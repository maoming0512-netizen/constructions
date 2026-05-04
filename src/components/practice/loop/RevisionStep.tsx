import { useState } from 'react'
import { motion } from 'framer-motion'
import { Edit3, ChevronRight, RotateCcw, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

export interface RevisionStepProps {
  originalSentence: string
  aiRevisedSentence?: string
  suggestions: string[]
  onComplete: (revisedSentence: string) => void
  onRequestAIFeedback?: (sentence: string) => void
}

/**
 * Step 7: Revision — 对比初稿和修改稿
 *
 * 学习者根据 AI 反馈修改自己的句子，通过对比初稿和修改稿，
 * 深化对构式用法的理解。这是「修订闭环」的核心环节。
 */
export default function RevisionStep({
  originalSentence,
  aiRevisedSentence,
  suggestions,
  onComplete,
  onRequestAIFeedback,
}: RevisionStepProps) {
  const [revision, setRevision] = useState('')
  const [useAIVersion, setUseAIVersion] = useState(false)

  const handleUseOriginal = () => {
    setRevision(originalSentence)
    setUseAIVersion(false)
  }

  const handleUseAI = () => {
    if (aiRevisedSentence) {
      setRevision(aiRevisedSentence)
      setUseAIVersion(true)
    }
  }

  const handleSubmit = () => {
    const final = revision.trim() || originalSentence
    setRevision(final)
    onComplete(final)
  }

  const handleSubmitAndAnalyze = () => {
    const final = revision.trim() || originalSentence
    setRevision(final)
    onComplete(final)
    onRequestAIFeedback?.(final)
  }

  // Diff highlighting: simple word-level comparison
  const renderDiff = () => {
    const origWords = originalSentence.split(/\s+/)
    const revWords = (useAIVersion ? aiRevisedSentence : revision)?.split(/\s+/) || []

    return (
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground mb-2">对比（绿色 = 新增/修改）：</p>
        <div className="flex flex-wrap gap-x-1 gap-y-0.5">
          {revWords.map((word, i) => {
            const inOriginal = origWords.some(
              (w) => w.toLowerCase() === word.toLowerCase()
            )
            return (
              <span
                key={i}
                className={cn(
                  'px-1.5 py-0.5 rounded text-sm',
                  inOriginal
                    ? 'bg-transparent'
                    : 'bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-200 font-medium'
                )}
              >
                {word}
              </span>
            )
          })}
        </div>
      </div>
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
      <div className="rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 p-6 border border-rose-100 dark:border-rose-900">
        <div className="flex items-center gap-2 mb-3">
          <Edit3 className="w-5 h-5 text-rose-600" />
          <span className="text-sm font-medium text-rose-700 dark:text-rose-400 uppercase tracking-wide">
            Step 7 / 8 · 修订 Revision
          </span>
        </div>
        <h2 className="text-xl font-bold mb-2">修改你的句子</h2>
        <p className="text-sm text-muted-foreground">
          根据 AI 反馈的建议，修改你的原始句子。对比修改前后的差异，强化对构式的理解。
        </p>
      </div>

      {/* Original sentence display */}
      <div className="p-4 rounded-lg bg-muted/50 border">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-muted-foreground uppercase">原始版本</span>
          <span className="text-xs px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
            Draft 1
          </span>
        </div>
        <p className="text-base line-through decoration-red-400 decoration-2 opacity-70">
          {originalSentence}
        </p>
      </div>

      {/* Arrow */}
      <div className="flex justify-center">
        <ArrowRight className="w-6 h-6 text-muted-foreground" />
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            AI 建议的修改方向
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => {
                  // Insert suggestion as a hint in the revision
                  setRevision((prev) =>
                    prev ? `${prev} (${s})` : `(${s})`
                  )
                }}
                className="px-3 py-1.5 rounded-full text-sm border bg-card hover:bg-rose-50 hover:border-rose-300 dark:hover:bg-rose-950/30 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="flex gap-3">
        <Button variant="outline" size="sm" onClick={handleUseOriginal}>
          <RotateCcw className="w-3 h-3 mr-1" />
          使用原句
        </Button>
        {aiRevisedSentence && (
          <Button variant="outline" size="sm" onClick={handleUseAI}>
            <Sparkles className="w-3 h-3 mr-1" />
            使用 AI 版本
          </Button>
        )}
      </div>

      {/* Revision textarea */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase">
            修改版本
            {useAIVersion && (
              <span className="ml-2 text-xs px-2 py-0.5 rounded bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200">
                AI Version
              </span>
            )}
          </span>
          <span className="text-xs text-muted-foreground">
            {(revision || aiRevisedSentence || '').length} 字符
          </span>
        </div>
        <Textarea
          value={revision}
          onChange={(e) => {
            setRevision(e.target.value)
            setUseAIVersion(false)
          }}
          placeholder="在这里输入修改后的句子..."
          rows={3}
          className="text-lg resize-none"
        />
      </div>

      {/* Diff preview */}
      {revision && revision !== originalSentence && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-4 rounded-lg bg-green-50/50 dark:bg-green-950/10 border border-green-200 dark:border-green-800"
        >
          {renderDiff()}
        </motion.div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleUseOriginal}>
          重置
        </Button>
        <div className="flex gap-3">
          {onRequestAIFeedback && (
            <Button
              variant="outline"
              onClick={handleSubmitAndAnalyze}
              disabled={!revision.trim()}
            >
              提交并重新分析
            </Button>
          )}
          <Button onClick={handleSubmit} disabled={!revision.trim()}>
            提交修改
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
