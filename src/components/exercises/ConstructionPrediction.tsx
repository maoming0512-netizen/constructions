import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ChevronRight, CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import ExerciseFeedback from './ExerciseFeedback'

export interface ConstructionPredictionProps {
  prompt: string
  context?: string
  constructionName: string
  constructionForm: string
  suggestedVerbs?: string[]
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
  onNextRecommended?: (id: string) => void
  onComplete: (isCorrect: boolean, userAnswer: string) => void
}

/**
 * ConstructionPrediction — 构式预测（按构式生成）
 *
 * 中文提示
 */
export default function ConstructionPrediction({
  prompt,
  context,
  constructionName,
  constructionForm,
  suggestedVerbs,
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
  onNextRecommended,
  onComplete,
}: ConstructionPredictionProps) {
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
      <div className="rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 p-6 border border-amber-100 dark:border-amber-900">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-amber-600" />
          <span className="text-sm font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wide">
            练习类型 · 构式生成
          </span>
        </div>
        <h2 className="text-xl font-bold">使用构式完成句子</h2>
      </div>

      {/* Prompt */}
      <div className="p-5 rounded-lg bg-muted/50 border">
        <p className="text-base font-medium leading-relaxed">{prompt}</p>
        {context && (
          <p className="text-sm text-muted-foreground mt-2">{context}</p>
        )}
      </div>

      {/* Construction info */}
      <div className="p-4 rounded-lg border bg-card space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">目标构式</p>
        <p className="text-lg font-bold text-amber-700 dark:text-amber-400">{constructionName}</p>
        <p className="text-sm font-mono text-muted-foreground">{constructionForm}</p>
        {suggestedVerbs && suggestedVerbs.length > 0 && (
          <div className="pt-2">
            <p className="text-xs text-muted-foreground mb-1">建议动词：</p>
            <div className="flex flex-wrap gap-2">
              {suggestedVerbs.map((verb) => (
                <span
                  key={verb}
                  className="px-2 py-1 rounded bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 text-xs font-medium"
                >
                  {verb}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Options */}
      <div className="space-y-3">
        <p className="text-sm font-medium">选择一个正确的补全：</p>
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
                !submitted && isSelected && 'border-amber-400 bg-amber-50 dark:bg-amber-950/20',
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
                : 'bg-amber-600 hover:bg-amber-700'
            )}
          >
            提交答案
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 transition-colors flex items-center gap-2"
          >
            下一题
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  )
}
