import { useState, useCallback, useEffect, useRef } from 'react'
import { type ErrorTypeCode } from '@/data/errorTypes'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LoopStep =
  | 'input-flood'
  | 'pattern-noticing'
  | 'role-mapping'
  | 'controlled-production'
  | 'free-production'
  | 'ai-feedback'
  | 'revision'
  | 'reflection'

export const STEP_ORDER: LoopStep[] = [
  'input-flood',
  'pattern-noticing',
  'role-mapping',
  'controlled-production',
  'free-production',
  'ai-feedback',
  'revision',
  'reflection',
]

export interface StepRecord {
  step: LoopStep
  startedAt: string
  completedAt?: string
  userInput?: unknown
  result?: unknown
}

export interface RevisionScoreDetail {
  dimension: string
  draft1Score: number
  draft2Score: number
  maxScore: number
  improvement: number
  description: string
}

export interface PracticeLoopState {
  // Flow control
  currentStepIndex: number
  currentStep: LoopStep
  isComplete: boolean

  // Step records
  stepRecords: Record<LoopStep, StepRecord | undefined>

  // Key user data
  originalSentence: string
  revisedSentence: string
  aiFeedbackData: AIFeedbackSummary | null

  // Revision Score
  revisionScoreDetails: RevisionScoreDetail[]
  totalDraft1Score: number
  totalDraft2Score: number
  maxTotalScore: number

  // Error tracking
  diagnosedErrors: { code: ErrorTypeCode; confidence: 'high' | 'medium' | 'low' }[]

  // Timestamps
  startedAt: string
  completedAt?: string
}

export interface AIFeedbackSummary {
  naturalness: number
  grammarScore: number
  constructionMatch: number
  overallAssessment: string
  positiveFeedback: string[]
  improvementSuggestions: string[]
  diagnosedErrorCodes: { code: ErrorTypeCode; confidence: 'high' | 'medium' | 'low' }[]
  revisedSentence?: string
  verbSuggestion?: string
}

export interface UsePracticeLoopOptions {
  constructionId: string
  persistKey?: string
  autoPersist?: boolean
}

export interface UsePracticeLoopReturn {
  // State
  state: PracticeLoopState

  // Navigation
  goNext: () => void
  goBack: () => void
  goToStep: (step: LoopStep) => void
  reset: () => void

  // Data setters
  setOriginalSentence: (sentence: string) => void
  setRevisedSentence: (sentence: string) => void
  setAIFeedback: (feedback: AIFeedbackSummary) => void
  setStepInput: (step: LoopStep, input: unknown) => void
  setStepResult: (step: LoopStep, result: unknown) => void
  setRevisionScore: (details: RevisionScoreDetail[]) => void

  // Computed
  canGoBack: boolean
  canGoNext: boolean
  progress: number
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY_PREFIX = 'practice-loop'

const DEFAULT_REVISION_SCORE_DETAILS: RevisionScoreDetail[] = [
  {
    dimension: '自然度',
    draft1Score: 0,
    draft2Score: 0,
    maxScore: 30,
    improvement: 0,
    description: '句子在母语者眼中的自然程度，包括搭配习惯和表达地道性',
  },
  {
    dimension: '语法正确性',
    draft1Score: 0,
    draft2Score: 0,
    maxScore: 25,
    improvement: 0,
    description: '语法结构的正确程度，包括时态、语态、一致性等',
  },
  {
    dimension: '构式匹配度',
    draft1Score: 0,
    draft2Score: 0,
    maxScore: 25,
    improvement: 0,
    description: '句子与目标构式形式和意义的匹配程度',
  },
  {
    dimension: '语义角色映射',
    draft1Score: 0,
    draft2Score: 0,
    maxScore: 20,
    improvement: 0,
    description: '语义角色是否正确映射到句法位置',
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getStorageKey(constructionId: string, customKey?: string): string {
  return `${STORAGE_KEY_PREFIX}:${customKey || constructionId}`
}

function loadState(key: string): Partial<PracticeLoopState> | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as Partial<PracticeLoopState>
  } catch {
    return null
  }
}

function saveState(key: string, state: PracticeLoopState): void {
  try {
    localStorage.setItem(key, JSON.stringify(state))
  } catch {
    // Silently fail if localStorage is full or unavailable
  }
}

function createInitialState(overrides?: Partial<PracticeLoopState>): PracticeLoopState {
  const now = new Date().toISOString()
  const maxTotalScore = DEFAULT_REVISION_SCORE_DETAILS.reduce((sum, d) => sum + d.maxScore, 0)

  return {
    currentStepIndex: 0,
    currentStep: STEP_ORDER[0],
    isComplete: false,
    stepRecords: {} as Record<LoopStep, StepRecord | undefined>,
    originalSentence: '',
    revisedSentence: '',
    aiFeedbackData: null,
    revisionScoreDetails: DEFAULT_REVISION_SCORE_DETAILS.map((d) => ({ ...d })),
    totalDraft1Score: 0,
    totalDraft2Score: 0,
    maxTotalScore,
    diagnosedErrors: [],
    startedAt: now,
    ...overrides,
  }
}

/**
 * Calculate the Revision Score from AI feedback data.
 * Maps AI scores to the 4 revision score dimensions.
 */
function calculateRevisionScore(
  draft1Feedback: AIFeedbackSummary | null,
  draft2Feedback: AIFeedbackSummary | null
): RevisionScoreDetail[] {
  const details = DEFAULT_REVISION_SCORE_DETAILS.map((d) => ({ ...d }))

  if (draft1Feedback) {
    // Map naturalness (0-100) to dimension score (0-30)
    details[0].draft1Score = Math.round((draft1Feedback.naturalness / 100) * details[0].maxScore)
    // Map grammar score (0-100) to dimension score (0-25)
    details[1].draft1Score = Math.round((draft1Feedback.grammarScore / 100) * details[1].maxScore)
    // Map construction match (0-100) to dimension score (0-25)
    details[2].draft1Score = Math.round((draft1Feedback.constructionMatch / 100) * details[2].maxScore)
    // Semantic role mapping: derive from construction match + naturalness average (0-20)
    const roleScore = Math.round(((draft1Feedback.constructionMatch + draft1Feedback.naturalness) / 2 / 100) * details[3].maxScore)
    details[3].draft1Score = roleScore
  }

  if (draft2Feedback) {
    details[0].draft2Score = Math.round((draft2Feedback.naturalness / 100) * details[0].maxScore)
    details[1].draft2Score = Math.round((draft2Feedback.grammarScore / 100) * details[1].maxScore)
    details[2].draft2Score = Math.round((draft2Feedback.constructionMatch / 100) * details[2].maxScore)
    const roleScore = Math.round(((draft2Feedback.constructionMatch + draft2Feedback.naturalness) / 2 / 100) * details[3].maxScore)
    details[3].draft2Score = roleScore
  }

  // Calculate improvement
  for (const d of details) {
    d.improvement = d.draft2Score - d.draft1Score
  }

  return details
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function usePracticeLoop(options: UsePracticeLoopOptions): UsePracticeLoopReturn {
  const { constructionId, persistKey, autoPersist = true } = options
  const storageKey = useRef(getStorageKey(constructionId, persistKey)).current

  // Initialize state from localStorage or defaults
  const [state, setState] = useState<PracticeLoopState>(createInitialState())

  useEffect(() => {
    if (autoPersist) {
      const saved = loadState(storageKey)
      if (saved) {
        setState(createInitialState(saved))
      }
    }
  }, [autoPersist, storageKey])

  // Persist state to localStorage
  useEffect(() => {
    if (autoPersist) {
      saveState(storageKey, state)
    }
  }, [state, autoPersist, storageKey])

  // Navigation
  const goNext = useCallback(() => {
    setState((prev) => {
      if (prev.currentStepIndex >= STEP_ORDER.length - 1) {
        // Mark as complete
        return {
          ...prev,
          isComplete: true,
          completedAt: new Date().toISOString(),
        }
      }
      const nextIndex = prev.currentStepIndex + 1
      const nextStep = STEP_ORDER[nextIndex]
      const now = new Date().toISOString()

      return {
        ...prev,
        currentStepIndex: nextIndex,
        currentStep: nextStep,
        stepRecords: {
          ...prev.stepRecords,
          [nextStep]: prev.stepRecords[nextStep] || {
            step: nextStep,
            startedAt: now,
          },
        },
      }
    })
  }, [])

  const goBack = useCallback(() => {
    setState((prev) => {
      if (prev.currentStepIndex <= 0) return prev
      const prevIndex = prev.currentStepIndex - 1
      return {
        ...prev,
        currentStepIndex: prevIndex,
        currentStep: STEP_ORDER[prevIndex],
      }
    })
  }, [])

  const goToStep = useCallback((step: LoopStep) => {
    const index = STEP_ORDER.indexOf(step)
    if (index === -1) return
    setState((prev) => {
      const now = new Date().toISOString()
      return {
        ...prev,
        currentStepIndex: index,
        currentStep: step,
        stepRecords: {
          ...prev.stepRecords,
          [step]: prev.stepRecords[step] || {
            step,
            startedAt: now,
          },
        },
      }
    })
  }, [])

  const reset = useCallback(() => {
    setState(createInitialState())
    if (autoPersist) {
      localStorage.removeItem(storageKey)
    }
  }, [autoPersist, storageKey])

  // Data setters
  const setOriginalSentence = useCallback((sentence: string) => {
    setState((prev) => ({ ...prev, originalSentence: sentence }))
  }, [])

  const setRevisedSentence = useCallback((sentence: string) => {
    setState((prev) => ({
      ...prev,
      revisedSentence: sentence,
    }))
  }, [])

  const setAIFeedback = useCallback((feedback: AIFeedbackSummary) => {
    setState((prev) => {
      const isDraft2 = prev.revisedSentence.length > 0
      const diagnosedErrors = feedback.diagnosedErrorCodes.map((e) => ({
        code: e.code,
        confidence: e.confidence,
      }))

      // Calculate revision score
      const draft1Feedback = isDraft2 ? prev.aiFeedbackData || feedback : feedback
      const draft2Feedback = isDraft2 ? feedback : null
      const scoreDetails = calculateRevisionScore(draft1Feedback, draft2Feedback)
      const totalDraft1Score = scoreDetails.reduce((sum, d) => sum + d.draft1Score, 0)
      const totalDraft2Score = scoreDetails.reduce((sum, d) => sum + d.draft2Score, 0)

      return {
        ...prev,
        aiFeedbackData: feedback,
        diagnosedErrors: [...prev.diagnosedErrors, ...diagnosedErrors],
        revisionScoreDetails: scoreDetails,
        totalDraft1Score,
        totalDraft2Score,
      }
    })
  }, [])

  const setStepInput = useCallback((step: LoopStep, input: unknown) => {
    setState((prev) => {
      const record = prev.stepRecords[step]
      return {
        ...prev,
        stepRecords: {
          ...prev.stepRecords,
          [step]: {
            step,
            startedAt: record?.startedAt || new Date().toISOString(),
            userInput: input,
          },
        },
      }
    })
  }, [])

  const setStepResult = useCallback((step: LoopStep, result: unknown) => {
    setState((prev) => {
      const record = prev.stepRecords[step]
      return {
        ...prev,
        stepRecords: {
          ...prev.stepRecords,
          [step]: {
            step,
            startedAt: record?.startedAt || new Date().toISOString(),
            completedAt: new Date().toISOString(),
            userInput: record?.userInput,
            result,
          },
        },
      }
    })
  }, [])

  const setRevisionScore = useCallback((details: RevisionScoreDetail[]) => {
    setState((prev) => {
      const totalDraft1Score = details.reduce((sum, d) => sum + d.draft1Score, 0)
      const totalDraft2Score = details.reduce((sum, d) => sum + d.draft2Score, 0)
      return {
        ...prev,
        revisionScoreDetails: details,
        totalDraft1Score,
        totalDraft2Score,
      }
    })
  }, [])

  // Computed
  const canGoBack = state.currentStepIndex > 0
  const canGoNext = state.currentStepIndex < STEP_ORDER.length - 1
  const progress = ((state.currentStepIndex + 1) / STEP_ORDER.length) * 100

  return {
    state,
    goNext,
    goBack,
    goToStep,
    reset,
    setOriginalSentence,
    setRevisedSentence,
    setAIFeedback,
    setStepInput,
    setStepResult,
    setRevisionScore,
    canGoBack,
    canGoNext,
    progress,
  }
}
