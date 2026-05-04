import { useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, ChevronRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface InputFloodProps {
  constructionName: string
  form: string
  meaning: string
  examples: string[]
  onComplete: () => void
}

/**
 * Step 1: Input Flood — 展示3-5个同构式例句，高亮构式形式
 *
 * 通过大量包含同一构式的例句（input flood），让学习者自然接触
 * 构式的形式-意义配对，为后续模式发现做铺垫。
 */
export default function InputFlood({
  constructionName,
  form,
  meaning,
  examples,
  onComplete,
}: InputFloodProps) {
  const [revealedCount, setRevealedCount] = useState(0)
  const [allRevealed, setAllRevealed] = useState(false)

  const revealNext = () => {
    if (revealedCount < examples.length) {
      setRevealedCount((c) => c + 1)
      if (revealedCount + 1 >= examples.length) {
        setAllRevealed(true)
      }
    }
  }

  const handleRevealAll = () => {
    setRevealedCount(examples.length)
    setAllRevealed(true)
  }

  // Highlight the construction form within the example sentence
  const highlightForm = (sentence: string) => {
    // Simple highlighting: find the key parts of the form pattern
    // e.g., "Subj V Obj1 Obj2" → highlight V, Obj1, Obj2 positions
    const formParts = form
      .split(/\s+/)
      .filter((p) => p !== 'Subj' && p !== '...')
    let highlighted = sentence
    formParts.forEach((part) => {
      const clean = part.replace(/[()]/g, '').trim()
      if (clean.length > 1) {
        const regex = new RegExp(`(\\b${clean}\\b)`, 'gi')
        highlighted = highlighted.replace(
          regex,
          '<mark class="bg-amber-200 dark:bg-amber-700 px-1 rounded font-semibold">$1</mark>'
        )
      }
    })
    return highlighted
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
      <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 p-6 border border-indigo-100 dark:border-indigo-900">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          <span className="text-sm font-medium text-indigo-700 dark:text-indigo-400 uppercase tracking-wide">
            Step 1 / 8 · 输入淹没 Input Flood
          </span>
        </div>
        <h2 className="text-xl font-bold mb-2">{constructionName}</h2>
        <p className="text-sm text-muted-foreground mb-3">
          形式：<code className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded text-sm font-mono">{form}</code>
        </p>
        <p className="text-sm text-muted-foreground">
          语义：<span className="font-medium text-foreground">{meaning}</span>
        </p>
      </div>

      {/* Examples with staggered reveal */}
      <div className="space-y-3">
        {examples.slice(0, revealedCount).map((example, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
            className={cn(
              'p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow',
              i === 0 && 'border-l-4 border-l-indigo-500'
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p
                  className="text-lg leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: highlightForm(example) }}
                />
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                例{i + 1}
              </span>
            </div>
          </motion.div>
        ))}

        {/* Placeholder for unrevealed examples */}
        {Array.from({ length: examples.length - revealedCount }).map((_, i) => (
          <motion.div
            key={`placeholder-${i}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 rounded-lg border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">点击下方按钮展示更多例句...</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between pt-2">
        {!allRevealed ? (
          <div className="flex gap-3">
            <Button onClick={revealNext} variant="default">
              <Sparkles className="w-4 h-4 mr-2" />
              {revealedCount === 0 ? '开始展示例句' : '下一句'}
            </Button>
            {revealedCount > 0 && revealedCount < examples.length && (
              <Button onClick={handleRevealAll} variant="outline">
                全部展示
              </Button>
            )}
          </div>
        ) : (
          <Button onClick={onComplete} variant="default" className="bg-green-600 hover:bg-green-700">
            我发现了模式，继续
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
        <span className="text-sm text-muted-foreground">
          {revealedCount} / {examples.length}
        </span>
      </div>
    </motion.div>
  )
}
