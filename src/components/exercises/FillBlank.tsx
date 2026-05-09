import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Edit3, ChevronRight, CheckCircle2, XCircle, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'
import ExerciseFeedback from './ExerciseFeedback'

export interface FillBlankProps {
  prompt: string
  context?: string
  prototypeSentence: string
  extensionSentence: string
  blankPosition: 'prototype' | 'extension'
  correctAnswer: string
  hint?: string
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
 * FillBlank — 填空练习
 *
 * "原型句子""扩展句子"
 */
export default function FillBlank({
  prompt,
  context,
  prototypeSentence,
  extensionSentence,
  blankPosition,
  correctAnswer,
  hint,
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
}: FillBlankProps) {
  const [answer, setAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [showHint, setShowHint] = useState(false)

  const handleSubmit = () => {
    if (!answer.trim()) return
    const correct = answer.toLowerCase().trim() === correctAnswer.toLowerCase().trim()
    setIsCorrect(correct)
    setSubmitted(true)
  }

  const handleNext = () => {
    onComplete(isCorrect, answer)
  }

  const renderSentence = (sentence: string, isBlank: boolean) => {
    if (!isBlank) return sentence
    const parts = sentence.split('___')
    if (parts.length === 1) return sentence
    return (
      <span>
        {parts[0]}
        <span className="inline-block min-w-[80px] border-b-2 border-blue-400 mx-1 text-center">
          {submitted ? (
            <span className={isCorrect ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
              {answer}
            </span>
          ) : (
            <span className="text-muted-foreground">?</span>
          )}
        </span>
        {parts[1]}
      </span>
    )
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
      <div className="rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 p-6 border border-teal-100 dark:border-teal-900">
        <div className="flex items-center gap-2 mb-3">
          <Edit3 className="w-5 h-5 text-teal-600" />
          <span className="text-sm font-medium text-teal-700 dark:text-teal-400 uppercase tracking-wide">
            练习类型 · 填空
          </span>
        </div>
        <h2 className="text-xl font-bold">用正确的词填空</h2>
      </div>

      {/* Prompt */}
      <div className="p-5 rounded-lg bg-muted/50 border">
        <p className="text-base font-medium leading-relaxed">{prompt}</p>
        {context && (
          <p className="text-sm text-muted-foreground mt-2">{context}</p>
        )}
      </div>

      {/* Sentences */}
      <div className="space-y-4">
        <div className="p-4 rounded-lg border bg-card">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">原型句子</p>
          <p className="text-base leading-relaxed">
            {renderSentence(prototypeSentence, blankPosition === 'prototype')}
          </p>
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">扩展句子</p>
          <p className="text-base leading-relaxed">
            {renderSentence(extensionSentence, blankPosition === 'extension')}
          </p>
        </div>
      </div>

      {/* Answer input */}
      {!submitted && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="输入你的答案..."
              className="flex-1 px-4 py-3 rounded-lg border bg-card text-base focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>
          {hint && (
            <button
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700 transition-colors"
            >
              <Lightbulb className="w-4 h-4" />
              {showHint ? '隐藏提示' : '显示提示'}
            </button>
          )}
          <AnimatePresence>
            {showHint && hint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-300"
              >
                {hint}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Result */}
      {submitted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2"
        >
          {isCorrect ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="text-green-700 dark:text-green-400 font-medium">回答正确！</span>
            </>
          ) : (
            <>
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700 dark:text-red-400">
                正确答案：<strong>{correctAnswer}</strong>
              </span>
            </>
          )}
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
              userAnswer={answer}
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
            disabled={!answer.trim()}
            className={cn(
              'px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors',
              !answer.trim()
                ? 'bg-muted-foreground/40 cursor-not-allowed'
                : 'bg-teal-600 hover:bg-teal-700'
            )}
          >
            提交答案
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 transition-colors flex items-center gap-2"
          >
            下一题
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  )
}
