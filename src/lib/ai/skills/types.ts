/**
 * AI Skill System - Shared Types
 *
 * Defines the core interfaces for the skill-based AI architecture.
 * Each skill encapsulates its own prompt, schema, fallback, and execution logic.
 */

/** Configuration for a single AI skill */
export interface AISkillConfig {
  name: string
  description: string
  systemPrompt: string
  jsonSchema: object
  fallbackResponse: object
  maxTokens?: number
  temperature?: number
}

/** Input to a skill execution — generic key-value map */
export interface AISkillInput {
  [key: string]: any
}

/** Result wrapper for all skill calls */
export interface AISkillResult<T = any> {
  success: boolean
  data?: T
  error?: string
  rawResponse?: string
  usedFallback: boolean
}

/** API configuration for OpenAI-compatible endpoints */
export interface AIApiConfig {
  apiKey: string
  baseURL: string
  model: string
}

/** Skill registry entry — combines config with execution */
export interface AISkill<TInput = AISkillInput, TOutput = any> {
  config: AISkillConfig
  execute: (input: TInput, apiConfig?: AIApiConfig) => Promise<AISkillResult<TOutput>>
  fallback: (input: TInput) => AISkillResult<TOutput>
}

/** Error categories for structured error handling */
export type AIErrorCategory =
  | 'network' // Timeout, DNS, connection refused
  | 'auth' // Invalid API key, unauthorized
  | 'rate_limit' // Too many requests
  | 'validation' // Invalid JSON from AI, schema mismatch
  | 'model' // Model unavailable, context length exceeded
  | 'abort' // User cancelled / client-side abort
  | 'unknown' // Catch-all

export interface AIErrorDetails {
  category: AIErrorCategory
  message: string
  statusCode?: number
  retryable: boolean
}
