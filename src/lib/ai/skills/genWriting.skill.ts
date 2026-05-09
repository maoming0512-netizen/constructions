import type { AISkillConfig, AISkillInput, AISkillResult } from './types'

export interface GenWritingInput extends AISkillInput {
  level: string
  type: string
  theme?: string
  _dynamicSystemPrompt?: string
}

export interface GenWritingOutput {
  exerciseId: string
  level: string
  type: string
  theme: string
  context: string
  task: string
  wordCount: string
  targetConstructions: string
  referenceAnswer: string
}

const systemPrompt = `You are a senior English writing exercise designer specializing in Gaokao continuation writing, Chinese-English translation, and IELTS writing training.

Generate ONE high-quality English writing exercise based on the user's requirements.

[Exercise Types]
- D1: Micro Continuation Writing (short story continuation, ~100-200 words)
- D2: Long Continuation Writing (full passage continuation, ~150-300 words)  
- T1: Chinese-English Translation (translate Chinese sentences into natural English)

[Levels]
- junior: Junior high school students (CEFR A2-B1), simpler vocabulary and sentence structures
- senior: Senior high school students (CEFR B1-B2), more complex themes and expressions

[Requirements]
1. The exercise must embed cross-cultural communication contexts (Chinese-Western cultural contact, telling China's stories)
2. Context/passage must be authentic and engaging
3. Reference answer must be natural, idiomatic English at the target level
4. Target constructions should be naturally demonstrated in the context
5. For D1/D2: provide a story opening with characters and a clear situation that needs continuation
6. For T1: provide Chinese text that requires natural English translation

[Output Format - STRICT JSON]
{
  "exerciseId": "AI-{level}-{type}-{random 3 digits}",
  "level": "junior or senior",
  "type": "D1, D2, or T1",
  "theme": "a short theme description in English",
  "context": "the reading passage or Chinese source text",
  "task": "clear instruction for the student",
  "wordCount": "expected word count, e.g. '100 words'",
  "targetConstructions": "key grammar constructions demonstrated",
  "referenceAnswer": "model answer in natural English"
}`

export const genWritingSkill = {
  config: {
    name: 'genWriting',
    description: 'Generate D1/D2/T1 English writing exercises with cross-cultural contexts',
    systemPrompt,
    temperature: 0.6,
    maxTokens: 4096,
    jsonSchema: {
      required: ['exerciseId', 'level', 'type', 'theme', 'context', 'task', 'wordCount', 'targetConstructions', 'referenceAnswer'],
    },
  } as AISkillConfig,

  fallback(input: AISkillInput): AISkillResult<GenWritingOutput> {
    const inp = input as GenWritingInput
    return {
      success: true,
      usedFallback: true,
      data: {
        exerciseId: `AI-${inp.level || 'senior'}-${inp.type || 'D1'}-000`,
        level: inp.level || 'senior',
        type: inp.type || 'D1',
        theme: 'Cross-Cultural Communication',
        context: inp.type === 'T1'
          ? '我的美国朋友对中国春节的习俗非常好奇，我决定带他去体验一次真正的中国新年。'
          : `During summer vacation, I volunteered at a local museum that showcases Chinese paper-cutting art. One day, a group of international students visited. I noticed an American girl, Emma, staring at a delicate paper-cut of a phoenix. "I wish I could understand the story behind this," she murmured. I walked over and said, "I can tell you about it if you'd like." Her eyes lit up...`,
        task: inp.type === 'T1' ? 'Translate the Chinese sentence into natural English.' : 'Continue the story in about 120 words, describing your interaction with Emma and what she learned.',
        wordCount: '120 words',
        targetConstructions: 'Caused-Motion, so...that, find Obj XP',
        referenceAnswer: inp.type === 'T1'
          ? 'My American friend was very curious about Chinese New Year customs, so I decided to take him to experience a real Chinese New Year.'
          : 'We spent the next hour going through the exhibition together. I explained how each paper-cut carried a wish — the phoenix represented rebirth and hope. Emma was so fascinated that she asked the museum staff if she could try cutting one herself. They handed her a pair of scissors and a piece of red paper. Her first attempt looked nothing like a phoenix, but she laughed and said, "I think I found a new hobby!" Before leaving, she bought a paper-cut kit, promising to show me her progress next time we met.',
      },
    }
  },
}
