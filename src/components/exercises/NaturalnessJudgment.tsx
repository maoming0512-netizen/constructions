import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Scale, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import ExerciseFeedback from './ExerciseFeedback'

export interface NaturalnessJudgmentProps {
  prompt: string
  context?: string
  sentence: string
  correctRating: number
  explanationZh: string
  explanationEn?: string
  conventionalityNote?: string
  semanticRoleExplanation?: string
  contrastExample?: string
  learningObjective?: string
  thinkingSteps?: string[]
  masteryChecks?: string[]
  nextRecommended?: { id: string; title: string; reason: string }[]
  feedbackLevels?: { short: string; detailed: string; deep: string }
  onNextRecommended?: (id: string) => void
  onComplete: (isCorrect: boolean, userRating: number) => void
}

const RATING_LABELS = [
  { value: 1, label: '非常自然', color: 'bg-green-500', textColor: 'text-green-700 dark:text-green-400' },
  { value: 2, label: '自然', color: 'bg-emerald-400', textColor: 'text-emerald-700 dark:text-emerald-400' },
  { value: 3, label: '略有别扭', color: 'bg-amber-400', textColor: 'text-amber-700 dark:text-amber-400' },
  { value: 4, label: '不自然', color: 'bg-red-400', textColor: 'text-red-700 dark:text-red-400' },
]

/**
 * NaturalnessJudgment — 自然度判断
 *
 * 评级改为"非常自然""自然""略有别扭""不自然"
 */
export default function NaturalnessJudgment({
  prompt,
  context,
  sentence,
  correctRating,
  explanationZh,
  explanationEn,
  conventionalityNote,
  semanticRoleExplanation,
  contrastExample,
  learningObjective,
  thinkingSteps,
  masteryChecks,
  nextRecommended,
  feedbackLevels,
  onNextRecommended,
  onComplete,
}: NaturalnessJudgmentProps) {
  const [selectedRating, setSelectedRating] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const handleSelect = (rating: number) => {
    if (submitted) return
    setSelectedRating(rating)
  }

  const handleSubmit = () => {
    if (selectedRating === null) return
    const correct = selectedRating === correctRating
    setIsCorrect(correct)
    setSubmitted(true)
  }

  const handleNext = () => {
    if (selectedRating === null) return
    onComplete(isCorrect, selectedRating)
  }

  const correctLabel = RATING_LABELS.find((r) => r.value === correctRating)?.label || String(correctRating)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-6 border border-green-100 dark:border-green-900">
        <div className="flex items-center gap-2 mb-3">
          <Scale className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium text-green-700 dark:text-green-400 uppercase tracking-wide">
            练习类型 · 自然度判断
          </span>
        </div>
        <h2 className="text-xl font-bold">判断句子的自然度</h2>
      </div>

      {/* Prompt */}
      <div className="p-5 rounded-lg bg-muted/50 border">
        <p className="text-base font-medium leading-relaxed">{prompt}</p>
        {context && (
          <p className="text-sm text-muted-foreground mt-2">{context}</p>
        )}
      </div>

      {/* Sentence to evaluate */}
      <div className="p-5 rounded-xl border bg-card">
        <p className="text-sm text-muted-foreground mb-2">请判断以下句子的自然度：</p>
        <p className="text-lg font-medium leading-relaxed">{sentence}</p>
      </div>

      {/* Rating */}
      <div className="space-y-3">
        <p className="text-sm font-medium">选择一个评级：</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {RATING_LABELS.map((rating) => {
            const isSelected = selectedRating === rating.value
            const isCorrectRating = rating.value === correctRating
            const showCorrect = submitted && isCorrectRating
            const showWrong = submitted && isSelected && !isCorrectRating

            return (
              <button
                key={rating.value}
                onClick={() => handleSelect(rating.value)}
                disabled={submitted}
                className={cn(
                  'p-4 rounded-lg border text-center transition-all',
                  !submitted && isSelected && 'border-blue-400 bg-blue-50 dark:bg-blue-950/20',
                  !submitted && !isSelected && 'border-border bg-card hover:bg-accent',
                  showCorrect && 'border-green-500 bg-green-50 dark:bg-green-950/20',
                  showWrong && 'border-red-500 bg-red-50 dark:bg-red-950/20',
                  submitted && !isSelected && !isCorrectRating && 'opacity-50'
                )}
              >
                <div
                  className={cn(
                    'w-3 h-3 rounded-full mx-auto mb-2',
                    rating.color,
                    showCorrect && 'ring-2 ring-green-600 ring-offset-2',
                    showWrong && 'ring-2 ring-red-600 ring-offset-2'
                  )}
                />
                <p
                  className={cn(
                    'text-sm font-medium',
                    showCorrect && 'text-green-700 dark:text-green-400',
                    showWrong && 'text-red-700 dark:text-red-400'
                  )}
                >
                  {rating.label}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <ExerciseFeedback
              isCorrect={isCorrect}
              correctAnswer={`评级：${correctLabel}`}
              userAnswer={selectedRating !== null ? `评级：${RATING_LABELS.find((r) => r.value === selectedRating)?.label}` : undefined}
              explanationZh={explanationZh}
              explanationEn={explanationEn}
              conventionalityNote={conventionalityNote}
              semanticRoleExplanation={semanticRoleExplanation}
              contrastExample={contrastExample}
              learningObjective={learningObjective}
              thinkingSteps={thinkingSteps}
              masteryChecks={masteryChecks}
              nextRecommended={nextRecommended}
              feedbackLevels={feedbackLevels}
              onNextRecommended={onNextRecommended}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="flex justify-end gap-3">
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={selectedRating === null}
            className={cn(
              'px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors',
              selectedRating === null
                ? 'bg-muted-foreground/40 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            )}
          >
            提交答案
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            下一题
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  )
}
