import { PrismaClient } from '@prisma/client'
import {
  logConstructionUsage,
  selectTeachingConstructions,
} from '../src/lib/exercises/teachingResources'
import { callSkill } from '../src/lib/ai/client'
import {
  buildContentSignature,
  constructionMetadataCards,
  GENERATION_VERSION,
  normalizeBlankDisplay,
  PROMPT_VERSION,
} from '../src/lib/exercises/exerciseBank'
import { toLegacyType } from '../src/lib/exercises/adaptiveExercise'
import { enforceStudentOnlyReference, validateWritingExercise, type GeneratedWritingExercise } from '../src/lib/ai/writingValidation'

const prisma = new PrismaClient()

const LEVELS = (process.env.PREGEN_LEVELS || 'junior,senior').split(',').map((x) => x.trim()).filter(Boolean)
const LIMIT = Number(process.env.PREGEN_LIMIT || 8)
const MIN_REVIEW_SCORE = Number(process.env.PREGEN_MIN_REVIEW_SCORE || 8)

async function main() {
  console.log(`Starting controlled official pre-generation. limit=${LIMIT}`)
  const [topics, goals] = await Promise.all([
    prisma.topic.findMany({ where: { active: true }, orderBy: { displayOrder: 'asc' } }),
    prisma.writingGoal.findMany({ where: { active: true }, orderBy: { displayOrder: 'asc' } }),
  ])

  let created = 0
  let skipped = 0

  for (const topic of topics) {
    for (const goal of goals) {
      for (const level of LEVELS) {
        if (created >= LIMIT) break
        const existing = await prisma.exercise.findFirst({
          where: {
            source: 'official',
            topicId: topic.id,
            goalId: goal.id,
            level,
            qualityStatus: { in: ['approved', 'ai_reviewed'] },
            publishStatus: { in: ['approved', 'published'] },
          },
          select: { exerciseId: true },
        })
        if (existing) {
          skipped += 1
          continue
        }

        const resources = await selectTeachingConstructions(prisma, {
          topicId: topic.id,
          goalId: goal.id,
          topic: topic.label,
          targetSkill: goal.label,
          writingFunction: goal.communicativePurpose,
          studentLevel: level,
        }, 4)

        if (resources.constructions.length < 2) {
          console.log(`skip weak construction pool: ${topic.slug}/${goal.slug}/${level}`)
          skipped += 1
          continue
        }

        const constructions = resources.constructions.map((c) => ({
          id: c.id,
          code: c.code,
          name: c.name,
          template: c.template,
          function: c.function,
          usageNote: c.usageNote,
          example: c.example,
          difficulty: c.difficulty,
          level: c.level,
          category: c.category,
          metadata: c.metadata,
        }))

        const analysis = await callSkill('constructionAnalyze', { topic, writingGoal: goal, studentLevel: level, constructions })
        const plan = await callSkill('exercisePlan', { topic, writingGoal: goal, studentLevel: level, constructions, analysis: analysis.data })
        const generated = await callSkill<GeneratedWritingExercise>('adaptiveExerciseGenerate', {
          topic,
          writingGoal: goal,
          studentLevel: level,
          constructions,
          analysis: analysis.data,
          plan: plan.data,
          includeReferenceAnswer: true,
        })

        if (!generated.data) {
          skipped += 1
          continue
        }

        const selectedType = plan.data?.selected_exercise_type || generated.data.metadata?.adaptive_exercise_type || 'construction_guided_continuation'
        const exercise = enforceStudentOnlyReference({
          ...generated.data,
          level,
          theme: topic.label,
          type: toLegacyType(selectedType as any),
          context: normalizeBlankDisplay(generated.data.context),
          targetConstructions: resources.constructions.map((c) => c.code).join(', '),
          metadata: {
            ...(generated.data.metadata || {}),
            topic_id: topic.id,
            goal_id: goal.id,
            topic: { id: topic.id, label: topic.label, slug: topic.slug },
            goal: { id: goal.id, label: goal.label, slug: goal.slug },
            adaptive_exercise_type: selectedType,
            exercise_type_label: plan.data?.exercise_type_label || generated.data.metadata?.exercise_type_label,
            target_constructions: constructionMetadataCards(resources.constructions),
            candidate_pool_size: resources.candidateCount,
            generation_version: GENERATION_VERSION,
            prompt_version: PROMPT_VERSION,
          },
        }, true)

        const validation = validateWritingExercise(exercise)
        const review = await callSkill('exerciseQualityReview', { exercise, validation, topic, goal, constructions, analysis: analysis.data, plan: plan.data })
        const score = Number(review.data?.score || 0)
        const qualityStatus = review.data?.approved && validation.valid && score >= MIN_REVIEW_SCORE ? 'approved' : score < 6 ? 'rejected' : 'needs_revision'
        const publishStatus = qualityStatus === 'approved' ? 'approved' : qualityStatus
        const signature = buildContentSignature({
          topicId: topic.id,
          goalId: goal.id,
          level,
          exerciseType: selectedType,
          constructionCodes: resources.constructions.map((c) => c.code),
          context: exercise.context,
          task: exercise.task,
        })

        const duplicate = await prisma.exercise.findFirst({ where: { contentSignature: signature }, select: { exerciseId: true } })
        if (duplicate) {
          skipped += 1
          continue
        }

        const saved = await prisma.exercise.create({
          data: {
            exerciseId: exercise.exerciseId || `OFF-${Date.now()}`,
            level,
            type: exercise.type,
            theme: topic.label,
            context: exercise.context,
            task: exercise.task,
            wordCount: exercise.wordCount,
            targetConstructions: exercise.targetConstructions,
            referenceAnswer: exercise.referenceAnswer,
            metadata: exercise.metadata as any,
            source: 'official',
            isPublic: publishStatus === 'approved',
            isPublished: publishStatus === 'approved',
            topicId: topic.id,
            goalId: goal.id,
            exerciseType: selectedType,
            constructionIds: resources.constructions.map((c) => c.id),
            qualityStatus,
            publishStatus,
            reviewNotes: review.data as any,
            reviewedAt: new Date(),
            approvedAt: publishStatus === 'approved' ? new Date() : undefined,
            pedagogicalFitScore: score || undefined,
            fitReason: plan.data?.rationale || '',
            generationVersion: GENERATION_VERSION,
            promptVersion: PROMPT_VERSION,
            skillsVersion: PROMPT_VERSION,
            constructionMetadataVersion: GENERATION_VERSION,
            topicVersion: topic.version,
            contentSignature: signature,
          },
        })

        await logConstructionUsage(prisma, {
          constructions: resources.constructions,
          exerciseId: saved.exerciseId,
          topicId: topic.id,
          goalId: goal.id,
          level,
          exerciseType: selectedType,
          source: 'official_pregeneration',
        })
        created += 1
        console.log(`created ${saved.exerciseId}: ${qualityStatus}/${publishStatus}`)
      }
    }
  }

  console.log(`Pre-generation complete. created=${created}, skipped=${skipped}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
