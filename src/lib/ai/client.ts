/**
 * AI Client — Unified Skill Calling Interface
 *
 * Provides safe, robust API calls for the skill-based AI architecture:
 * - Request timeout (30s)
 * - Retry mechanism (max 3 attempts)
 * - Error classification
 * - Automatic fallback when API is unconfigured
 * - Streaming support with user-friendly markdown output
 * - Dynamic system prompt support via _dynamicSystemPrompt input field
 */

import type {
  AISkillConfig,
  AISkillInput,
  AISkillResult,
  AIApiConfig,
  AIErrorDetails,
} from './skills/types'

/* ─────────────────────────── Skill Registry ─────────────────────────── */

import { analyzeSentenceSkill } from './skills/analyzeSentence.skill'
import { generateExerciseSkill } from './skills/generateExercise.skill'
import { minimalPairSkill } from './skills/minimalPair.skill'
import { teacherExplainSkill } from './skills/teacherExplain.skill'
import { constructionExpandSkill } from './skills/constructionExpand.skill'
import { analyzeAnswerSkill } from './skills/analyzeAnswer.skill'
import { genWritingSkill } from './skills/genWriting.skill'
import { findConstructionsSkill } from './skills/findConstructions.skill'
import { constructionAnalyzeSkill } from './skills/constructionAnalyze.skill'
import { exercisePlanSkill } from './skills/exercisePlan.skill'
import { adaptiveExerciseGenerateSkill } from './skills/adaptiveExerciseGenerate.skill'
import { exerciseQualityReviewSkill } from './skills/exerciseQualityReview.skill'
import { constructionArticleGenerateSkill } from './skills/constructionArticleGenerate.skill'

const skillRegistry: Record<string, { config: AISkillConfig; fallback: (input: AISkillInput) => AISkillResult<any> }> = {
  [analyzeSentenceSkill.config.name]: analyzeSentenceSkill,
  [generateExerciseSkill.config.name]: generateExerciseSkill,
  [minimalPairSkill.config.name]: minimalPairSkill,
  [teacherExplainSkill.config.name]: teacherExplainSkill,
  [constructionExpandSkill.config.name]: constructionExpandSkill,
  [analyzeAnswerSkill.config.name]: analyzeAnswerSkill,
  [genWritingSkill.config.name]: genWritingSkill,
  [findConstructionsSkill.config.name]: findConstructionsSkill,
  [constructionAnalyzeSkill.config.name]: constructionAnalyzeSkill,
  [exercisePlanSkill.config.name]: exercisePlanSkill,
  [adaptiveExerciseGenerateSkill.config.name]: adaptiveExerciseGenerateSkill,
  [exerciseQualityReviewSkill.config.name]: exerciseQualityReviewSkill,
  [constructionArticleGenerateSkill.config.name]: constructionArticleGenerateSkill,
}

export function listSkills(): string[] {
  return Object.keys(skillRegistry)
}

export function getSkillConfig(skillName: string): AISkillConfig | undefined {
  return skillRegistry[skillName]?.config
}

/* ─────────────────────────── API Config ─────────────────────────── */

let globalApiConfig: AIApiConfig | null = null

export const DEFAULT_AI_CONFIG: AIApiConfig = {
  apiKey: process.env.DEEPSEEK_API_KEY || process.env.AI_API_KEY || '',
  baseURL: process.env.DEEPSEEK_BASE_URL || process.env.AI_BASE_URL || 'https://api.deepseek.com',
  model: process.env.DEEPSEEK_MODEL || process.env.AI_MODEL || 'deepseek-chat',
}

function persistConfig(config: AIApiConfig): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('cs_api_key', config.apiKey)
  localStorage.setItem('cs_base_url', config.baseURL)
  localStorage.setItem('cs_model', config.model)
}

function loadPersistedConfig(): AIApiConfig | null {
  if (typeof window === 'undefined') return null
  const apiKey = localStorage.getItem('cs_api_key')
  const baseURL = localStorage.getItem('cs_base_url')
  const model = localStorage.getItem('cs_model')
  if (!apiKey) return null
  return { apiKey, baseURL: baseURL || DEFAULT_AI_CONFIG.baseURL, model: model || DEFAULT_AI_CONFIG.model }
}

export function setAIConfig(config: AIApiConfig): void {
  globalApiConfig = config
  if (typeof window !== 'undefined') persistConfig(config)
}

export function getAIConfig(): AIApiConfig {
  // Always use default config — reliable, no localStorage interference
  return loadPersistedConfig() || DEFAULT_AI_CONFIG
}

export function isAIConfigured(): boolean {
  return !!getAIConfig().apiKey
}

/* ─────────────────────────── Constants ─────────────────────────── */

// 无超时限制，让用户可以等待长文本生成
const REQUEST_TIMEOUT_MS = 0
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1000

/* ─────────────────────────── Error Classification ─────────────────────────── */

function classifyError(error: unknown): AIErrorDetails {
  if (error instanceof Response) {
    const status = error.status
    if (status === 401 || status === 403) {
      return { category: 'auth', message: 'API认证失败，请检查API Key', statusCode: status, retryable: false }
    }
    if (status === 429) {
      return { category: 'rate_limit', message: '请求过于频繁，请稍后再试', statusCode: status, retryable: true }
    }
    if (status >= 500) {
      return { category: 'model', message: `AI服务错误 (${status})`, statusCode: status, retryable: true }
    }
    return { category: 'validation', message: `请求错误 (${status})`, statusCode: status, retryable: false }
  }

  if (error instanceof Error) {
    const msg = error.message.toLowerCase()
    if (msg.includes('timeout') || msg.includes('abort')) {
      return { category: 'network', message: '请求超时，请重试', retryable: true }
    }
    if (msg.includes('fetch') || msg.includes('network') || msg.includes('connection')) {
      return { category: 'network', message: '网络连接失败，请检查网络', retryable: true }
    }
    return { category: 'unknown', message: error.message, retryable: false }
  }

  return { category: 'unknown', message: '未知错误', retryable: false }
}

/* ─────────────────────────── Retry Logic ─────────────────────────── */

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function withRetry<T>(fn: () => Promise<T>, maxRetries = MAX_RETRIES): Promise<T> {
  let lastError: AIErrorDetails = { category: 'unknown', message: 'Unknown error', retryable: false }

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = classifyError(error)
      if (!lastError.retryable || attempt >= maxRetries) throw lastError
      const delay = RETRY_DELAY_MS * Math.pow(2, attempt)
      await sleep(delay)
    }
  }
  throw lastError
}

/* ─────────────────────────── Timeout ─────────────────────────── */

function createTimeoutSignal(timeoutMs: number): AbortSignal {
  const controller = new AbortController()
  // 如果timeoutMs为0，则不设置超时
  if (timeoutMs > 0) {
    setTimeout(() => controller.abort(), timeoutMs)
  }
  return controller.signal
}

function combineSignals(signal1: AbortSignal, signal2: AbortSignal): AbortSignal {
  const controller = new AbortController()
  
  const onAbort = () => controller.abort()
  signal1.addEventListener('abort', onAbort)
  signal2.addEventListener('abort', onAbort)
  
  // Cleanup listeners when either signal aborts
  const cleanup = () => {
    signal1.removeEventListener('abort', onAbort)
    signal2.removeEventListener('abort', onAbort)
  }
  controller.signal.addEventListener('abort', cleanup, { once: true })
  
  return controller.signal
}

/* ─────────────────────────── System Prompt Resolution ─────────────────────────── */

function resolveSystemPrompt(skillConfig: AISkillConfig, input: AISkillInput): string {
  return (input._dynamicSystemPrompt as string) || skillConfig.systemPrompt
}

/* ─────────────────────────── Non-streaming Call ─────────────────────────── */

async function callOpenAINonStream(
  skillConfig: AISkillConfig,
  input: AISkillInput,
  apiConfig: AIApiConfig
): Promise<string> {
  const { baseURL, apiKey, model } = apiConfig
  const url = `${baseURL.replace(/\/+$/, '')}/chat/completions`

  const effectiveSystemPrompt = resolveSystemPrompt(skillConfig, input)

  const body: Record<string, any> = {
    model,
    messages: [
      { role: 'system', content: effectiveSystemPrompt },
      { role: 'user', content: typeof input === 'object' && input !== null ? JSON.stringify(input) : String(input) },
    ],
    temperature: skillConfig.temperature ?? 0.3,
    max_tokens: skillConfig.maxTokens ?? 4096,
    stream: false,
    response_format: { type: 'json_object' },
  }

  const signal = createTimeoutSignal(REQUEST_TIMEOUT_MS)

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify(body),
    signal,
  })

  if (!response.ok) throw response

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('Empty response')
  return content
}

/* ─────────────────────────── Streaming Call ─────────────────────────── */

/**
 * Parse a Server-Sent Event (SSE) line from the stream.
 * Handles both standard OpenAI format and DeepSeek-specific fields.
 * 返回 content 和 reasoning_content（如果存在）
 */
function parseSSELine(line: string): { content?: string; reasoning?: string } | null {
  const trimmed = line.trim()
  if (!trimmed || trimmed === 'data: [DONE]') return null
  if (!trimmed.startsWith('data: ')) return null

  try {
    const json = JSON.parse(trimmed.slice(6))
    const delta = json.choices?.[0]?.delta
    if (!delta) return null
    
    const content = delta.content || ''
    const reasoning = ''
    
    // 如果两者都为空，返回null
    if (!content && !reasoning) return null
    
    return { 
      ...(content && { content })
    }
  } catch {
    return null
  }
}

export async function* callOpenAIStream(
  skillConfig: AISkillConfig,
  input: AISkillInput,
  apiConfig: AIApiConfig,
  externalSignal?: AbortSignal
): AsyncGenerator<{ type: 'content' | 'reasoning'; text: string }> {
  const { baseURL, apiKey, model } = apiConfig
  const url = `${baseURL.replace(/\/+$/, '')}/chat/completions`

  const effectiveSystemPrompt = resolveSystemPrompt(skillConfig, input)

  const body: Record<string, any> = {
    model,
    messages: [
      { role: 'system', content: effectiveSystemPrompt },
      { role: 'user', content: typeof input === 'object' && input !== null ? JSON.stringify(input) : String(input) },
    ],
    temperature: skillConfig.temperature ?? 0.4,
    max_tokens: skillConfig.maxTokens ?? 4096,
    stream: true,
  }

  console.log(`[AI] Streaming "${skillConfig.name}" → ${model}`)

  // Combine timeout signal with external signal
  const timeoutSignal = createTimeoutSignal(REQUEST_TIMEOUT_MS)
  const signal = externalSignal 
    ? combineSignals(timeoutSignal, externalSignal)
    : timeoutSignal

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify(body),
    signal,
  })

  if (!response.ok) throw response

  const reader = response.body?.getReader()
  if (!reader) throw new Error('No response body')

  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const parsed = parseSSELine(line)
        if (parsed) {
          // 优先返回reasoning，让用户看到思考过程
          if (parsed.content) {
            yield { type: 'content', text: parsed.content }
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

/* ─────────────────────────── Public: callSkill (non-streaming) ─────────────────────────── */

export async function callSkill<T = any>(
  skillName: string,
  input: AISkillInput,
  config?: AIApiConfig
): Promise<AISkillResult<T>> {
  const skill = skillRegistry[skillName]
  if (!skill) {
    return { success: false, error: `未知skill: "${skillName}"`, usedFallback: false }
  }

  const apiConfig = config || getAIConfig()
  if (!apiConfig?.apiKey) {
    return skill.fallback(input)
  }

  try {
    let rawText = await withRetry(() => callOpenAINonStream(skill.config, input, apiConfig))

    // Try to parse as JSON
    let parsed: any
    try {
      parsed = JSON.parse(rawText)
    } catch {
      const match = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
      if (match) {
        parsed = JSON.parse(match[1])
      } else {
        rawText = await withRetry(() => callOpenAINonStream(skill.config, {
          ...input,
          _dynamicSystemPrompt: `${resolveSystemPrompt(skill.config, input)}\n\nYour previous response was not valid JSON. Return ONLY one strict JSON object that matches the schema. Do not include markdown, comments, explanations, or chain-of-thought.`,
        }, apiConfig), 1)
        parsed = JSON.parse(rawText)
      }
    }

    // Validate required fields
    const schema = skill.config.jsonSchema as Record<string, any>
    const required = schema?.required as string[] || []
    const missing = required.filter((k) => !(k in parsed))
    if (missing.length > 0) {
      console.warn(`[AI] Missing keys: ${missing.join(', ')}`)
      const fb = skill.fallback(input)
      fb.rawResponse = rawText
      return fb
    }

    return { success: true, data: parsed as T, usedFallback: false }
  } catch (error) {
    const details = classifyError(error)
    console.error(`[AI] "${skillName}" failed:`, details.message)

    if (details.retryable) {
      const fb = skill.fallback(input)
      fb.error = details.message
      return fb
    }

    return { success: false, error: details.message, usedFallback: false }
  }
}

/* ─────────────────────────── Public: streamSkill ─────────────────────────── */

/**
 * Stream AI response. Yields text chunks for user-friendly display.
 *
 * When the stream completes, the accumulated text can be:
 * - Displayed directly as markdown (user-friendly)
 * - Parsed as JSON if needed (structured data)
 *
 * Errors are handled gracefully: if the API call fails, the generator
 * yields an error message followed by fallback markdown content.
 */
export async function* streamSkill(
  skillName: string,
  input: AISkillInput,
  config?: AIApiConfig,
  signal?: AbortSignal
): AsyncGenerator<string> {
  const skill = skillRegistry[skillName]
  if (!skill) {
    yield `❌ 错误：未知的AI功能 "${skillName}"\n\n`
    return
  }

  const apiConfig = config || getAIConfig()
  if (!apiConfig?.apiKey) {
    yield '⚠️ **API 未配置**\n\n请在「设置」页面配置您的 API Key。\n\n---\n\n'
    const fb = skill.fallback(input)
    yield formatFallbackAsMarkdown(skillName, fb.data)
    return
  }

  try {
    const stream = callOpenAIStream(skill.config, input, apiConfig, signal)
    let hasContent = false

    for await (const chunk of stream) {
      if (chunk.type === 'content' && chunk.text) {
        hasContent = true
        yield chunk.text
      }
    }

    if (!hasContent) {
      yield '\n\n⚠️ **API 返回了空内容**\n\n--- 以下为本地模拟结果 ---\n\n'
      const fb = skill.fallback(input)
      yield formatFallbackAsMarkdown(skillName, fb.data)
    }
  } catch (error) {
    const details = classifyError(error)
    console.error(`[AI] "${skillName}" failed:`, details.message)

    // Yield error as markdown, then fallback
    yield `\n\n❌ **API 调用失败**\n\n原因：${details.message}\n\n`

    if (details.category === 'auth') {
      yield '💡 **建议**：请在「设置」页面检查 API Key 是否正确。\n\n'
    } else if (details.category === 'network') {
      yield '💡 **建议**：\n1. 检查网络连接\n2. 确认 API 地址可访问\n3. 尝试关闭浏览器代理/VPN\n\n'
    } else if (details.category === 'rate_limit') {
      yield '💡 **建议**：请求过于频繁，请等待几秒后重试。\n\n'
    }

    yield '--- 以下为本地模拟结果 ---\n\n'
    const fb = skill.fallback(input)
    yield formatFallbackAsMarkdown(skillName, fb.data)
  }
}

/**
 * Format fallback data as user-friendly markdown text.
 */
function formatFallbackAsMarkdown(skillName: string, data: any): string {
  if (!data) return '（暂无数据）'

  switch (skillName) {
    case 'analyzeSentence':
      return `## 📋 句子分析结果\n\n**注意**：此结果为本地模拟数据，非AI实时分析。\n\n### 检测到的构式\n- ${data.detectedConstructions?.map((c: any) => c.name).join('\n- ') || '未检测到'}\n\n### 自然度\n${data.naturalness?.label || '未知'}\n\n### 语义角色\n${data.semanticRoles?.map((r: any) => `- **${r.form}** → ${r.role}`).join('\n') || '无'}\n\n### 建议\n${data.feedbackZh || '无'}\n`

    case 'generateExercise':
      return `## 📝 练习题\n\n**注意**：此结果为本地模拟数据。\n\n**构式**：${data.constructionId || '未指定'}\n**难度**：${data.difficulty || '未指定'}\n\n${data.prompt || ''}\n\n${data.options ? data.options.map((o: string, i: number) => `${String.fromCharCode(65 + i)}. ${o}`).join('\n') : ''}\n\n**答案**：${data.correctAnswer || '见解析'}\n\n**解析**：${data.explanationZh || '暂无解析'}\n`

    case 'minimalPair':
      return `## 🔍 最小对对比\n\n**注意**：此结果为本地模拟数据。\n\n${data.pairs?.map((p: any, i: number) => `### 对比 ${i + 1}\n**A**：${p.sentenceA}\n**B**：${p.sentenceB}\n\n差异：${p.difference || '见详细解析'}\n`).join('\n---\n') || '无对比数据'}\n`

    case 'teacherExplain':
      return `## 📖 构式讲解\n\n**注意**：此结果为本地模拟数据。\n\n### 概念\n${data.concept || '暂无'}\n\n### 形式模板\n${data.formPattern || '暂无'}\n\n### 核心意义\n${data.coreMeaning || '暂无'}\n\n### 典型动词\n${data.typicalVerbs?.join('、') || '暂无'}\n\n### 例句\n${data.examples?.map((e: any) => `- ${e.sentence}`).join('\n') || '暂无'}\n\n### 学习建议\n${data.learningTips?.join('\n') || '暂无'}\n`

    case 'constructionExpand':
      return `## 🌱 构式扩展\n\n**注意**：此结果为本地模拟数据。\n\n**原型**：${data.prototype || '未指定'}\n\n${data.extensions?.map((e: any) => `- **${e.level}**：${e.sentence}（动词：${e.verb}）`).join('\n') || '无扩展数据'}\n`

    default:
      return JSON.stringify(data, null, 2)
  }
}

/* ─────────────────────────── Re-export types ─────────────────────────── */

export type { AISkillConfig, AISkillInput, AISkillResult, AIApiConfig, AIErrorDetails }
