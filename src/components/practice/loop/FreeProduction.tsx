import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, ChevronRight, RotateCcw, Mic } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export interface FreeProductionProps {
  constructionName: string
  form: string
  prompt: string
  suggestedVerbs?: string[]
  minLength?: number
  onComplete: (sentence: string) => void
  onRequestAIAnalysis?: (sentence: string) => void
}

/**
 * Step 5: Free Production — 自由造句输入框
 *
 * 学习者自主使用目标构式造句，产出原创句子。
 * 这是从接受性知识到产出性能力的关键转化步骤。
 */
export default function FreeProduction({
  constructionName,
  form,
  prompt,
  suggestedVerbs = [],
  minLength = 5,
  onComplete,
  onRequestAIAnalysis,
}: FreeProductionProps) {
  const [sentence, setSentence] = useState('')
  const [charCount, setCharCount] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setSentence(val)
    setCharCount(val.trim().length)
  }

  const handleInsertVerb = (verb: string) => {
    const newSentence = sentence ? `${sentence.trim()} ${verb}` : verb
    setSentence(newSentence)
    setCharCount(newSentence.length)
    textareaRef.current?.focus()
  }

  const handleSubmit = () => {
    if (charCount < minLength) return
    onComplete(sentence.trim())
  }

  const handleReset = () => {
    setSentence('')
    setCharCount(0)
  }

  const handleAnalyze = () => {
    if (charCount < minLength || !onRequestAIAnalysis) return
    onRequestAIAnalysis(sentence.trim())
  }

  const canSubmit = charCount >= minLength

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 p-6 border border-violet-100 dark:border-violet-900">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="w-5 h-5 text-violet-600" />
          <span className="text-sm font-medium text-violet-700 dark:text-violet-400 uppercase tracking-wide">
            Step 5 / 8 · 自由产出 Free Production
          </span>
        </div>
        <h2 className="text-xl font-bold mb-2">使用「{constructionName}」造句</h2>
        <p className="text-sm text-muted-foreground">
          形式：<code className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded text-sm font-mono">{form}</code>
        </p>
      </div>

      {/* Prompt */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center shrink-0">
            <Mic className="w-4 h-4 text-violet-600" />
          </div>
          <p className="text-base leading-relaxed">{prompt}</p>
        </div>
      </div>

      {/* Suggested verbs */}
      {suggestedVerbs.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">可尝试的动词（点击插入）：</p>
          <div className="flex flex-wrap gap-2">
            {suggestedVerbs.map((verb) => (
              <button
                key={verb}
                onClick={() => handleInsertVerb(verb)}
                className="px-3 py-1.5 rounded-full text-sm border bg-card hover:bg-violet-50 hover:border-violet-300 dark:hover:bg-violet-950/30 transition-colors"
              >
                {verb}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Textarea */}
      <div className="space-y-2">
        <Textarea
          ref={textareaRef}
          value={sentence}
          onChange={handleChange}
          placeholder={`请输入一个使用「${constructionName}」的完整句子...`}
          rows={4}
          className="text-lg resize-none"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {charCount} 字符
            {canSubmit && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-green-600 ml-2"
              >
                ✓ 可以提交了
              </motion.span>
            )}
          </span>
          <span className="text-xs">最少 {minLength} 个字符</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleReset} disabled={!sentence}>
          <RotateCcw className="w-4 h-4 mr-2" />
          清空
        </Button>
        <div className="flex gap-3">
          {onRequestAIAnalysis && (
            <Button variant="outline" onClick={handleAnalyze} disabled={!canSubmit}>
              AI 分析
            </Button>
          )}
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            提交造句
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
