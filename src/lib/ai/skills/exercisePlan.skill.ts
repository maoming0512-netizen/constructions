import type { AISkillConfig, AISkillInput, AISkillResult } from './types'

export interface ExercisePlanOutput {
  selected_exercise_type: string
  exercise_type_label: string
  word_limit: string
  teaching_objective: string
  scene: string
  communicative_situation: string
  student_role: string
  audience: string
  action_hint: string
  emotional_hint: string
  interaction_guidance: string
  blank_plan: Array<{
    blank_id: number
    purpose: string
    suggested_constructions: string[]
  }>
  rationale: string
}

const wordLimits: Record<string, string> = {
  long_continuation: '100-150 words',
  micro_continuation: '40-60 words',
  action_chain_continuation: '40-80 words',
  gap_continuation: '1-2 guided blanks',
  single_sentence_translation: '1 natural English sentence',
  construction_guided_continuation: '80-120 words',
}

const labels: Record<string, string> = {
  long_continuation: 'Long Continuation',
  micro_continuation: 'Micro Continuation',
  action_chain_continuation: 'Action-chain Continuation',
  gap_continuation: 'Gap Continuation',
  single_sentence_translation: 'Situational Translation',
  construction_guided_continuation: 'Construction-guided Practice',
}

const systemPrompt = `You are an English-writing teacher, intercultural communication coach, and construction-guided writing planner.

Quality is more important than speed or quantity. Do not plan a casual worksheet. Plan a coherent teaching unit.

Given:
- user topic
- writing goal
- student level
- PostgreSQL constructions
- AI construction analysis

Choose the best exercise type. The exercise type should emerge from the construction characteristics and writing goal.

You may choose:
- long_continuation
- micro_continuation
- action_chain_continuation
- gap_continuation
- single_sentence_translation
- construction_guided_continuation

Planning principles:
- Prefer the type that best teaches the retrieved constructions.
- Use only constructions with real expression value. Do not build exercises around vocabulary-only or low-value rows.
- Avoid repetitive task shapes.
- Create a real human scene with a communication reason.
- Include interpersonal dynamics and a small emotional movement.
- Intercultural communication includes both Chinese culture and modern Chinese youth life: school pressure, AI tools, internships, games, animation, milk tea, food delivery, online friendship, family expectations, city commuting, teamwork, and global youth culture.
- Chinese cultural content should be natural, concrete, and useful in real communication.
- Avoid slogans, propaganda-like wording, and generic textbook topics.

Bad scene patterns to avoid:
- "Tom wanted to introduce Chinese culture to his foreign friend."
- "They learned a lot from each other."
- "This experience made them understand culture better."
- "It was a meaningful day."
- Any empty claim that culture is important without concrete human context.

A good plan must include:
- a specific speaker or writer role
- a clear audience
- a reason to communicate
- one small tension, question, misunderstanding, invitation, choice, or emotional turn
- why the selected constructions are necessary, not decorative
- a realistic modern or intercultural detail close to Chinese high school or college life

If topic-goal-construction fit is weak, choose a simpler exercise type or state that revision/supplementation is needed in the rationale.

Return strict JSON only.`

export const exercisePlanSkill = {
  config: {
    name: 'exercisePlan',
    description: 'Plan the best adaptive exercise type and communicative scene from analyzed constructions.',
    systemPrompt,
    temperature: 0.35,
    maxTokens: 2200,
    jsonSchema: {
      required: ['selected_exercise_type', 'exercise_type_label', 'word_limit', 'teaching_objective', 'scene', 'communicative_situation', 'student_role', 'audience', 'action_hint', 'emotional_hint', 'interaction_guidance', 'blank_plan', 'rationale'],
    },
  } as AISkillConfig,

  fallback(input: AISkillInput): AISkillResult<ExercisePlanOutput> {
    const analysis = input.analysis?.groupProfile
    const selected = analysis?.recommended_exercise_types?.[0] || 'construction_guided_continuation'
    return {
      success: true,
      usedFallback: true,
      data: {
        selected_exercise_type: selected,
        exercise_type_label: labels[selected] || 'Construction-guided Practice',
        word_limit: wordLimits[selected] || '80-120 words',
        teaching_objective: input.writingGoal || 'Use target constructions for real communication.',
        scene: `A Chinese student talks with a foreign friend about ${input.topic || 'a cultural detail'} in a calm, specific situation.`,
        communicative_situation: 'A student explains, invites, or repairs understanding in an intercultural conversation.',
        student_role: 'Chinese student communicator',
        audience: 'foreign friend or exchange student',
        action_hint: selected === 'action_chain_continuation' ? 'Show movement, response, and the next action clearly.' : '',
        emotional_hint: 'Show one small emotional change through behavior or tone.',
        interaction_guidance: 'Make the communication respectful, concrete, and useful.',
        blank_plan: selected === 'gap_continuation' ? [{ blank_id: 1, purpose: 'emotional or explanatory turning point', suggested_constructions: [] }] : [],
        rationale: 'Fallback plan based on construction metadata and user goal.',
      },
    }
  },
}
