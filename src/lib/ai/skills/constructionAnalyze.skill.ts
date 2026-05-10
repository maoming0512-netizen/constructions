import type { AISkillConfig, AISkillInput, AISkillResult } from './types'
import { profileConstruction } from '@/lib/exercises/adaptiveExercise'

export interface ConstructionAnalyzeInput extends AISkillInput {
  topic?: string
  writingGoal?: string
  studentLevel?: string
  constructions: Array<{
    code: string
    name: string
    template: string
    function: string
    usageNote?: string
    example: string
    difficulty?: string
    level?: string
    category?: string
    metadata?: any
  }>
}

export interface ConstructionAnalyzeOutput {
  constructionInsights: Array<{
    code: string
    communicative_function: string[]
    emotional_function: string[]
    narrative_function: string[]
    intercultural_value: string
    action_density: number
    emotional_intensity: number
    suitable_interaction_type: string[]
    suitable_exercise_types: string[]
    teaching_note: string
  }>
  groupProfile: {
    main_communicative_goal: string
    emotional_arc: string
    narrative_potential: string
    intercultural_value: string
    recommended_exercise_types: string[]
  }
}

const systemPrompt = `You are a construction-aware English writing pedagogy analyst for a production English-learning platform.

You analyze PostgreSQL construction rows for Chinese students learning natural English writing.
Use ONLY the construction data provided by the user. Do not invent construction names, examples, meanings, or levels.

Core principle:
- The construction library is not a vocabulary list.
- A useful construction helps students express meaning more clearly, naturally, politely, vividly, or confidently.
- Low-value rows such as isolated words, vague vocabulary, random phrases, or patterns with no communicative function must be marked as unsuitable for generation.

For each construction, infer:
- construction_type: phrase, collocation, sentence_pattern, discourse_pattern, communicative_expression, intercultural_expression, or vocabulary_only
- teaching_value: high, medium, or low
- student_growth_value: high, medium, or low
- use_in_generation: true only if it can support real student expression
- communicative function
- emotional function
- narrative function
- intercultural value
- action density from 1 to 3
- emotional intensity from 1 to 3
- suitable interaction type
- suitable exercise types
- common learner risk
- how it should be taught

Exercise type vocabulary:
- long_continuation: 100-150 words, for cultural explanation, reflection, relationship development, conflict, emotional progression.
- micro_continuation: 40-60 words, for one small reaction, invitation, realization, emotional turn, or atmosphere.
- action_chain_continuation: 40-80 words, for movement, reaction chains, physical interaction, and emotional flow.
- gap_continuation: 1-2 blanks, for transitions, clarification, emotional turning points, invitation patterns, and reflective expressions.
- single_sentence_translation: one meaningful situational sentence, for communicative patterns, tone, comparison, politeness, or cultural explanation.
- construction_guided_continuation: guided practice when the construction needs explicit explanation, examples, and controlled use.

Quality bar:
- Prefer constructions that solve a real communicative problem: explaining a habit, softening disagreement, comparing youth life, clarifying tone, repairing misunderstanding, expressing family expectations, sharing preferences, or reflecting on experience.
- Do not recommend vocabulary_only or low teaching_value items for target-construction use.
- If the candidate group is weak, say so in groupProfile and recommend supplementing or enriching the construction bank.

Return strict JSON only.`

export const constructionAnalyzeSkill = {
  config: {
    name: 'constructionAnalyze',
    description: 'Analyze PostgreSQL constructions for communicative, emotional, narrative, and exercise-type suitability.',
    systemPrompt,
    temperature: 0.25,
    maxTokens: 3000,
    jsonSchema: {
      required: ['constructionInsights', 'groupProfile'],
    },
  } as AISkillConfig,

  fallback(input: AISkillInput): AISkillResult<ConstructionAnalyzeOutput> {
    const data = input as ConstructionAnalyzeInput
    const insights = (data.constructions || []).map((c) => {
      const profile = c.metadata?.recommended_exercise_types ? c.metadata : profileConstruction({
        name: c.name,
        template: c.template,
        function: c.function,
        usageNote: c.usageNote || '',
        example: c.example,
        category: c.category || '',
        level: c.level || 'senior',
      })
      return {
        code: c.code,
        communicative_function: profile.communicative_function,
        emotional_function: profile.emotional_function,
        narrative_function: profile.narrative_function,
        intercultural_value: profile.cultural_usage?.join(', ') || 'general communication',
        action_density: profile.action_density,
        emotional_intensity: profile.emotional_intensity,
        suitable_interaction_type: profile.interaction_type,
        suitable_exercise_types: profile.recommended_exercise_types,
        teaching_note: `${c.name} can support ${profile.communicative_function.join(', ') || 'natural expression'}.`,
      }
    })
    return {
      success: true,
      usedFallback: true,
      data: {
        constructionInsights: insights,
        groupProfile: {
          main_communicative_goal: data.writingGoal || 'natural communication',
          emotional_arc: 'small human change',
          narrative_potential: 'scene-based interaction',
          intercultural_value: data.topic || 'intercultural communication',
          recommended_exercise_types: Array.from(new Set(insights.flatMap((i) => i.suitable_exercise_types))).slice(0, 4),
        },
      },
    }
  },
}
