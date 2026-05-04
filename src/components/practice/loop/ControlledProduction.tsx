import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PenTool, CheckCircle2, XCircle, ChevronRight, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface ControlledExercise {
  id: string
  type: 'fill-blank' | 'multiple-choice' | 'reorder'
  prompt: string
  hint?: string
  options?: string[]
  correctAnswer: string
  explanation: string
}

export interface ControlledProductionProps {
  exercises: ControlledExercise[]
  onComplete: (results: { exerciseId: string; userAnswer: string; isCorrect: boolean }[]) => void
}

/**
 * Step 4: Controlled Production — 填空/选择练习
 *
 * 学习者在控制性环境中产出语言，通过填空、选择和排序练习
 * 巩固对构式形式的掌握。
 */
export default function ControlledProduction({
  exercises,
  onComplete,
}: ControlledProductionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({})
  const [showHint, setShowHint] = useState(false)
  const [, setResults] = useState<{ exerciseId: string; userAnswer: string; isCorrect: boolean }[]>([])

  const currentExercise = exercises[currentIndex]
  const isCurrentSubmitted = submitted[currentExercise.id] || false
  const currentAnswer = answers[currentExercise.id] || ''
  const isCurrentCorrect =
    currentAnswer.toLowerCase().trim() === currentExercise.correctAnswer.toLowerCase().trim()

  const handleAnswer = (value: string) => {
    if (isCurrentSubmitted) return
    setAnswers((prev) => ({ ...prev, [currentExercise.id]: value }))
  }

  const handleSubmit = () => {
    if (!currentAnswer) return
    setSubmitted((prev) => ({ ...prev, [currentExercise.id]: true }))
    const correct =
      currentAnswer.toLowerCase().trim() === currentExercise.correctAnswer.toLowerCase().trim()
    setResults((prev) => [...prev, { exerciseId: currentExercise.id, userAnswer: currentAnswer, isCorrect: correct }])
  }

  const handleNext = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex((i) => i + 1)
      setShowHint(false)
    } else {
      // All done, collect results
      const finalResults = exercises.map((ex) => ({
        exerciseId: ex.id,
        userAnswer: answers[ex.id] || '',
        isCorrect:
          (answers[ex.id] || '').toLowerCase().trim() === ex.correctAnswer.toLowerCase().trim(),
      }))
      onComplete(finalResults)
    }
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
      <div className="rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30 p-6 border border-teal-100 dark:border-teal-900">
        <div className="flex items-center gap-2 mb-3">
          <PenTool className="w-5 h-5 text-teal-600" />
          <span className="text-sm font-medium text-teal-700 dark:text-teal-400 uppercase tracking-wide">
            Step 4 / 8 · 控制性产出 Controlled Production
          </span>
        </div>
        <h2 className="text-xl font-bold">填空与选择练习</h2>
        <p className="text-sm text-muted-foreground mt-1">
          在控制性环境中练习构式用法，巩固形式-意义配对。
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        {exercises.map((ex, i) => (
          <div
            key={ex.id}
            className={cn(
              'h-2 flex-1 rounded-full transition-all',
              i < currentIndex && submitted[ex.id]
                ? (answers[ex.id] || '').toLowerCase().trim() === ex.correctAnswer.toLowerCase().trim()
                  ? 'bg-green-500'
                  : 'bg-red-400'
                : i === currentIndex
                ? 'bg-teal-500'
                : 'bg-slate-200 dark:bg-slate-700'
            )}
          />
        ))}
        <span className="text-sm text-muted-foreground ml-2">
          {currentIndex + 1} / {exercises.length}
        </span>
      </div>

      {/* Exercise card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentExercise.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="p-6 rounded-xl border bg-card space-y-5"
        >
          {/* Prompt */}
          <div>
            <p className="text-lg font-medium leading-relaxed">{currentExercise.prompt}</p>
          </div>

          {/* Hint toggle */}
          {currentExercise.hint && (
            <button
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700 transition-colors"
            >
              <Lightbulb className="w-4 h-4" />
              {showHint ? '隐藏提示' : '显示提示'}
            </button>
          )}

          <AnimatePresence>
            {showHint && currentExercise.hint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-300"
              >
                {currentExercise.hint}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Answer area */}
          {currentExercise.type === 'multiple-choice' && currentExercise.options ? (
            <div className="space-y-2">
              {currentExercise.options.map((option, i) => {
                const isSelected = currentAnswer === option
                const showCorrect = isCurrentSubmitted && option === currentExercise.correctAnswer
                const showWrong = isCurrentSubmitted && isSelected && option !== currentExercise.correctAnswer

                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(option)}
                    disabled={isCurrentSubmitted}
                    className={cn(
                      'w-full text-left p-3 rounded-lg border transition-all',
                      !isCurrentSubmitted && isSelected && 'border-teal-400 bg-teal-50 dark:bg-teal-950/20',
                      !isCurrentSubmitted && !isSelected && 'border-border hover:bg-accent',
                      showCorrect && 'border-green-500 bg-green-50 dark:bg-green-950/20',
                      showWrong && 'border-red-500 bg-red-50 dark:bg-red-950/20'
                    )}
                  >
                    <span className="font-medium">{String.fromCharCode(65 + i)}.</span>{' '}
                    {option}
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="space-y-3">
              <Input
                value={currentAnswer}
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder="输入你的答案..."
                disabled={isCurrentSubmitted}
                className={cn(
                  'text-lg',
                  isCurrentSubmitted &&
                    (isCurrentCorrect
                      ? 'border-green-500 focus-visible:ring-green-500'
                      : 'border-red-500 focus-visible:ring-red-500')
                )}
              />
              {isCurrentSubmitted && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  {isCurrentCorrect ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span className="text-green-700 dark:text-green-400 font-medium">回答正确！</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-500" />
                      <span className="text-red-700 dark:text-red-400">
                        正确答案：<strong>{currentExercise.correctAnswer}</strong>
                      </span>
                    </>
                  )}
                </motion.div>
              )}
            </div>
          )}

          {/* Explanation */}
          <AnimatePresence>
            {isCurrentSubmitted && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 rounded-lg bg-muted text-sm"
              >
                <p className="font-medium mb-1">解析：</p>
                <p className="text-muted-foreground">{currentExercise.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <div className="flex justify-end">
        {!isCurrentSubmitted ? (
          <Button onClick={handleSubmit} disabled={!currentAnswer}>
            提交
          </Button>
        ) : (
          <Button onClick={handleNext}>
            {currentIndex < exercises.length - 1 ? '下一题' : '完成练习'}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </motion.div>
  )
}
