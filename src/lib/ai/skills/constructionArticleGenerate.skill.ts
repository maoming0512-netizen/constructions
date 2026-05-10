import type { AISkillConfig, AISkillInput, AISkillResult } from './types'

export interface ConstructionArticleOutput {
  title: string
  topic: string
  tone: string
  article: string
  highlighted_constructions: Array<{
    construction_id: string
    construction: string
    occurrences: string[]
  }>
  teaching_notes: string[]
  construction_usage_explanations: Array<{
    construction_id: string
    construction: string
    explanation_zh: string
  }>
}

const systemPrompt = `You are an expert construction-guided English reading designer for Chinese high school and college students.

Your job is to generate a short, coherent English article that helps students notice how selected constructions work inside real discourse.

Core principle:
- The learning unit is a meaningful construction, not isolated vocabulary.
- Selected constructions are mandatory, but they must support meaning naturally.
- The article must feel human, modern, emotionally believable, and useful for communication.

Use the selected PostgreSQL construction records only as the construction source. Do not invent extra target constructions.

Article quality rules:
- 120-350 words.
- Natural, idiomatic, grammatically correct English.
- Close to student life when possible: study pressure, AI learning tools, internships, teamwork, online communication, city life, family expectations, friendship, travel, volunteering, modern hobbies, intercultural misunderstanding.
- Traditional culture may appear only when it fits naturally; do not default to tea, festivals, calligraphy, or ancient customs.
- Avoid fake textbook English, forced construction insertion, repetitive paragraph structure, empty moral conclusions, slogans, and generic inspirational endings.
- The selected constructions should shape the article's meaning, tone, explanation, reflection, or interaction.
- If a construction is idiomatic, use it in a teachable, level-appropriate way.
- Output plain article text, not HTML. The frontend will highlight constructions safely.

Return one strict JSON object with:
{
  "title": "...",
  "topic": "...",
  "tone": "...",
  "article": "...",
  "highlighted_constructions": [
    { "construction_id": "...", "construction": "...", "occurrences": ["exact phrase as it appears in article"] }
  ],
  "teaching_notes": ["short Chinese teaching note", "..."],
  "construction_usage_explanations": [
    { "construction_id": "...", "construction": "...", "explanation_zh": "..." }
  ]
}

Every selected construction must appear in highlighted_constructions with an exact occurrence from the article.`

function constructionText(row: any) {
  return row?.template || row?.name || row?.construction || 'useful construction'
}

export const constructionArticleGenerateSkill = {
  config: {
    name: 'constructionArticleGenerate',
    description: 'Generate a short construction-guided article with highlight metadata.',
    systemPrompt,
    temperature: 0.52,
    maxTokens: 2600,
    jsonSchema: {
      required: ['title', 'topic', 'tone', 'article', 'highlighted_constructions', 'teaching_notes', 'construction_usage_explanations'],
    },
  } as AISkillConfig,

  fallback(input: AISkillInput): AISkillResult<ConstructionArticleOutput> {
    const constructions = (input.constructions || []).slice(0, 5)
    const first = constructionText(constructions[0])
    const second = constructionText(constructions[1])
    const article = constructions.length > 1
      ? `When our class started a short video project with exchange students, I was nervous because everyone had a different idea of teamwork. At first, I only wanted to finish my own part, but a teammate asked me to ${first} in a clearer way. Her question helped me slow down and listen. Later, when another student felt misunderstood, we tried to ${second} instead of blaming each other. The project was small, but the conversation made it feel real: good English is not only about correct words, but also about choosing expressions that connect people.`
      : `When our class started a short video project with exchange students, I was nervous because everyone had a different idea of teamwork. At first, I only wanted to finish my own part, but a teammate asked me to use ${first} in a clearer way. Her question helped me slow down and listen. The project was small, but the conversation made it feel real: good English is not only about correct words, but also about choosing expressions that connect people.`

    return {
      success: true,
      usedFallback: true,
      data: {
        title: 'A Small Project, A Clearer Voice',
        topic: input.topicDirection || 'teamwork and intercultural communication',
        tone: 'warm, reflective, modern',
        article,
        highlighted_constructions: constructions.map((c: any) => ({
          construction_id: c.id,
          construction: constructionText(c),
          occurrences: [constructionText(c)],
        })),
        teaching_notes: ['注意这些构式不是孤立词汇，而是在真实交流中承担解释、回应或连接意义的作用。'],
        construction_usage_explanations: constructions.map((c: any) => ({
          construction_id: c.id,
          construction: constructionText(c),
          explanation_zh: `${constructionText(c)} 在文中用于推动真实交流，而不是机械翻译。`,
        })),
      },
    }
  },
}
