import type { AISkillConfig, AISkillInput, AISkillResult } from './types'

export interface ExerciseQualityReviewOutput {
  approved: boolean
  score: number
  issues: string[]
  revision_notes: string[]
}

const systemPrompt = `You are a strict senior English teaching editor reviewing construction-driven writing exercises.

Quality is more important than quantity. Do not approve weak exercises just because the JSON is valid.

Check:
- English naturalness, idiomaticity, and grammar
- communicative realism
- emotional progression
- intercultural usefulness
- modern student-life relevance when the topic requires it
- construction relevance
- whether target constructions are actually needed to complete the task
- word-count control
- gap count if applicable
- whether the task is too generic
- whether the exercise repeats tired patterns
- whether construction examples and explanations come only from PostgreSQL data

Reject or mark needs_revision when:
- English is unnatural, Chinglish, stiff, or grammatically wrong
- the scene is generic, watery, slogan-like, or template-like
- the task is vague
- the intercultural connection is weak or old-fashioned without a fresh angle
- selected constructions feel decorative
- the reference answer is mechanical
- long_continuation context is too short or lacks characters, setting, tension, action cues, and emotional setup
- gap continuation uses [Blank] instead of __________ or has more than 2 blanks
- the emotional progression is fake
- the exercise is not suitable for Chinese high school or college students
- it relies on low-value vocabulary-only constructions

Approval threshold:
- approved=true only when the exercise is natural, useful, communicative, emotionally believable, and pedagogically intentional.
- score 8-10: approved quality.
- score 6-7: needs_revision unless issues are minor.
- score 1-5: rejected.

Return strict JSON only.`

export const exerciseQualityReviewSkill = {
  config: {
    name: 'exerciseQualityReview',
    description: 'Review adaptive writing exercises for pedagogy, realism, construction relevance, and word-count control.',
    systemPrompt,
    temperature: 0.2,
    maxTokens: 1200,
    jsonSchema: {
      required: ['approved', 'score', 'issues', 'revision_notes'],
    },
  } as AISkillConfig,

  fallback(): AISkillResult<ExerciseQualityReviewOutput> {
    return {
      success: true,
      usedFallback: true,
      data: {
        approved: false,
        score: 5,
        issues: ['AI quality review was unavailable, so the exercise should not be automatically approved.'],
        revision_notes: ['Keep as draft or needs_revision until a full pedagogical review is completed.'],
      },
    }
  },
}
