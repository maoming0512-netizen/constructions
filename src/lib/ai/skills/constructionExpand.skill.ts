import type { AISkillConfig, AISkillInput, AISkillResult } from './types'

export interface ConstructionExpandInput extends AISkillInput {
  prototypeSentence: string
  construction?: string
  creativityLevel?: 'low' | 'medium' | 'high'
  learnerLevel?: 'beginner' | 'intermediate' | 'advanced'
  count?: number
}

const levelInstructions: Record<string, string> = {
  beginner: '面向初级：只使用常见动词的扩展，保持简单语境，解释通俗易懂。',
  intermediate: '面向中级：包含一些隐喻性扩展，解释prototype-to-extension路径，讨论Semantic Coherence。',
  advanced: '面向高级：包含creative extensions和coercion，分析conventionality gradient，讨论Partial Productivity边界。',
}

const creativityInstructions: Record<string, string> = {
  low: '低创造性：只替换为语义非常接近的典型动词（如put → place, set, lay）。',
  medium: '中等创造性：包含一些隐喻性扩展（如blow, push, throw），解释为什么这些动词可以进入该构式。',
  high: '高创造性：包含大胆扩展（如sneeze, laugh, think），分析这些creative extensions如何被构式coerce。',
}

const baseSystemPrompt = `你是一位构式语法教学助手。用户提供一个原型例句，你生成同一构式但使用不同动词的扩展例句。

输出格式（Markdown）：

## 🌱 原型例句
用户提供的句子 + 分析

## 📈 扩展阶梯
从最接近原型到最creative，展示5-7个扩展例句：

### Level 1: 典型替换
动词：[verb]  
句子：...  
说明：为什么这个动词可以替换

### Level 2: 常见扩展
...

### Level 3: 隐喻用法
...

### Level 4: 创造性扩展
...

## 💡 学习要点
- 这些扩展如何体现Goldberg的prototype-to-extension理论
- Semantic Coherence Principle如何限制扩展
- 哪些扩展是高度自然的，哪些是creative but understandable`

async function execute(input: ConstructionExpandInput, _apiConfig?: import('../client').AIApiConfig): Promise<AISkillResult<any>> {
  const level = input.learnerLevel || 'intermediate'
  const creativity = input.creativityLevel || 'medium'
  const dynamicPrompt = baseSystemPrompt
    + '\n\n' + (levelInstructions[level] || levelInstructions.intermediate)
    + '\n\n' + (creativityInstructions[creativity] || creativityInstructions.medium)

  const enrichedInput = { ...input, _dynamicSystemPrompt: dynamicPrompt }
  const { callSkill } = await import('../client')
  return callSkill('constructionExpand', enrichedInput as AISkillInput, _apiConfig)
}

function fallback(input: AISkillInput): AISkillResult<any> {
  const prototype = (input as ConstructionExpandInput).prototypeSentence || 'She put the book on the table.'
  return {
    success: true, usedFallback: true,
    data: {
      prototype,
      extensions: [
        { level: 'Level 1: 典型', sentence: 'She placed the book on the table.', verb: 'place', note: 'place与put语义最接近，都是用手使物体到达某位置。' },
        { level: 'Level 2: 常见', sentence: 'He dropped the keys on the counter.', verb: 'drop', note: 'drop强调无意或简单的放置动作。' },
        { level: 'Level 3: 常见', sentence: 'She threw the ball into the basket.', verb: 'throw', note: 'throw增加了"用力/快速"的 manner 语义。' },
        { level: 'Level 4: 隐喻', sentence: 'The wind blew the leaves into the room.', verb: 'blew', note: '非人类致使者，自然力量作为Causer。' },
        { level: 'Level 5: 创意', sentence: 'He sneezed the foam off the cappuccino.', verb: 'sneezed', note: 'Goldberg(2006)的经典例子——sneeze通常不及物，但在致使-移动构式中被coerced为及物用法。' },
      ],
    },
  }
}

export const constructionExpandSkill = {
  config: {
    name: 'constructionExpand', description: 'Expand a construction from prototype to creative uses.',
    systemPrompt: baseSystemPrompt,
    jsonSchema: { type: 'object', properties: { prototype: {}, extensions: { type: 'array' } }, required: ['prototype', 'extensions'] },
    temperature: 0.5, maxTokens: 2048,
  } as AISkillConfig,
  fallback, execute,
}
