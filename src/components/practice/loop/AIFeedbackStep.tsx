import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  BookOpen,
  Shield,
  BarChart3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { type DiagnosisResult } from '@/data/errorTypes'

export interface AIFeedbackData {
  originalSentence: string
  naturalness: number
  grammarScore: number
  constructionMatch: number
  overallAssessment: string
  positiveFeedback: string[]
  improvementSuggestions: string[]
  diagnosedErrors: DiagnosisResult[]
  revisedSentence?: string
  verbSuggestion?: string
}

export interface AIFeedbackStepProps {
  feedback: AIFeedbackData
  onComplete: () => void
  onRequestRevision?: () => void
}

/**
 * Step 6: AI Feedback — AI分析结果展示
 *
 * 展示 AI 对学习者产出句子的多维度分析，包括自然度评分、
 * 语法正确性、构式匹配度以及错误诊断。
 */
export default function AIFeedbackStep({
  feedback,
  onComplete,
  onRequestRevision,
}: AIFeedbackStepProps) {
  const [expandedError, setExpandedError] = useState<number | null>(null)
  const [showAllSuggestions, setShowAllSuggestions] = useState(false)

  const scoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-amber-600'
    return 'text-red-600'
  }

  const hasRevisedSentence = !!feedback.revisedSentence && feedback.revisedSentence !== feedback.originalSentence

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-6 border border-blue-100 dark:border-blue-900">
        <div className="flex items-center gap-2 mb-3">
          <Bot className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-700 dark:text-blue-400 uppercase tracking-wide">
            Step 6 / 8 · AI 反馈 AI Feedback
          </span>
        </div>
        <h2 className="text-xl font-bold">AI 分析结果</h2>
        <p className="text-sm text-muted-foreground mt-1">
          基于 Goldberg 构式语法理论的多维度分析
        </p>
      </div>

      {/* Original sentence */}
      <div className="p-4 rounded-lg bg-muted/50 border">
        <p className="text-sm text-muted-foreground mb-1">你的句子：</p>
        <p className="text-lg font-medium">{feedback.originalSentence}</p>
      </div>

      {/* Score cards */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-xl border bg-card text-center space-y-2"
        >
          <TrendingUp className="w-5 h-5 mx-auto text-violet-500" />
          <p className="text-sm text-muted-foreground">自然度</p>
          <p className={cn('text-3xl font-bold', scoreColor(feedback.naturalness))}>
            {feedback.naturalness}
          </p>
          <Progress value={feedback.naturalness} className="h-2" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-xl border bg-card text-center space-y-2"
        >
          <CheckCircle2 className="w-5 h-5 mx-auto text-green-500" />
          <p className="text-sm text-muted-foreground">语法正确性</p>
          <p className={cn('text-3xl font-bold', scoreColor(feedback.grammarScore))}>
            {feedback.grammarScore}
          </p>
          <Progress value={feedback.grammarScore} className="h-2" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-xl border bg-card text-center space-y-2"
        >
          <BarChart3 className="w-5 h-5 mx-auto text-blue-500" />
          <p className="text-sm text-muted-foreground">构式匹配度</p>
          <p className={cn('text-3xl font-bold', scoreColor(feedback.constructionMatch))}>
            {feedback.constructionMatch}
          </p>
          <Progress value={feedback.constructionMatch} className="h-2" />
        </motion.div>
      </div>

      {/* Overall assessment */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={cn(
          'p-5 rounded-xl border',
          feedback.naturalness >= 70
            ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
            : feedback.naturalness >= 40
            ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
            : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
        )}
      >
        <div className="flex items-start gap-3">
          {feedback.naturalness >= 70 ? (
            <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-semibold mb-1">总体评价</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {feedback.overallAssessment}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Positive feedback */}
      {feedback.positiveFeedback.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          <h3 className="font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            做得好的地方
          </h3>
          {feedback.positiveFeedback.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-lg bg-green-50/50 dark:bg-green-950/10 border border-green-100 dark:border-green-900"
            >
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <p className="text-sm">{item}</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Improvement suggestions */}
      {feedback.improvementSuggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          <h3 className="font-semibold flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-500" />
            改进建议
          </h3>
          {(showAllSuggestions
            ? feedback.improvementSuggestions
            : feedback.improvementSuggestions.slice(0, 3)
          ).map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900"
            >
              <AlertTriangle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-sm">{item}</p>
            </motion.div>
          ))}
          {feedback.improvementSuggestions.length > 3 && (
            <button
              onClick={() => setShowAllSuggestions(!showAllSuggestions)}
              className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              {showAllSuggestions ? '收起' : `查看全部 ${feedback.improvementSuggestions.length} 条建议`}
            </button>
          )}
        </motion.div>
      )}

      {/* Error diagnosis */}
      {feedback.diagnosedErrors.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="space-y-3"
        >
          <h3 className="font-semibold flex items-center gap-2">
            <Shield className="w-4 h-4 text-red-500" />
            错误诊断
          </h3>
          {feedback.diagnosedErrors.map((diag, i) => {
            const isExpanded = expandedError === i
            const ErrorIcon = diag.errorType.icon

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className={cn(
                  'rounded-lg border overflow-hidden',
                  diag.confidence === 'high'
                    ? 'bg-red-50/50 dark:bg-red-950/10 border-red-200 dark:border-red-900'
                    : diag.confidence === 'medium'
                    ? 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900'
                    : 'bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-700'
                )}
              >
                <button
                  onClick={() => setExpandedError(isExpanded ? null : i)}
                  className="w-full flex items-center gap-3 p-4 text-left"
                >
                  <ErrorIcon className="w-5 h-5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{diag.errorType.name}</span>
                      <span
                        className={cn(
                          'text-xs px-2 py-0.5 rounded-full',
                          diag.confidence === 'high'
                            ? 'bg-red-200 text-red-800'
                            : diag.confidence === 'medium'
                            ? 'bg-amber-200 text-amber-800'
                            : 'bg-slate-200 text-slate-800'
                        )}
                      >
                        {diag.confidence === 'high' ? '高置信度' : diag.confidence === 'medium' ? '中置信度' : '低置信度'}
                      </span>
                    </div>
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-4 space-y-2"
                    >
                      <p className="text-sm text-muted-foreground">
                        {diag.errorType.description}
                      </p>
                      <div className="p-3 rounded bg-white dark:bg-slate-900 border text-sm">
                        <span className="font-medium">Goldberg 概念：</span>
                        {diag.errorType.relatedGoldbergConcept}
                      </div>
                      <div className="p-3 rounded bg-white dark:bg-slate-900 border text-sm">
                        <span className="font-medium">学习建议：</span>
                        {diag.errorType.learningRecommendation}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* Revised sentence preview */}
      {hasRevisedSentence && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="p-5 rounded-xl border bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800"
        >
          <p className="text-sm text-muted-foreground mb-2">AI 建议的修改版本：</p>
          <p className="text-lg font-medium text-green-800 dark:text-green-300">
            {feedback.revisedSentence}
          </p>
          {feedback.verbSuggestion && (
            <p className="text-sm text-muted-foreground mt-2">
              建议动词：{feedback.verbSuggestion}
            </p>
          )}
        </motion.div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between pt-2">
        {onRequestRevision && feedback.naturalness < 80 && (
          <Button variant="outline" onClick={onRequestRevision}>
            <Bot className="w-4 h-4 mr-2" />
            进入修改步骤
          </Button>
        )}
        <div className="ml-auto">
          <Button onClick={onComplete}>
            {feedback.naturalness < 60 ? '尝试修改' : '继续下一步'}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
