import type { AISkillConfig, AISkillInput, AISkillResult } from './types'

export interface MinimalPairInput extends AISkillInput {
  constructionA: string
  constructionB: string
  sharedVerb?: string
  learnerLevel?: 'beginner' | 'intermediate' | 'advanced'
  focusArea?: 'meaning' | 'form' | 'both'
  count?: number
}

const levelInstructions: Record<string, string> = {
  beginner: '面向初级：用简单中文解释差异，给出日常生活例句，避免复杂术语。',
  intermediate: '面向中级：解释form-function pairing的差异，引用Goldberg理论（如Surface Generalization），分析语义角色映射的不同。',
  advanced: '面向高级：深入分析语用差异、信息结构、conventionality gradient，讨论coercion和creative extensions的边界。',
}

const baseSystemPrompt = `你是一位构式语法教学助手。生成一对（或多对）最小对比句，展示两个不同构式的差异。

输出格式（Markdown）：

## 🔍 构式对比
构式A vs 构式B的简要介绍

## 📝 对比例句
### 对比1
**构式A例句**：...
**构式B例句**：...
**差异分析**：用中文详细解释两句的语义、语用差异

## 📊 核心差异总结
| 维度 | 构式A | 构式B |
|------|-------|-------|
| 形式 | ... | ... |
| 核心意义 | ... | ... |
| 典型动词 | ... | ... |
| 语用功能 | ... | ... |

## 💡 学习提示
如何区分这两个构式`

async function execute(input: MinimalPairInput, _apiConfig?: import('../client').AIApiConfig): Promise<AISkillResult<any>> {
  const level = input.learnerLevel || 'intermediate'
  const dynamicPrompt = baseSystemPrompt + '\n\n' + (levelInstructions[level] || levelInstructions.intermediate)
  const enrichedInput = { ...input, _dynamicSystemPrompt: dynamicPrompt }
  const { callSkill } = await import('../client')
  return callSkill('minimalPair', enrichedInput as AISkillInput, _apiConfig)
}

function fallback(input: AISkillInput): AISkillResult<any> {
  const i = input as MinimalPairInput
  return {
    success: true, usedFallback: true,
    data: {
      constructionA: i.constructionA || 'ditransitive',
      constructionB: i.constructionB || 'prepositional-dative',
      pairs: [{
        sentenceA: 'She gave him a book.',
        sentenceB: 'She gave a book to him.',
        difference: '双及物构式强调"致使拥有"的结果（Recipient成功收到了Theme），而介词与格构式强调"转移过程"。根据Goldberg的Surface Generalization Hypothesis，这两种表层形式各自编码不同的意义，不能简单视为同义转换。',
        meaningA: 'She caused him to have a book.',
        meaningB: 'She performed an act of transfer directed toward him.',
      }],
    },
  }
}

export const minimalPairSkill = {
  config: {
    name: 'minimalPair', description: 'Generate minimal pairs comparing two constructions.',
    systemPrompt: baseSystemPrompt,
    jsonSchema: { type: 'object', properties: { pairs: { type: 'array' } }, required: ['pairs'] },
    temperature: 0.4, maxTokens: 2048,
  } as AISkillConfig,
  fallback, execute,
}
