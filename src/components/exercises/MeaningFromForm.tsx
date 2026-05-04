import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, CheckCircle2, XCircle, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import ExerciseFeedback from './ExerciseFeedback'

export interface MeaningFromFormProps {
  prompt: string
  context?: string
  options: string[]
  correctAnswer: string
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
  diagnosedErrors?: { code: string; confidence: 'high' | 'medium' | 'low' }[]
  onNextRecommended?: (id: string) => void
  onComplete: (isCorrect: boolean, userAnswer: string) => void
}

/**
 * MeaningFromForm — 意义辨析（从形式到意义）
 *
 * 按钮"提交答案""下一题"，正确选项绿色✓，错误红色✗
 */
export default function MeaningFromForm({
  prompt,
  context,
  options,
  correctAnswer,
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
  diagnosedErrors,
  onNextRecommended,
  onComplete,
}: MeaningFromFormProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const handleSelect = (index: number) => {
    if (submitted) return
    setSelected(index)
  }

  const handleSubmit = () => {
    if (selected === null) return
    const userAnswer = options[selected]
    const correct = userAnswer === correctAnswer
    setIsCorrect(correct)
    setSubmitted(true)
  }

  const handleNext = () => {
    if (selected === null) return
    onComplete(isCorrect, options[selected])
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
      <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-6 border border-blue-100 dark:border-blue-900">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-700 dark:text-blue-400 uppercase tracking-wide">
            练习类型 · 意义辨析
          </span>
        </div>
        <h2 className="text-xl font-bold">分析构式的语义功能</h2>
      </div>

      {/* Prompt */}
      <div className="p-5 rounded-lg bg-muted/50 border">
        <p className="text-base font-medium leading-relaxed">{prompt}</p>
        {context && (
          <p className="text-sm text-muted-foreground mt-2">{context}</p>
        )}
      </div>

      {/* Options */}
      {!submitted ? (
        <div className="space-y-3">
          {options.map((option, i) => {
            const isSelected = selected === i
            return (
              <motion.button
                key={i}
                onClick={() => handleSelect(i)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={cn(
                  'w-full text-left p-4 rounded-lg border transition-all duration-200',
                  'hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400',
                  isSelected
                    ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/20'
                    : 'border-border bg-card hover:bg-accent'
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5',
                      isSelected
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : 'border-muted-foreground/30'
                    )}
                  >
                    {isSelected && <span className="text-xs font-bold">{String.fromCharCode(65 + i)}</span>}
                  </div>
                  <p className="font-medium">{option}</p>
                </div>
              </motion.button>
            )
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {options.map((option, i) => {
            const isSelected = selected === i
            const isCorrectOption = option === correctAnswer
            const showCorrect = isCorrectOption
            const showWrong = isSelected && !isCorrectOption

            return (
              <div
                key={i}
                className={cn(
                  'w-full text-left p-4 rounded-lg border transition-all',
                  showCorrect && 'border-green-500 bg-green-50 dark:bg-green-950/20',
                  showWrong && 'border-red-500 bg-red-50 dark:bg-red-950/20',
                  !showCorrect && !showWrong && 'border-border bg-card opacity-60'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    {showCorrect && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                    {showWrong && <XCircle className="w-5 h-5 text-red-500" />}
                    {!showCorrect && !showWrong && (
                      <span className="text-xs text-muted-foreground">{String.fromCharCode(65 + i)}</span>
                    )}
                  </div>
                  <p className={cn('font-medium', showCorrect && 'text-green-700 dark:text-green-400')}>
                    {option}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

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
              correctAnswer={correctAnswer}
              userAnswer={selected !== null ? options[selected] : undefined}
              explanationZh={explanationZh}
              explanationEn={explanationEn}
              conventionalityNote={conventionalityNote}
              semanticRoleExplanation={semanticRoleExplanation}
              contrastExample={contrastExample}
              diagnosedErrors={diagnosedErrors as any}
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
            disabled={selected === null}
            className={cn(
              'px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors',
              selected === null
                ? 'bg-muted-foreground/40 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            )}
          >
            提交答案
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            下一题
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  )
}
