import {
  Eye,
  Shuffle,
  AlertTriangle,
  UserX,
  Shield,
  BookOpen,
  TrendingUp,
  Globe,
  type LucideIcon,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ErrorType {
  id: string
  code: ErrorTypeCode
  name: string
  nameEn: string
  description: string
  relatedGoldbergConcept: string
  conceptExplanation: string
  learningRecommendation: string
  relatedExerciseTypes: string[]
  icon: LucideIcon
}

export type ErrorTypeCode =
  | 'FORM_MISREAD'
  | 'ROLE_MAPPING_ERROR'
  | 'VERB_CONSTRUCTION_MISMATCH'
  | 'RECIPIENT_CONSTRAINT'
  | 'PREEMPTION_ERROR'
  | 'CONVENTIONALITY_ERROR'
  | 'OVERGENERALIZATION'
  | 'L1_TRANSFER'

export interface DiagnosisResult {
  errorType: ErrorType
  confidence: 'high' | 'medium' | 'low'
  matchedKeywords: string[]
  suggestion: string
}

// ---------------------------------------------------------------------------
// Error Type Definitions
// ---------------------------------------------------------------------------

export const errorTypes: ErrorType[] = [
  {
    id: 'error-form-misread',
    code: 'FORM_MISREAD',
    name: '构式形式误读',
    nameEn: 'Form Misreading',
    description:
      '学习者误读了构式的表层形式，将目标构式与形式相似但语义不同的其他构式混淆。例如将双及物构式（ditransitive）与致使-移动构式（caused-motion）混淆。',
    relatedGoldbergConcept: 'Surface Generalization Hypothesis',
    conceptExplanation:
      'Goldberg 指出，学习者不能仅依赖表层形式来习得构式，因为相同形式可能承载不同语义。必须同时关注形式-意义配对。',
    learningRecommendation:
      '通过「输入淹没」接触大量同构式例句，强化形式-意义的正确配对；使用最小对立对（minimal pairs）对比区分易混淆构式。',
    relatedExerciseTypes: ['meaning-from-form', 'construction-sorting', 'naturalness-judgment'],
    icon: Eye,
  },
  {
    id: 'error-role-mapping',
    code: 'ROLE_MAPPING_ERROR',
    name: '语义角色映射错误',
    nameEn: 'Semantic Role Mapping Error',
    description:
      '学习者未能正确将事件参与者映射到构式规定的语义角色上。例如混淆双及物构式中的「转移者」(transferor)、「转移物」(theme) 和「接受者」(recipient)。',
    relatedGoldbergConcept: 'Correspondence Principle',
    conceptExplanation:
      'Goldberg 的对应原则指出：语义上凸显的参与者应映射到句法上凸显的位置。违背此原则会导致角色错位。',
    learningRecommendation:
      '进行角色标注练习，明确句子各成分对应的语义角色；绘制角色映射图强化理解；对比正确与错误的角色分配。',
    relatedExerciseTypes: ['meaning-from-form', 'prototype-to-extension', 'repair-sentence'],
    icon: Shuffle,
  },
  {
    id: 'error-verb-mismatch',
    code: 'VERB_CONSTRUCTION_MISMATCH',
    name: '动词-构式不匹配',
    nameEn: 'Verb-Construction Mismatch',
    description:
      '学习者选择的动词与目标构式的语义要求不兼容。例如在某些构式中使用了无法表达该构式核心语义的动词。',
    relatedGoldbergConcept: 'Semantic Coherence Principle',
    conceptExplanation:
      '语义一致原则要求：动词表达的语义结构与构式表达的语义结构之间必须存在语义一致性，才能合法共现。',
    learningRecommendation:
      '收集构式的典型动词清单，分类练习；分析动词与构式的语义兼容性；使用语义特征矩阵判断动词能否进入特定构式。',
    relatedExerciseTypes: ['naturalness-judgment', 'generate-by-construction', 'repair-sentence'],
    icon: AlertTriangle,
  },
  {
    id: 'error-recipient-constraint',
    code: 'RECIPIENT_CONSTRAINT',
    name: '接受者限制违反',
    nameEn: 'Recipient Constraint Violation',
    description:
      '学习者在需要表达「有意愿的接受者」(willing recipient) 时使用了不恰当的表达，或违反了构式对接受者的语义限制。',
    relatedGoldbergConcept: 'Semantic Constraints on Roles',
    conceptExplanation:
      '某些构式对参与者施加了特定的语义限制，如双及物构式通常要求接受者是有意愿、有生命的，能作为潜在拥有者。',
    learningRecommendation:
      '明确各类构式对参与者的限制条件；对比合法与不合法的接受者实例；强化「有意愿性」(volitionality) 等语义特征辨识。',
    relatedExerciseTypes: ['naturalness-judgment', 'repair-sentence', 'prototype-to-extension'],
    icon: UserX,
  },
  {
    id: 'error-preemption',
    code: 'PREEMPTION_ERROR',
    name: '先占阻断错误',
    nameEn: 'Preemption Error',
    description:
      '学习者产出了语法上可能合法、但母语者不会使用的表达，因为已有更习惯、更地道的替代形式存在。',
    relatedGoldbergConcept: 'Statistical Preemption',
    conceptExplanation:
      '统计先占理论：如果某一语义有高度 entrenched 的惯用表达，学习者应避免使用竞争性的替代形式，即使后者看似合理。',
    learningRecommendation:
      '大量接触地道语料，培养统计语感；对比学习者的表达与母语者实际使用的表达；记忆高频搭配和惯用说法。',
    relatedExerciseTypes: ['naturalness-judgment', 'ai-coach', 'generate-by-construction'],
    icon: Shield,
  },
  {
    id: 'error-conventionality',
    code: 'CONVENTIONALITY_ERROR',
    name: '地道性错误',
    nameEn: 'Conventionality Error',
    description:
      '学习者产出的句子虽然能理解，但不符合母语者的表达习惯，缺乏地道性。这通常是因为对构式的固结程度不够。',
    relatedGoldbergConcept: 'Entrenchment',
    conceptExplanation:
      '固结 (Entrenchment) 是指语言形式通过反复使用而在认知中强化。地道性错误反映了对特定构式-动词搭配的固结不足。',
    learningRecommendation:
      '增加输入频率，大量阅读和聆听包含目标构式的真实语料；进行模仿造句练习；使用 AI 反馈检测不地道表达。',
    relatedExerciseTypes: ['ai-coach', 'generate-by-construction', 'naturalness-judgment'],
    icon: BookOpen,
  },
  {
    id: 'error-overgeneralization',
    code: 'OVERGENERALIZATION',
    name: '过度泛化',
    nameEn: 'Overgeneralization',
    description:
      '学习者将构式的使用范围过度扩展到不兼容的动词或语境中，反映了「部分能产性」(partial productivity) 理解的不足。',
    relatedGoldbergConcept: 'Partial Productivity',
    conceptExplanation:
      '构式具有部分能产性：允许多种动词进入，但并非所有语义上可想象的动词都能合法使用。学习者需习得每个构式的语义准入条件。',
    learningRecommendation:
      '学习构式的准入条件（语义相容性要求）；收集能进入和不能进入构式的动词对比清单；理解构式的原型成员与边缘成员之分。',
    relatedExerciseTypes: ['prototype-to-extension', 'naturalness-judgment', 'repair-sentence'],
    icon: TrendingUp,
  },
  {
    id: 'error-l1-transfer',
    code: 'L1_TRANSFER',
    name: '母语迁移',
    nameEn: 'L1 Transfer',
    description:
      '学习者受母语表达习惯的影响，将母语的构式或搭配方式错误地迁移到目标语中，导致不符合英语表达习惯。',
    relatedGoldbergConcept: 'Constructional Relativity',
    conceptExplanation:
      '不同语言拥有不同的构式库。Goldberg 认为构式是语言特有的形式-意义配对，不能简单从一种语言映射到另一种语言。',
    learningRecommendation:
      '对比母语与英语在对应表达上的差异；明确英语构式特有的形式-意义配对；注意「假朋友」(false friends) 现象。',
    relatedExerciseTypes: ['meaning-from-form', 'construction-sorting', 'naturalness-judgment'],
    icon: Globe,
  },
]

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

export function getErrorTypeByCode(code: ErrorTypeCode): ErrorType | undefined {
  return errorTypes.find((e) => e.code === code)
}

export function getErrorTypeById(id: string): ErrorType | undefined {
  return errorTypes.find((e) => e.id === id)
}

// ---------------------------------------------------------------------------
// Diagnosis engine
// ---------------------------------------------------------------------------

const keywordMap: Record<ErrorTypeCode, string[]> = {
  FORM_MISREAD: ['形式', '表面', '混淆', '看起来', '结构相似', 'misread', 'confused', 'surface'],
  ROLE_MAPPING_ERROR: ['角色', '映射', '施事', '受事', '主体', 'mapping', 'role', 'agent', 'patient'],
  VERB_CONSTRUCTION_MISMATCH: ['动词', '搭配', '不匹配', '语义冲突', 'verb', 'mismatch', 'compatible'],
  RECIPIENT_CONSTRAINT: ['接受者', '限制', '意愿', '生命度', 'recipient', 'willing', 'animate'],
  PREEMPTION_ERROR: ['惯用', '地道', '母语者', 'idiomatic', 'conventional', 'preempted'],
  CONVENTIONALITY_ERROR: ['地道性', '习惯', 'natural', 'fluent', 'conventional', 'awkward'],
  OVERGENERALIZATION: ['泛化', '过度', '扩展', '能产', 'productive', 'overgeneralize', 'extend'],
  L1_TRANSFER: ['母语', '迁移', '中文', '翻译', 'transfer', 'L1', 'native', 'translate'],
}

/**
 * Diagnose an error based on user description or AI feedback text.
 * Returns the most likely error type with confidence level.
 */
export function diagnoseError(text: string): DiagnosisResult | null {
  if (!text || text.trim().length === 0) return null

  const lowerText = text.toLowerCase()
  let bestMatch: ErrorTypeCode | null = null
  let bestScore = 0
  let matchedKeywords: string[] = []

  for (const [code, keywords] of Object.entries(keywordMap)) {
    const matches = keywords.filter((kw) => lowerText.includes(kw.toLowerCase()))
    const score = matches.length
    if (score > bestScore) {
      bestScore = score
      bestMatch = code as ErrorTypeCode
      matchedKeywords = matches
    }
  }

  if (!bestMatch || bestScore === 0) return null

  const errorType = getErrorTypeByCode(bestMatch)!
  const confidence = bestScore >= 3 ? 'high' : bestScore >= 2 ? 'medium' : 'low'

  return {
    errorType,
    confidence,
    matchedKeywords,
    suggestion: errorType.learningRecommendation,
  }
}

/**
 * Diagnose from structured feedback (AI analysis result).
 */
export function diagnoseFromAIFeedback(
  naturalness: number,
  grammarValid: boolean,
  constructionMatched: boolean,
  notes: string
): DiagnosisResult | null {
  // Direct rule-based inference before keyword matching
  if (!constructionMatched && grammarValid) {
    return {
      errorType: getErrorTypeByCode('FORM_MISREAD')!,
      confidence: 'high',
      matchedKeywords: ['构式不匹配'],
      suggestion: getErrorTypeByCode('FORM_MISREAD')!.learningRecommendation,
    }
  }

  if (!grammarValid && naturalness < 40) {
    return {
      errorType: getErrorTypeByCode('VERB_CONSTRUCTION_MISMATCH')!,
      confidence: 'high',
      matchedKeywords: ['语法错误', '不自然'],
      suggestion: getErrorTypeByCode('VERB_CONSTRUCTION_MISMATCH')!.learningRecommendation,
    }
  }

  if (naturalness >= 40 && naturalness < 70 && grammarValid && constructionMatched) {
    return {
      errorType: getErrorTypeByCode('CONVENTIONALITY_ERROR')!,
      confidence: 'medium',
      matchedKeywords: ['自然度中等'],
      suggestion: getErrorTypeByCode('CONVENTIONALITY_ERROR')!.learningRecommendation,
    }
  }

  if (naturalness >= 70 && naturalness < 90) {
    return {
      errorType: getErrorTypeByCode('PREEMPTION_ERROR')!,
      confidence: 'low',
      matchedKeywords: ['接近地道但非惯用'],
      suggestion: getErrorTypeByCode('PREEMPTION_ERROR')!.learningRecommendation,
    }
  }

  // Fall back to keyword diagnosis
  return diagnoseError(notes)
}
