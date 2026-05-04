export type ExerciseType =
  | 'meaning-from-form'
  | 'naturalness-judgment'
  | 'construction-sorting'
  | 'prototype-to-extension'
  | 'repair-sentence'
  | 'ai-coach'
  | 'generate-by-construction'

export interface Exercise {
  id: string
  type: ExerciseType
  title: string
  description: string
  constructionId?: string
  difficulty: 1 | 2 | 3
  content: ExerciseContent
  createdAt?: string
  updatedAt?: string
}

export interface ExerciseContent {
  prompt: string
  options?: string[]
  correctAnswer?: string | string[]
  explanation?: string
  hints?: string[]
}

export interface ExerciseProgress {
  exerciseId: string
  userId: string
  completed: boolean
  score: number
  attempts: number
  lastAttemptAt?: string
}

export interface ExerciseTypeInfo {
  id: ExerciseType
  name: string
  description: string
  iconColor: string
  bgColor: string
}

// === V2 Content Expansion: Pedagogical & Assessment Metadata ===

export type Register = 'spoken' | 'written' | 'academic' | 'casual' | 'literary'
export type SourceType = 'ielts' | 'toefl' | 'academic' | 'authentic' | 'constructed'
export type DifficultyLabel = 'beginner' | 'intermediate' | 'advanced'

export interface GoldbergMetadata {
  /** Which Goldberg (1995, 2006, 2019) concept this exercise targets */
  goldbergConcept: string
  /** Specific learning objective tied to construction grammar pedagogy */
  learningObjective: string
  /** The skill this exercise aims to develop */
  targetSkill: string
  /** Common misconception learners have for this construction */
  expectedMisconception: string
}

export interface AssessmentMetadata {
  /** IELTS band score this exercise targets (e.g., 6.5, 7.0, 7.5, 8.0) */
  ieltsBand?: number
  /** TOEFL score range this exercise targets (e.g., 100, 110, 115) */
  toeflScore?: number
  /** Types of errors this exercise is designed to surface */
  errorTypes?: string[]
}

export interface AdvancedExercise {
  id: string
  constructionId: string
  exerciseType: ExerciseType | string
  prompt: string
  context?: string
  register?: Register
  sourceType?: SourceType
  options?: string[]
  correctAnswer: any
  explanationZh: string
  explanationEn: string
  /** Note on conventionality: why this form is (or is not) conventional in English */
  conventionalityNote: string
  /** Explanation mapping semantic roles (Agent, Patient, Theme, Goal, etc.) to construction slots */
  semanticRoleExplanation: string
  /** Contrast example showing a different construction with similar but distinct meaning */
  contrastExample: string
  difficulty: DifficultyLabel
  tags: string[]
  /** Pedagogical metadata grounded in Construction Grammar theory */
  learningObjective: string
  goldbergConcept: string
  targetSkill: string
  expectedMisconception: string
  /** Assessment metadata for standardized test alignment */
  ieltsBand?: number
  toeflScore?: number
  errorTypes?: string[]
}
