import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  XCircle,
  BookOpen,
  Users,
  Sparkles,
  GitCompare,
  AlertTriangle,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Target,
  HelpCircle,
  ArrowRight,
  GraduationCap,
  BrainCircuit,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ErrorTypeCode } from '@/data/errorTypes'
import { errorTypes } from '@/data/errorTypes'

export interface ExerciseFeedbackProps {
  isCorrect: boolean
  correctAnswer: string
  userAnswer?: string
  explanationZh: string
  explanationEn?: string
  conventionalityNote?: string
  semanticRoleExplanation?: string
  contrastExample?: string
  diagnosedErrors?: { code: ErrorTypeCode; confidence: 'high' | 'medium' | 'low' }[]
  onNext?: () => void
  onRetry?: () => void

  /* ---- v3 增强字段 ---- */
  /** 三层反馈：简短 / 详细 / 深层 */
  feedbackLevels?: {
    short: string
    detailed: string
    deep: string
  }
  /** 学习目标 */
  learningObjective?: string
  /** 建议思考步骤 */
  thinkingSteps?: string[]
  /** 掌握度自检问题 */
  masteryChecks?: string[]
  /** 接下来推荐的练习 */
  nextRecommended?: { id: string; title: string; reason: string }[]
  /** 点击推荐项时的回调 */
  onNextRecommended?: (id: string) => void
}

/* ------------------------------------------------------------------ */
//  CollapsibleSection 小折叠面板
/* ------------------------------------------------------------------ */
function CollapsibleSection({
  icon,
  title,
  children,
  defaultOpen = false,
  colorClass = 'text-blue-700 dark:text-blue-400',
  borderClass = 'border-blue-100 dark:border-blue-900',
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  colorClass?: string
  borderClass?: string
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={cn('rounded-xl border bg-card overflow-hidden', borderClass)}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <h3 className={cn('text-sm font-semibold', colorClass)}>{title}</h3>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ------------------------------------------------------------------ */
//  MasteryCheckPanel 掌握度自检
/* ------------------------------------------------------------------ */
function MasteryCheckPanel({ questions }: { questions: string[] }) {
  const [selected, setSelected] = useState<Record<number, 'yes' | 'no' | null>>({})

  const allAnswered = questions.every((_, i) => selected[i] != null)
  const yesCount = Object.values(selected).filter((v) => v === 'yes').length
  const total = questions.length
  const progress = Math.round((Object.values(selected).filter(Boolean).length / total) * 100)

  return (
    <div className="space-y-4">
      {/* 进度条 */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <div
            className="h-full rounded-full bg-violet-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground">{progress}%</span>
      </div>

      {questions.map((q, i) => (
        <div key={i} className="space-y-2">
          <p className="text-sm font-medium flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
            {q}
          </p>
          <div className="flex gap-2 pl-6">
            <button
              onClick={() => setSelected((s) => ({ ...s, [i]: 'yes' }))}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                selected[i] === 'yes'
                  ? 'bg-green-100 border-green-300 text-green-700 dark:bg-green-900 dark:border-green-700 dark:text-green-300'
                  : 'bg-card hover:bg-accent text-muted-foreground'
              )}
            >
              ✅ 已掌握
            </button>
            <button
              onClick={() => setSelected((s) => ({ ...s, [i]: 'no' }))}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                selected[i] === 'no'
                  ? 'bg-amber-100 border-amber-300 text-amber-700 dark:bg-amber-900 dark:border-amber-700 dark:text-amber-300'
                  : 'bg-card hover:bg-accent text-muted-foreground'
              )}
            >
              ❓ 还需复习
            </button>
          </div>
        </div>
      ))}

      {allAnswered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'p-3 rounded-lg text-sm font-medium',
            yesCount === total
              ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 border border-green-200 dark:border-green-900'
              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-900'
          )}
        >
          {yesCount === total
            ? '太棒了！你已完全掌握本题知识点，可以继续挑战更高难度的练习。'
            : `你已标记 ${total - yesCount} 个需要复习的点，建议回顾解析后再做一次本题。`}
        </motion.div>
      )}
    </div>
  )
}

/**
 * ExerciseFeedback — 练习反馈组件（v3 增强版）
 *
 * 新增功能：
 * - 顶部正确/错误状态横幅
 * - 三层反馈折叠面板（简短 / 详细 / 深层）
 * - 语义角色、地道性说明、对比例句
 * - 做错时的学习建议
 * - 掌握度自检
 * - 接下来推荐练习
 */
export default function ExerciseFeedback({
  isCorrect,
  correctAnswer,
  userAnswer,
  explanationZh,
  explanationEn,
  conventionalityNote,
  semanticRoleExplanation,
  contrastExample,
  diagnosedErrors,
  onNext,
  onRetry,
  feedbackLevels,
  learningObjective,
  thinkingSteps,
  masteryChecks,
  nextRecommended,
  onNextRecommended,
}: ExerciseFeedbackProps) {
  const errorDetails = diagnosedErrors
    ?.map((e) => errorTypes.find((et) => et.code === e.code))
    .filter(Boolean)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-5"
    >
      {/* ═══════════════════════════════════════
          1. 顶部状态横幅
         ═══════════════════════════════════════ */}
      <div
        className={cn(
          'flex items-center gap-3 p-4 rounded-xl border',
          isCorrect
            ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900'
            : 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900'
        )}
      >
        {isCorrect ? (
          <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
        ) : (
          <XCircle className="w-6 h-6 text-red-600 shrink-0" />
        )}
        <div>
          <p
            className={cn(
              'text-base font-bold',
              isCorrect
                ? 'text-green-700 dark:text-green-400'
                : 'text-red-700 dark:text-red-400'
            )}
          >
            {isCorrect ? '回答正确！' : '回答错误'}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isCorrect
              ? '你已正确理解本题的核心知识点。'
              : '没关系，查看下方的解析和建议，理解后可以继续前进。'}
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          2. 答案对比
         ═══════════════════════════════════════ */}
      <div className="rounded-xl border bg-card p-5 space-y-4">
        {/* 正确答案 */}
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-700 dark:text-green-400">正确答案</p>
            <p className="text-base font-semibold mt-1">{correctAnswer}</p>
          </div>
        </div>

        {/* 你的答案（做错时显示） */}
        {!isCorrect && userAnswer && (
          <div className="flex items-start gap-3 pt-3 border-t border-dashed">
            <XCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-400">你的答案</p>
              <p className="text-base font-semibold mt-1 text-red-600 dark:text-red-400">{userAnswer}</p>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════
          3. 学习目标（如提供）
         ═══════════════════════════════════════ */}
      {learningObjective && (
        <div className="rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-950/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-semibold text-indigo-700 dark:text-indigo-400">本题学习目标</h3>
          </div>
          <p className="text-sm text-indigo-800 dark:text-indigo-300 leading-relaxed">{learningObjective}</p>
        </div>
      )}

      {/* ═══════════════════════════════════════
          4. 建议思考步骤（如提供）
         ═══════════════════════════════════════ */}
      {thinkingSteps && thinkingSteps.length > 0 && (
        <CollapsibleSection
          icon={<BrainCircuit className="w-4 h-4 text-teal-500" />}
          title="建议思考步骤"
          colorClass="text-teal-700 dark:text-teal-400"
          borderClass="border-teal-100 dark:border-teal-900"
        >
          <ol className="space-y-2">
            {thinkingSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 text-xs font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </CollapsibleSection>
      )}

      {/* ═══════════════════════════════════════
          5. 三层反馈面板
         ═══════════════════════════════════════ */}
      {/* 简短反馈 */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-blue-500" />
          <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-400">简要反馈</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {feedbackLevels?.short ?? explanationZh}
        </p>
        {explanationEn && (
          <p className="text-sm text-muted-foreground leading-relaxed mt-3 italic border-l-2 border-blue-200 pl-3">
            {explanationEn}
          </p>
        )}
      </div>

      {/* 详细解析 */}
      <CollapsibleSection
        icon={<BookOpen className="w-4 h-4 text-emerald-500" />}
        title="详细解析（点击展开）"
        colorClass="text-emerald-700 dark:text-emerald-400"
        borderClass="border-emerald-100 dark:border-emerald-900"
      >
        <p className="text-sm text-muted-foreground leading-relaxed">
          {feedbackLevels?.detailed ?? explanationZh}
        </p>
      </CollapsibleSection>

      {/* 深层分析 */}
      <CollapsibleSection
        icon={<GraduationCap className="w-4 h-4 text-violet-500" />}
        title="深层分析（点击展开）"
        colorClass="text-violet-700 dark:text-violet-400"
        borderClass="border-violet-100 dark:border-violet-900"
      >
        <p className="text-sm text-muted-foreground leading-relaxed">
          {feedbackLevels?.deep ??
            '从构式语法理论来看，本题涉及构式与动词之间的互动关系。构式本身携带独立于动词的语义，而动词通过与构式融合（fusion）贡献其特定语义成分。理解这一点有助于解释为什么某些动词可以出现在看似不符合其常规语义框架的构式中。'}
        </p>
      </CollapsibleSection>

      {/* ═══════════════════════════════════════
          6. 语义角色 / 地道性 / 对比
         ═══════════════════════════════════════ */}
      {semanticRoleExplanation && (
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-violet-500" />
            <h3 className="text-sm font-semibold text-violet-700 dark:text-violet-400">语义角色</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{semanticRoleExplanation}</p>
        </div>
      )}

      {conventionalityNote && (
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-400">地道性说明</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{conventionalityNote}</p>
        </div>
      )}

      {contrastExample && (
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <GitCompare className="w-4 h-4 text-teal-500" />
            <h3 className="text-sm font-semibold text-teal-700 dark:text-teal-400">对比例句</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{contrastExample}</p>
        </div>
      )}

      {/* ═══════════════════════════════════════
          7. 错误诊断与学习建议（做错时）
         ═══════════════════════════════════════ */}
      {!isCorrect && errorDetails && errorDetails.length > 0 && (
        <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <h3 className="text-sm font-semibold text-red-700 dark:text-red-400">错误诊断与学习建议</h3>
          </div>

          {errorDetails.map((error, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 font-medium">
                  {error?.name}
                </span>
                {diagnosedErrors?.[i].confidence === 'high' && (
                  <span className="text-xs text-red-500 font-medium">（高置信度）</span>
                )}
                {diagnosedErrors?.[i].confidence === 'medium' && (
                  <span className="text-xs text-amber-500 font-medium">（中置信度）</span>
                )}
                {diagnosedErrors?.[i].confidence === 'low' && (
                  <span className="text-xs text-muted-foreground">（低置信度）</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{error?.description}</p>
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-sm text-amber-800 dark:text-amber-300">{error?.learningRecommendation}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══════════════════════════════════════
          8. 学习建议（通用）
         ═══════════════════════════════════════ */}
      {!isCorrect && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-400">学习建议</h3>
          </div>
          <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
            建议重新阅读本题解析，特别关注构式的核心语义与动词之间的互动关系。尝试用自己的话复述为什么正确答案是合理的，并与对比例句进行对比，加深理解。
          </p>
        </div>
      )}

      {/* ═══════════════════════════════════════
          9. 掌握度自检
         ═══════════════════════════════════════ */}
      {masteryChecks && masteryChecks.length > 0 && (
        <div className="rounded-xl border border-violet-200 dark:border-violet-900 bg-violet-50 dark:bg-violet-950/20 p-5">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="w-4 h-4 text-violet-500" />
            <h3 className="text-sm font-semibold text-violet-700 dark:text-violet-400">掌握度自检</h3>
          </div>
          <MasteryCheckPanel questions={masteryChecks} />
        </div>
      )}

      {/* ═══════════════════════════════════════
          10. 接下来推荐
         ═══════════════════════════════════════ */}
      {nextRecommended && nextRecommended.length > 0 && (
        <div className="rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/20 p-5">
          <div className="flex items-center gap-2 mb-4">
            <ArrowRight className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-400">接下来推荐练习</h3>
          </div>
          <div className="space-y-3">
            {nextRecommended.map((rec) => (
              <button
                key={rec.id}
                onClick={() => onNextRecommended?.(rec.id)}
                className="w-full text-left p-4 rounded-lg border bg-card hover:bg-accent transition-colors flex items-start gap-3"
              >
                <ArrowRight className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{rec.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{rec.reason}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          11. 操作按钮
         ═══════════════════════════════════════ */}
      <div className="flex justify-end gap-3 pt-2">
        {!isCorrect && onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-accent transition-colors"
          >
            重新尝试
          </button>
        )}
        {onNext && (
          <button
            onClick={onNext}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
              isCorrect
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-blue-600 hover:bg-blue-700'
            )}
          >
            {isCorrect ? '下一题' : '查看答案后继续'}
          </button>
        )}
      </div>
    </motion.div>
  )
}
