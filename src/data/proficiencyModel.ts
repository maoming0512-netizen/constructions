// =============================================================================
// V2: 6-Dimension Proficiency Model
// =============================================================================
// Theory grounding: Goldberg (1995, 2006, 2019) — Construction Grammar
// Six dimensions of constructional mastery, each weighted according to
// pedagogical importance in assessing construction grammar competence.
// =============================================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DimensionId =
  | 'form_recognition'
  | 'meaning_prediction'
  | 'role_mapping'
  | 'naturalness_judgment'
  | 'productive_use'
  | 'conventionality_sense'

export type ProficiencyLevel =
  | 'novice'        // 0.0 - 0.2
  | 'developing'    // 0.2 - 0.4
  | 'intermediate'  // 0.4 - 0.6
  | 'proficient'    // 0.6 - 0.8
  | 'expert'        // 0.8 - 1.0

export interface ProficiencyDimension {
  id: DimensionId
  name: string
  nameZh: string
  description: string
  descriptionZh: string
  weight: number          // Weight in overall proficiency calculation (sums to 1.0)
  goldbergConcept: string // Relevant Goldberg theoretical concept
  assessmentMethods: string[]
  assessmentMethodsZh: string[]
  typicalErrors: string[]
  typicalErrorsZh: string[]
}

export interface DimensionScore {
  dimensionId: DimensionId
  rawScore: number        // 0.0 - 1.0
  confidence: number      // 0.0 - 1.0 (how confident the assessment is)
  sampleSize: number      // Number of exercises/assessments used
  lastUpdated: string     // ISO date string
}

export interface ProficiencyReport {
  overallScore: number             // Weighted average 0.0 - 1.0
  overallLevel: ProficiencyLevel
  dimensionScores: DimensionScore[]
  recommendations: Recommendation[]
  strengthAreas: DimensionId[]
  weaknessAreas: DimensionId[]
  nextSteps: string[]
  nextStepsZh: string[]
  generatedAt: string
}

export interface Recommendation {
  id: string
  dimensionId: DimensionId
  priority: 'high' | 'medium' | 'low'
  message: string
  messageZh: string
  suggestedExercises: string[]
  estimatedImprovement: number // Expected score improvement 0.0 - 1.0
}

// ---------------------------------------------------------------------------
// Dimension Definitions
// ---------------------------------------------------------------------------

export const PROFICIENCY_DIMENSIONS: ProficiencyDimension[] = [
  {
    id: 'form_recognition',
    name: 'Form Recognition',
    nameZh: '形式识别',
    description:
      'The ability to identify and classify constructions by their formal properties (word order, morphology, syntactic slots). This includes recognizing construction types from surface form alone.',
    descriptionZh:
      '通过形式特征（语序、形态、句法槽位）识别和分类构式的能力。包括仅从表面形式识别构式类型。',
    weight: 0.15,
    goldbergConcept:
      'Constructions are form-meaning pairings: form recognition is the prerequisite for accessing constructional meaning (Goldberg 1995: Ch. 1)',
    assessmentMethods: [
      'Construction identification exercises',
      'Multiple-choice form classification',
      'Syntactic parsing of construction instances',
    ],
    assessmentMethodsZh: [
      '构式识别练习',
      '多项选择形式分类',
      '构式实例的句法分析',
    ],
    typicalErrors: [
      'Failing to distinguish between ditransitive and prepositional dative',
      'Misidentifying reduced concessive clauses as additive',
      'Confusing SAI in conditionals with question formation',
    ],
    typicalErrorsZh: [
      '未能区分双及物构式与介词与格构式',
      '将缩减让步从句误识别为附加从句',
      '将条件句中的SAI误认为疑问句构式',
    ],
  },
  {
    id: 'meaning_prediction',
    name: 'Meaning Prediction',
    nameZh: '意义预测',
    description:
      'The ability to predict the semantic interpretation of a construction instance, including constructionally contributed meaning beyond what the verb encodes.',
    descriptionZh:
      '预测构式实例语义解读的能力，包括构式贡献的超出动词编码范围的意义。',
    weight: 0.15,
    goldbergConcept:
      'Constructions contribute meaning independently of the words they contain; meaning prediction requires accessing constructional semantics (Goldberg 1995: Ch. 2)',
    assessmentMethods: [
      'Meaning-from-form exercises',
      'Paraphrase matching',
      'Semantic entailment verification',
    ],
    assessmentMethodsZh: [
      '形式推意义练习',
      '释义匹配',
      '语义蕴涵验证',
    ],
    typicalErrors: [
      'Attributing all meaning to the verb and ignoring constructional contributions',
      'Misinterpreting metaphorical extensions as literal',
      'Failing to recognize presupposition in cleft constructions',
    ],
    typicalErrorsZh: [
      '将所有意义归因于动词而忽略构式贡献',
      '将隐喻扩展误解为字面意义',
      '未能识别分裂句中的预设',
    ],
  },
  {
    id: 'role_mapping',
    name: 'Role Mapping',
    nameZh: '角色映射',
    description:
      'The ability to correctly map semantic roles (Agent, Patient, Theme, Goal, Recipient, Experiencer, etc.) onto the syntactic slots of a construction.',
    descriptionZh:
      '将语义角色（施事、受事、客体、目标、接受者、经历者等）正确映射到构式句法槽位的能力。',
    weight: 0.15,
    goldbergConcept:
      'Constructions map semantic roles onto syntactic positions; role-mapping competence is central to argument-structure mastery (Goldberg 1995: Ch. 2-3)',
    assessmentMethods: [
      'Role-labeling exercises',
      'Semantic role diagramming',
      'Argument-structure paraphrase tasks',
    ],
    assessmentMethodsZh: [
      '角色标注练习',
      '语义角色图示',
      '论元结构释义任务',
    ],
    typicalErrors: [
      'Confusing Recipient and Theme in ditransitive constructions',
      'Labeling intransitive motion subjects as Agents instead of Themes',
      'Misidentifying the experiencer in tough-movement constructions',
    ],
    typicalErrorsZh: [
      '混淆双及物构式中的接受者和客体',
      '将不及物位移构式主语标记为施事而非客体',
      '在tough-movement构式中误识别经历者',
    ],
  },
  {
    id: 'naturalness_judgment',
    name: 'Naturalness Judgment',
    nameZh: '自然度判断',
    description:
      'The ability to evaluate how natural or acceptable a construction instance sounds to a native speaker. This includes sensitivity to register, collocational preferences, and constructional frequency.',
    descriptionZh:
      '评估构式实例对母语者而言有多自然或可接受的能力。包括对语域、搭配偏好和构式频率的敏感度。',
    weight: 0.15,
    goldbergConcept:
      'Naturalness judgments reflect statistical preemption and entrenchment from usage experience (Goldberg 2006: Ch. 4)',
    assessmentMethods: [
      'Naturalness rating scales (1-5)',
      'Acceptability judgment tasks',
      'Register-appropriateness evaluation',
    ],
    assessmentMethodsZh: [
      '自然度量表评分（1-5）',
      '可接受性判断任务',
      '语域适当性评估',
    ],
    typicalErrors: [
      'Rating creative but acceptable extensions as ungrammatical',
      'Accepting L1-transfer patterns that violate English constructional conventions',
      'Failing to detect register mismatches (e.g., colloquial forms in academic writing)',
    ],
    typicalErrorsZh: [
      '将创意但可接受的扩展评为不合语法',
      '接受违反英语构式惯例的L1迁移模式',
      '未能察觉语域不匹配（如学术写作中的口语形式）',
    ],
  },
  {
    id: 'productive_use',
    name: 'Productive Use',
    nameZh: '产出能力',
    description:
      'The ability to produce novel, contextually appropriate sentences using target constructions. This is the highest-order skill, requiring integration of form, meaning, and context.',
    descriptionZh:
      '使用目标构式产出新颖且语境适当的句子的能力。这是最高阶技能，需要对形式、意义和语境的整合。',
    weight: 0.20,
    goldbergConcept:
      'Constructions are productive schemas; speakers create novel instances by filling constructional templates (Goldberg 2006: Ch. 5)',
    assessmentMethods: [
      'Sentence production tasks',
      'Construction-based writing prompts',
      'Spontaneous speaking exercises',
    ],
    assessmentMethodsZh: [
      '句子产出任务',
      '基于构式的写作提示',
      '即兴口语练习',
    ],
    typicalErrors: [
      'Avoiding target constructions in favor of simpler alternatives',
      'Overusing one construction while neglectingalternatives',
      'Producing semantically anomalous verb-construction combinations',
    ],
    typicalErrorsZh: [
      '回避目标构式而使用更简单的替代方案',
      '过度使用一种构式而忽视替代方案',
      '产出语义异常的动词-构式组合',
    ],
  },
  {
    id: 'conventionality_sense',
    name: 'Conventionality Sense',
    nameZh: '地道性感知',
    description:
      'The ability to distinguish between highly conventional, marginally conventional, and creative/novel uses of a construction. This includes sensitivity to the conventionality cline from prototype to innovation.',
    descriptionZh:
      '区分高度约定俗成、边缘约定俗成和创意/新颖用法的能力。包括对从原型到创新的约定性梯度的敏感度。',
    weight: 0.20,
    goldbergConcept:
      'Conventionality judgments require sensitivity to the cline from prototype through metaphorical extension to creative innovation (Goldberg 2006: Ch. 5; Goldberg 2019)',
    assessmentMethods: [
      'Conventionality cline rating tasks',
      'Prototype-to-extension sorting exercises',
      'Native-speaker-likeness evaluation',
    ],
    assessmentMethodsZh: [
      '约定性梯度评级任务',
      '原型到扩展的分类练习',
      '母语者相似度评估',
    ],
    typicalErrors: [
      'Treating all grammatical sentences as equally conventional',
      'Avoiding creative extensions out of fear of error',
      'Overusing creative extensions in inappropriate registers',
    ],
    typicalErrorsZh: [
      '将所有合乎语法的句子视为同等约定俗成',
      '因害怕出错而回避创意扩展',
      '在不适当的语域中过度使用创意扩展',
    ],
  },
]

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const TOTAL_WEIGHT = PROFICIENCY_DIMENSIONS.reduce(
  (sum, d) => sum + d.weight,
  0
)

export const DIMENSION_IDS: DimensionId[] = PROFICIENCY_DIMENSIONS.map(
  (d) => d.id
)

// ---------------------------------------------------------------------------
// Scoring Functions
// ---------------------------------------------------------------------------

/**
 * Convert a raw numeric score (0.0 - 1.0) to a proficiency level label.
 */
export function scoreToLevel(score: number): ProficiencyLevel {
  if (score < 0.2) return 'novice'
  if (score < 0.4) return 'developing'
  if (score < 0.6) return 'intermediate'
  if (score < 0.8) return 'proficient'
  return 'expert'
}

/**
 * Get a human-readable label for a proficiency level.
 */
export function levelToLabel(level: ProficiencyLevel): string {
  const labels: Record<ProficiencyLevel, string> = {
    novice: 'Novice',
    developing: 'Developing',
    intermediate: 'Intermediate',
    proficient: 'Proficient',
    expert: 'Expert',
  }
  return labels[level]
}

/**
 * Get a human-readable label (Chinese) for a proficiency level.
 */
export function levelToLabelZh(level: ProficiencyLevel): string {
  const labels: Record<ProficiencyLevel, string> = {
    novice: '新手',
    developing: '发展中',
    intermediate: '中级',
    proficient: '熟练',
    expert: '专家',
  }
  return labels[level]
}

/**
 * Calculate overall proficiency score as a weighted average of dimension scores.
 * Missing dimensions are excluded from the calculation.
 */
export function calculateProficiency(
  dimensionScores: DimensionScore[]
): {
  overallScore: number
  overallLevel: ProficiencyLevel
  coverage: number // What fraction of dimensions were assessed
} {
  if (dimensionScores.length === 0) {
    return { overallScore: 0, overallLevel: 'novice', coverage: 0 }
  }

  // Normalize weights for available dimensions
  const availableDimensions = new Set(dimensionScores.map((ds) => ds.dimensionId))
  const availableWeight = PROFICIENCY_DIMENSIONS
    .filter((d) => availableDimensions.has(d.id))
    .reduce((sum, d) => sum + d.weight, 0)

  const weightMultiplier = availableWeight > 0 ? 1 / availableWeight : 0

  let weightedSum = 0
  for (const ds of dimensionScores) {
    const dimDef = PROFICIENCY_DIMENSIONS.find((d) => d.id === ds.dimensionId)
    if (!dimDef) continue
    const normalizedWeight = dimDef.weight * weightMultiplier
    weightedSum += ds.rawScore * normalizedWeight
  }

  const coverage = availableDimensions.size / PROFICIENCY_DIMENSIONS.length

  return {
    overallScore: Math.round(weightedSum * 100) / 100,
    overallLevel: scoreToLevel(weightedSum),
    coverage,
  }
}

/**
 * Generate targeted recommendations based on dimension scores.
 */
export function generateRecommendations(
  dimensionScores: DimensionScore[]
): Recommendation[] {
  const recommendations: Recommendation[] = []

  for (const dimDef of PROFICIENCY_DIMENSIONS) {
    const ds = dimensionScores.find((d) => d.dimensionId === dimDef.id)
    const score = ds?.rawScore ?? 0

    if (score < 0.4) {
      // Low score → high priority recommendation
      recommendations.push({
        id: `rec-${dimDef.id}-low`,
        dimensionId: dimDef.id,
        priority: 'high',
        message: `${dimDef.name} is below developing level (${Math.round(score * 100)}%). Focus on foundational exercises targeting ${dimDef.name.toLowerCase()}.`,
        messageZh: `${dimDef.nameZh}处于发展水平以下（${Math.round(score * 100)}%）。专注于针对${dimDef.nameZh}的基础练习。`,
        suggestedExercises: _getExercisesForDimension(dimDef.id, 'beginner'),
        estimatedImprovement: 0.25,
      })
    } else if (score < 0.6) {
      // Medium score → medium priority
      recommendations.push({
        id: `rec-${dimDef.id}-mid`,
        dimensionId: dimDef.id,
        priority: 'medium',
        message: `${dimDef.name} is at intermediate level (${Math.round(score * 100)}%). Practice more challenging exercises to reach proficiency.`,
        messageZh: `${dimDef.nameZh}处于中级水平（${Math.round(score * 100)}%）。练习更具挑战性的练习以达到熟练水平。`,
        suggestedExercises: _getExercisesForDimension(dimDef.id, 'intermediate'),
        estimatedImprovement: 0.15,
      })
    } else if (score < 0.8) {
      // Good score → low priority refinement
      recommendations.push({
        id: `rec-${dimDef.id}-high`,
        dimensionId: dimDef.id,
        priority: 'low',
        message: `${dimDef.name} is proficient (${Math.round(score * 100)}%). Focus on creative extensions and conventionality sensitivity.`,
        messageZh: `${dimDef.nameZh}处于熟练水平（${Math.round(score * 100)}%）。专注于创意扩展和约定性敏感度。`,
        suggestedExercises: _getExercisesForDimension(dimDef.id, 'advanced'),
        estimatedImprovement: 0.08,
      })
    }
    // Expert level (>= 0.8) → no recommendation needed
  }

  // Sort by priority (high → medium → low)
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  return recommendations
}

/**
 * Generate a complete proficiency report from dimension scores.
 */
export function generateProficiencyReport(
  dimensionScores: DimensionScore[]
): ProficiencyReport {
  const { overallScore, overallLevel } = calculateProficiency(dimensionScores)
  const recommendations = generateRecommendations(dimensionScores)

  const sortedByScore = [...dimensionScores].sort((a, b) => b.rawScore - a.rawScore)
  const strengthAreas: DimensionId[] = sortedByScore
    .slice(0, 2)
    .map((ds) => ds.dimensionId)
  const weaknessAreas: DimensionId[] = sortedByScore
    .slice(-2)
    .map((ds) => ds.dimensionId)

  const nextSteps = _generateNextSteps(strengthAreas, weaknessAreas, overallLevel)
  const nextStepsZh = _generateNextStepsZh(strengthAreas, weaknessAreas, overallLevel)

  return {
    overallScore,
    overallLevel,
    dimensionScores,
    recommendations,
    strengthAreas,
    weaknessAreas,
    nextSteps,
    nextStepsZh,
    generatedAt: new Date().toISOString(),
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function _getExercisesForDimension(
  dimensionId: DimensionId,
  level: 'beginner' | 'intermediate' | 'advanced'
): string[] {
  const exerciseMap: Record<DimensionId, Record<string, string[]>> = {
    form_recognition: {
      beginner: [
        'construction-identification-001',
        'ditransitive-vs-dative-001',
        'sai-identification-001',
      ],
      intermediate: [
        'reduced-concessive-spotting-001',
        'information-structure-cleft-001',
        'way-construction-spotting-001',
      ],
      advanced: [
        'constructional-coercion-identification-001',
        'non-compositional-format-001',
        'pseudocleft-vs-it-cleft-001',
      ],
    },
    meaning_prediction: {
      beginner: [
        'ditransitive-meaning-001',
        'caused-motion-meaning-001',
        'resultative-meaning-001',
      ],
      intermediate: [
        'hedging-construction-meaning-001',
        'concessive-clause-meaning-001',
        'existential-there-meaning-001',
      ],
      advanced: [
        'metaphorical-ditransitive-meaning-001',
        'whats-x-doing-y-pragmatic-force-001',
        'conventionality-cline-prediction-001',
      ],
    },
    role_mapping: {
      beginner: [
        'ditransitive-role-map-001',
        'caused-motion-role-map-001',
        'transitive-role-map-001',
      ],
      intermediate: [
        'resultative-secondary-predicate-001',
        'way-construction-role-map-001',
        'tough-movement-role-map-001',
      ],
      advanced: [
        'metaphorical-caused-motion-role-map-001',
        'cognate-object-role-map-001',
        'coercion-role-reassignment-001',
      ],
    },
    naturalness_judgment: {
      beginner: [
        'basic-naturalness-rating-001',
        'register-appropriateness-001',
        'word-order-naturalness-001',
      ],
      intermediate: [
        'hedging-naturalness-judgment-001',
        'discourse-marker-naturalness-001',
        'passive-naturalness-judgment-001',
      ],
      advanced: [
        'ielts-aw-001',
        'toefl-sp-001',
        'creative-extension-naturalness-001',
      ],
    },
    productive_use: {
      beginner: [
        'ditransitive-production-001',
        'caused-motion-production-001',
        'transitive-production-001',
      ],
      intermediate: [
        'resultative-production-001',
        'way-construction-production-001',
        'reported-speech-production-001',
      ],
      advanced: [
        'ielts-aw-010',
        'toefl-sp-007',
        'cognate-object-production-001',
      ],
    },
    conventionality_sense: {
      beginner: [
        'conventional-vs-unconventional-sorting-001',
        'prototype-identification-001',
      ],
      intermediate: [
        'conventionality-cline-rating-001',
        'metaphorical-extension-judgment-001',
      ],
      advanced: [
        'sem-ana-003',
        'sem-ana-005',
        'creative-vs-conventional-production-001',
      ],
    },
  }

  return exerciseMap[dimensionId]?.[level] ?? []
}

function _generateNextSteps(
  strengths: DimensionId[],
  weaknesses: DimensionId[],
  level: ProficiencyLevel
): string[] {
  const steps: string[] = []

  if (level === 'novice' || level === 'developing') {
    steps.push(
      `Focus on building foundational competence in: ${weaknesses.map((id) => PROFICIENCY_DIMENSIONS.find((d) => d.id === id)?.name).join(', ')}.`
    )
    steps.push('Complete Level 1 learning path exercises (Core Argument Structure).')
    steps.push('Practice construction identification and basic role-mapping.')
  } else if (level === 'intermediate') {
    steps.push(
      `Strengthen ${weaknesses.map((id) => PROFICIENCY_DIMENSIONS.find((d) => d.id === id)?.name).join(', ')} through Level 2 extension exercises.`
    )
    steps.push(
      `Leverage your strengths in ${strengths.map((id) => PROFICIENCY_DIMENSIONS.find((d) => d.id === id)?.name).join(', ')} to tackle more complex constructions.`
    )
    steps.push('Begin working with metaphorical extensions and coercion.')
  } else {
    steps.push(
      `Refine ${weaknesses.map((id) => PROFICIENCY_DIMENSIONS.find((d) => d.id === id)?.name).join(', ')} through advanced discourse-level exercises.`
    )
    steps.push('Explore Level 3: Discourse and Pragmatics.')
    steps.push('Practice creative constructional extensions with conventionality awareness.')
  }

  steps.push('Track your progress using the proficiency dashboard.')

  return steps
}

function _generateNextStepsZh(
  strengths: DimensionId[],
  weaknesses: DimensionId[],
  level: ProficiencyLevel
): string[] {
  const steps: string[] = []

  if (level === 'novice' || level === 'developing') {
    steps.push(
      `专注于建立基础能力：${weaknesses.map((id) => PROFICIENCY_DIMENSIONS.find((d) => d.id === id)?.nameZh).join('、')}。`
    )
    steps.push('完成第1级学习路径练习（核心论元结构）。')
    steps.push('练习构式识别和基础角色映射。')
  } else if (level === 'intermediate') {
    steps.push(
      `通过第2级扩展练习加强${weaknesses.map((id) => PROFICIENCY_DIMENSIONS.find((d) => d.id === id)?.nameZh).join('、')}。`
    )
    steps.push(
      `利用您在${strengths.map((id) => PROFICIENCY_DIMENSIONS.find((d) => d.id === id)?.nameZh).join('、')}方面的优势应对更复杂的构式。`
    )
    steps.push('开始练习隐喻扩展和压制现象。')
  } else {
    steps.push(
      `通过高级语篇层面练习精进${weaknesses.map((id) => PROFICIENCY_DIMENSIONS.find((d) => d.id === id)?.nameZh).join('、')}。`
    )
    steps.push('探索第3级：语篇与语用。')
    steps.push('在约定性意识的指导下练习创意构式扩展。')
  }

  steps.push('使用掌握度仪表板跟踪您的进步。')

  return steps
}

// ---------------------------------------------------------------------------
// Export: Dimension utilities
// ---------------------------------------------------------------------------

export function getDimensionById(
  dimensionId: DimensionId
): ProficiencyDimension | undefined {
  return PROFICIENCY_DIMENSIONS.find((d) => d.id === dimensionId)
}

export function getWeightForDimension(dimensionId: DimensionId): number {
  return PROFICIENCY_DIMENSIONS.find((d) => d.id === dimensionId)?.weight ?? 0
}

export function validateDimensionScores(
  scores: DimensionScore[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  const seen = new Set<DimensionId>()

  for (const score of scores) {
    if (!PROFICIENCY_DIMENSIONS.some((d) => d.id === score.dimensionId)) {
      errors.push(`Unknown dimension: ${score.dimensionId}`)
    }
    if (seen.has(score.dimensionId)) {
      errors.push(`Duplicate dimension: ${score.dimensionId}`)
    }
    seen.add(score.dimensionId)
    if (score.rawScore < 0 || score.rawScore > 1) {
      errors.push(
        `Invalid rawScore for ${score.dimensionId}: must be 0.0 - 1.0`
      )
    }
    if (score.confidence < 0 || score.confidence > 1) {
      errors.push(
        `Invalid confidence for ${score.dimensionId}: must be 0.0 - 1.0`
      )
    }
  }

  return { valid: errors.length === 0, errors }
}
