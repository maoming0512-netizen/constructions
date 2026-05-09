import type { AISkillConfig, AISkillInput, AISkillResult } from './types'

/* ── Types ── */

export interface AnalyzeInput extends AISkillInput {
  sentence: string
  learnerLevel?: 'beginner' | 'intermediate' | 'advanced'
  focusConstructions?: string[]
}

/* ── Level-specific instructions ── */

const levelInstructions: Record<string, string> = {
  beginner: `面向初级学习者：
- 使用简单中文解释，避免复杂术语
- 只标注核心语义角色（施事、受事、主题等）
- 判断句子是否"自然"，用日常生活类比说明
- 给出2-3条具体改进建议`,

  intermediate: `面向中级学习者：
- 使用中文解释，专业术语保留英文并注释
- 完整标注语义角色，解释form-function pairing
- 引用Goldberg理论（如Semantic Coherence Principle）
- 分析动词与构式的语义相容性`,

  advanced: `面向高级学习者：
- 深入分析构式层面的语义贡献
- 讨论Surface Generalization、Statistical Preemption等理论
- 分析creative extensions和coercion
- 评估conventionality gradient`,
}

/* ── System Prompt ── */

const baseSystemPrompt = `你是一位专业的构式语法(Construction Grammar)教学助手，精通Adele E. Goldberg的理论。

你的任务：分析用户提供的英文句子，用中文输出分析结果。

输出格式要求（Markdown）：

## 🔍 构式识别
列出检测到的构式，包括名称、形式模板、核心意义。

## 📊 自然度评估
- 评分：1-5星
- 标签：非常自然 / 自然 / 略有别扭 / 不自然
- 说明：为什么是这个评级

## 🏷️ 语义角色映射
用表格或列表展示每个成分对应的语义角色。
格式：成分 → 角色（简要说明）

## 💡 分析点评
用中文详细解释这个句子的构式特点：
- 为什么这个构式适合/不适合这个句子
- 动词与构式的语义相容性
- 引用的Goldberg理论概念

## ✏️ 改进建议
如果是用户自己写的句子，给出2-3条具体改进建议。

## 📚 相似构式
列出1-2个相似构式，简要说明区别。`

/* ── Execute ── */

async function execute(
  input: AnalyzeInput,
  _apiConfig?: import('../client').AIApiConfig
): Promise<AISkillResult<any>> {
  const level = input.learnerLevel || 'intermediate'
  const dynamicPrompt = baseSystemPrompt + '\n\n' + (levelInstructions[level] || levelInstructions.intermediate)

  const enrichedInput = {
    ...input,
    _dynamicSystemPrompt: dynamicPrompt,
  }

  const { callSkill } = await import('../client')
  return callSkill('analyzeSentence', enrichedInput as AISkillInput, _apiConfig)
}

/* ── Fallback ── */

function fallback(input: AISkillInput): AISkillResult<any> {
  const sentence = (input as AnalyzeInput).sentence || 'the sentence'
  return {
    success: true,
    usedFallback: true,
    data: {
      detectedConstructions: [
        {
          name: 'Caused-Motion Construction',
          formPattern: 'Subj V Obj Path',
          coreMeaning: 'X causes Y to move Z',
          confidence: 0.85,
        },
      ],
      naturalness: {
        score: 4,
        label: 'Natural',
        explanation: '该表达符合致使-移动构式的常规用法。',
      },
      semanticRoles: [
        { form: sentence.split(' ')[0] || 'Subject', role: 'Agent/Causer' },
        { form: sentence.split(' ').slice(1).join(' '), role: 'Theme + Path' },
      ],
      feedbackZh: `「${sentence}」符合致使-移动构式的典型用法。根据Goldberg的Surface Generalization Hypothesis，这个表层形式本身编码了"致使移动"的意义。`,
      suggestedAlternatives: ['Try varying the path preposition (into, onto, through)'],
      practicePrompts: ['用 caused-motion construction 写一个包含不同动词的句子。'],
    },
  }
}

/* ── Skill Export ── */

export const analyzeSentenceSkill = {
  config: {
    name: 'analyzeSentence',
    description: 'Analyze an English sentence for constructions, naturalness, and semantic roles.',
    systemPrompt: baseSystemPrompt,
    jsonSchema: {
      type: 'object',
      properties: {
        detectedConstructions: { type: 'array' },
        naturalness: { type: 'object' },
        semanticRoles: { type: 'array' },
        feedbackZh: { type: 'string' },
        suggestedAlternatives: { type: 'array' },
        practicePrompts: { type: 'array' },
      },
      required: ['detectedConstructions', 'naturalness', 'semanticRoles', 'feedbackZh'],
    },
    temperature: 0.3,
    maxTokens: 2048,
  } as AISkillConfig,
  fallback,
  execute,
}
