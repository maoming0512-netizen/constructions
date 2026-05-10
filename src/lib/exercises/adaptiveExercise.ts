import type { PrismaClient } from '@prisma/client'
import type { TeachingConstruction } from './teachingResources'

export type AdaptiveExerciseType =
  | 'long_continuation'
  | 'micro_continuation'
  | 'action_chain_continuation'
  | 'gap_continuation'
  | 'single_sentence_translation'
  | 'construction_guided_continuation'

export interface ConstructionProfile {
  school_level: string
  fine_level: string
  communicative_function: string[]
  emotional_function: string[]
  narrative_function: string[]
  interaction_type: string[]
  scene_type: string[]
  cultural_usage: string[]
  intercultural_value: string[]
  emotional_intensity: number
  action_density: number
  discourse_scope: string
  production_difficulty: string
  common_error_risk: string[]
  teaching_priority: string
  usage_frequency: string
  rotation_weight: number
  recommended_exercise_types: AdaptiveExerciseType[]
}

export interface AdaptiveExercisePlan {
  exerciseType: AdaptiveExerciseType
  exerciseTypeLabel: string
  wordLimit: string
  sceneGuidance: string
  taskFocus: string
  constructions: TeachingConstruction[]
  profile: ConstructionProfile
  balanceNotice?: string
}

const EXERCISE_LABELS: Record<AdaptiveExerciseType, string> = {
  long_continuation: 'Long Continuation',
  micro_continuation: 'Micro Continuation',
  action_chain_continuation: 'Action-chain Continuation',
  gap_continuation: 'Gap Continuation',
  single_sentence_translation: 'Situational Translation',
  construction_guided_continuation: 'Construction-guided Practice',
}

const WORD_LIMITS: Record<AdaptiveExerciseType, string> = {
  long_continuation: '100-150 words',
  micro_continuation: '40-60 words',
  action_chain_continuation: '40-80 words',
  gap_continuation: '1-2 guided blanks',
  single_sentence_translation: '1 natural English sentence',
  construction_guided_continuation: '80-120 words',
}

function hasAny(text: string, words: string[]) {
  return words.some((word) => text.includes(word.toLowerCase()))
}

function normalizeProfile(raw: Partial<ConstructionProfile>, level?: string): ConstructionProfile {
  return {
    school_level: raw.school_level || (level?.includes('junior') ? 'Junior High' : 'Senior High'),
    fine_level: raw.fine_level || (level?.includes('junior') ? 'L2' : 'L4'),
    communicative_function: raw.communicative_function || [],
    emotional_function: raw.emotional_function || [],
    narrative_function: raw.narrative_function || [],
    interaction_type: raw.interaction_type || [],
    scene_type: raw.scene_type || [],
    cultural_usage: raw.cultural_usage || raw.intercultural_value || [],
    intercultural_value: raw.intercultural_value || raw.cultural_usage || [],
    emotional_intensity: raw.emotional_intensity || 1,
    action_density: raw.action_density || 1,
    discourse_scope: raw.discourse_scope || 'sentence',
    production_difficulty: raw.production_difficulty || 'medium',
    common_error_risk: raw.common_error_risk || ['unnatural_translation'],
    teaching_priority: raw.teaching_priority || 'medium',
    usage_frequency: raw.usage_frequency || 'medium',
    rotation_weight: raw.rotation_weight || 1,
    recommended_exercise_types: raw.recommended_exercise_types || ['construction_guided_continuation'],
  }
}

export function profileConstruction(c: Pick<TeachingConstruction, 'name' | 'template' | 'function' | 'usageNote' | 'example' | 'category' | 'level'>): ConstructionProfile {
  const text = `${c.name} ${c.template} ${c.function} ${c.usageNote} ${c.example} ${c.category}`.toLowerCase()
  const communicative = new Set<string>()
  const emotional = new Set<string>()
  const narrative = new Set<string>()
  const interaction = new Set<string>()
  const scene = new Set<string>()
  const culture = new Set<string>()
  const errorRisk = new Set<string>()
  const recommended = new Set<AdaptiveExerciseType>()

  if (hasAny(text, ['invite', 'would like', 'offer', 'ask', 'suggest', 'recommend'])) {
    communicative.add('invitation_or_offer')
    interaction.add('polite_exchange')
    scene.add('school_exchange')
    errorRisk.add('tone')
    recommended.add('single_sentence_translation')
    recommended.add('micro_continuation')
  }
  if (hasAny(text, ['explain', 'show', 'share', 'important', 'meaning', 'custom', 'culture'])) {
    communicative.add('explanation')
    culture.add('cultural_explanation')
    culture.add('sharing_chinese_culture')
    scene.add('school_exchange')
    recommended.add('construction_guided_continuation')
    recommended.add('long_continuation')
  }
  if (hasAny(text, ['although', 'though', 'but', 'however', 'in spite', 'despite', 'contrast'])) {
    narrative.add('contrast_or_turn')
    emotional.add('change')
    errorRisk.add('logic')
    recommended.add('gap_continuation')
    recommended.add('long_continuation')
  }
  if (hasAny(text, ['because', 'so that', 'so...that', 'result', 'reason'])) {
    narrative.add('cause_result')
    errorRisk.add('logic')
    recommended.add('gap_continuation')
    recommended.add('construction_guided_continuation')
  }
  if (hasAny(text, ['make', 'let', 'put', 'take', 'give', 'hand', 'show', 'move', 'run', 'walk'])) {
    narrative.add('action_sequence')
    scene.add('physical_interaction')
    errorRisk.add('word_order')
    errorRisk.add('collocation')
    recommended.add('action_chain_continuation')
  }
  if (hasAny(text, ['feel', 'grateful', 'nervous', 'happy', 'angry', 'sorry', 'apologize', 'comfort'])) {
    emotional.add('emotional_response')
    interaction.add('relationship_repair')
    errorRisk.add('tone')
    recommended.add('micro_continuation')
    recommended.add('action_chain_continuation')
  }
  if (hasAny(text, ['compare', 'more', 'than', 'not only', 'also', 'rather than', 'similar', 'different'])) {
    communicative.add('comparison')
    errorRisk.add('word_order')
    recommended.add('single_sentence_translation')
    recommended.add('construction_guided_continuation')
  }

  if (recommended.size === 0) {
    recommended.add(c.level === 'senior' ? 'construction_guided_continuation' : 'single_sentence_translation')
    communicative.add('general_expression')
  }

  const actionDensity = narrative.has('action_sequence') ? 3 : hasAny(text, ['verb', 'v +']) ? 2 : 1
  const emotionalIntensity = emotional.has('emotional_response') ? 3 : emotional.has('change') ? 2 : 1
  const schoolLevel = c.level?.includes('junior') ? 'Junior High' : c.level?.includes('senior') ? 'Senior High' : c.level?.includes('ielts') ? 'Advanced' : 'Senior High'
  const fineLevel = c.level?.includes('junior') ? 'L2' : c.level?.includes('senior') ? 'L4' : c.level?.includes('basic') ? 'L5' : c.level?.includes('advanced') ? 'L6' : 'L3'
  const productionDifficulty = c.level?.includes('advanced') || emotionalIntensity >= 3 ? 'high' : c.level?.includes('senior') || actionDensity >= 2 ? 'medium' : 'low'

  return {
    school_level: schoolLevel,
    fine_level: fineLevel,
    communicative_function: Array.from(communicative),
    emotional_function: Array.from(emotional),
    narrative_function: Array.from(narrative),
    interaction_type: Array.from(interaction),
    scene_type: Array.from(scene),
    cultural_usage: Array.from(culture),
    intercultural_value: Array.from(culture),
    emotional_intensity: emotionalIntensity,
    action_density: actionDensity,
    discourse_scope: recommended.has('long_continuation') ? 'paragraph' : recommended.has('single_sentence_translation') ? 'sentence' : 'dialogue',
    production_difficulty: productionDifficulty,
    common_error_risk: Array.from(errorRisk.size ? errorRisk : ['unnatural_translation']),
    teaching_priority: culture.size || emotional.size ? 'high' : 'medium',
    usage_frequency: text.length > 180 ? 'medium' : 'high',
    rotation_weight: productionDifficulty === 'high' ? 0.85 : 1,
    recommended_exercise_types: Array.from(recommended),
  }
}

function mergeProfiles(profiles: ConstructionProfile[]): ConstructionProfile {
  const normalized = profiles.map((p) => normalizeProfile(p))
  const merge = (key: keyof ConstructionProfile) => Array.from(new Set(normalized.flatMap((p) => p[key] as string[])))
  const recommended = normalized.flatMap((p) => p.recommended_exercise_types)
  const counts = recommended.reduce<Record<string, number>>((acc, type) => {
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {})
  return {
    school_level: normalized[0]?.school_level || 'Senior High',
    fine_level: normalized[0]?.fine_level || 'L3',
    communicative_function: merge('communicative_function'),
    emotional_function: merge('emotional_function'),
    narrative_function: merge('narrative_function'),
    interaction_type: merge('interaction_type'),
    scene_type: merge('scene_type'),
    cultural_usage: merge('cultural_usage'),
    intercultural_value: merge('intercultural_value'),
    emotional_intensity: Math.max(...normalized.map((p) => p.emotional_intensity), 1),
    action_density: Math.max(...normalized.map((p) => p.action_density), 1),
    discourse_scope: normalized.some((p) => p.discourse_scope === 'paragraph') ? 'paragraph' : 'dialogue',
    production_difficulty: normalized.some((p) => p.production_difficulty === 'high') ? 'high' : normalized.some((p) => p.production_difficulty === 'medium') ? 'medium' : 'low',
    common_error_risk: merge('common_error_risk'),
    teaching_priority: normalized.some((p) => p.teaching_priority === 'high') ? 'high' : 'medium',
    usage_frequency: 'medium',
    rotation_weight: Math.min(...normalized.map((p) => p.rotation_weight || 1), 1),
    recommended_exercise_types: Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([type]) => type as AdaptiveExerciseType),
  }
}

async function recentExerciseTypeCounts(prisma: PrismaClient) {
  const recent = await prisma.exercise.findMany({
    take: 80,
    orderBy: { updatedAt: 'desc' },
    select: { type: true, exerciseType: true, metadata: true },
  })
  return recent.reduce<Record<string, number>>((acc, row) => {
    const metadata = row.metadata as any
    const type = row.exerciseType || metadata?.adaptive_exercise_type || row.type
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {})
}

export async function createAdaptiveExercisePlan(
  prisma: PrismaClient,
  constructions: TeachingConstruction[]
): Promise<AdaptiveExercisePlan> {
  const profiles = constructions.map((c) => {
    const metadata = (c as any).metadata as ConstructionProfile | undefined
    return metadata?.recommended_exercise_types ? normalizeProfile(metadata, c.level) : profileConstruction(c)
  })
  const profile = mergeProfiles(profiles)
  const recentCounts = await recentExerciseTypeCounts(prisma)
  const candidates = profile.recommended_exercise_types.length
    ? profile.recommended_exercise_types
    : (['construction_guided_continuation'] as AdaptiveExerciseType[])

  const exerciseType = candidates
    .slice()
    .sort((a, b) => (recentCounts[a] || 0) - (recentCounts[b] || 0))[0]

  const sceneGuidance = [
    profile.cultural_usage.length ? 'Use a concrete intercultural scene.' : 'Use a real human communication scene.',
    profile.action_density >= 3 ? 'Include visible movement and reaction.' : 'Keep the scene focused and easy to picture.',
    profile.emotional_intensity >= 2 ? 'Show a small emotional change.' : 'Keep the tone natural and calm.',
  ].join(' ')

  const taskFocus = [
    ...profile.communicative_function,
    ...profile.narrative_function,
    ...profile.emotional_function,
  ].slice(0, 4).join(', ') || 'natural expression'

  return {
    exerciseType,
    exerciseTypeLabel: EXERCISE_LABELS[exerciseType],
    wordLimit: WORD_LIMITS[exerciseType],
    sceneGuidance,
    taskFocus,
    constructions,
    profile,
    balanceNotice: recentCounts[exerciseType] ? `Selected ${EXERCISE_LABELS[exerciseType]} while considering recent exercise-type reuse.` : undefined,
  }
}

export function toLegacyType(type: AdaptiveExerciseType) {
  if (type === 'long_continuation') return 'D2'
  if (type === 'micro_continuation') return 'D1'
  if (type === 'gap_continuation') return 'GAP'
  if (type === 'action_chain_continuation') return 'ACT'
  if (type === 'single_sentence_translation') return 'TR'
  return 'CG'
}
