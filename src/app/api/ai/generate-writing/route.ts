import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getWordLimit } from '@/lib/ai/writingPrompt'
import { enforceStudentOnlyReference, validateWritingExercise, type GeneratedWritingExercise } from '@/lib/ai/writingValidation'
import { logConstructionUsage, normalizeExerciseMode, selectTeachingConstructions, trackConstructionExposure } from '@/lib/exercises/teachingResources'
import { toLegacyType } from '@/lib/exercises/adaptiveExercise'
import { callSkill } from '@/lib/ai/client'
import { resolveTeachingSelection } from '@/lib/teaching/catalog'
import {
  buildContentSignature,
  constructionMetadataCards,
  GENERATION_VERSION,
  hasSimilarExercise,
  normalizeBlankDisplay,
  PROMPT_VERSION,
} from '@/lib/exercises/exerciseBank'

function fallbackExercise(body: any, constructions: Awaited<ReturnType<typeof selectTeachingConstructions>>['constructions'], notice?: string): GeneratedWritingExercise {
  const type = body.adaptiveType ? toLegacyType(body.adaptiveType) : normalizeExerciseMode(body.mode || body.type)
  const limit = body.wordLimit ? { label: body.wordLimit } : getWordLimit(type)
  const codes = constructions.slice(0, 4).map((c) => c.code).join(', ')
  const target = constructionMetadataCards(constructions)

  return {
    exerciseId: `AI-${type}-${Date.now()}`,
    level: body.studentLevel || body.level || 'senior',
    type,
    theme: body.topicLabel || 'A meaningful communication scene',
    context: type === 'GAP'
      ? `${body.topicLabel || 'A student explains a cultural detail'} to a foreign friend. __________ After listening, the friend looked at the scene with warmer eyes.`
      : `${body.topicLabel || 'A student'} becomes the center of a small, real conversation. Someone asks a sincere question, and the student needs to respond with clear meaning, natural tone, and a little emotional movement.`,
    task: type === 'GAP'
      ? 'Fill in 1 blank with a meaningful sentence. Use the target constructions naturally.'
      : `Continue the scene in ${limit.label}. Use the target constructions naturally and make the communication concrete, warm, and useful.`,
    wordCount: limit.label,
    targetConstructions: codes,
    referenceAnswer: '',
    metadata: {
      mode: type === 'GAP' ? 'gap_continuation' : type === 'CG' ? 'construction_guided_continuation' : type === 'ACT' ? 'action_chain_continuation' : type === 'TR' ? 'single_sentence_translation' : 'student_continuation',
      adaptive_exercise_type: body.adaptiveType || '',
      exercise_type_label: body.exerciseTypeLabel || '',
      teaching_objective: body.goalLabel || 'Use database-backed constructions for real communication.',
      communicative_situation: 'A student uses stronger English constructions to explain, respond, or repair meaning.',
      student_role: 'Chinese student communicator',
      audience: 'foreign friend, classmate, or teacher',
      target_constructions: target,
      blanks: type === 'GAP' ? [{ blank_id: 1, guidance: 'Explain the meaning or show the emotional turn.', suggested_constructions: target.slice(0, 2).map((c) => c.code) }] : [],
      data_notice: notice || '',
    },
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    const body = await req.json()
    const selection = await resolveTeachingSelection(prisma, {
      topicId: body.topicId,
      goalId: body.goalId,
      level: body.studentLevel || body.level,
    })

    const resources = await selectTeachingConstructions(prisma, {
      topicId: selection.topic.id,
      goalId: selection.goal.id,
      mode: body.mode || body.type,
      topic: selection.topic.label,
      difficulty: body.difficulty,
      targetSkill: selection.goal.label,
      studentLevel: selection.level,
      writingFunction: selection.goal.communicativePurpose,
      constructionType: body.constructionType,
      exerciseType: body.exerciseType,
    })

    if (resources.constructions.length < 2) {
      return NextResponse.json({
        success: false,
        error: 'Not enough PostgreSQL construction data matched this topic, goal, and level.',
        friendlyMessage: 'We need more teaching data for this topic and goal. Please try a different goal or level for now.',
        notice: resources.notice,
      }, { status: 422 })
    }

    const constructionPayload = resources.constructions.map((c) => ({
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

    const analysisResult = await callSkill('constructionAnalyze', {
      topic: selection.topic,
      writingGoal: selection.goal,
      studentLevel: selection.level,
      constructions: constructionPayload,
    })

    const planResult = await callSkill('exercisePlan', {
      topic: selection.topic,
      writingGoal: selection.goal,
      studentLevel: selection.level,
      constructions: constructionPayload,
      analysis: analysisResult.data,
      dataNotice: resources.notice,
    })

    const generateResult = await callSkill('adaptiveExerciseGenerate', {
      topic: selection.topic,
      writingGoal: selection.goal,
      studentLevel: selection.level,
      constructions: constructionPayload,
      analysis: analysisResult.data,
      plan: planResult.data,
      includeReferenceAnswer: Boolean(body.includeReferenceAnswer),
    })

    let exercise = generateResult.data as GeneratedWritingExercise | undefined
    const selectedType = planResult.data?.selected_exercise_type || exercise?.metadata?.adaptive_exercise_type || 'construction_guided_continuation'
    const selectedLabel = planResult.data?.exercise_type_label || exercise?.metadata?.exercise_type_label || 'Construction-guided Practice'
    const selectedWordLimit = planResult.data?.word_limit || exercise?.wordCount

    if (!exercise) {
      exercise = fallbackExercise({
        ...body,
        adaptiveType: selectedType,
        exerciseTypeLabel: selectedLabel,
        wordLimit: selectedWordLimit,
        topicLabel: selection.topic.label,
        goalLabel: selection.goal.label,
      }, resources.constructions, resources.notice)
    }

    exercise.type = toLegacyType(selectedType as any)
    exercise.level = selection.level
    exercise.theme = selection.topic.label
    exercise.context = normalizeBlankDisplay(exercise.context || '')
    exercise.wordCount = body.wordLimit || selectedWordLimit || getWordLimit(exercise.type).label
    exercise.targetConstructions = resources.constructions.slice(0, 4).map((c) => c.code).join(', ')
    exercise.metadata = {
      ...(exercise.metadata || {}),
      source: 'user_generated',
      topic: { id: selection.topic.id, label: selection.topic.label, category: selection.topic.category, version: selection.topic.version },
      goal: { id: selection.goal.id, label: selection.goal.label, version: selection.goal.version },
      topic_id: selection.topic.id,
      goal_id: selection.goal.id,
      adaptive_exercise_type: selectedType,
      exercise_type_label: selectedLabel,
      action_hint: exercise.metadata?.action_hint || planResult.data?.action_hint || '',
      emotional_hint: exercise.metadata?.emotional_hint || planResult.data?.emotional_hint || '',
      interaction_guidance: exercise.metadata?.interaction_guidance || planResult.data?.interaction_guidance || '',
      construction_analysis: analysisResult.data || null,
      planning_rationale: planResult.data?.rationale || '',
      target_constructions: constructionMetadataCards(resources.constructions),
      candidate_pool_size: resources.candidateCount,
      data_notice: resources.notice || '',
      generation_version: GENERATION_VERSION,
      prompt_version: PROMPT_VERSION,
    }
    exercise = enforceStudentOnlyReference(exercise, Boolean(body.includeReferenceAnswer) || selectedType === 'single_sentence_translation')

    const validation = validateWritingExercise(exercise)
    const reviewResult = await callSkill('exerciseQualityReview', {
      exercise,
      validation,
      topic: selection.topic,
      goal: selection.goal,
      constructions: constructionPayload,
      analysis: analysisResult.data,
      plan: planResult.data,
    })

    const reviewScore = reviewResult.data?.score ? Number(reviewResult.data.score) : 0
    const qualityStatus = reviewResult.data?.approved && validation.valid && reviewScore >= 8
      ? 'ai_reviewed'
      : reviewScore < 6 || !validation.valid
        ? 'rejected'
        : 'needs_revision'
    const publishStatus = qualityStatus === 'ai_reviewed' ? 'draft' : qualityStatus
    const constructionCodes = resources.constructions.slice(0, 4).map((c) => c.code)
    const contentSignature = buildContentSignature({
      topicId: selection.topic.id,
      goalId: selection.goal.id,
      level: selection.level,
      exerciseType: selectedType,
      constructionCodes,
      context: exercise.context,
      task: exercise.task,
    })
    const duplicate = await hasSimilarExercise(prisma, contentSignature, session?.user?.id)

    if (qualityStatus === 'rejected') {
      return NextResponse.json({
        success: false,
        error: 'The AI response was not stable enough, so we did not publish this exercise.',
        friendlyMessage: 'We are preparing a better exercise for this topic. Please try another goal or level for now.',
        validation,
        review: reviewResult.data,
        qualityStatus,
      }, { status: 422 })
    }

    let savedExercise = null
    if (session?.user?.id && !duplicate) {
      savedExercise = await prisma.aIGeneratedExercise.create({
        data: {
          exerciseId: exercise.exerciseId || `AI-${Date.now()}`,
          userId: session.user.id,
          level: selection.level,
          type: exercise.type,
          theme: exercise.theme,
          context: exercise.context,
          task: exercise.task,
          wordCount: exercise.wordCount,
          targetConstructions: exercise.targetConstructions,
          referenceAnswer: exercise.referenceAnswer,
          metadata: exercise.metadata,
          source: 'user_generated',
          isPublic: false,
          topicId: selection.topic.id,
          goalId: selection.goal.id,
          exerciseType: selectedType,
          constructionIds: resources.constructions.slice(0, 4).map((c) => c.id),
          qualityStatus,
          publishStatus,
          reviewNotes: reviewResult.data || {},
          reviewedAt: new Date(),
          qualityReviewResult: reviewResult.data || {},
          pedagogicalFitScore: reviewResult.data?.score ? Number(reviewResult.data.score) : undefined,
          fitReason: planResult.data?.rationale || '',
          generationVersion: GENERATION_VERSION,
          promptVersion: PROMPT_VERSION,
          skillsVersion: PROMPT_VERSION,
          constructionMetadataVersion: GENERATION_VERSION,
          topicVersion: selection.topic.version,
          contentSignature,
        },
      })
      await logConstructionUsage(prisma, {
        constructions: resources.constructions.slice(0, 4),
        exerciseId: savedExercise.exerciseId,
        topicId: selection.topic.id,
        goalId: selection.goal.id,
        level: selection.level,
        exerciseType: selectedType,
        source: 'user_generated',
      })
      await trackConstructionExposure(prisma, {
        userId: session.user.id,
        constructions: resources.constructions.slice(0, 4),
        metadata: {
          topicId: selection.topic.id,
          goalId: selection.goal.id,
          level: selection.level,
          exerciseType: selectedType,
          source: 'generated_exercise',
        },
      })
    }

    return NextResponse.json({
      success: true,
      exercise: {
        ...exercise,
        source: session?.user?.id ? 'user_generated' : 'local_temporary',
        topic: selection.topic,
        goal: selection.goal,
        qualityStatus,
        savedExerciseId: savedExercise?.id,
        duplicateOf: duplicate?.exerciseId,
      },
      validation,
      review: reviewResult.data,
      storage: session?.user?.id ? (savedExercise ? 'account' : 'duplicate_reused') : 'local',
      usedFallback: Boolean(analysisResult.usedFallback || planResult.usedFallback || generateResult.usedFallback || reviewResult.usedFallback),
    })
  } catch (error: any) {
    console.error('Generate writing exercise error:', error)
    return NextResponse.json({ error: error.message || 'Failed to generate exercise' }, { status: 500 })
  }
}
