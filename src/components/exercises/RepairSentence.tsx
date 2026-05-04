import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wrench, ChevronRight, CheckCircle2, XCircle, PenTool } from 'lucide-react'
import { cn } from '@/lib/utils'
import ExerciseFeedback from './ExerciseFeedback'

export interface RepairSentenceProps {
  prompt: string
  context?: string
  originalSentence: string
  correctAnswer: string
  options: string[]
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
  onComplete: (isCorrect: boolean, userAnswer: string) => void
}

/**
 * RepairSentence — 句子改写
 *
 * "提交改写"，显示正确改写
 */
export default function RepairSentence({
  prompt,
  context,
  originalSentence,
  correctAnswer,
  options,
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
}: RepairSentenceProps) {
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
      <div className="rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 p-6 border border-rose-100 dark:border-rose-900">
        <div className="flex items-center gap-2 mb-3">
          <Wrench className="w-5 h-5 text-rose-600" />
          <span className="text-sm font-medium text-rose-700 dark:text-rose-400 uppercase tracking-wide">
            练习类型 · 句子改写
          </span>
        </div>
        <h2 className="text-xl font-bold">选择最恰当的改写</h2>
      </div>

      {/* Prompt */}
      <div className="p-5 rounded-lg bg-muted/50 border">
        <p className="text-base font-medium leading-relaxed">{prompt}</p>
        {context && (
          <p className="text-sm text-muted-foreground mt-2">{context}</p>
        )}
      </div>

      {/* Original sentence */}
      <div className="p-4 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
        <p className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-2">
          原句
        </p>
        <p className="text-base font-medium leading-relaxed">{originalSentence}</p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        <p className="text-sm font-medium">选择一个改写：</p>
        {options.map((option, i) => {
          const isSelected = selected === i
          const isCorrectOption = option === correctAnswer
          const showCorrect = submitted && isCorrectOption
          const showWrong = submitted && isSelected && !isCorrectOption

          return (
            <motion.button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={submitted}
              whileHover={!submitted ? { scale: 1.01 } : {}}
              whileTap={!submitted ? { scale: 0.99 } : {}}
              className={cn(
                'w-full text-left p-4 rounded-lg border transition-all duration-200',
                !submitted && isSelected && 'border-rose-400 bg-rose-50 dark:bg-rose-950/20',
                !submitted && !isSelected && 'border-border bg-card hover:bg-accent',
                showCorrect && 'border-green-500 bg-green-50 dark:bg-green-950/20',
                showWrong && 'border-red-500 bg-red-50 dark:bg-red-950/20'
              )}
            >
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5">
                  {showCorrect && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                  {showWrong && <XCircle className="w-5 h-5 text-red-500" />}
                  {!showCorrect && !showWrong && (
                    <span
                      className={cn(
                        'text-xs font-bold',
                        isSelected ? 'text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                  )}
                </div>
                <p className={cn('font-medium', showCorrect && 'text-green-700 dark:text-green-400')}>
                  {option}
                </p>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Correct rewrite display */}
      {submitted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <PenTool className="w-4 h-4 text-green-600" />
            <p className="text-sm font-semibold text-green-700 dark:text-green-400">正确改写</p>
          </div>
          <p className="text-base font-medium text-green-800 dark:text-green-300">{correctAnswer}</p>
        </motion.div>
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
                : 'bg-rose-600 hover:bg-rose-700'
            )}
          >
            提交改写
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 transition-colors flex items-center gap-2"
          >
            下一题
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  )
}
