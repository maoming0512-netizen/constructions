import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, ChevronRight, CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import ExerciseFeedback from './ExerciseFeedback'

export interface RoleItem {
  token: string
  correctRoleId: string
  userRoleId?: string
}

export interface SemanticRole {
  id: string
  label: string
  description: string
  color: string
}

export interface SemanticRoleMappingProps {
  prompt: string
  sentence: string
  tokens: RoleItem[]
  availableRoles: SemanticRole[]
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
  onComplete: (isCorrect: boolean, results: { token: string; correctRoleId: string; userRoleId: string }[]) => void
}

/**
 * SemanticRoleMapping — 语义角色映射
 *
 * 中文角色标签
 */
export default function SemanticRoleMapping({
  prompt,
  sentence,
  tokens,
  availableRoles,
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
}: SemanticRoleMappingProps) {
  const [assignments, setAssignments] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const handleAssign = (token: string, roleId: string) => {
    if (submitted) return
    setAssignments((prev) => ({ ...prev, [token]: roleId }))
  }

  const handleSubmit = () => {
    const allAssigned = tokens.every((t) => assignments[t.token])
    if (!allAssigned) return
    const correct = tokens.every((t) => assignments[t.token] === t.correctRoleId)
    setIsCorrect(correct)
    setSubmitted(true)
  }

  const handleNext = () => {
    const results = tokens.map((t) => ({
      token: t.token,
      correctRoleId: t.correctRoleId,
      userRoleId: assignments[t.token] || '',
    }))
    onComplete(isCorrect, results)
  }

  const allAssigned = tokens.every((t) => assignments[t.token])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30 p-6 border border-sky-100 dark:border-sky-900">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-5 h-5 text-sky-600" />
          <span className="text-sm font-medium text-sky-700 dark:text-sky-400 uppercase tracking-wide">
            练习类型 · 语义角色映射
          </span>
        </div>
        <h2 className="text-xl font-bold">为每个成分标注语义角色</h2>
      </div>

      {/* Prompt */}
      <div className="p-5 rounded-lg bg-muted/50 border">
        <p className="text-base font-medium leading-relaxed">{prompt}</p>
      </div>

      {/* Sentence */}
      <div className="p-5 rounded-xl border bg-card">
        <p className="text-sm text-muted-foreground mb-2">分析句子：</p>
        <p className="text-lg font-medium leading-relaxed">{sentence}</p>
      </div>

      {/* Role palette */}
      <div className="space-y-2">
        <p className="text-sm font-medium">可用的语义角色（点击下方角色，再点击句子成分进行标注）：</p>
        <div className="flex flex-wrap gap-2">
          {availableRoles.map((role) => (
            <div
              key={role.id}
              className="px-3 py-2 rounded-lg border text-sm"
              style={{
                borderColor: role.color + '40',
                background: role.color + '15',
                color: role.color,
              }}
            >
              <span className="font-medium">{role.label}</span>
              <span className="text-xs ml-1 opacity-70">{role.description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tokens to map */}
      <div className="space-y-3">
        <p className="text-sm font-medium">句子成分：</p>
        {tokens.map((token, i) => {
          const assignedRoleId = assignments[token.token]
          const assignedRole = availableRoles.find((r) => r.id === assignedRoleId)
          const isCorrectAssignment = submitted && assignedRoleId === token.correctRoleId
          const isWrongAssignment = submitted && assignedRoleId !== token.correctRoleId
          const correctRole = availableRoles.find((r) => r.id === token.correctRoleId)

          return (
            <div
              key={i}
              className={cn(
                'flex items-center gap-3 p-4 rounded-lg border transition-all',
                isCorrectAssignment && 'border-green-500 bg-green-50 dark:bg-green-950/20',
                isWrongAssignment && 'border-red-500 bg-red-50 dark:bg-red-950/20',
                !submitted && 'border-border bg-card'
              )}
            >
              <span className="text-base font-medium min-w-[120px]">{token.token}</span>
              <div className="flex-1">
                {!submitted ? (
                  <div className="flex flex-wrap gap-2">
                    {availableRoles.map((role) => (
                      <button
                        key={role.id}
                        onClick={() => handleAssign(token.token, role.id)}
                        className={cn(
                          'px-2 py-1 rounded text-xs font-medium transition-all',
                          assignedRoleId === role.id
                            ? 'text-white'
                            : 'opacity-60 hover:opacity-100'
                        )}
                        style={{
                          background: assignedRoleId === role.id ? role.color : role.color + '20',
                          color: assignedRoleId === role.id ? '#fff' : role.color,
                        }}
                      >
                        {role.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {isCorrectAssignment ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-green-700 dark:text-green-400">
                          {assignedRole?.label}
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-red-600 dark:text-red-400">
                          你的答案：{assignedRole?.label || '未标注'}
                        </span>
                        <span className="text-sm text-green-600 dark:text-green-400">
                          正确答案：{correctRole?.label}
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
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
              correctAnswer={tokens.map((t) => `${t.token}: ${availableRoles.find((r) => r.id === t.correctRoleId)?.label}`).join('; ')}
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
            disabled={!allAssigned}
            className={cn(
              'px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors',
              !allAssigned
                ? 'bg-muted-foreground/40 cursor-not-allowed'
                : 'bg-sky-600 hover:bg-sky-700'
            )}
          >
            提交答案
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 transition-colors flex items-center gap-2"
          >
            下一题
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  )
}
