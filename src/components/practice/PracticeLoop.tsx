import { AnimatePresence, motion } from 'framer-motion'
import {
  BookOpen,
  Lightbulb,
  Users,
  PenTool,
  MessageSquare,
  Bot,
  Edit3,
  Award,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  BarChart3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

import {
  InputFlood,
  PatternNoticing,
  RoleMappingStep,
  ControlledProduction,
  FreeProduction,
  AIFeedbackStep,
  RevisionStep,
  ReflectionStep,
} from './loop'

import {
  usePracticeLoop,
  STEP_ORDER,
  type LoopStep,
  type AIFeedbackSummary,
} from '@/hooks/usePracticeLoop'
import { type ErrorTypeCode, errorTypes } from '@/data/errorTypes'
import type { ControlledExercise } from './loop/ControlledProduction'
import type { SemanticRole, TokenRole } from './loop/RoleMappingStep'
import type { RevisionScoreDetail } from './loop/ReflectionStep'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PracticeLoopProps {
  construction: {
    id: string
    name: string
    form: string
    meaning: string
    examples: string[]
    verbs?: string[]
  }
  // Pre-configured exercise data
  patternNoticingOptions?: { label: string; isCorrect: boolean; explanation: string }[]
  roleMappingData?: {
    sentence: string
    tokens: TokenRole[]
    availableRoles: SemanticRole[]
  }
  controlledExercises?: ControlledExercise[]
  freeProductionPrompt?: string
  onComplete?: (result: {
    originalSentence: string
    revisedSentence: string
    revisionScore: {
      draft1Total: number
      draft2Total: number
      maxTotal: number
      improvement: number
      details: RevisionScoreDetail[]
    }
    diagnosedErrors: { code: ErrorTypeCode; confidence: 'high' | 'medium' | 'low' }[]
  }) => void
  onNextConstruction?: () => void
}

// ---------------------------------------------------------------------------
// Step Configuration
// ---------------------------------------------------------------------------

interface StepConfig {
  step: LoopStep
  label: string
  labelEn: string
  icon: React.ElementType
  color: string
}

const STEP_CONFIG: StepConfig[] = [
  {
    step: 'input-flood',
    label: '输入淹没',
    labelEn: 'Input Flood',
    icon: BookOpen,
    color: 'bg-indigo-500',
  },
  {
    step: 'pattern-noticing',
    label: '模式发现',
    labelEn: 'Noticing',
    icon: Lightbulb,
    color: 'bg-amber-500',
  },
  {
    step: 'role-mapping',
    label: '角色映射',
    labelEn: 'Role Mapping',
    icon: Users,
    color: 'bg-sky-500',
  },
  {
    step: 'controlled-production',
    label: '控制性产出',
    labelEn: 'Controlled',
    icon: PenTool,
    color: 'bg-teal-500',
  },
  {
    step: 'free-production',
    label: '自由产出',
    labelEn: 'Free Production',
    icon: MessageSquare,
    color: 'bg-violet-500',
  },
  {
    step: 'ai-feedback',
    label: 'AI 反馈',
    labelEn: 'AI Feedback',
    icon: Bot,
    color: 'bg-blue-500',
  },
  {
    step: 'revision',
    label: '修订',
    labelEn: 'Revision',
    icon: Edit3,
    color: 'bg-rose-500',
  },
  {
    step: 'reflection',
    label: '反思',
    labelEn: 'Reflection',
    icon: Award,
    color: 'bg-emerald-500',
  },
]

// ---------------------------------------------------------------------------
// Default / demo data generators
// ---------------------------------------------------------------------------

function getDefaultPatternOptions(meaning: string): {
  label: string
  isCorrect: boolean
  explanation: string
}[] {
  return [
    {
      label: meaning,
      isCorrect: true,
      explanation: '正确！这些例句都表达了相同的语义模式。',
    },
    {
      label: '表达时间的先后顺序',
      isCorrect: false,
      explanation: '不正确。这些例句与时间顺序无关。',
    },
    {
      label: '描述物体的物理属性',
      isCorrect: false,
      explanation: '不正确。这些例句并非描述物理属性。',
    },
    {
      label: '表达因果关系',
      isCorrect: false,
      explanation: '不正确。这些例句的核心语义不是因果关系。',
    },
  ]
}

function getDefaultRoleMapping(): {
  sentence: string
  tokens: TokenRole[]
  availableRoles: SemanticRole[]
} {
  return {
    sentence: 'She gave him a book.',
    tokens: [
      { token: 'She', correctRoleId: 'agent' },
      { token: 'gave', correctRoleId: 'action' },
      { token: 'him', correctRoleId: 'recipient' },
      { token: 'a book', correctRoleId: 'theme' },
    ],
    availableRoles: [
      {
        id: 'agent',
        label: '施事 (Agent)',
        description: '动作的执行者',
        color: '#3b82f6',
      },
      {
        id: 'action',
        label: '动作 (Action)',
        description: '谓语动词',
        color: '#8b5cf6',
      },
      {
        id: 'recipient',
        label: '接受者 (Recipient)',
        description: '接受物品的参与者',
        color: '#10b981',
      },
      {
        id: 'theme',
        label: '受事/客体 (Theme)',
        description: '被转移的物品',
        color: '#f59e0b',
      },
      {
        id: 'location',
        label: '地点 (Location)',
        description: '事件发生的地点',
        color: '#6b7280',
      },
    ],
  }
}

function getDefaultControlledExercises(): ControlledExercise[] {
  return [
    {
      id: 'ctrl-1',
      type: 'fill-blank',
      prompt: '请用正确的动词填空：She ___ him a beautiful gift.',
      hint: '思考表示「给予」含义的动词',
      correctAnswer: 'gave',
      explanation: 'give 是双及物构式的典型动词，表示从转移者到接受者的成功转移。',
    },
    {
      id: 'ctrl-2',
      type: 'multiple-choice',
      prompt: '下面哪个句子正确使用了双及物构式？',
      options: [
        'She gave a book him.',
        'She gave him a book.',
        'She gave to him a book.',
      ],
      correctAnswer: 'She gave him a book.',
      explanation: '双及物构式的语序为：Subj V Obj_recipient Obj_theme',
    },
  ]
}

function getDefaultAIFeedback(_originalSentence: string): AIFeedbackSummary {
  return {
    naturalness: 55,
    grammarScore: 70,
    constructionMatch: 60,
    overallAssessment:
      '你的句子基本语法正确，但自然度还有提升空间。动词与构式的搭配可以更地道。',
    positiveFeedback: [
      '正确使用了目标构式的基本结构',
      '语义角色分配基本合理',
    ],
    improvementSuggestions: [
      '尝试使用更典型的动词搭配',
      '注意接受者的有意愿性要求',
      '可以参考母语者常用的高频表达',
    ],
    diagnosedErrorCodes: [
      { code: 'CONVENTIONALITY_ERROR', confidence: 'medium' },
      { code: 'VERB_CONSTRUCTION_MISMATCH', confidence: 'low' },
    ],
    revisedSentence: '',
  }
}

// ---------------------------------------------------------------------------
// Step Progress Indicator
// ---------------------------------------------------------------------------

function StepProgressIndicator({
  currentStepIndex,
  onStepClick,
}: {
  currentStepIndex: number
  onStepClick?: (index: number) => void
}) {
  return (
    <div className="w-full">
      {/* Desktop: horizontal step bar */}
      <div className="hidden md:flex items-center gap-1 mb-2">
        {STEP_CONFIG.map((config, i) => {
          const isActive = i === currentStepIndex
          const isCompleted = i < currentStepIndex
          const Icon = config.icon

          return (
            <button
              key={config.step}
              onClick={() => onStepClick?.(i)}
              disabled={!onStepClick || i > currentStepIndex + 1}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-all',
                'focus:outline-none focus:ring-2 focus:ring-offset-1',
                isActive && 'bg-accent',
                isCompleted && 'opacity-70 hover:opacity-100',
                i > currentStepIndex + 1 && 'cursor-not-allowed opacity-40'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center transition-colors',
                  isActive
                    ? `${config.color} text-white`
                    : isCompleted
                    ? `${config.color} text-white opacity-60`
                    : 'bg-muted text-muted-foreground'
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={cn(
                  'text-xs font-medium leading-tight text-center',
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {config.label}
              </span>
              <span className="text-[10px] text-muted-foreground hidden lg:block">
                {config.labelEn}
              </span>
            </button>
          )
        })}
      </div>

      {/* Mobile: compact step indicator */}
      <div className="md:hidden flex items-center justify-between mb-2 px-1">
        <span className="text-sm font-medium">
          {currentStepIndex + 1} / {STEP_ORDER.length}
        </span>
        <span className="text-sm text-muted-foreground">
          {STEP_CONFIG[currentStepIndex]?.label}
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative">
        <Progress
          value={((currentStepIndex + 1) / STEP_ORDER.length) * 100}
          className="h-2"
        />
        <div className="flex justify-between mt-1">
          {STEP_CONFIG.map((config, i) => (
            <div
              key={config.step}
              className={cn(
                'w-2 h-2 rounded-full -mt-3.5',
                i <= currentStepIndex ? config.color : 'bg-slate-200 dark:bg-slate-700'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

/**
 * PracticeLoop — 8-Step Construction Grammar Learning Flow
 *
 * A complete learning loop based on Goldberg's Construction Grammar:
 * 1. Input Flood → 2. Pattern Noticing → 3. Role Mapping → 4. Controlled Production
 * 5. Free Production → 6. AI Feedback → 7. Revision → 8. Reflection
 *
 * Features:
 * - Framer Motion animated transitions between steps
 * - Progress indicator with step navigation
 * - Revision Score calculation (Draft 1 vs Draft 2)
 * - Error type diagnosis integration
 * - localStorage persistence via usePracticeLoop hook
 */
export default function PracticeLoop({
  construction,
  patternNoticingOptions,
  roleMappingData,
  controlledExercises,
  freeProductionPrompt,
  onComplete: _onComplete,
  onNextConstruction,
}: PracticeLoopProps) {
  const loop = usePracticeLoop({
    constructionId: construction.id,
  })

  const currentStep = loop.state.currentStep
  const currentStepIndex = loop.state.currentStepIndex

  // Handlers for each step
  const handleInputFloodComplete = () => loop.goNext()

  const handlePatternNoticingComplete = (_selectedIndex: number, _isCorrect: boolean) => {
    loop.goNext()
  }

  const handleRoleMappingComplete = (
    results: { token: string; correctRoleId: string; userRoleId: string; isCorrect: boolean }[]
  ) => {
    loop.setStepResult('role-mapping', results)
    loop.goNext()
  }

  const handleControlledProductionComplete = (
    results: { exerciseId: string; userAnswer: string; isCorrect: boolean }[]
  ) => {
    loop.setStepResult('controlled-production', results)
    loop.goNext()
  }

  const handleFreeProductionComplete = (sentence: string) => {
    loop.setOriginalSentence(sentence)
    loop.setStepResult('free-production', { sentence })
    loop.goNext()
  }

  const handleAIFeedbackComplete = () => {
    loop.goNext()
  }

  const handleRevisionComplete = (revisedSentence: string) => {
    loop.setRevisedSentence(revisedSentence)
    loop.setStepResult('revision', { revisedSentence })
    loop.goNext()

    // After revision, auto-generate mock AI feedback for draft 2
    // In a real app, this would call the AI service again
    const draft2Feedback: AIFeedbackSummary = {
      naturalness: Math.min(55 + 20, 95),
      grammarScore: Math.min(70 + 15, 95),
      constructionMatch: Math.min(60 + 25, 95),
      overallAssessment:
        '修改后的句子在各个方面都有明显提升，构式使用更加地道。',
      positiveFeedback: [
        '构式形式使用正确',
        '动词搭配更加地道',
        '语义角色映射清晰',
      ],
      improvementSuggestions: ['继续保持这种练习方式'],
      diagnosedErrorCodes: [],
      revisedSentence,
    }

    // Calculate revision scores
    loop.setAIFeedback(draft2Feedback)
  }

  const handleReflectionRestart = () => {
    loop.reset()
  }

  const handleReflectionNextConstruction = () => {
    onNextConstruction?.()
  }

  // Demo AI feedback generation
  const handleRequestAIFeedback = () => {
    if (!loop.state.originalSentence) return
    const feedback = getDefaultAIFeedback(loop.state.originalSentence)
    feedback.revisedSentence = loop.state.originalSentence + ' (improved)'
    loop.setAIFeedback(feedback)
  }

  // Get current step configuration
  const currentConfig = STEP_CONFIG[currentStepIndex]

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Header with progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{construction.name}</h1>
            <p className="text-sm text-muted-foreground">{construction.meaning}</p>
          </div>
          <div className="flex items-center gap-2">
            {loop.canGoBack && (
              <Button variant="outline" size="sm" onClick={loop.goBack}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                上一步
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={loop.reset}>
              <RotateCcw className="w-4 h-4 mr-1" />
              重置
            </Button>
          </div>
        </div>

        {/* Step progress indicator */}
        <StepProgressIndicator
          currentStepIndex={currentStepIndex}
          onStepClick={(index) => {
            // Allow jumping to completed steps or current step
            if (index <= currentStepIndex) {
              loop.goToStep(STEP_ORDER[index])
            }
          }}
        />

        {/* Current step info */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          {currentConfig && (
            <>
              <currentConfig.icon className="w-4 h-4" />
              <span>
                Step {currentStepIndex + 1} of {STEP_ORDER.length}: {currentConfig.label} (
                {currentConfig.labelEn})
              </span>
            </>
          )}
        </motion.div>
      </div>

      {/* Step content */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          {currentStep === 'input-flood' && (
            <motion.div
              key="input-flood"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <InputFlood
                constructionName={construction.name}
                form={construction.form}
                meaning={construction.meaning}
                examples={construction.examples}
                onComplete={handleInputFloodComplete}
              />
            </motion.div>
          )}

          {currentStep === 'pattern-noticing' && (
            <motion.div
              key="pattern-noticing"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <PatternNoticing
                constructionName={construction.name}
                form={construction.form}
                meaning={construction.meaning}
                options={
                  patternNoticingOptions ||
                  getDefaultPatternOptions(construction.meaning)
                }
                onComplete={handlePatternNoticingComplete}
              />
            </motion.div>
          )}

          {currentStep === 'role-mapping' && (
            <motion.div
              key="role-mapping"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <RoleMappingStep
                {...(roleMappingData || getDefaultRoleMapping())}
                onComplete={handleRoleMappingComplete}
              />
            </motion.div>
          )}

          {currentStep === 'controlled-production' && (
            <motion.div
              key="controlled-production"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ControlledProduction
                exercises={controlledExercises || getDefaultControlledExercises()}
                onComplete={handleControlledProductionComplete}
              />
            </motion.div>
          )}

          {currentStep === 'free-production' && (
            <motion.div
              key="free-production"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <FreeProduction
                constructionName={construction.name}
                form={construction.form}
                prompt={
                  freeProductionPrompt ||
                  `请使用「${construction.name}」造一个句子，表达一个${construction.meaning}的场景。`
                }
                suggestedVerbs={construction.verbs}
                onComplete={handleFreeProductionComplete}
              />
            </motion.div>
          )}

          {currentStep === 'ai-feedback' && (
            <motion.div
              key="ai-feedback"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AIFeedbackStep
                feedback={{
                  originalSentence: loop.state.originalSentence,
                  naturalness: loop.state.aiFeedbackData?.naturalness || 55,
                  grammarScore: loop.state.aiFeedbackData?.grammarScore || 70,
                  constructionMatch: loop.state.aiFeedbackData?.constructionMatch || 60,
                  overallAssessment:
                    loop.state.aiFeedbackData?.overallAssessment ||
                    'AI 正在分析你的句子...',
                  positiveFeedback: loop.state.aiFeedbackData?.positiveFeedback || [
                    '句子结构清晰',
                  ],
                  improvementSuggestions:
                    loop.state.aiFeedbackData?.improvementSuggestions || [
                      '尝试使用更典型的动词',
                    ],
                  diagnosedErrors:
                    loop.state.aiFeedbackData?.diagnosedErrorCodes?.map((e) => ({
                      errorType: errorTypes.find((et) => et.code === e.code)!,
                      confidence: e.confidence,
                      matchedKeywords: [],
                      suggestion: '',
                    })) || [],
                  revisedSentence: loop.state.aiFeedbackData?.revisedSentence,
                }}
                onComplete={handleAIFeedbackComplete}
                onRequestRevision={() => loop.goNext()}
              />
            </motion.div>
          )}

          {currentStep === 'revision' && (
            <motion.div
              key="revision"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <RevisionStep
                originalSentence={loop.state.originalSentence}
                aiRevisedSentence={loop.state.aiFeedbackData?.revisedSentence}
                suggestions={
                  loop.state.aiFeedbackData?.improvementSuggestions || [
                    '尝试使用更典型的动词搭配',
                    '检查语义角色是否正确映射',
                    '确保接受者具有有意愿性',
                  ]
                }
                onComplete={handleRevisionComplete}
                onRequestAIFeedback={handleRequestAIFeedback}
              />
            </motion.div>
          )}

          {currentStep === 'reflection' && (
            <motion.div
              key="reflection"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ReflectionStep
                constructionName={construction.name}
                originalSentence={loop.state.originalSentence}
                revisedSentence={loop.state.revisedSentence}
                revisionScoreDetails={loop.state.revisionScoreDetails}
                totalDraft1Score={loop.state.totalDraft1Score}
                totalDraft2Score={loop.state.totalDraft2Score}
                maxTotalScore={loop.state.maxTotalScore}
                diagnosedErrors={loop.state.diagnosedErrors}
                learningNotes={[
                  `通过输入淹没，你接触了 ${construction.examples.length} 个包含「${construction.name}」的例句。`,
                  '角色映射练习帮助你理解了 Goldberg 的对应原则。',
                  '控制性产出和自由产出分别锻炼了你的识别能力和创造能力。',
                  `AI 反馈显示你的句子自然度从初稿到修改稿有 ${
                    loop.state.totalDraft2Score - loop.state.totalDraft1Score
                  } 分的提升。`,
                  '建议回顾 AI 指出的错误类型，在后续练习中有针对性地改进。',
                ]}
                onRestart={handleReflectionRestart}
                onNextConstruction={handleReflectionNextConstruction}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom progress summary */}
      {currentStep !== 'reflection' && (
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <BarChart3 className="w-4 h-4" />
            <span>
              进度: {currentStepIndex + 1} / {STEP_ORDER.length} 步骤
            </span>
          </div>
          <div className="flex items-center gap-1">
            {loop.canGoBack && (
              <Button variant="ghost" size="sm" onClick={loop.goBack}>
                <ChevronLeft className="w-3 h-3 mr-1" />
                上一步
              </Button>
            )}
            {loop.canGoNext && (
              <Button
                variant="outline"
                size="sm"
                onClick={loop.goNext}
              >
                跳过
                <ChevronRight className="w-3 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
