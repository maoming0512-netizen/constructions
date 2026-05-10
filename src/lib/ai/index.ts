/**
 * AI Module — Unified Exports
 *
 * Central entry point for all AI functionality.
 * Import from '@/lib/ai' to access skills, client, types, and utilities.
 *
 * @example
 * ```typescript
 * import { analyzeSentenceSkill, callSkill, isAIConfigured } from '@/lib/ai'
 *
 * // Direct skill execution (typed input/output)
 * const result = await analyzeSentenceSkill.execute({ sentence: 'She gave him a book.' })
 *
 * // Generic skill call by name
 * const result2 = await callSkill('analyzeSentence', { sentence: 'Hello world.' })
 *
 * // Check configuration
 * if (isAIConfigured()) { ... }
 * ```
 */

/* ─────────────────────────── Skill Exports ─────────────────────────── */

export { analyzeSentenceSkill } from './skills/analyzeSentence.skill'
export { generateExerciseSkill } from './skills/generateExercise.skill'
export { minimalPairSkill } from './skills/minimalPair.skill'
export { teacherExplainSkill } from './skills/teacherExplain.skill'
export { constructionExpandSkill } from './skills/constructionExpand.skill'
export { analyzeAnswerSkill } from './skills/analyzeAnswer.skill'
export { genWritingSkill } from './skills/genWriting.skill'
export { findConstructionsSkill } from './skills/findConstructions.skill'
export { constructionAnalyzeSkill } from './skills/constructionAnalyze.skill'
export { exercisePlanSkill } from './skills/exercisePlan.skill'
export { adaptiveExerciseGenerateSkill } from './skills/adaptiveExerciseGenerate.skill'
export { exerciseQualityReviewSkill } from './skills/exerciseQualityReview.skill'
export { constructionArticleGenerateSkill } from './skills/constructionArticleGenerate.skill'

/* ─────────────────────────── Client Exports ─────────────────────────── */

export {
  callSkill,
  streamSkill,
  callOpenAIStream,
  setAIConfig,
  getAIConfig,
  isAIConfigured,
  listSkills,
  getSkillConfig,
  DEFAULT_AI_CONFIG,
} from './client'

/* ─────────────────────────── Type Exports ─────────────────────────── */

export type {
  AISkillConfig,
  AISkillInput,
  AISkillResult,
  AIApiConfig,
  AIErrorDetails,
} from './skills/types'

/* ─────────────────────────── Skill-specific Input/Output Types ─────────────────────────── */

export type {
  AnalyzeInput as AnalyzeSentenceInput,
} from './skills/analyzeSentence.skill'

export type {
  GenerateExerciseInput,
} from './skills/generateExercise.skill'

export type {
  MinimalPairInput,
} from './skills/minimalPair.skill'

export type {
  TeacherExplainInput,
} from './skills/teacherExplain.skill'

export type {
  ConstructionExpandInput,
} from './skills/constructionExpand.skill'

/* ─────────────────────────── Prompts (legacy reference) ─────────────────────────── */

/**
 * Note: The old prompts.ts file has been replaced by the skill system.
 * Each skill now encapsulates its own systemPrompt within its AISkillConfig.
 * If you need backward compatibility, prompts.ts can still be imported separately:
 *
 * ```typescript
 * import { somePrompt } from '@/lib/ai/prompts'
 * ```
 *
 * The skill-based approach ensures prompts are versioned together with their
 * schemas, fallbacks, and execution logic.
 */
