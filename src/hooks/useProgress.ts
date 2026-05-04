import { useState, useCallback, useEffect } from 'react'
import { type ErrorTypeCode, errorTypes, getErrorTypeByCode } from '@/data/errorTypes'
import type { LoopStep } from './usePracticeLoop'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PracticeAttempt {
  id: string
  constructionId: string
  constructionName: string
  startedAt: string
  completedAt?: string
  stepsCompleted: LoopStep[]
  currentStep: LoopStep
  isComplete: boolean
  originalSentence?: string
  revisedSentence?: string
  revisionScore?: {
    draft1Total: number
    draft2Total: number
    maxTotal: number
    improvement: number
  }
  errorsDiagnosed: ErrorTypeCode[]
}

export interface ConstructionMastery {
  constructionId: string
  constructionName: string
  attempts: number
  completions: number
  averageRevisionScore: number
  bestScore: number
  lastAttemptAt?: string
  mastered: boolean
  errorFrequency: Record<ErrorTypeCode, number>
}

export interface ErrorTypeDistribution {
  code: ErrorTypeCode
  name: string
  count: number
  percentage: number
}

export interface LearningRecommendation {
  type: 'review' | 'practice' | 'focus' | 'reward'
  title: string
  description: string
  relatedErrorType?: ErrorTypeCode
  relatedConstructionIds?: string[]
}

export interface ProgressState {
  attempts: PracticeAttempt[]
  constructionMastery: Record<string, ConstructionMastery>
  totalAttempts: number
  totalCompletions: number
  averageImprovement: number
  errorDistribution: ErrorTypeDistribution[]
  recommendations: LearningRecommendation[]
  lastUpdatedAt: string
}

export interface UseProgressOptions {
  persistKey?: string
  autoPersist?: boolean
}

export interface UseProgressReturn {
  state: ProgressState
  recordAttempt: (attempt: Omit<PracticeAttempt, 'id'>) => string
  updateAttempt: (id: string, updates: Partial<PracticeAttempt>) => void
  getConstructionMastery: (constructionId: string) => ConstructionMastery | undefined
  getRecommendations: () => LearningRecommendation[]
  getErrorDistribution: () => ErrorTypeDistribution[]
  resetProgress: () => void
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'practice-progress'
const MASTERY_THRESHOLD = 3 // Number of completions to consider mastered
const MIN_AVERAGE_SCORE_FOR_MASTERY = 70

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadProgress(key: string): Partial<ProgressState> | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as Partial<ProgressState>
  } catch {
    return null
  }
}

function saveProgress(key: string, state: ProgressState): void {
  try {
    localStorage.setItem(key, JSON.stringify(state))
  } catch {
    // Silently fail
  }
}

function generateId(): string {
  return `attempt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

function createEmptyState(): ProgressState {
  return {
    attempts: [],
    constructionMastery: {},
    totalAttempts: 0,
    totalCompletions: 0,
    averageImprovement: 0,
    errorDistribution: [],
    recommendations: [],
    lastUpdatedAt: new Date().toISOString(),
  }
}

function computeErrorDistribution(attempts: PracticeAttempt[]): ErrorTypeDistribution[] {
  const counts: Record<ErrorTypeCode, number> = {} as Record<ErrorTypeCode, number>

  // Initialize all error types with 0
  for (const et of errorTypes) {
    counts[et.code] = 0
  }

  // Count errors across all attempts
  let totalErrors = 0
  for (const attempt of attempts) {
    for (const code of attempt.errorsDiagnosed) {
      if (counts[code] !== undefined) {
        counts[code]++
        totalErrors++
      }
    }
  }

  return Object.entries(counts).map(([code, count]) => {
    const errorType = getErrorTypeByCode(code as ErrorTypeCode)
    return {
      code: code as ErrorTypeCode,
      name: errorType?.name || code,
      count,
      percentage: totalErrors > 0 ? Math.round((count / totalErrors) * 100) : 0,
    }
  })
}

function computeConstructionMastery(
  attempts: PracticeAttempt[]
): Record<string, ConstructionMastery> {
  const byConstruction: Record<string, PracticeAttempt[]> = {}

  for (const attempt of attempts) {
    if (!byConstruction[attempt.constructionId]) {
      byConstruction[attempt.constructionId] = []
    }
    byConstruction[attempt.constructionId].push(attempt)
  }

  const mastery: Record<string, ConstructionMastery> = {}

  for (const [constructionId, constructionAttempts] of Object.entries(byConstruction)) {
    const completions = constructionAttempts.filter((a) => a.isComplete)
    const completionCount = completions.length

    // Calculate average revision score from completed attempts
    const scores = completions
      .map((a) => a.revisionScore?.draft2Total)
      .filter((s): s is number => s !== undefined)
    const averageRevisionScore =
      scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
    const bestScore = scores.length > 0 ? Math.max(...scores) : 0

    // Count error frequency for this construction
    const errorFrequency: Record<ErrorTypeCode, number> = {} as Record<ErrorTypeCode, number>
    for (const et of errorTypes) {
      errorFrequency[et.code] = 0
    }
    for (const attempt of constructionAttempts) {
      for (const code of attempt.errorsDiagnosed) {
        errorFrequency[code] = (errorFrequency[code] || 0) + 1
      }
    }

    // Determine mastery
    const mastered =
      completionCount >= MASTERY_THRESHOLD &&
      averageRevisionScore >= MIN_AVERAGE_SCORE_FOR_MASTERY

    const lastAttempt = constructionAttempts[constructionAttempts.length - 1]

    mastery[constructionId] = {
      constructionId,
      constructionName: lastAttempt?.constructionName || constructionId,
      attempts: constructionAttempts.length,
      completions: completionCount,
      averageRevisionScore,
      bestScore,
      lastAttemptAt: lastAttempt?.startedAt,
      mastered,
      errorFrequency,
    }
  }

  return mastery
}

function generateRecommendations(state: ProgressState): LearningRecommendation[] {
  const recommendations: LearningRecommendation[] = []

  // Check for constructions with many errors
  for (const [cid, mastery] of Object.entries(state.constructionMastery)) {
    const mostFrequentError = Object.entries(mastery.errorFrequency).sort(
      (a, b) => b[1] - a[1]
    )[0]

    if (mostFrequentError && mostFrequentError[1] >= 2) {
      const errorType = getErrorTypeByCode(mostFrequentError[0] as ErrorTypeCode)
      recommendations.push({
        type: 'focus',
        title: `针对「${mastery.constructionName}」的${errorType?.name || ''}专项练习`,
        description:
          errorType?.learningRecommendation ||
          '建议针对该错误类型进行专项练习。',
        relatedErrorType: mostFrequentError[0] as ErrorTypeCode,
        relatedConstructionIds: [cid],
      })
    }

    // Suggest review for incomplete attempts
    const incompleteAttempts = state.attempts.filter(
      (a) => a.constructionId === cid && !a.isComplete
    )
    if (incompleteAttempts.length >= 2) {
      recommendations.push({
        type: 'review',
        title: `继续完成「${mastery.constructionName}」的练习`,
        description: `你有 ${incompleteAttempts.length} 个未完成的练习，建议继续完成以获得更好的学习效果。`,
        relatedConstructionIds: [cid],
      })
    }
  }

  // General recommendations based on overall progress
  if (state.totalAttempts === 0) {
    recommendations.push({
      type: 'practice',
      title: '开始学习构式语法',
      description:
        '从基础的输入淹没练习开始，逐步体验完整的 8 步学习闭环。',
    })
  }

  if (state.averageImprovement > 0 && state.averageImprovement < 10) {
    recommendations.push({
      type: 'focus',
      title: '提升修改效果',
      description:
        '你的进步幅度还有提升空间。建议在 AI 反馈步骤仔细阅读改进建议，并在修订时尝试应用所有建议。',
    })
  }

  // Reward for good progress
  const masteredCount = Object.values(state.constructionMastery).filter((m) => m.mastered).length
  if (masteredCount >= 3) {
    recommendations.push({
      type: 'reward',
      title: '出色的学习进度！',
      description: `你已经掌握了 ${masteredCount} 个构式！继续保持这种学习节奏。`,
    })
  }

  return recommendations
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useProgress(options: UseProgressOptions = {}): UseProgressReturn {
  const { persistKey = STORAGE_KEY, autoPersist = true } = options

  const [state, setState] = useState<ProgressState>(createEmptyState())

  useEffect(() => {
    if (autoPersist) {
      const saved = loadProgress(persistKey)
      if (saved) {
        setState({
          ...createEmptyState(),
          ...saved,
          lastUpdatedAt: new Date().toISOString(),
        })
      }
    }
  }, [autoPersist, persistKey])

  // Persist to localStorage
  useEffect(() => {
    if (autoPersist) {
      saveProgress(persistKey, state)
    }
  }, [state, autoPersist, persistKey])

  const recordAttempt = useCallback(
    (attempt: Omit<PracticeAttempt, 'id'>): string => {
      const id = generateId()
      const fullAttempt: PracticeAttempt = { ...attempt, id }

      setState((prev) => {
        const newAttempts = [...prev.attempts, fullAttempt]
        const completions = newAttempts.filter((a) => a.isComplete)
        const improvements = completions
          .map((a) => a.revisionScore?.improvement)
          .filter((i): i is number => i !== undefined)
        const averageImprovement =
          improvements.length > 0
            ? Math.round(
                (improvements.reduce((a, b) => a + b, 0) / improvements.length) * 10
              ) / 10
            : 0

        const mastery = computeConstructionMastery(newAttempts)
        const errorDistribution = computeErrorDistribution(newAttempts)

        const newState: ProgressState = {
          ...prev,
          attempts: newAttempts,
          constructionMastery: mastery,
          totalAttempts: newAttempts.length,
          totalCompletions: completions.length,
          averageImprovement,
          errorDistribution,
          recommendations: [], // Will be computed lazily
          lastUpdatedAt: new Date().toISOString(),
        }

        newState.recommendations = generateRecommendations(newState)
        return newState
      })

      return id
    },
    []
  )

  const updateAttempt = useCallback((id: string, updates: Partial<PracticeAttempt>) => {
    setState((prev) => {
      const index = prev.attempts.findIndex((a) => a.id === id)
      if (index === -1) return prev

      const newAttempts = [...prev.attempts]
      newAttempts[index] = { ...newAttempts[index], ...updates }

      const completions = newAttempts.filter((a) => a.isComplete)
      const improvements = completions
        .map((a) => a.revisionScore?.improvement)
        .filter((i): i is number => i !== undefined)
      const averageImprovement =
        improvements.length > 0
          ? Math.round(
              (improvements.reduce((a, b) => a + b, 0) / improvements.length) * 10
            ) / 10
          : 0

      const mastery = computeConstructionMastery(newAttempts)
      const errorDistribution = computeErrorDistribution(newAttempts)

      const newState: ProgressState = {
        ...prev,
        attempts: newAttempts,
        constructionMastery: mastery,
        totalAttempts: newAttempts.length,
        totalCompletions: completions.length,
        averageImprovement,
        errorDistribution,
        recommendations: [],
        lastUpdatedAt: new Date().toISOString(),
      }

      newState.recommendations = generateRecommendations(newState)
      return newState
    })
  }, [])

  const getConstructionMastery = useCallback(
    (constructionId: string): ConstructionMastery | undefined => {
      return state.constructionMastery[constructionId]
    },
    [state.constructionMastery]
  )

  const getRecommendations = useCallback((): LearningRecommendation[] => {
    return state.recommendations
  }, [state.recommendations])

  const getErrorDistribution = useCallback((): ErrorTypeDistribution[] => {
    return state.errorDistribution
  }, [state.errorDistribution])

  const resetProgress = useCallback(() => {
    setState(createEmptyState())
    if (autoPersist) {
      localStorage.removeItem(persistKey)
    }
  }, [autoPersist, persistKey])

  return {
    state,
    recordAttempt,
    updateAttempt,
    getConstructionMastery,
    getRecommendations,
    getErrorDistribution,
    resetProgress,
  }
}
