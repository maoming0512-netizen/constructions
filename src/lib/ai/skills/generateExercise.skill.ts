import type { AISkillConfig, AISkillInput, AISkillResult } from './types'

export interface GenerateExerciseInput extends AISkillInput {
  construction: string
  difficulty: number
  exerciseType: string
  topic?: string
  learnerLevel?: 'beginner' | 'intermediate' | 'advanced'
  count?: number
}

/* ── Construction descriptions for prompt ── */

const constructionDescriptions: Record<string, string> = {
  ditransitive: '双及物构式 (Subj V Obj1 Obj2) — "Agent causes Recipient to receive Theme"，如 She gave him a book.',
  'caused-motion': '致使-移动构式 (Subj V Obj Path) — "Causer causes Theme to move along Path"，如 She put the book on the table.',
  resultative: '结果构式 (Subj V Obj Result-AP) — "Agent causes Patient to become Result State"，如 He wiped the table clean.',
  way: '路径构式 (Subj V Poss-way Path) — "Subject moves along path by means of verb"，如 He pushed his way through the crowd.',
  'whats-x-doing': "What's X doing Y? 构式 — 表达意外/不合时宜的存在，如 What's this fly doing in my soup?",
  sai: '主助倒装家族 (Aux Subject Verb...) — 用于疑问、感叹、条件等非典型陈述，如 Did you see that?',
}

/* ── Level-specific instructions ── */

const levelInstructions: Record<string, string> = {
  beginner: `初级题目要求：
- 使用常见动词（give, put, take, make, get等）
- 例句贴近日常生活
- 选项干扰项要反映真实学习者的常见错误
- 解析用简单中文，避免过多术语
- 语义角色只标注最核心的`,

  intermediate: `中级题目要求：
- 使用中等频率动词，包含一些隐喻用法
- 包含自然度判断（区分自然/略有别扭/不自然）
- 引入prototype-to-extension的概念
- 解析引用Goldberg理论，解释为什么某些表达被pre-empt
- 包含对比分析（如ditransitive vs prepositional dative）`,

  advanced: `高级题目要求：
- 使用非常规动词或creative extensions
- 分析coercion和polysemy现象
- 讨论conventionality gradient
- 引入复杂的语义角色映射
- 分析深层理论问题（如Partial Productivity的边界）`,
}

/* ── System Prompt ── */

const baseSystemPrompt = `你是一位专业的构式语法(Construction Grammar)教学助手。你的任务是根据用户要求，生成一道高质量的英语构式练习题，并用中文输出。

输出格式要求（Markdown）：

## 📝 题目
[题目内容，用中文描述任务]

## ✏️ 目标句子
[如果是基于句子的练习，给出英文句子]

## 📋 选项（如适用）
A. [选项1]
B. [选项2]
C. [选项3]
D. [选项4]

## ✅ 正确答案
[正确答案及简要说明]

## 📚 解析
用中文详细解析：
- 这道题考察的构式及其形式-意义配对
- 引用的Goldberg理论概念
- 为什么正确答案是正确的
- 为什么错误选项是错的

## 🎯 学习目标
这道题希望学习者掌握什么

## 💡 常见误解
学习者容易犯什么错误

题目设计原则：
1. 每道题必须真正考察构式语法的核心概念，不要做成普通语法题
2. 不要硬扯"雅思""托福"作为包装
3. 答案和解析用中文，例句保留英文
4. 选项设计要有干扰性，反映真实学习者错误`

/* ── Execute ── */

async function execute(
  input: GenerateExerciseInput,
  _apiConfig?: import('../client').AIApiConfig
): Promise<AISkillResult<any>> {
  const level = input.difficulty <= 1 ? 'beginner' : input.difficulty >= 3 ? 'advanced' : 'intermediate'
  const levelPrompt = levelInstructions[level] || levelInstructions.intermediate
  const constructionDesc = constructionDescriptions[input.construction] || input.construction

  const dynamicPrompt = baseSystemPrompt
    + '\n\n当前构式：' + constructionDesc
    + '\n\n难度要求：' + levelPrompt

  const enrichedInput = {
    ...input,
    _dynamicSystemPrompt: dynamicPrompt,
  }

  const { callSkill } = await import('../client')
  return callSkill('generateExercise', enrichedInput as AISkillInput, _apiConfig)
}

/* ── Fallback ── */

function fallback(input: AISkillInput): AISkillResult<any> {
  const i = input as GenerateExerciseInput
  const construction = i.construction || 'ditransitive'
  const exerciseType = i.exerciseType || 'meaning_from_form'

  const constructionNameMap: Record<string, string> = {
    ditransitive: '双及物构式',
    'caused-motion': '致使-移动构式',
    resultative: '结果构式',
    way: '路径构式',
    'whats-x-doing': "What's X doing Y? 构式",
    sai: '主助倒装家族',
  }

  return {
    success: true,
    usedFallback: true,
    data: {
      id: `ai-${Date.now()}`,
      constructionId: construction,
      constructionName: constructionNameMap[construction] || construction,
      exerciseType,
      difficulty: i.difficulty || 2,
      prompt: `（本地模拟）请分析以下句子使用了什么构式：\n\n"She gave him a book."`,
      options: ['双及物构式', '致使-移动构式', '结果构式', '路径构式'],
      correctAnswer: 'A',
      explanationZh: '「She gave him a book.」是双及物构式的典型例句。根据Goldberg（1995），双及物构式的形式为"Subj V Obj1 Obj2"，核心意义是"Agent causes Recipient to receive Theme"。动词give是该构式中最典型的语义锚点。',
      explanationEn: 'This is the Ditransitive Construction.',
      conventionalityNote: 'give是双及物构式中最自然、最高频的动词。',
      semanticRoleExplanation: 'She [Agent] gave [Transfer] him [Recipient] a book [Theme]',
      contrastExample: '对比：She gave a book to him.（Prepositional Dative构式，强调转移过程而非拥有结果）',
      tags: [construction, 'ai-generated'],
      learningObjective: `识别${constructionNameMap[construction] || construction}的典型形式`,
      goldbergConcept: 'Construction as form-meaning pairing',
      targetSkill: '构式识别',
      expectedMisconception: '可能将双及物构式与Prepositional Dative混淆',
      source: 'ai-fallback',
    },
  }
}

export const generateExerciseSkill = {
  config: {
    name: 'generateExercise',
    description: 'Generate a construction grammar exercise with Chinese explanations.',
    systemPrompt: baseSystemPrompt,
    jsonSchema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        constructionId: { type: 'string' },
        exerciseType: { type: 'string' },
        difficulty: { type: 'number' },
        prompt: { type: 'string' },
        options: { type: 'array' },
        correctAnswer: {},
        explanationZh: { type: 'string' },
      },
      required: ['constructionId', 'exerciseType', 'difficulty', 'prompt', 'explanationZh'],
    },
    temperature: 0.4,
    maxTokens: 2048,
  } as AISkillConfig,
  fallback,
  execute,
}
