import { getWordLimit } from './writingPrompt'
import type { AdaptiveExerciseType } from '@/lib/exercises/adaptiveExercise'

export interface GeneratedWritingExercise {
  exerciseId: string
  level: string
  type: string
  theme: string
  context: string
  task: string
  wordCount: string
  targetConstructions: string
  referenceAnswer: string
  metadata?: Record<string, any>
}

export function countEnglishWords(text: string) {
  return (text.match(/[A-Za-z]+(?:[-'][A-Za-z]+)*/g) || []).length
}

export function validateWritingExercise(exercise: GeneratedWritingExercise) {
  const issues: string[] = []
  const adaptiveType = exercise.metadata?.adaptive_exercise_type as AdaptiveExerciseType | undefined
  const limit = adaptiveType === 'long_continuation'
    ? { min: 100, max: 150 }
    : adaptiveType === 'micro_continuation'
      ? { min: 40, max: 60 }
      : adaptiveType === 'action_chain_continuation'
        ? { min: 40, max: 80 }
        : getWordLimit(exercise.type)
  const answerWords = countEnglishWords(exercise.referenceAnswer || '')

  if (exercise.referenceAnswer && ['D1', 'D2', 'ACT'].includes(exercise.type)) {
    if (answerWords < limit.min || answerWords > limit.max) {
      issues.push(`referenceAnswer has ${answerWords} words; expected ${limit.min}-${limit.max}.`)
    }
  }

  if (exercise.type === 'GAP') {
    const blanks = exercise.metadata?.blanks
    const blankCount = Array.isArray(blanks) ? blanks.length : (exercise.context.match(/_{3,}|\[Blank\s*\d+\]/gi) || []).length
    if (blankCount < 1 || blankCount > 2) {
      issues.push(`gap_continuation must contain 1-2 blanks; found ${blankCount}.`)
    }
  }

  const codes = (exercise.targetConstructions || '').split(',').map((code) => code.trim()).filter(Boolean)
  if (codes.length < 2 || codes.length > 4) {
    issues.push(`targetConstructions must contain 2-4 PostgreSQL construction codes; found ${codes.length}.`)
  }

  return {
    valid: issues.length === 0,
    issues,
    answerWords,
  }
}

export function enforceStudentOnlyReference(exercise: GeneratedWritingExercise, includeReferenceAnswer?: boolean) {
  if (!includeReferenceAnswer && (exercise.type === 'D1' || exercise.type === 'D2')) {
    return { ...exercise, referenceAnswer: '' }
  }
  return exercise
}
