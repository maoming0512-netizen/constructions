import type { AISkillConfig, AISkillInput, AISkillResult } from './types'

export interface TeacherExplainInput extends AISkillInput {
  construction: string
  learnerLevel?: 'beginner' | 'intermediate' | 'advanced'
  focusArea?: 'all' | 'form' | 'meaning' | 'verbs' | 'comparison'
  explanationDepth?: 'brief' | 'detailed' | 'comprehensive'
}

const levelInstructions: Record<string, string> = {
  beginner: '面向初级：用简单中文，日常生活例句，核心概念用类比解释。',
  intermediate: '面向中级：术语保留英文并注释，引用Goldberg理论，包含prototype-to-extension学习路径。',
  advanced: '面向高级：深入理论分析，讨论争议和前沿问题，引用原始文献。',
}

const focusInstructions: Record<string, string> = {
  all: '全面讲解：形式模板、核心意义、典型动词、常见例句、常见错误、相似构式对比。',
  form: '重点讲解形式模板：句法结构、成分顺序、可变性、强制性成分。',
  meaning: '重点讲解核心意义和语义贡献：构式本身编码的意义、与动词语义的互动。',
  verbs: '重点讲解典型动词：semantic anchors、可进入动词的语义约束、Semantic Coherence Principle。',
  comparison: '重点与相似构式对比：形式差异、语义差异、语用差异、典型语境。',
}

const baseSystemPrompt = `你是一位优秀的构式语法教师。用中文系统讲解一个英语构式。

输出格式（Markdown）：

## 📖 构式名称
英文名称 + 中文翻译

## 📝 形式模板
用清晰的格式展示句法结构，标注每个成分。

## 💡 核心意义
用中文解释这个构式表达什么意义。

## 🔑 典型动词
列出5-8个常见动词，简要说明每个动词在该构式中的特点。

## 📚 例句
5个例句（从原型到扩展），每个附中文翻译和简要说明。

## ⚠️ 常见错误
学习者容易犯什么错误，为什么。

## 🔍 相似构式对比
与1-2个相似构式对比，用表格展示差异。

## 🎯 学习建议
如何掌握这个构式。`

async function execute(input: TeacherExplainInput, _apiConfig?: import('../client').AIApiConfig): Promise<AISkillResult<any>> {
  const level = input.learnerLevel || 'intermediate'
  const focus = input.focusArea || 'all'
  const dynamicPrompt = baseSystemPrompt
    + '\n\n' + (levelInstructions[level] || levelInstructions.intermediate)
    + '\n\n' + (focusInstructions[focus] || focusInstructions.all)

  const enrichedInput = { ...input, _dynamicSystemPrompt: dynamicPrompt }
  const { callSkill } = await import('../client')
  return callSkill('teacherExplain', enrichedInput as AISkillInput, _apiConfig)
}

function fallback(input: AISkillInput): AISkillResult<any> {
  const construction = (input as TeacherExplainInput).construction || 'ditransitive'
  const explanations: Record<string, any> = {
    ditransitive: {
      concept: '双及物构式 (Ditransitive Construction)',
      formPattern: 'Subj + V + Obj1(Recipient) + Obj2(Theme)',
      coreMeaning: '施事致使接受者收到客体（Agent causes Recipient to receive Theme）',
      typicalVerbs: ['give', 'send', 'show', 'tell', 'teach', 'offer', 'bring', 'hand', 'lend', 'pass'],
      examples: [
        { sentence: 'She gave him a book.', meaning: '她给了他一本书', note: '原型用法——give是最典型的语义锚点' },
        { sentence: 'He taught the children French.', meaning: '他教孩子们法语', note: '隐喻性转移——知识作为Theme' },
        { sentence: 'She baked her friend a cake.', meaning: '她给朋友烤了一个蛋糕', note: '创造性扩展——creation动词' },
      ],
      relatedConstructions: ['Prepositional Dative (Subj V Obj to/for Recipient)'],
      learningTips: ['从give开始学习原型例句', '注意Recipient必须是可接收者', '对比介词与格构式理解语义差异'],
    },
  }
  return {
    success: true, usedFallback: true,
    data: explanations[construction] || explanations.ditransitive,
  }
}

export const teacherExplainSkill = {
  config: {
    name: 'teacherExplain', description: 'Explain a construction like a teacher in Chinese.',
    systemPrompt: baseSystemPrompt,
    jsonSchema: { type: 'object', properties: { concept: {}, formPattern: {}, coreMeaning: {}, typicalVerbs: {}, examples: {}, learningTips: {} }, required: ['concept', 'coreMeaning'] },
    temperature: 0.3, maxTokens: 4096,
  } as AISkillConfig,
  fallback, execute,
}
