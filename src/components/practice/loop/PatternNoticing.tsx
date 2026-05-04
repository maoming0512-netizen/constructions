import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lightbulb, CheckCircle2, XCircle, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface PatternNoticingProps {
  constructionName: string
  form: string
  meaning: string
  options: { label: string; isCorrect: boolean; explanation: string }[]
  onComplete: (selectedIndex: number, isCorrect: boolean) => void
}

/**
 * Step 2: Pattern Noticing — 选择题"这些句子共同表达了什么？"
 *
 * 引导学习者从 Step 1 的多个例句中归纳出构式的共同语义模式，
 * 激发主动发现（noticing the gap），促进深层学习。
 */
export default function PatternNoticing({
  constructionName,
  form,
  options,
  onComplete,
}: PatternNoticingProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const handleSelect = (index: number) => {
    if (submitted) return
    setSelected(index)
  }

  const handleSubmit = () => {
    if (selected === null) return
    const correct = options[selected].isCorrect
    setIsCorrect(correct)
    setSubmitted(true)
  }

  const handleNext = () => {
    if (selected === null) return
    onComplete(selected, options[selected].isCorrect)
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
      <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-6 border border-amber-100 dark:border-amber-900">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-5 h-5 text-amber-600" />
          <span className="text-sm font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wide">
            Step 2 / 8 · 模式发现 Pattern Noticing
          </span>
        </div>
        <h2 className="text-xl font-bold mb-2">这些句子共同表达了什么？</h2>
        <p className="text-sm text-muted-foreground">
          构式形式：<code className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded text-sm font-mono">{form}</code>
        </p>
      </div>

      {/* Question */}
      <div className="p-4 rounded-lg bg-muted/50 border">
        <p className="text-base font-medium">
          回顾刚才看到的所有例句，它们都使用了「{constructionName}」这一结构。
          你认为这个结构的核心语义功能是什么？
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {options.map((option, i) => {
          const isSelected = selected === i
          const showCorrect = submitted && option.isCorrect
          const showWrong = submitted && isSelected && !option.isCorrect

          return (
            <motion.button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={submitted}
              whileHover={!submitted ? { scale: 1.01 } : {}}
              whileTap={!submitted ? { scale: 0.99 } : {}}
              className={cn(
                'w-full text-left p-4 rounded-lg border transition-all duration-200',
                'hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400',
                !submitted && isSelected && 'border-amber-400 bg-amber-50 dark:bg-amber-950/20',
                !submitted && !isSelected && 'border-border bg-card hover:bg-accent',
                showCorrect && 'border-green-500 bg-green-50 dark:bg-green-950/20',
                showWrong && 'border-red-500 bg-red-50 dark:bg-red-950/20'
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5',
                    isSelected
                      ? 'border-amber-500 bg-amber-500 text-white'
                      : 'border-muted-foreground/30',
                    showCorrect && 'border-green-500 bg-green-500',
                    showWrong && 'border-red-500 bg-red-500'
                  )}
                >
                  {isSelected && !submitted && <span className="text-xs font-bold">{i + 1}</span>}
                  {showCorrect && <CheckCircle2 className="w-4 h-4" />}
                  {showWrong && <XCircle className="w-4 h-4" />}
                  {!isSelected && submitted && !option.isCorrect && (
                    <span className="text-xs text-muted-foreground">{i + 1}</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{option.label}</p>
                  <AnimatePresence>
                    {submitted && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={cn(
                          'text-sm mt-2',
                          option.isCorrect ? 'text-green-700 dark:text-green-400' : 'text-muted-foreground'
                        )}
                      >
                        {option.explanation}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Controls */}
      <div className="flex justify-end gap-3">
        {!submitted ? (
          <Button onClick={handleSubmit} disabled={selected === null}>
            提交答案
          </Button>
        ) : (
          <Button onClick={handleNext} variant="default">
            {isCorrect ? '回答正确，继续' : '查看解析，继续'}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </motion.div>
  )
}
