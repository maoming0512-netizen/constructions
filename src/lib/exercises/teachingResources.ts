import type { PrismaClient } from '@prisma/client'

export type WritingMode =
  | 'D1'
  | 'D2'
  | 'GAP'
  | 'ACT'
  | 'TR'
  | 'CG'
  | 'student_continuation'
  | 'gap_continuation'
  | 'construction_guided_continuation'

export interface ExerciseResourceRequest {
  mode?: WritingMode | string
  topic?: string
  topicId?: string
  goalId?: string
  difficulty?: string
  targetSkill?: string
  studentLevel?: string
  writingFunction?: string
  constructionType?: string
  exerciseType?: string
}

export interface TeachingConstruction {
  id: string
  code: string
  name: string
  template: string
  function: string
  usageNote: string
  example: string
  difficulty: string
  level: string
  category: string
  metadata?: unknown
  usageCount?: number
  lastUsedAt?: Date | null
  rotationWeight?: number
}

const FUNCTION_KEYWORDS: Record<string, string[]> = {
  emotion: ['feel', 'grateful', 'nervous', 'happy', 'sorry', 'comfort'],
  action: ['make', 'let', 'show', 'offer', 'invite', 'move', 'take', 'put'],
  conflict: ['although', 'because', 'however', 'problem', 'sorry'],
  transition: ['as soon as', 'although', 'so that', 'not only'],
  ending: ['so...that', 'finally', 'grateful', 'important'],
  explanation: ['explain', 'show', 'share', 'so that', 'important', 'meaning'],
  communication: ['would like', 'apologize', 'invite', 'share', 'grateful', 'ask'],
  culture: ['share', 'explain', 'show', 'important', 'custom', 'culture'],
  comparison: ['more', 'than', 'not only', 'also', 'rather than', 'different'],
}

const select = {
  id: true,
  code: true,
  name: true,
  template: true,
  function: true,
  usageNote: true,
  example: true,
  difficulty: true,
  level: true,
  category: true,
  metadata: true,
  usageCount: true,
  lastUsedAt: true,
  rotationWeight: true,
}

function normalizeLevel(level?: string | null) {
  if (!level) return undefined
  const lowered = level.toLowerCase()
  if (lowered.includes('junior') || lowered.includes('初中')) return 'junior'
  if (lowered.includes('senior') || lowered.includes('高中')) return 'senior'
  return lowered
}

function keywordsFromRequest(request: ExerciseResourceRequest): string[] {
  const raw = [
    request.topic,
    request.targetSkill,
    request.writingFunction,
    request.constructionType,
  ].filter(Boolean).join(' ').toLowerCase()

  const keywords = new Set<string>()
  for (const [key, values] of Object.entries(FUNCTION_KEYWORDS)) {
    if (raw.includes(key)) values.forEach((value) => keywords.add(value))
  }

  if (request.mode === 'GAP' || request.mode === 'gap_continuation') {
    FUNCTION_KEYWORDS.transition.forEach((value) => keywords.add(value))
  }
  if (request.mode === 'CG' || request.mode === 'construction_guided_continuation') {
    FUNCTION_KEYWORDS.explanation.forEach((value) => keywords.add(value))
  }
  if (keywords.size === 0) {
    FUNCTION_KEYWORDS.communication.forEach((value) => keywords.add(value))
    FUNCTION_KEYWORDS.explanation.forEach((value) => keywords.add(value))
  }

  return Array.from(keywords)
}

function buildKeywordWhere(keywords: string[]) {
  return keywords.flatMap((keyword) => [
    { name: { contains: keyword, mode: 'insensitive' as const } },
    { template: { contains: keyword, mode: 'insensitive' as const } },
    { function: { contains: keyword, mode: 'insensitive' as const } },
    { usageNote: { contains: keyword, mode: 'insensitive' as const } },
    { example: { contains: keyword, mode: 'insensitive' as const } },
  ])
}

function uniqueByCode(rows: TeachingConstruction[]) {
  const seen = new Set<string>()
  return rows.filter((row) => {
    if (seen.has(row.code)) return false
    seen.add(row.code)
    return true
  })
}

function metadataArray(row: TeachingConstruction, key: string): string[] {
  const value = (row.metadata as any)?.[key]
  return Array.isArray(value) ? value : []
}

function diversityKey(row: TeachingConstruction) {
  const profileKeys = [
    ...metadataArray(row, 'communicative_function'),
    ...metadataArray(row, 'emotional_function'),
    ...metadataArray(row, 'narrative_function'),
  ]
  return profileKeys[0] || row.category || row.level
}

function isUsableTeachingConstruction(row: TeachingConstruction) {
  const metadata = (row.metadata as any) || {}
  const constructionText = `${row.template || row.name || ''}`.trim()
  const tokenCount = (constructionText.match(/[A-Za-z]+(?:[-'][A-Za-z]+)*/g) || []).length
  if (metadata.use_in_generation === false) return false
  if (metadata.active_for_learning === false) return false
  if (metadata.vocabulary_only === true) return false
  if (metadata.construction_type === 'vocabulary_only') return false
  if (metadata.teaching_value === 'low' || metadata.student_growth_value === 'low') return false
  if (metadata.exclusion_reason) return false
  if (tokenCount <= 1 && !/[.\[\]()]|\b(sb|sth|one's|what|it|there|would|let)\b/i.test(constructionText)) return false
  return true
}

function exerciseTypePreference(row: TeachingConstruction, request: ExerciseResourceRequest) {
  const metadata = (row.metadata as any) || {}
  const type = metadata.construction_type || ''
  const mode = String(request.exerciseType || request.mode || '')
  if (mode.includes('continuation') && ['discourse_pattern', 'sentence_pattern', 'communicative_expression', 'intercultural_expression'].includes(type)) return 10
  if ((mode === 'TR' || mode.includes('translation') || mode.includes('imitation')) && ['phrase', 'collocation', 'sentence_pattern', 'communicative_expression'].includes(type)) return 10
  if (['vocabulary_only', 'single_word'].includes(type)) return -100
  if (metadata.teaching_value === 'high') return 5
  return 0
}

function levelScore(rowLevel: string, requested?: string) {
  if (!requested) return 0
  if (rowLevel === requested) return 12
  if (requested === 'senior' && rowLevel === 'junior') return 5
  if (requested === 'junior' && rowLevel === 'senior') return -8
  return -2
}

async function rowsFromMappings(prisma: PrismaClient, request: ExerciseResourceRequest, level?: string) {
  const rows = new Map<string, { row: TeachingConstruction; score: number }>()

  if (request.topicId) {
    const topicRows = await prisma.constructionTopic.findMany({
      where: { topicId: request.topicId },
      take: 80,
      orderBy: [{ relevanceScore: 'desc' }, { createdAt: 'desc' }],
      include: { construction: { select } },
    })
    for (const item of topicRows) {
      const row = item.construction
      rows.set(row.id, { row, score: item.relevanceScore * 40 + levelScore(row.level, level) })
    }
  }

  if (request.goalId) {
    const goalRows = await prisma.constructionGoal.findMany({
      where: { goalId: request.goalId },
      take: 80,
      orderBy: [{ relevanceScore: 'desc' }, { createdAt: 'desc' }],
      include: { construction: { select } },
    })
    for (const item of goalRows) {
      const row = item.construction
      const current = rows.get(row.id)
      rows.set(row.id, {
        row,
        score: (current?.score || 0) + item.relevanceScore * 35 + levelScore(row.level, level),
      })
    }
  }

  if (request.exerciseType || request.mode) {
    const exerciseType = request.exerciseType || request.mode
    const typeRows = await prisma.constructionExerciseType.findMany({
      where: { exerciseType: String(exerciseType) },
      take: 60,
      orderBy: [{ relevanceScore: 'desc' }, { createdAt: 'desc' }],
      include: { construction: { select } },
    })
    for (const item of typeRows) {
      const row = item.construction
      const current = rows.get(row.id)
      rows.set(row.id, {
        row,
        score: (current?.score || 0) + item.relevanceScore * 15 + levelScore(row.level, level),
      })
    }
  }

  return Array.from(rows.values())
}

async function keywordRows(prisma: PrismaClient, request: ExerciseResourceRequest, level?: string) {
  const keywords = keywordsFromRequest(request)
  const rows = await prisma.construction.findMany({
    where: {
      ...(level ? { level } : {}),
      OR: buildKeywordWhere(keywords),
    },
    select,
    take: 48,
    orderBy: [{ usageCount: 'asc' }, { code: 'asc' }],
  })
  return rows.map((row) => ({ row, score: 18 + levelScore(row.level, level) }))
}

async function generalRows(prisma: PrismaClient, level?: string) {
  const rows = await prisma.construction.findMany({
    where: {
      ...(level ? { level } : {}),
      OR: buildKeywordWhere(FUNCTION_KEYWORDS.communication),
    },
    select,
    take: 32,
    orderBy: [{ usageCount: 'asc' }, { code: 'asc' }],
  })
  return rows.map((row) => ({ row, score: 6 + levelScore(row.level, level) }))
}

function balanceConstructionReuse(rows: Array<{ row: TeachingConstruction; score: number }>, take: number) {
  const scored = uniqueByCode(rows.map((item) => item.row).filter(isUsableTeachingConstruction))
    .map((row) => {
      const base = rows.find((item) => item.row.id === row.id)?.score || 0
      const usagePenalty = Math.min(row.usageCount || 0, 30) * 0.8
      const recentPenalty = row.lastUsedAt && Date.now() - row.lastUsedAt.getTime() < 1000 * 60 * 60 * 24 * 7 ? 12 : 0
      const rotationBoost = (row.rotationWeight || 1) * 4
      return { row, score: base + rotationBoost - usagePenalty - recentPenalty }
    })
    .sort((a, b) => b.score - a.score || a.row.code.localeCompare(b.row.code))

  const diversitySeen = new Set<string>()
  const diverse: Array<{ row: TeachingConstruction; score: number }> = []
  const remaining: Array<{ row: TeachingConstruction; score: number }> = []

  for (const item of scored) {
    const key = diversityKey(item.row)
    if (!diversitySeen.has(key)) {
      diversitySeen.add(key)
      diverse.push(item)
    } else {
      remaining.push(item)
    }
  }

  const result = diverse.slice(0, take)
  if (result.length < take) {
    result.push(...remaining.slice(0, take - result.length))
  }

  return result.map((item) => item.row)
}

export async function selectTeachingConstructions(
  prisma: PrismaClient,
  request: ExerciseResourceRequest,
  take = 4
): Promise<{ constructions: TeachingConstruction[]; notice?: string; candidateCount: number }> {
  const level = normalizeLevel(request.studentLevel || request.difficulty)
  const scored: Array<{ row: TeachingConstruction; score: number }> = []
  let notice: string | undefined

  try {
    scored.push(...await rowsFromMappings(prisma, request, level))
  } catch {
    notice = 'The relational teaching index is unavailable; using keyword-backed construction retrieval.'
  }

  if (scored.length < 8) {
    scored.push(...await keywordRows(prisma, request, level))
  }

  if (scored.length < 4) {
    scored.push(...await keywordRows(prisma, { ...request, studentLevel: undefined, difficulty: undefined }))
    notice = notice || 'Matched constructions were limited, so retrieval was relaxed beyond the requested level.'
  }

  if (scored.length < 4) {
    scored.push(...await generalRows(prisma, level))
    notice = notice || 'More targeted teaching data is needed; using general communication constructions from PostgreSQL.'
  }

  const constructions = balanceConstructionReuse(scored.map((item) => ({
    row: item.row,
    score: item.score + exerciseTypePreference(item.row, request),
  })), take)

  if (constructions.length < 2 && scored.length >= 2) {
    const relaxed = uniqueByCode(scored.map((item) => item.row))
      .filter((row) => {
        const metadata = (row.metadata as any) || {}
        if (metadata.use_in_generation === false) return false
        if (metadata.active_for_learning === false) return false
        if (metadata.vocabulary_only === true) return false
        if (metadata.construction_type === 'vocabulary_only') return false
        return true
      })
      .sort((a, b) => {
        const aScore = scored.find((item) => item.row.id === a.id)?.score || 0
        const bScore = scored.find((item) => item.row.id === b.id)?.score || 0
        return bScore - aScore || a.code.localeCompare(b.code)
      })
      .slice(0, take)
    return {
      constructions: relaxed,
      notice: notice || 'Matched constructions were limited; showing the best available constructions for this selection.',
      candidateCount: uniqueByCode(scored.map((item) => item.row)).length,
    }
  }

  return {
    constructions,
    notice: scored.length >= 2 ? notice : 'Not enough suitable constructions were found. Please enrich topic, goal, or construction mappings.',
    candidateCount: uniqueByCode(scored.map((item) => item.row)).length,
  }
}

export async function logConstructionUsage(
  prisma: PrismaClient,
  params: {
    constructions: TeachingConstruction[]
    exerciseId?: string
    topicId?: string | null
    goalId?: string | null
    level?: string
    exerciseType?: string
    source: string
  }
) {
  const now = new Date()
  const rows = params.constructions.map((construction) => ({
    constructionId: construction.id,
    exerciseId: params.exerciseId,
    topicId: params.topicId || undefined,
    goalId: params.goalId || undefined,
    level: params.level,
    exerciseType: params.exerciseType,
    source: params.source,
    usedAt: now,
  }))
  if (!rows.length) return

  await prisma.$transaction([
    prisma.constructionUsageLog.createMany({ data: rows }),
    ...params.constructions.map((construction) => prisma.construction.update({
      where: { id: construction.id },
      data: { usageCount: { increment: 1 }, lastUsedAt: now },
    })),
  ])
}

export async function trackConstructionExposure(
  prisma: PrismaClient,
  params: {
    userId?: string | null
    constructions: TeachingConstruction[]
    metadata?: Record<string, unknown>
  }
) {
  if (!params.userId || !params.constructions.length) return
  const now = new Date()
  await prisma.$transaction(params.constructions.map((construction) => prisma.userConstructionMastery.upsert({
    where: {
      userId_constructionId: {
        userId: params.userId!,
        constructionId: construction.id,
      },
    },
    update: {
      exposureCount: { increment: 1 },
      lastSeenAt: now,
      metadata: (params.metadata || undefined) as any,
    },
    create: {
      userId: params.userId!,
      constructionId: construction.id,
      exposureCount: 1,
      lastSeenAt: now,
      masteryLevel: 'seen',
      metadata: (params.metadata || undefined) as any,
    },
  })))
}

export function normalizeExerciseMode(mode?: string): 'D1' | 'D2' | 'GAP' | 'CG' {
  if (mode === 'D2') return 'D2'
  if (mode === 'GAP' || mode === 'gap_continuation') return 'GAP'
  if (mode === 'CG' || mode === 'construction_guided_continuation') return 'CG'
  return 'D1'
}
