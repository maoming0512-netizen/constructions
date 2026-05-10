import type { TeachingConstruction } from '@/lib/exercises/teachingResources'
import { normalizeExerciseMode } from '@/lib/exercises/teachingResources'
import type { AdaptiveExercisePlan } from '@/lib/exercises/adaptiveExercise'

export interface WritingPromptInput {
  mode?: string
  topic?: string
  difficulty?: string
  targetSkill?: string
  wordLimit?: string
  numberOfBlanks?: number
  studentLevel?: string
  includeReferenceAnswer?: boolean
}

export function getWordLimit(mode?: string) {
  const normalized = normalizeExerciseMode(mode)
  if (normalized === 'D2') return { label: '100-150 words', min: 100, max: 150 }
  if (normalized === 'D1') return { label: '40-60 words', min: 40, max: 60 }
  if (normalized === 'GAP') return { label: '1-2 sentences per blank', min: 20, max: 70 }
  return { label: '80-120 words', min: 80, max: 120 }
}

export function buildWritingExercisePrompt(input: WritingPromptInput, constructions: TeachingConstruction[], notice?: string) {
  const mode = normalizeExerciseMode(input.mode)
  const wordLimit = getWordLimit(input.mode)
  const constructionBlock = constructions.map((c, index) => ({
    index: index + 1,
    code: c.code,
    construction: c.name,
    template: c.template,
    meaning_zh: c.function,
    function: c.function,
    usage_note: c.usageNote,
    example: c.example,
    level: c.level,
    difficulty: c.difficulty,
    category: c.category,
  }))

  const requirements = {
    mode,
    topic: input.topic || 'intercultural communication',
    difficulty: input.difficulty || input.studentLevel || 'senior',
    target_skill: input.targetSkill || 'natural English continuation writing',
    word_limit: input.wordLimit || wordLimit.label,
    include_reference_answer: Boolean(input.includeReferenceAnswer),
    number_of_blanks: mode === 'GAP' ? Math.min(Math.max(input.numberOfBlanks || 1, 1), 2) : 0,
  }

  return `You are an English writing teacher designing continuation-writing practice for Chinese students.

PostgreSQL is the source of truth. Use ONLY the teaching constructions in the JSON block below. Do not invent construction names, examples, meanings, difficulty labels, or teaching explanations.

Selected teaching constructions from PostgreSQL:
${JSON.stringify(constructionBlock, null, 2)}

Request:
${JSON.stringify(requirements, null, 2)}

${notice ? `Data notice: ${notice}` : ''}

Design requirements:
- Build a real communicative scene with at least two people interacting.
- The topic should help Chinese students explain Chinese culture, daily life, values, art, landscapes, food, school life, friendship, or polite intercultural communication in natural English.
- Avoid slogans, empty praise, political preaching, and generic textbook propaganda.
- The selected constructions must directly support the writing goal.
- D2 Long Continuation: the reference answer, if requested, must be 100-150 English words and must not exceed 150 words.
- D1 Micro Continuation: the reference answer, if requested, must be 40-60 English words and focus on one small scene, one emotional turn, or one action.
- GAP: create only 1-2 strategically blanked sentences. Blank emotion, action, conflict, explanation, or transition sentences, not random grammar points.
- Student-only D1/D2 practice should not include a reference answer unless include_reference_answer is true.

Return STRICT JSON only. Use this shape:
{
  "exerciseId": "AI-{mode}-{short timestamp or random suffix}",
  "level": "junior or senior",
  "type": "D1, D2, GAP, or CG",
  "theme": "short English title",
  "context": "story context, or passage_with_blanks for GAP",
  "task": "student-facing writing task",
  "wordCount": "${requirements.word_limit}",
  "targetConstructions": "comma-separated real construction codes from the selected PostgreSQL rows",
  "referenceAnswer": "",
  "metadata": {
    "mode": "student_continuation | gap_continuation | construction_guided_continuation",
    "teaching_objective": "...",
    "communicative_situation": "...",
    "student_role": "...",
    "audience": "...",
    "target_constructions": [
      {
        "code": "real code",
        "construction": "real name",
        "meaning_zh": "from PostgreSQL",
        "function": "from PostgreSQL",
        "example": "from PostgreSQL"
      }
    ],
    "blanks": [
      {
        "blank_id": 1,
        "guidance": "...",
        "suggested_constructions": ["real code"]
      }
    ],
    "data_notice": "${notice || ''}"
  }
}`
}

export function buildAdaptiveWritingExercisePrompt(input: WritingPromptInput, plan: AdaptiveExercisePlan, notice?: string) {
  const constructionBlock = plan.constructions.map((c, index) => ({
    index: index + 1,
    code: c.code,
    construction: c.name,
    template: c.template,
    meaning_zh: c.function,
    function: c.function,
    usage_note: c.usageNote,
    example: c.example,
    level: c.level,
    difficulty: c.difficulty,
    category: c.category,
  }))

  const request = {
    topic: input.topic || 'intercultural communication',
    difficulty: input.difficulty || input.studentLevel || 'senior',
    selected_exercise_type: plan.exerciseType,
    selected_exercise_type_label: plan.exerciseTypeLabel,
    selection_reason: {
      construction_profile: plan.profile,
      task_focus: plan.taskFocus,
      scene_guidance: plan.sceneGuidance,
      balance_notice: plan.balanceNotice || '',
    },
    word_limit: input.wordLimit || plan.wordLimit,
  }

  return `You are an English writing teacher. Generate ONE construction-driven exercise for Chinese students.

Architecture:
construction retrieval -> communicative-function analysis -> emotional/narrative analysis -> exercise-type selection -> scene generation -> task generation -> structured output.

The exercise type has already been selected from the construction profiles. Use ONLY the PostgreSQL construction data below. Do not invent construction names, examples, explanations, levels, or teaching content.

PostgreSQL constructions:
${JSON.stringify(constructionBlock, null, 2)}

Adaptive plan:
${JSON.stringify(request, null, 2)}

${notice ? `Data notice: ${notice}` : ''}

Teaching rules:
- Every exercise must have a real communicative situation with at least two people.
- Chinese culture should appear naturally through the scene and communication need, not slogans or decoration.
- If selected_exercise_type is long_continuation, any reference answer must be 100-150 words and never exceed 150 words.
- If selected_exercise_type is micro_continuation, any reference answer must be 40-60 words.
- If selected_exercise_type is action_chain_continuation, guide a 40-80 word action/reaction sequence with emotional flow.
- If selected_exercise_type is gap_continuation, create only 1-2 important blanks and guide each blank with target construction codes.
- If selected_exercise_type is single_sentence_translation, create one meaningful Chinese situational sentence and one natural English reference translation.
- If selected_exercise_type is construction_guided_continuation, include construction guidance from the PostgreSQL rows.

Return STRICT JSON only:
{
  "exerciseId": "AI-ADAPT-{short suffix}",
  "level": "junior or senior",
  "type": "D1 | D2 | GAP | ACT | TR | CG",
  "theme": "short English title",
  "context": "scene opening, passage with blanks, or Chinese source sentence",
  "task": "student-facing task with action/emotion/communication guidance",
  "wordCount": "${request.word_limit}",
  "targetConstructions": "comma-separated real PostgreSQL codes",
  "referenceAnswer": "",
  "metadata": {
    "adaptive_exercise_type": "${plan.exerciseType}",
    "exercise_type_label": "${plan.exerciseTypeLabel}",
    "teaching_objective": "...",
    "communicative_situation": "...",
    "student_role": "...",
    "audience": "...",
    "action_hint": "...",
    "emotional_hint": "...",
    "interaction_guidance": "...",
    "target_constructions": [
      {
        "code": "real code",
        "construction": "real name",
        "meaning_zh": "from PostgreSQL",
        "function": "from PostgreSQL",
        "example": "from PostgreSQL"
      }
    ],
    "blanks": [
      {
        "blank_id": 1,
        "guidance": "...",
        "suggested_constructions": ["real code"]
      }
    ],
    "construction_profile": ${JSON.stringify(plan.profile)}
  }
}`
}
