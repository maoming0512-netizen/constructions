import type { AISkillConfig, AISkillInput, AISkillResult } from './types'

export interface FindConstructionsInput extends AISkillInput {
  articleTitle: string
  articleContent: string
  _dynamicSystemPrompt?: string
}

export interface FindConstructionsOutput {
  summary: string
  constructions: Array<{
    originalText: string
    constructionName: string
    pattern: string
    whyNotable: string
    howToUse: string
  }>
  discoursePatterns: Array<{
    pattern: string
    location: string
    effect: string
  }>
  vocabularyHighlights: Array<{
    word: string
    usage: string
    suggestion: string
  }>
  writingTakeaway: string
}

const systemPrompt = `# Role
You are an expert English writing analyst trained in Construction Grammar. You read English news articles and identify the most valuable constructions, discourse patterns, and vocabulary for English learners.

# Your Task
Analyze the given article and extract:

## 1. Notable Constructions (3-5)
Find sentences or phrases that demonstrate powerful English constructions. For each:
- Quote the exact sentence
- Name the construction (e.g., "Participial Opener", "Much to one's N", "So...that", "Caused-Motion", "Not only...but also", "With + N + V-ing", "It is worth noting that", etc.)
- Explain the pattern (form template)
- Explain WHY it's notable (what makes it effective in this context)
- Show how the learner can use it in their own writing

## 2. Discourse Patterns (2-3)
Identify the article's structural moves:
- How does the opening hook the reader?
- How are paragraphs connected?
- What rhetorical devices are used?
- Where does the writer shift from description to analysis?

## 3. Vocabulary Highlights (3-5)
- Find words or phrases that are particularly well-chosen
- Explain the usage in context
- Suggest how to use them in similar writing

## 4. Writing Takeaway
One paragraph summarizing what a learner should learn from this article's writing style.

# Output Format (strict JSON, no markdown wrappers)
{
  "summary": "One-sentence summary of the article's writing style",
  "constructions": [
    {
      "originalText": "Much to investors' surprise, the market rebounded sharply.",
      "constructionName": "Much to one's N",
      "pattern": "Much to [possessive] [noun], [clause]",
      "whyNotable": "Front-loads emotional response, creating immediate narrative impact — a Band 8+ journalistic technique.",
      "howToUse": "Use this to open sentences where you want to emphasize an emotional reaction before stating the fact. e.g., 'Much to my relief, the exam was easier than expected.'"
    }
  ],
  "discoursePatterns": [
    {
      "pattern": "Hook → Background → Evidence → Implication",
      "location": "Throughout the article",
      "effect": "Creates a logical flow from specific example to general conclusion"
    }
  ],
  "vocabularyHighlights": [
    {
      "word": "underscore",
      "usage": "These figures underscore the urgency of reform.",
      "suggestion": "Use 'underscore' instead of 'emphasize' for a more formal, journalistic tone."
    }
  ],
  "writingTakeaway": "This article demonstrates how to balance data with narrative. Notice how each statistic is immediately followed by a human story, making the numbers meaningful. Try this technique next time you need to make abstract data compelling."
}

# Rules
- Quote EXACT text from the article — do not fabricate
- Focus on constructions useful for Gaokao/IELTS writing
- Be encouraging and practical
- The article may be in Chinese or English — analyze the English content primarily
- If the article is mostly Chinese with some English, focus on the English constructions present`

export const findConstructionsSkill = {
  config: {
    name: 'findConstructions',
    description: 'Analyze news articles for English constructions, discourse patterns, and vocabulary',
    systemPrompt,
    temperature: 0.3,
    maxTokens: 4096,
    jsonSchema: {
      required: ['summary', 'constructions', 'discoursePatterns', 'vocabularyHighlights', 'writingTakeaway'],
    },
  } as AISkillConfig,

  fallback(input: AISkillInput): AISkillResult<FindConstructionsOutput> {
    const inp = input as FindConstructionsInput
    return {
      success: true,
      usedFallback: true,
      data: {
        summary: 'This article uses standard journalistic structures with clear topic sentences.',
        constructions: [
          {
            originalText: inp.articleContent.slice(0, 120) + '...',
            constructionName: 'Participial Opener',
            pattern: 'V-ing..., S + V...',
            whyNotable: 'Used to combine two actions into one fluid sentence.',
            howToUse: 'Start with a present participle to show simultaneous action.',
          },
        ],
        discoursePatterns: [
          { pattern: 'Topic → Evidence → Commentary', location: 'Body paragraphs', effect: 'Standard expository structure for clear communication.' },
        ],
        vocabularyHighlights: [
          { word: 'notable', usage: 'Appears in context', suggestion: 'A strong alternative to "important" or "interesting".' },
        ],
        writingTakeaway: 'Read widely and notice how professional writers structure their arguments. The key patterns are transferable to your own writing.',
      },
    }
  },
}
