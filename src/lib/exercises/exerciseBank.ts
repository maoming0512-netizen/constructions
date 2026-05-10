import type { PrismaClient } from '@prisma/client'
import type { TeachingConstruction } from './teachingResources'

export const GENERATION_VERSION = 'adaptive-teaching-kb-2026-05'
export const PROMPT_VERSION = 'skills-2026-05-expression-first'

export function adaptiveToLegacyType(type?: string) {
  if (type === 'long_continuation') return 'D2'
  if (type === 'micro_continuation') return 'D1'
  if (type === 'gap_continuation') return 'GAP'
  if (type === 'action_chain_continuation') return 'ACT'
  if (type === 'single_sentence_translation') return 'TR'
  return 'CG'
}

export function normalizeBlankDisplay(text: string) {
  return text.replace(/\[Blank\s*\d*\]/gi, '__________')
}

export function buildContentSignature(input: {
  topicId?: string | null
  goalId?: string | null
  level?: string
  exerciseType?: string
  constructionCodes?: string[]
  context?: string
  task?: string
}) {
  const normalizedContext = (input.context || '').toLowerCase().replace(/\s+/g, ' ').slice(0, 180)
  const normalizedTask = (input.task || '').toLowerCase().replace(/\s+/g, ' ').slice(0, 120)
  return [
    input.topicId || 'none',
    input.goalId || 'none',
    input.level || 'none',
    input.exerciseType || 'none',
    [...(input.constructionCodes || [])].sort().join('|'),
    normalizedContext,
    normalizedTask,
  ].join('::')
}

export async function findApprovedOfficialExercise(
  prisma: PrismaClient,
  params: { topicId: string; goalId: string; level: string }
) {
  const rows = await prisma.exercise.findMany({
    where: {
      source: 'official',
      isPublic: true,
      isPublished: true,
      qualityStatus: 'approved',
      publishStatus: { in: ['approved', 'published'] },
      topicId: params.topicId,
      goalId: params.goalId,
      level: params.level,
    },
    take: 8,
    orderBy: [
      { pedagogicalFitScore: 'desc' },
      { updatedAt: 'asc' },
    ],
  })

  if (rows.length) return rows[Math.floor(Math.random() * Math.min(rows.length, 4))]

  return prisma.exercise.findFirst({
    where: {
      source: 'official',
      isPublic: true,
      isPublished: true,
      qualityStatus: 'approved',
      publishStatus: { in: ['approved', 'published'] },
      topicId: params.topicId,
      level: params.level,
    },
    orderBy: [
      { pedagogicalFitScore: 'desc' },
      { updatedAt: 'asc' },
    ],
  })
}

export async function hasSimilarExercise(
  prisma: PrismaClient,
  signature: string,
  userId?: string
) {
  const [official, generated] = await Promise.all([
    prisma.exercise.findFirst({ where: { contentSignature: signature }, select: { id: true, exerciseId: true } }),
    userId
      ? prisma.aIGeneratedExercise.findFirst({ where: { contentSignature: signature, userId }, select: { id: true, exerciseId: true } })
      : Promise.resolve(null),
  ])
  return official || generated
}

export function constructionMetadataCards(constructions: TeachingConstruction[]) {
  return constructions.slice(0, 4).map((c) => {
    const metadata = c.metadata as any
    return {
      id: c.id,
      code: c.code,
      construction: c.template || c.name,
      template: c.template,
      meaning_zh: c.function,
      communicative_function: metadata?.communicative_function || [],
      emotional_function: metadata?.emotional_function || [],
      narrative_function: metadata?.narrative_function || [],
      usage_scene: metadata?.scene_type?.[0] || c.category,
      construction_type: metadata?.construction_type || c.category,
      tone: metadata?.emotional_function?.[0] || '',
      example: c.example,
      why_useful: c.usageNote || c.function,
      production_difficulty: metadata?.production_difficulty || c.difficulty,
      common_error_risk: metadata?.common_error_risk || [],
    }
  })
}
