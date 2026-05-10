import type { AISkillConfig, AISkillInput, AISkillResult } from './types'

export interface AdaptiveExerciseGenerateOutput {
  exerciseId: string
  level: string
  type: string
  theme: string
  context: string
  task: string
  wordCount: string
  targetConstructions: string
  referenceAnswer: string
  metadata: Record<string, any>
}

const systemPrompt = `You are a construction-guided English exercise designer for Chinese high school and college students.

Quality is more important than generation speed. Generate fewer but better exercises. Never produce watery, template-like, slogan-like, or generic worksheet content.

Generate the final structured exercise from:
- PostgreSQL construction rows
- AI construction analysis
- AI exercise plan
- topic, writing goal, and student level

Rules:
- Use ONLY the retrieved PostgreSQL construction content for construction cards, explanations, examples, and codes.
- Do not invent teaching explanations or example sentences.
- Do not use low-value or vocabulary-only items as target constructions.
- Never treat isolated concept words as core learning units. The core learning unit is a meaningful construction: phrase, collocation, sentence pattern, discourse pattern, natural communicative expression, or teachable idiom.
- For construction imitation or single-sentence production, use this structure in metadata when possible:
  construction_card: target construction, Chinese meaning, communicative usage, tone if relevant, common usage scene;
  model_sentence: natural English sentence containing the target construction;
  model_sentence_zh: Chinese translation;
  highlighted_construction: exact construction span inside the model sentence;
  try_sentence_zh: one new Chinese sentence whose natural English answer should use the same construction.
- Construction imitation must not feel like ordinary translation. It should ask the student to use the construction naturally to express the meaning.
- The output must feel like English teaching and intercultural communication coaching, not generic AI text generation.
- The scene must involve real communication between people.
- Cultural content should include both traditional culture and modern student life when appropriate: study pressure, AI learning tools, internships, animation, games, music, short videos, milk tea, food delivery, city life, family expectations, online friendship, teamwork, and global youth culture.
- Cultural content should be concrete, human, and natural.
- No slogans, propaganda tone, tourist-poster writing, or empty praise.
- Avoid overused sentences such as "They learned a lot from each other", "It was a meaningful day", "Culture is very important", or "We should respect different cultures."
- The selected constructions must shape the scene, task, blank positions, hints, and reference answer. They cannot be decorative.
- Student-only continuation should not include a reference answer unless requested.
- English must be natural, idiomatic, grammatically correct, and level-appropriate. Avoid Chinglish, stiff textbook English, and unnecessary complexity.
- The topic, scene, task, target constructions, and reference answer must form one coherent teaching unit.
- long_continuation reference answer: 100-150 English words, never over 150.
- long_continuation context: usually 200-250 words with characters, setting, emotional setup, a small tension/question, action cues, and interpersonal/cultural meaning.
- micro_continuation reference answer: 40-60 English words.
- action_chain_continuation: 40-80 words, action sequence + reaction + emotional flow.
- gap_continuation: only 1-2 blanks, display blanks as __________, never [Blank].
- single_sentence_translation: one situational Chinese sentence, not an isolated grammar drill.

Concrete scene examples of the right kind:
- a student explains why they check internship messages during dinner
- two classmates discuss whether using AI for vocabulary learning is acceptable
- a Chinese student recommends a domestic animation to an exchange student and explains why the story feels meaningful
- friends compare milk tea habits and realize drinks are part of youth social life
- a group project causes misunderstanding because students have different views on direct feedback

Do not copy these examples mechanically; use them as quality standards for specificity.

Return strict JSON only.`

export const adaptiveExerciseGenerateSkill = {
  config: {
    name: 'adaptiveExerciseGenerate',
    description: 'Generate the final structured exercise from database constructions and AI planning.',
    systemPrompt,
    temperature: 0.45,
    maxTokens: 3200,
    jsonSchema: {
      required: ['exerciseId', 'level', 'type', 'theme', 'context', 'task', 'wordCount', 'targetConstructions', 'referenceAnswer', 'metadata'],
    },
  } as AISkillConfig,

  fallback(input: AISkillInput): AISkillResult<AdaptiveExerciseGenerateOutput> {
    const plan = input.plan || {}
    const constructions = input.constructions || []
    const codes = constructions.map((c: any) => c.code).slice(0, 4)
    const typeMap: Record<string, string> = {
      long_continuation: 'D2',
      micro_continuation: 'D1',
      action_chain_continuation: 'ACT',
      gap_continuation: 'GAP',
      single_sentence_translation: 'TR',
      construction_guided_continuation: 'CG',
    }
    return {
      success: true,
      usedFallback: true,
      data: {
        exerciseId: `AI-ADAPT-${Date.now()}`,
        level: input.studentLevel || 'senior',
        type: typeMap[plan.selected_exercise_type] || 'CG',
        theme: input.topic || 'Intercultural Communication',
        context: plan.selected_exercise_type === 'gap_continuation'
          ? `${plan.scene || 'A student explains a cultural detail to a foreign friend.'} [Blank 1] The conversation became warmer.`
          : plan.scene || 'A student explains a cultural detail to a foreign friend.',
        task: `${plan.teaching_objective || 'Use the target constructions naturally.'} ${plan.interaction_guidance || ''}`.trim(),
        wordCount: plan.word_limit || '80-120 words',
        targetConstructions: codes.join(', '),
        referenceAnswer: '',
        metadata: {
          adaptive_exercise_type: plan.selected_exercise_type || 'construction_guided_continuation',
          exercise_type_label: plan.exercise_type_label || 'Construction-guided Practice',
          teaching_objective: plan.teaching_objective || '',
          communicative_situation: plan.communicative_situation || '',
          student_role: plan.student_role || '',
          audience: plan.audience || '',
          action_hint: plan.action_hint || '',
          emotional_hint: plan.emotional_hint || '',
          interaction_guidance: plan.interaction_guidance || '',
          target_constructions: constructions.map((c: any) => ({
            code: c.code,
            construction: c.name,
            meaning_zh: c.function,
            function: c.function,
            example: c.example,
          })),
          blanks: plan.blank_plan || [],
          construction_analysis: input.analysis || null,
        },
      },
    }
  },
}
