// ---------------------------------------------------------------------------
// V2 Practice Loop — 8-Step Learning Flow Components
// ---------------------------------------------------------------------------
// Based on Goldberg's Construction Grammar learning methodology:
//   Input Flood → Pattern Noticing → Role Mapping → Controlled Production
//   → Free Production → AI Feedback → Revision → Reflection
// ---------------------------------------------------------------------------

export { default as InputFlood } from './InputFlood'
export type { InputFloodProps } from './InputFlood'

export { default as PatternNoticing } from './PatternNoticing'
export type { PatternNoticingProps } from './PatternNoticing'

export { default as RoleMappingStep } from './RoleMappingStep'
export type { RoleMappingStepProps, SemanticRole, TokenRole } from './RoleMappingStep'

export { default as ControlledProduction } from './ControlledProduction'
export type { ControlledProductionProps, ControlledExercise } from './ControlledProduction'

export { default as FreeProduction } from './FreeProduction'
export type { FreeProductionProps } from './FreeProduction'

export { default as AIFeedbackStep } from './AIFeedbackStep'
export type { AIFeedbackStepProps, AIFeedbackData } from './AIFeedbackStep'

export { default as RevisionStep } from './RevisionStep'
export type { RevisionStepProps } from './RevisionStep'

export { default as ReflectionStep } from './ReflectionStep'
export type { ReflectionStepProps, RevisionScoreDetail } from './ReflectionStep'
