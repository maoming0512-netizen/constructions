import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Award,
  TrendingUp,
  BookOpen,
  Target,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowUpRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { type ErrorTypeCode, getErrorTypeByCode } from '@/data/errorTypes'

export interface RevisionScoreDetail {
  dimension: string
  draft1Score: number
  draft2Score: number
  maxScore: number
  improvement: number
  description: string
}

export interface ReflectionStepProps {
  constructionName: string
  originalSentence: string
  revisedSentence: string
  revisionScoreDetails: RevisionScoreDetail[]
  totalDraft1Score: number
  totalDraft2Score: number
  maxTotalScore: number
  diagnosedErrors: { code: ErrorTypeCode; confidence: 'high' | 'medium' | 'low' }[]
  learningNotes: string[]
  onRestart: () => void
  onNextConstruction?: () => void
}

/**
 * Step 8: Reflection — Revision Score 对比表格 + 学习总结
 *
 * 通过对比初稿（Draft 1）和修改稿（Draft 2）的多维度评分，
 * 让学习者直观看到自己的进步，并生成个性化的学习总结。
 */
export default function ReflectionStep({
  constructionName,
  originalSentence,
  revisedSentence,
  revisionScoreDetails,
  totalDraft1Score,
  totalDraft2Score,
  maxTotalScore,
  diagnosedErrors,
  learningNotes,
  onRestart,
  onNextConstruction,
}: ReflectionStepProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('revision-score')

  const totalImprovement = totalDraft2Score - totalDraft1Score
  const improvementPercent =
    maxTotalScore > 0
      ? Math.round(((totalDraft2Score - totalDraft1Score) / maxTotalScore) * 100)
      : 0

  const scoreLevel = (score: number, max: number) => {
    const pct = (score / max) * 100
    if (pct >= 80) return { label: '优秀', color: 'text-green-600', bg: 'bg-green-500' }
    if (pct >= 60) return { label: '良好', color: 'text-amber-600', bg: 'bg-amber-500' }
    return { label: '需改进', color: 'text-red-600', bg: 'bg-red-500' }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 p-6 border border-emerald-100 dark:border-emerald-900"
      >
        <div className="flex items-center gap-2 mb-3">
          <Award className="w-5 h-5 text-emerald-600" />
          <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
            Step 8 / 8 · 反思总结 Reflection
          </span>
        </div>
        <h2 className="text-xl font-bold mb-2">练习完成！</h2>
        <p className="text-sm text-muted-foreground">
          通过对比初稿和修改稿，回顾你的学习收获。
        </p>
      </motion.div>

      {/* Overall Revision Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 rounded-xl border bg-card text-center space-y-3"
        >
          <p className="text-sm text-muted-foreground">初稿总分</p>
          <p className="text-4xl font-bold">
            {totalDraft1Score}
            <span className="text-lg text-muted-foreground font-normal">/{maxTotalScore}</span>
          </p>
          <div className={cn('text-sm font-medium', scoreLevel(totalDraft1Score, maxTotalScore).color)}>
            {scoreLevel(totalDraft1Score, maxTotalScore).label}
          </div>
          <Progress
            value={(totalDraft1Score / maxTotalScore) * 100}
            className="h-2"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-5 rounded-xl border bg-card text-center space-y-3"
        >
          <p className="text-sm text-muted-foreground">修改稿总分</p>
          <p className="text-4xl font-bold text-emerald-600">
            {totalDraft2Score}
            <span className="text-lg text-muted-foreground font-normal">/{maxTotalScore}</span>
          </p>
          <div className={cn('text-sm font-medium', scoreLevel(totalDraft2Score, maxTotalScore).color)}>
            {scoreLevel(totalDraft2Score, maxTotalScore).label}
          </div>
          <Progress
            value={(totalDraft2Score / maxTotalScore) * 100}
            className="h-2 bg-emerald-100"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={cn(
            'p-5 rounded-xl border text-center space-y-3',
            totalImprovement > 0
              ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
              : 'bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-700'
          )}
        >
          <p className="text-sm text-muted-foreground">进步幅度</p>
          <div className="flex items-center justify-center gap-1">
            <ArrowUpRight className={cn('w-8 h-8', totalImprovement >= 0 ? 'text-green-600' : 'text-red-600')} />
            <p className={cn('text-4xl font-bold', totalImprovement >= 0 ? 'text-green-600' : 'text-red-600')}>
              {totalImprovement > 0 ? '+' : ''}{improvementPercent}%
            </p>
          </div>
          <div className="text-sm font-medium text-green-700 dark:text-green-400">
            {totalImprovement > 0
              ? `提升了 ${totalImprovement} 分`
              : totalImprovement === 0
              ? '保持水平'
              : `下降了 ${Math.abs(totalImprovement)} 分`}
          </div>
        </motion.div>
      </div>

      {/* Sentence comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-2 py-0.5 rounded bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 font-medium">
              Draft 1 · 初稿
            </span>
          </div>
          <p className="text-base line-through decoration-red-400 decoration-2 opacity-70">
            {originalSentence}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-green-50/50 dark:bg-green-950/10 border border-green-100 dark:border-green-900">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-2 py-0.5 rounded bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 font-medium">
              Draft 2 · 修改稿
            </span>
          </div>
          <p className="text-base font-medium text-green-800 dark:text-green-300">
            {revisedSentence}
          </p>
        </div>
      </div>

      {/* Revision Score Detail Table */}
      <div className="rounded-xl border overflow-hidden">
        <button
          onClick={() => setExpandedSection(expandedSection === 'revision-score' ? null : 'revision-score')}
          className="w-full flex items-center justify-between p-4 bg-muted/50 hover:bg-muted transition-colors"
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">Revision Score 详细对比</span>
          </div>
          <ChevronRight
            className={cn('w-4 h-4 transition-transform', expandedSection === 'revision-score' && 'rotate-90')}
          />
        </button>

        {expandedSection === 'revision-score' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="overflow-x-auto"
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 border-b">
                  <th className="text-left p-3 font-medium">维度</th>
                  <th className="text-center p-3 font-medium">初稿</th>
                  <th className="text-center p-3 font-medium">修改稿</th>
                  <th className="text-center p-3 font-medium">进步</th>
                  <th className="text-left p-3 font-medium">说明</th>
                </tr>
              </thead>
              <tbody>
                {revisionScoreDetails.map((detail, i) => {
                  const improved = detail.improvement > 0
                  const declined = detail.improvement < 0

                  return (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b last:border-0 hover:bg-muted/20"
                    >
                      <td className="p-3 font-medium">{detail.dimension}</td>
                      <td className="p-3 text-center">
                        <span className={cn('font-bold', scoreLevel(detail.draft1Score, detail.maxScore).color)}>
                          {detail.draft1Score}
                        </span>
                        <span className="text-muted-foreground">/{detail.maxScore}</span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={cn('font-bold', scoreLevel(detail.draft2Score, detail.maxScore).color)}>
                          {detail.draft2Score}
                        </span>
                        <span className="text-muted-foreground">/{detail.maxScore}</span>
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={cn(
                            'text-sm font-bold',
                            improved && 'text-green-600',
                            declined && 'text-red-600',
                            !improved && !declined && 'text-muted-foreground'
                          )}
                        >
                          {improved && '+'}
                          {detail.improvement > 0 ? `${detail.improvement}` : detail.improvement === 0 ? '=' : detail.improvement}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground text-xs max-w-[200px]">
                        {detail.description}
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </motion.div>
        )}
      </div>

      {/* Error diagnosis summary */}
      {diagnosedErrors.length > 0 && (
        <div className="rounded-xl border overflow-hidden">
          <button
            onClick={() => setExpandedSection(expandedSection === 'errors' ? null : 'errors')}
            className="w-full flex items-center justify-between p-4 bg-red-50/50 dark:bg-red-950/10 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="font-semibold">本次练习诊断到的错误类型</span>
              <span className="text-xs px-2 py-0.5 rounded bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200">
                {diagnosedErrors.length}
              </span>
            </div>
            <ChevronRight
              className={cn('w-4 h-4 transition-transform', expandedSection === 'errors' && 'rotate-90')}
            />
          </button>

          {expandedSection === 'errors' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="p-4 space-y-3"
            >
              {diagnosedErrors.map((err, i) => {
                const errorType = getErrorTypeByCode(err.code)
                if (!errorType) return null
                const ErrorIcon = errorType.icon

                return (
                  <div
                    key={i}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg border',
                      err.confidence === 'high'
                        ? 'bg-red-50/50 dark:bg-red-950/10 border-red-100 dark:border-red-900'
                        : 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900'
                    )}
                  >
                    <ErrorIcon className="w-5 h-5 shrink-0 mt-0.5" style={{ color: err.confidence === 'high' ? '#dc2626' : '#d97706' }} />
                    <div>
                      <p className="font-medium">{errorType.name}</p>
                      <p className="text-sm text-muted-foreground">{errorType.relatedGoldbergConcept}</p>
                      <p className="text-xs text-muted-foreground mt-1">{errorType.learningRecommendation}</p>
                    </div>
                    <span
                      className={cn(
                        'text-xs px-2 py-0.5 rounded-full shrink-0',
                        err.confidence === 'high'
                          ? 'bg-red-200 text-red-800'
                          : 'bg-amber-200 text-amber-800'
                      )}
                    >
                      {err.confidence === 'high' ? '高置信度' : '中置信度'}
                    </span>
                  </div>
                )
              })}
            </motion.div>
          )}
        </div>
      )}

      {/* Learning summary */}
      <div className="rounded-xl border overflow-hidden">
        <button
          onClick={() => setExpandedSection(expandedSection === 'summary' ? null : 'summary')}
          className="w-full flex items-center justify-between p-4 bg-emerald-50/50 dark:bg-emerald-950/10 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">学习总结</span>
          </div>
          <ChevronRight
            className={cn('w-4 h-4 transition-transform', expandedSection === 'summary' && 'rotate-90')}
          />
        </button>

        {expandedSection === 'summary' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="p-4 space-y-4"
          >
            <div className="space-y-3">
              {learningNotes.map((note, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-sm">{note}</p>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-lg bg-muted border">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-emerald-600" />
                <span className="font-medium text-sm">关于「{constructionName}」</span>
              </div>
              <p className="text-sm text-muted-foreground">
                通过本次 8 步练习闭环，你从输入淹没到自由产出，经历了模式发现、角色映射、
                控制性练习、AI 反馈和修订的完整流程。这种基于 Goldberg 构式语法理论的
                练习设计，帮助你建立了形式-意义的深层联结。
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" onClick={onRestart}>
          <RotateCcw className="w-4 h-4 mr-2" />
          再练一次
        </Button>
        {onNextConstruction && (
          <Button onClick={onNextConstruction}>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            下一个构式
          </Button>
        )}
      </div>
    </motion.div>
  )
}
