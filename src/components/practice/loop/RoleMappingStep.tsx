import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface SemanticRole {
  id: string
  label: string
  description: string
  color: string
}

export interface TokenRole {
  token: string
  correctRoleId: string
  userRoleId?: string
}

export interface RoleMappingStepProps {
  sentence: string
  tokens: TokenRole[]
  availableRoles: SemanticRole[]
  onComplete: (results: { token: string; correctRoleId: string; userRoleId: string; isCorrect: boolean }[]) => void
}

/**
 * Step 3: Role Mapping — 为句子成分标注语义角色
 *
 * 学习者将句子中的每个成分映射到正确的语义角色（如施事、受事、接受者等），
 * 强化对 Goldberg 对应原则（Correspondence Principle）的理解。
 */
export default function RoleMappingStep({
  sentence,
  tokens,
  availableRoles,
  onComplete,
}: RoleMappingStepProps) {
  const [assignments, setAssignments] = useState<Record<number, string>>({})
  const [submitted, setSubmitted] = useState<boolean | null>(false)
  const [showHint, setShowHint] = useState(false)

  const assignRole = (tokenIndex: number, roleId: string) => {
    if (submitted) return
    setAssignments((prev) => ({ ...prev, [tokenIndex]: roleId }))
  }

  const allAssigned = tokens.every((_, i) => assignments[i] !== undefined)

  const handleSubmit = () => {
    if (!allAssigned) return
    const results = tokens.map((token, i) => ({
      token: token.token,
      correctRoleId: token.correctRoleId,
      userRoleId: assignments[i]!,
      isCorrect: assignments[i] === token.correctRoleId,
    }))
    setSubmitted(true)
    onComplete(results)
  }

  const handleSkip = () => {
    // Skip: mark unassigned as incorrect
    const results = tokens.map((token, i) => ({
      token: token.token,
      correctRoleId: token.correctRoleId,
      userRoleId: assignments[i] || '',
      isCorrect: assignments[i] === token.correctRoleId,
    }))
    setSubmitted(true)
    onComplete(results)
  }

  const correctCount = tokens.filter((t, i) => assignments[i] === t.correctRoleId).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-br from-sky-50 to-cyan-50 dark:from-sky-950/30 dark:to-cyan-950/30 p-6 border border-sky-100 dark:border-sky-900">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-5 h-5 text-sky-600" />
          <span className="text-sm font-medium text-sky-700 dark:text-sky-400 uppercase tracking-wide">
            Step 3 / 8 · 角色映射 Role Mapping
          </span>
        </div>
        <h2 className="text-xl font-bold mb-2">为句子成分标注语义角色</h2>
        <p className="text-sm text-muted-foreground">
          将句子中的每个成分拖拽或点击对应到正确的语义角色。
          这对应 Goldberg 的 <strong>对应原则 (Correspondence Principle)</strong>。
        </p>
      </div>

      {/* Sentence display */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border shadow-sm">
        <p className="text-sm text-muted-foreground mb-2">目标句子：</p>
        <p className="text-xl leading-relaxed font-medium">{sentence}</p>
      </div>

      {/* Role palette */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-muted-foreground mr-2 self-center">可选角色：</span>
        {availableRoles.map((role) => (
          <div
            key={role.id}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium border cursor-default',
            )}
            style={{
              backgroundColor: role.color + '20',
              borderColor: role.color + '60',
              color: role.color,
            }}
          >
            {role.label}
          </div>
        ))}
        <button
          onClick={() => setShowHint(!showHint)}
          className="ml-auto flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
          提示
        </button>
      </div>

      {showHint && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-300"
        >
          对应原则：语义上凸显的参与者应映射到句法上凸显的位置。
          思考每个成分在事件中扮演的角色。
        </motion.div>
      )}

      {/* Token assignment */}
      <div className="space-y-3">
        {tokens.map((token, i) => {
          const assignedRoleId = assignments[i]
          const assignedRole = availableRoles.find((r) => r.id === assignedRoleId)
          const isCorrect = submitted && assignedRoleId === token.correctRoleId
          const isWrong = submitted && assignedRoleId !== token.correctRoleId
          const correctRole = availableRoles.find((r) => r.id === token.correctRoleId)

          return (
            <motion.div
              key={i}
              layout
              className={cn(
                'p-4 rounded-lg border bg-card transition-colors',
                isCorrect && 'border-green-400 bg-green-50/50 dark:bg-green-950/10',
                isWrong && 'border-red-400 bg-red-50/50 dark:bg-red-950/10'
              )}
            >
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <span className="text-sm text-muted-foreground">成分 {i + 1}</span>
                  <p className="text-lg font-semibold">「{token.token}」</p>
                </div>

                {!submitted ? (
                  <div className="flex flex-wrap gap-2">
                    {availableRoles.map((role) => (
                      <button
                        key={role.id}
                        onClick={() => assignRole(i, role.id)}
                        className={cn(
                          'px-3 py-1.5 rounded-full text-sm font-medium border transition-all',
                          assignedRoleId === role.id
                            ? 'ring-2 ring-offset-1'
                            : 'hover:opacity-80'
                        )}
                        style={
                          assignedRoleId === role.id
                            ? {
                                backgroundColor: role.color + '30',
                                borderColor: role.color,
                                color: role.color,
                              }
                            : {
                                backgroundColor: role.color + '10',
                                borderColor: role.color + '30',
                                color: role.color + 'CC',
                              }
                        }
                      >
                        {role.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    {assignedRole && (
                      <span
                        className={cn(
                          'px-3 py-1.5 rounded-full text-sm font-medium border',
                          isCorrect
                            ? 'border-green-500 bg-green-100 text-green-700'
                            : 'border-red-500 bg-red-100 text-red-700'
                        )}
                      >
                        {assignedRole.label}
                      </span>
                    )}
                    {isWrong && correctRole && (
                      <span className="text-sm text-muted-foreground">
                        → 应为 <span className="font-medium text-green-600">{correctRole.label}</span>
                      </span>
                    )}
                    {isCorrect && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                  </div>
                )}
              </div>

              {submitted && correctRole && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 text-sm text-muted-foreground pl-0"
                >
                  {correctRole.description}
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Controls */}
      {!submitted ? (
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleSkip}>
            跳过
          </Button>
          <Button onClick={handleSubmit} disabled={!allAssigned}>
            提交标注 ({Object.keys(assignments).length}/{tokens.length})
          </Button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 rounded-lg bg-muted"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="font-medium">
              正确 {correctCount} / {tokens.length}
            </span>
          </div>
          <Button onClick={() => {}}>
            继续
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}
