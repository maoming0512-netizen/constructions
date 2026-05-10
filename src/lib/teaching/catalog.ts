import type { PrismaClient, Topic, WritingGoal } from '@prisma/client'

export const PLATFORM_LEVELS = [
  { value: 'junior', label: 'Junior High', description: 'Concrete scenes, clear emotion, useful everyday constructions.' },
  { value: 'senior', label: 'Senior High', description: 'Richer narration, intercultural explanation, and stronger discourse control.' },
]

export function levelMatches(level: string, minLevel?: string | null, maxLevel?: string | null) {
  const order = ['primary', 'junior', 'senior', 'college', 'advanced']
  const value = order.indexOf(level)
  const min = minLevel ? order.indexOf(minLevel) : -1
  const max = maxLevel ? order.indexOf(maxLevel) : -1
  if (value < 0) return true
  if (min >= 0 && value < min) return false
  if (max >= 0 && value > max) return false
  return true
}

export async function getActiveTeachingOptions(prisma: PrismaClient) {
  const [topics, goals, learningPaths] = await Promise.all([
    prisma.topic.findMany({
      where: { active: true },
      orderBy: [{ displayOrder: 'asc' }, { label: 'asc' }],
    }),
    prisma.writingGoal.findMany({
      where: { active: true },
      orderBy: [{ displayOrder: 'asc' }, { label: 'asc' }],
    }),
    prisma.learningPath.findMany({
      where: { active: true },
      orderBy: [{ displayOrder: 'asc' }, { label: 'asc' }],
      include: {
        stages: {
          where: { active: true },
          orderBy: { stageOrder: 'asc' },
        },
      },
    }),
  ])

  return { topics, goals, learningPaths, levels: PLATFORM_LEVELS }
}

export async function resolveTeachingSelection(
  prisma: PrismaClient,
  input: { topicId?: string | null; goalId?: string | null; level?: string | null }
): Promise<{ topic: Topic; goal: WritingGoal; level: string }> {
  const level = input.level || 'senior'
  if (!input.topicId || !input.goalId) {
    throw new Error('Please choose a platform topic and writing goal.')
  }

  const [topic, goal] = await Promise.all([
    prisma.topic.findFirst({ where: { id: input.topicId, active: true } }),
    prisma.writingGoal.findFirst({ where: { id: input.goalId, active: true } }),
  ])

  if (!topic || !goal) throw new Error('The selected topic or writing goal is not available.')
  if (!levelMatches(level, topic.minLevel, topic.maxLevel) || !levelMatches(level, goal.minLevel, goal.maxLevel)) {
    throw new Error('The selected topic and goal are not suitable for this level.')
  }

  return { topic, goal, level }
}

export function publicTopic(topic: Topic) {
  return {
    id: topic.id,
    slug: topic.slug,
    label: topic.label,
    category: topic.category,
    description: topic.description,
    minLevel: topic.minLevel,
    maxLevel: topic.maxLevel,
    communicativeFunctions: topic.communicativeFunctions,
    emotionalFunctions: topic.emotionalFunctions,
    relatedConstructionFns: topic.relatedConstructionFns,
    iconKey: topic.iconKey,
    metadata: topic.metadata,
    displayOrder: topic.displayOrder,
  }
}

export function publicGoal(goal: WritingGoal) {
  return {
    id: goal.id,
    slug: goal.slug,
    label: goal.label,
    description: goal.description,
    communicativePurpose: goal.communicativePurpose,
    recommendedExerciseTypes: goal.recommendedExerciseTypes,
    relatedConstructionFns: goal.relatedConstructionFns,
    minLevel: goal.minLevel,
    maxLevel: goal.maxLevel,
    metadata: goal.metadata,
    displayOrder: goal.displayOrder,
  }
}
