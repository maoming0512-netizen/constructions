import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutGrid, ChevronRight, ArrowUp, ArrowDown, CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import ExerciseFeedback from './ExerciseFeedback'

export interface ConstructionSortingProps {
  prompt: string
  context?: string
  items: { id: string; label: string; correctOrder: number }[]
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
  onComplete: (isCorrect: boolean, userOrder: string[]) => void
}

/**
 * ConstructionSorting — 构式排序
 *
 * 构式标签中文
 */
export default function ConstructionSorting({
  prompt,
  context,
  items,
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
}: ConstructionSortingProps) {
  const [order, setOrder] = useState<string[]>(items.map((item) => item.id))
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (submitted) return
    const newOrder = [...order]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= newOrder.length) return
    ;[newOrder[index], newOrder[swapIndex]] = [newOrder[swapIndex], newOrder[index]]
    setOrder(newOrder)
  }

  const handleSubmit = () => {
    const sortedItems = items.sort((a, b) => a.correctOrder - b.correctOrder)
    const correct = sortedItems.every((item, i) => item.id === order[i])
    setIsCorrect(correct)
    setSubmitted(true)
  }

  const handleNext = () => {
    onComplete(isCorrect, order)
  }

  const correctOrder = items
    .sort((a, b) => a.correctOrder - b.correctOrder)
    .map((item) => item.label)
    .join(' → ')

  const userOrderStr = order
    .map((id) => items.find((item) => item.id === id)?.label)
    .filter(Boolean)
    .join(' → ')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 p-6 border border-violet-100 dark:border-violet-900">
        <div className="flex items-center gap-2 mb-3">
          <LayoutGrid className="w-5 h-5 text-violet-600" />
          <span className="text-sm font-medium text-violet-700 dark:text-violet-400 uppercase tracking-wide">
            练习类型 · 构式排序
          </span>
        </div>
        <h2 className="text-xl font-bold">将构式元素按正确顺序排列</h2>
      </div>

      {/* Prompt */}
      <div className="p-5 rounded-lg bg-muted/50 border">
        <p className="text-base font-medium leading-relaxed">{prompt}</p>
        {context && (
          <p className="text-sm text-muted-foreground mt-2">{context}</p>
        )}
      </div>

      {/* Sortable items */}
      <div className="space-y-2">
        <p className="text-sm font-medium">点击上下箭头调整顺序：</p>
        {order.map((id, index) => {
          const item = items.find((i) => i.id === id)!
          const isInCorrectPosition = submitted && item.correctOrder === index + 1
          const isInWrongPosition = submitted && item.correctOrder !== index + 1

          return (
            <div
              key={id}
              className={cn(
                'flex items-center gap-3 p-4 rounded-lg border transition-all',
                isInCorrectPosition && 'border-green-500 bg-green-50 dark:bg-green-950/20',
                isInWrongPosition && 'border-red-500 bg-red-50 dark:bg-red-950/20',
                !submitted && 'border-border bg-card'
              )}
            >
              <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
              <p className="flex-1 font-medium">{item.label}</p>
              {!submitted && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveItem(index, 'up')}
                    disabled={index === 0}
                    className="p-1 rounded hover:bg-accent disabled:opacity-30 transition-colors"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveItem(index, 'down')}
                    disabled={index === order.length - 1}
                    className="p-1 rounded hover:bg-accent disabled:opacity-30 transition-colors"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
              )}
              {submitted && (
                <div>
                  {isInCorrectPosition ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              )}
            </div>
          )
        })}
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
              correctAnswer={correctOrder}
              userAnswer={userOrderStr}
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
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 transition-colors"
          >
            提交答案
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 transition-colors flex items-center gap-2"
          >
            下一题
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  )
}
