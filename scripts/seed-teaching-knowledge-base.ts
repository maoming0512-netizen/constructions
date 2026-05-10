import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import { profileConstruction } from '../src/lib/exercises/adaptiveExercise'
import { buildContentSignature, adaptiveToLegacyType } from '../src/lib/exercises/exerciseBank'
import { seedLearningPaths as seedLearningPathData, seedTopics, seedWritingGoals, TEACHING_CATALOG_VERSION } from '../src/lib/teaching/catalogSeed'
import { supplementalConstructions } from '../src/lib/teaching/supplementalConstructions'

const prisma = new PrismaClient()

function intersects(a: string[] = [], b: string[] = []) {
  const lower = new Set(a.map((item) => item.toLowerCase()))
  return b.some((item) => lower.has(item.toLowerCase()))
}

function metadataTerms(metadata: any) {
  return [
    ...(metadata?.communicative_function || []),
    ...(metadata?.emotional_function || []),
    ...(metadata?.narrative_function || []),
    ...(metadata?.intercultural_value || []),
    ...(metadata?.cultural_usage || []),
    ...(metadata?.recommended_exercise_types || []),
  ].filter(Boolean)
}

async function backupBeforeUpdate() {
  const dir = path.resolve(__dirname, 'backups')
  fs.mkdirSync(dir, { recursive: true })
  const backupPath = path.join(dir, `teaching-kb-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`)

  const [topicCount, goalCount, constructionCount, exerciseCount] = await Promise.all([
    prisma.topic.count().catch(() => 0),
    prisma.writingGoal.count().catch(() => 0),
    prisma.construction.count(),
    prisma.exercise.count(),
  ])

  const samples = await prisma.exercise.findMany({
    take: 50,
    select: {
      id: true,
      exerciseId: true,
      theme: true,
      level: true,
      type: true,
      topicId: true,
      goalId: true,
      metadata: true,
      updatedAt: true,
    },
  })

  fs.writeFileSync(backupPath, JSON.stringify({
    createdAt: new Date().toISOString(),
    counts: { topicCount, goalCount, constructionCount, exerciseCount },
    exerciseSamples: samples,
  }, null, 2), 'utf-8')
  console.log(`Backup written: ${backupPath}`)
}

async function seedCatalog() {
  const topics = new Map<string, Awaited<ReturnType<typeof prisma.topic.upsert>>>()
  const goals = new Map<string, Awaited<ReturnType<typeof prisma.writingGoal.upsert>>>()

  for (const topic of seedTopics) {
    const row = await prisma.topic.upsert({
      where: { slug: topic.slug },
      update: {
        label: topic.label,
        category: topic.category,
        description: topic.description,
        minLevel: topic.minLevel,
        maxLevel: topic.maxLevel,
        communicativeFunctions: topic.communicativeFunctions,
        emotionalFunctions: topic.emotionalFunctions,
        relatedConstructionFns: topic.relatedConstructionFns,
        iconKey: topic.iconKey,
        displayOrder: topic.displayOrder,
        active: true,
        version: TEACHING_CATALOG_VERSION,
        metadata: topic.metadata as any,
      },
      create: {
        ...topic,
        metadata: topic.metadata as any,
        version: TEACHING_CATALOG_VERSION,
        active: true,
      },
    })
    topics.set(topic.slug, row)
  }

  for (const goal of seedWritingGoals) {
    const row = await prisma.writingGoal.upsert({
      where: { slug: goal.slug },
      update: {
        label: goal.label,
        description: goal.description,
        communicativePurpose: goal.communicativePurpose,
        recommendedExerciseTypes: goal.recommendedExerciseTypes,
        relatedConstructionFns: goal.relatedConstructionFns,
        minLevel: goal.minLevel,
        maxLevel: goal.maxLevel,
        displayOrder: goal.displayOrder,
        active: true,
        version: TEACHING_CATALOG_VERSION,
        metadata: goal.metadata as any,
      },
      create: {
        ...goal,
        metadata: goal.metadata as any,
        version: TEACHING_CATALOG_VERSION,
        active: true,
      },
    })
    goals.set(goal.slug, row)
  }

  return { topics, goals }
}

async function seedLearningPaths() {
  const stages = new Map<string, any>()

  for (const pathSeed of seedLearningPathData) {
    const learningPath = await prisma.learningPath.upsert({
      where: { slug: pathSeed.slug },
      update: {
        label: pathSeed.label,
        description: pathSeed.description,
        displayOrder: pathSeed.displayOrder,
        metadata: pathSeed.metadata as any,
        active: true,
      },
      create: {
        slug: pathSeed.slug,
        label: pathSeed.label,
        description: pathSeed.description,
        displayOrder: pathSeed.displayOrder,
        metadata: pathSeed.metadata as any,
        active: true,
      },
    })

    for (const stageSeed of pathSeed.stages) {
      const stage = await prisma.learningPathStage.upsert({
        where: { slug: stageSeed.slug },
        update: {
          learningPathId: learningPath.id,
          label: stageSeed.label,
          description: stageSeed.description,
          stageOrder: stageSeed.stageOrder,
          targetExpressionAbility: stageSeed.targetExpressionAbility,
          prerequisiteConstructionTypes: stageSeed.prerequisiteConstructionTypes,
          recommendedExerciseTypes: stageSeed.recommendedExerciseTypes,
          metadata: stageSeed.metadata as any,
          active: true,
        },
        create: {
          learningPathId: learningPath.id,
          slug: stageSeed.slug,
          label: stageSeed.label,
          description: stageSeed.description,
          stageOrder: stageSeed.stageOrder,
          targetExpressionAbility: stageSeed.targetExpressionAbility,
          prerequisiteConstructionTypes: stageSeed.prerequisiteConstructionTypes,
          recommendedExerciseTypes: stageSeed.recommendedExerciseTypes,
          metadata: stageSeed.metadata as any,
          active: true,
        },
      })
      stages.set(stageSeed.slug, stage)
    }

    for (const stageSeed of pathSeed.stages) {
      if (!stageSeed.nextRecommendedStageSlug) continue
      const stage = stages.get(stageSeed.slug)
      const next = stages.get(stageSeed.nextRecommendedStageSlug)
      if (stage && next) {
        await prisma.learningPathStage.update({
          where: { id: stage.id },
          data: { nextRecommendedStageId: next.id },
        })
      }
    }
  }

  return stages
}

async function seedSupplementalConstructions(topics: Map<string, any>, goals: Map<string, any>) {
  const usableRows: Array<{ constructionId: string; item: typeof supplementalConstructions[number] }> = []

  for (const item of supplementalConstructions) {
    const exact = await prisma.construction.findFirst({
      where: {
        OR: [
          { code: item.code },
          { template: item.template },
          { example: item.example },
        ],
      },
      select: { id: true, code: true, metadata: true },
    })

    const data = {
      code: item.code,
      name: item.name,
      template: item.template,
      coreWords: item.coreWords,
      function: item.function,
      usageNote: item.usageNote,
      example: item.example,
      difficulty: item.difficulty,
      level: item.level,
      category: item.category,
      metadata: item.metadata as any,
      metadataVersion: TEACHING_CATALOG_VERSION,
      rotationWeight: item.metadata.rotation_weight || 1,
    }

    const row = exact
      ? await prisma.construction.update({
          where: { id: exact.id },
          data: {
            metadata: {
              ...((exact.metadata as any) || {}),
              ...item.metadata,
              duplicate_check: exact.code === item.code ? 'matched_code' : 'matched_existing_template_or_example',
            },
            metadataVersion: TEACHING_CATALOG_VERSION,
          },
          select: { id: true },
        })
      : await prisma.construction.create({ data, select: { id: true } })

    usableRows.push({ constructionId: row.id, item })
  }

  for (const { constructionId, item } of usableRows) {
    for (const slug of item.topicSlugs) {
      const topic = topics.get(slug)
      if (!topic) continue
      await prisma.constructionTopic.upsert({
        where: { constructionId_topicId: { constructionId, topicId: topic.id } },
        update: { relevanceScore: 0.95, reason: item.metadata.topic_relevance_reason as string },
        create: { constructionId, topicId: topic.id, relevanceScore: 0.95, reason: item.metadata.topic_relevance_reason as string },
      })
    }

    for (const slug of item.goalSlugs) {
      const goal = goals.get(slug)
      if (!goal) continue
      await prisma.constructionGoal.upsert({
        where: { constructionId_goalId: { constructionId, goalId: goal.id } },
        update: { relevanceScore: 0.95, reason: item.metadata.goal_relevance_reason as string },
        create: { constructionId, goalId: goal.id, relevanceScore: 0.95, reason: item.metadata.goal_relevance_reason as string },
      })
    }

    for (const exerciseType of item.exerciseTypes) {
      await prisma.constructionExerciseType.upsert({
        where: { constructionId_exerciseType: { constructionId, exerciseType } },
        update: { relevanceScore: 0.95, reason: 'Supplemented construction curated for this exercise type.' },
        create: { constructionId, exerciseType, relevanceScore: 0.95, reason: 'Supplemented construction curated for this exercise type.' },
      })
    }
  }

  console.log(`Supplemental constructions linked: ${usableRows.length}`)
}

async function enrichConstructionMetadataAndMappings(topics: Map<string, any>, goals: Map<string, any>) {
  const constructions = await prisma.construction.findMany({
    select: {
      id: true,
      name: true,
      template: true,
      function: true,
      usageNote: true,
      example: true,
      category: true,
      level: true,
      metadata: true,
    },
  })

  let enriched = 0
  let topicLinks = 0
  let goalLinks = 0
  let typeLinks = 0

  for (const c of constructions) {
    const existing = (c.metadata as any) || {}
    const generated = existing?.recommended_exercise_types ? existing : profileConstruction(c)
    const merged = {
      ...generated,
      ...existing,
      metadata_version: TEACHING_CATALOG_VERSION,
    }

    if (!existing?.metadata_version || !existing?.production_difficulty) {
      await prisma.construction.update({
        where: { id: c.id },
        data: {
          metadata: merged,
          metadataVersion: TEACHING_CATALOG_VERSION,
          rotationWeight: merged.rotation_weight || 1,
        },
      })
      enriched += 1
    }

    const terms = metadataTerms(merged)
    for (const topicSeed of seedTopics) {
      if (!intersects(terms, topicSeed.relatedConstructionFns) && !intersects(terms, topicSeed.communicativeFunctions)) continue
      const topic = topics.get(topicSeed.slug)
      if (!topic) continue
      await prisma.constructionTopic.upsert({
        where: { constructionId_topicId: { constructionId: c.id, topicId: topic.id } },
        update: {},
        create: {
          constructionId: c.id,
          topicId: topic.id,
          relevanceScore: topicSeed.metadata?.recommended ? 0.74 : 0.64,
          reason: `Metadata functions match topic needs: ${topicSeed.relatedConstructionFns.join(', ')}`,
        },
      })
      topicLinks += 1
    }

    for (const goalSeed of seedWritingGoals) {
      if (!intersects(terms, goalSeed.relatedConstructionFns) && !intersects(merged.recommended_exercise_types || [], goalSeed.recommendedExerciseTypes)) continue
      const goal = goals.get(goalSeed.slug)
      if (!goal) continue
      await prisma.constructionGoal.upsert({
        where: { constructionId_goalId: { constructionId: c.id, goalId: goal.id } },
        update: {},
        create: {
          constructionId: c.id,
          goalId: goal.id,
          relevanceScore: 0.7,
          reason: `Metadata functions match writing goal: ${goalSeed.relatedConstructionFns.join(', ')}`,
        },
      })
      goalLinks += 1
    }

    for (const exerciseType of merged.recommended_exercise_types || []) {
      await prisma.constructionExerciseType.upsert({
        where: { constructionId_exerciseType: { constructionId: c.id, exerciseType } },
        update: {},
        create: {
          constructionId: c.id,
          exerciseType,
          relevanceScore: 0.72,
          reason: 'Recommended by construction metadata.',
        },
      })
      typeLinks += 1
    }
  }

  console.log(`Enriched metadata: ${enriched}; topic links touched: ${topicLinks}; goal links touched: ${goalLinks}; type links touched: ${typeLinks}`)
}

function inferTopicSlug(theme: string) {
  const text = theme.toLowerCase()
  if (/ai|tool|人工智能|智能/.test(text)) return 'ai-learning-tools'
  if (/实习|career|job|future|大学|university|职业/.test(text)) return 'university-internship'
  if (/奶茶|coffee|drink|外卖|hotpot|火锅|food|饮食|吃/.test(text)) return 'milk-tea-food-delivery'
  if (/朋友|friend|误会|apolog/.test(text)) return 'friendship-empathy'
  if (/school|校园|课堂|学习|考试/.test(text)) return 'school-exchange'
  if (/city|travel|museum|交通|旅行|城市/.test(text)) return 'city-commuting-daily-life'
  if (/春节|festival|tea|calligraphy|paper|文化|习俗|传统/.test(text)) return 'festival-family'
  return 'school-exchange'
}

function inferGoalSlug(exerciseType: string, theme: string) {
  const text = theme.toLowerCase()
  if (exerciseType === 'GAP') return 'soften-and-repair'
  if (/误会|apolog|sorry|team|feedback/.test(text)) return 'soften-and-repair'
  if (/feel|emotion|friend|surprise|感动|紧张/.test(text)) return 'build-emotion'
  if (exerciseType === 'ACT') return 'guide-actions'
  if (/compare|different|than|比较/.test(text)) return 'compare-perspectives'
  return 'explain-culture'
}

async function enrichOfficialExercises(topics: Map<string, any>, goals: Map<string, any>) {
  const exercises = await prisma.exercise.findMany()
  let updated = 0

  for (const ex of exercises) {
    const topic = topics.get(inferTopicSlug(ex.theme))
    const goal = goals.get(inferGoalSlug(ex.type, ex.theme))
    if (!topic || !goal) continue
    const exerciseType = (ex.metadata as any)?.adaptive_exercise_type || (ex.type === 'D2' ? 'long_continuation' : ex.type === 'GAP' ? 'gap_continuation' : ex.type === 'CG' ? 'construction_guided_continuation' : ex.type === 'T1' || ex.type === 'TR' ? 'single_sentence_translation' : 'micro_continuation')
    const constructionCodes = ex.targetConstructions.split(/[,/]/).map((part) => part.trim()).filter(Boolean).slice(0, 4)
    const contentSignature = buildContentSignature({
      topicId: topic.id,
      goalId: goal.id,
      level: ex.level,
      exerciseType,
      constructionCodes,
      context: ex.context,
      task: ex.task,
    })

    await prisma.exercise.update({
      where: { id: ex.id },
      data: {
        source: 'official',
        isPublic: true,
        topicId: ex.topicId || topic.id,
        goalId: ex.goalId || goal.id,
        exerciseType,
        constructionIds: constructionCodes,
        qualityStatus: ex.qualityStatus || 'approved',
        publishStatus: ex.publishStatus || 'published',
        reviewedAt: ex.reviewedAt || new Date(),
        approvedAt: ex.approvedAt || new Date(),
        reviewNotes: ex.reviewNotes || { source: 'legacy_official_bank_mapping', status: 'needs human review for premium publishing over time' },
        pedagogicalFitScore: ex.pedagogicalFitScore || 7,
        fitReason: ex.fitReason || 'Legacy official exercise mapped to the closest platform topic and writing goal for retrieval.',
        generationVersion: ex.generationVersion || 'legacy-bank',
        promptVersion: ex.promptVersion || 'legacy',
        constructionMetadataVersion: ex.constructionMetadataVersion || TEACHING_CATALOG_VERSION,
        topicVersion: ex.topicVersion || TEACHING_CATALOG_VERSION,
        contentSignature,
        metadata: {
          ...((ex.metadata as any) || {}),
          topic_id: ex.topicId || topic.id,
          goal_id: ex.goalId || goal.id,
          adaptive_exercise_type: exerciseType,
          legacy_type: ex.type,
          source: 'official',
        },
      },
    })
    updated += 1
  }

  console.log(`Official exercises mapped: ${updated}`)
}

async function main() {
  console.log('Seeding teaching knowledge base...')
  await backupBeforeUpdate()
  const { topics, goals } = await seedCatalog()
  await seedLearningPaths()
  await seedSupplementalConstructions(topics, goals)
  await enrichConstructionMetadataAndMappings(topics, goals)
  await enrichOfficialExercises(topics, goals)
  console.log('Teaching knowledge base seed complete.')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
