import type { AdaptiveExerciseType, ConstructionProfile } from '@/lib/exercises/adaptiveExercise'

export type SupplementalConstruction = {
  code: string
  name: string
  template: string
  coreWords: string
  function: string
  usageNote: string
  example: string
  difficulty: string
  level: string
  category: string
  topicSlugs: string[]
  goalSlugs: string[]
  exerciseTypes: AdaptiveExerciseType[]
  metadata: ConstructionProfile & Record<string, unknown>
}

function profile(input: {
  school_level: string
  fine_level: string
  communicative_function: string[]
  emotional_function?: string[]
  narrative_function?: string[]
  interaction_type?: string[]
  scene_type: string[]
  intercultural_value: string[]
  production_difficulty: string
  common_error_risk: string[]
  teaching_priority?: string
  recommended_exercise_types: AdaptiveExerciseType[]
  topic_relevance_reason: string
  goal_relevance_reason: string
}): ConstructionProfile & Record<string, unknown> {
  return {
    school_level: input.school_level,
    fine_level: input.fine_level,
    communicative_function: input.communicative_function,
    emotional_function: input.emotional_function || [],
    narrative_function: input.narrative_function || [],
    interaction_type: input.interaction_type || ['peer_to_peer'],
    scene_type: input.scene_type,
    cultural_usage: input.intercultural_value,
    intercultural_value: input.intercultural_value,
    emotional_intensity: input.emotional_function?.length ? 2 : 1,
    action_density: input.narrative_function?.includes('action_sequence') ? 3 : 1,
    discourse_scope: input.recommended_exercise_types.includes('long_continuation') ? 'paragraph' : 'dialogue',
    production_difficulty: input.production_difficulty,
    common_error_risk: input.common_error_risk,
    teaching_priority: input.teaching_priority || 'high',
    usage_frequency: 'medium',
    rotation_weight: input.production_difficulty === 'high' ? 0.85 : 1,
    recommended_exercise_types: input.recommended_exercise_types,
    source: 'system_supplemented',
    quality_status: 'ai_reviewed',
    review_note: 'Curated as modern intercultural communication support; duplicate-aware seed script required before insertion.',
    topic_relevance_reason: input.topic_relevance_reason,
    goal_relevance_reason: input.goal_relevance_reason,
  }
}

export const supplementalConstructions: SupplementalConstruction[] = [
  {
    code: 'SYS-MOD-001',
    name: 'explaining a habit without overgeneralizing',
    template: 'One reason many students do this is that ...',
    coreWords: 'one reason; many students; is that',
    function: '自然解释一种学生生活习惯，同时避免把个人经验说成绝对事实。',
    usageNote: 'Use this when explaining milk tea, food delivery, commuting, AI tools, or study routines to someone from another culture.',
    example: 'One reason many students order milk tea after class is that it gives them a small break before evening study.',
    difficulty: '高中',
    level: 'senior',
    category: 'SYS_Modern_Intercultural',
    topicSlugs: ['milk-tea-food-delivery', 'study-pressure', 'ai-learning-tools', 'global-youth-culture'],
    goalSlugs: ['explain-culture', 'compare-perspectives'],
    exerciseTypes: ['single_sentence_translation', 'construction_guided_continuation', 'micro_continuation'],
    metadata: profile({
      school_level: 'Senior High',
      fine_level: 'L4',
      communicative_function: ['explanation', 'daily_life_description'],
      scene_type: ['school_exchange', 'city_life', 'online_chat'],
      intercultural_value: ['explaining_modern_chinese_daily_life', 'avoiding_overgeneralization'],
      production_difficulty: 'medium',
      common_error_risk: ['overgeneralization', 'logic', 'unnatural_translation'],
      recommended_exercise_types: ['single_sentence_translation', 'construction_guided_continuation', 'micro_continuation'],
      topic_relevance_reason: 'Useful for explaining modern habits through a concrete reason.',
      goal_relevance_reason: 'Supports clear cultural explanation and perspective comparison.',
    }),
  },
  {
    code: 'SYS-MOD-002',
    name: 'softening disagreement in teamwork',
    template: 'I see your point, but I wonder if ...',
    coreWords: 'see your point; wonder if',
    function: '礼貌表达不同意见，保护合作关系。',
    usageNote: 'Use this in group projects, AI-use discussions, feedback conversations, and intercultural misunderstandings.',
    example: 'I see your point, but I wonder if we could make the feedback less direct so everyone feels comfortable revising it.',
    difficulty: '高中',
    level: 'senior',
    category: 'SYS_Modern_Intercultural',
    topicSlugs: ['teamwork-direct-feedback', 'ai-learning-tools', 'online-friendship-communication'],
    goalSlugs: ['soften-and-repair'],
    exerciseTypes: ['gap_continuation', 'single_sentence_translation', 'micro_continuation'],
    metadata: profile({
      school_level: 'Senior High',
      fine_level: 'L4',
      communicative_function: ['disagreement_softening', 'clarification'],
      emotional_function: ['respect', 'patience'],
      scene_type: ['group_project', 'online_meeting'],
      intercultural_value: ['avoiding_misunderstanding', 'showing_respect'],
      production_difficulty: 'medium',
      common_error_risk: ['tone', 'word_order', 'overuse'],
      recommended_exercise_types: ['gap_continuation', 'single_sentence_translation', 'micro_continuation'],
      topic_relevance_reason: 'Directly addresses feedback-style differences in intercultural teamwork.',
      goal_relevance_reason: 'Teaches relationship repair and softened disagreement.',
    }),
  },
  {
    code: 'SYS-MOD-003',
    name: 'connecting preference with personal meaning',
    template: 'What I like about ... is not just ..., but ...',
    coreWords: 'what I like about; not just; but',
    function: '解释个人喜好背后的意义，而不只是说“我喜欢”。',
    usageNote: 'Useful for recommending animation, games, music, sports, drinks, or city places.',
    example: 'What I like about this animation is not just the beautiful scenes, but the way it shows young people learning to carry responsibility.',
    difficulty: '高中',
    level: 'senior',
    category: 'SYS_Modern_Intercultural',
    topicSlugs: ['animation-games-media', 'global-youth-culture', 'city-commuting-daily-life'],
    goalSlugs: ['compare-perspectives', 'explain-culture'],
    exerciseTypes: ['micro_continuation', 'construction_guided_continuation', 'single_sentence_translation'],
    metadata: profile({
      school_level: 'Senior High',
      fine_level: 'L4',
      communicative_function: ['sharing_preferences', 'explanation', 'comparison'],
      emotional_function: ['curiosity', 'belonging'],
      scene_type: ['online_chat', 'club_activity'],
      intercultural_value: ['sharing_youth_culture', 'explaining_personal_meaning'],
      production_difficulty: 'medium',
      common_error_risk: ['logic', 'parallelism', 'unnatural_translation'],
      recommended_exercise_types: ['micro_continuation', 'construction_guided_continuation', 'single_sentence_translation'],
      topic_relevance_reason: 'Turns hobbies and media preferences into meaningful intercultural explanation.',
      goal_relevance_reason: 'Supports perspective comparison and richer self-expression.',
    }),
  },
  {
    code: 'SYS-MOD-004',
    name: 'explaining family expectations with nuance',
    template: 'For my family, ... is less about ... and more about ...',
    coreWords: 'less about; more about',
    function: '有层次地解释家庭期待、价值观或选择背后的原因。',
    usageNote: 'Use when explaining family expectations, career planning, tradition, or personal dreams.',
    example: 'For my family, choosing a stable job is less about controlling my life and more about hoping I can feel secure.',
    difficulty: '高中',
    level: 'senior',
    category: 'SYS_Modern_Intercultural',
    topicSlugs: ['family-expectations-dreams', 'university-internship', 'tradition-in-modern-life'],
    goalSlugs: ['explain-culture', 'compare-perspectives', 'build-emotion'],
    exerciseTypes: ['long_continuation', 'construction_guided_continuation', 'micro_continuation'],
    metadata: profile({
      school_level: 'Senior High',
      fine_level: 'L5',
      communicative_function: ['cultural_explanation', 'reflection', 'comparison'],
      emotional_function: ['respect', 'pressure', 'empathy'],
      narrative_function: ['reflection'],
      scene_type: ['roommate_conversation', 'essay_reflection'],
      intercultural_value: ['explaining_family_expectations', 'avoiding_misunderstanding'],
      production_difficulty: 'high',
      common_error_risk: ['tone', 'logic', 'overgeneralization'],
      recommended_exercise_types: ['long_continuation', 'construction_guided_continuation', 'micro_continuation'],
      topic_relevance_reason: 'Helps explain family values without stereotypes.',
      goal_relevance_reason: 'Supports cultural explanation and emotional nuance.',
    }),
  },
  {
    code: 'SYS-MOD-005',
    name: 'respectful curiosity about another culture',
    template: 'I am curious how people your age usually ...',
    coreWords: 'curious how; people your age; usually',
    function: '礼貌询问对方文化或生活习惯，避免冒犯。',
    usageNote: 'Use this when comparing youth life, school routines, work-life balance, or online habits.',
    example: 'I am curious how people your age usually balance part-time jobs, classes, and free time.',
    difficulty: '高中',
    level: 'senior',
    category: 'SYS_Modern_Intercultural',
    topicSlugs: ['global-youth-culture', 'university-internship', 'study-pressure', 'online-friendship-communication'],
    goalSlugs: ['compare-perspectives', 'soften-and-repair'],
    exerciseTypes: ['single_sentence_translation', 'micro_continuation', 'gap_continuation'],
    metadata: profile({
      school_level: 'Senior High',
      fine_level: 'L4',
      communicative_function: ['asking_respectfully', 'comparison', 'clarification'],
      emotional_function: ['curiosity', 'respect'],
      scene_type: ['school_exchange', 'online_chat', 'dorm_conversation'],
      intercultural_value: ['asking_about_other_cultures', 'showing_respect'],
      production_difficulty: 'medium',
      common_error_risk: ['tone', 'word_order'],
      recommended_exercise_types: ['single_sentence_translation', 'micro_continuation', 'gap_continuation'],
      topic_relevance_reason: 'Gives students a natural way to ask about peers in other cultures.',
      goal_relevance_reason: 'Supports comparison and repair through respectful curiosity.',
    }),
  },
  {
    code: 'SYS-MOD-006',
    name: 'clarifying intention in digital communication',
    template: 'I did not mean to sound ..., I just wanted to ...',
    coreWords: 'did not mean to sound; just wanted to',
    function: '澄清线上表达语气，修复误解。',
    usageNote: 'Use when a message, emoji, short reply, or direct comment is misunderstood.',
    example: 'I did not mean to sound impatient, I just wanted to make sure we finished the slides before the meeting.',
    difficulty: '高中',
    level: 'senior',
    category: 'SYS_Modern_Intercultural',
    topicSlugs: ['online-friendship-communication', 'teamwork-direct-feedback', 'ai-learning-tools'],
    goalSlugs: ['soften-and-repair', 'build-emotion'],
    exerciseTypes: ['gap_continuation', 'micro_continuation', 'single_sentence_translation'],
    metadata: profile({
      school_level: 'Senior High',
      fine_level: 'L4',
      communicative_function: ['clarification', 'apology', 'repair'],
      emotional_function: ['regret', 'respect', 'patience'],
      scene_type: ['online_chat', 'group_project'],
      intercultural_value: ['avoiding_misunderstanding', 'repairing_tone'],
      production_difficulty: 'medium',
      common_error_risk: ['tone', 'tense', 'logic'],
      recommended_exercise_types: ['gap_continuation', 'micro_continuation', 'single_sentence_translation'],
      topic_relevance_reason: 'Targets a common real-life digital misunderstanding.',
      goal_relevance_reason: 'Strong fit for softening, repair, and emotional control.',
    }),
  },
]
