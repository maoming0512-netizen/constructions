'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Eye,
  EyeOff,
  FileText,
  Globe,
  BookOpen,
  Loader2,
  Shuffle,
  Save,
  Clock,
  ChevronDown,
  ChevronUp,
  Brain,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { callOpenAIStream, getAIConfig, getSkillConfig } from '@/lib/ai'
import { useAuth } from '@/context/AuthContext'

// Minimal local type (no data — all data from API)
interface V11Exercise {
  id: string; level: string; type: string; theme: string
  context: string; task: string; wordCount: string
  targetConstructions: string; referenceAnswer: string
}

const levelNames: Record<string, string> = { junior: 'Junior High', senior: 'Senior High' }
const typeLabels: Record<string, string> = { D1: 'Micro Continuation', D2: 'Long Continuation', T1: 'C-E Translation' }

function PracticePage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const startTimeRef = useRef(Date.now())

  const [filterLevel, setFilterLevel] = useState<string>('')
  const [filterType, setFilterType] = useState<string>('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [studentAnswer, setStudentAnswer] = useState('')
  const [showReference, setShowReference] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null)
  const [reasoningContent, setReasoningContent] = useState<string | null>(null)
  const [reasoningOpen, setReasoningOpen] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'saving'>('idle')
  const [apiError, setApiError] = useState(false)

  // Load exercises from API
  const [dbExercises, setDbExercises] = useState<V11Exercise[]>([])
  const [loadingExercises, setLoadingExercises] = useState(true)
  const [totalExercises, setTotalExercises] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  const loadExercises = useCallback((pageNum: number = 1, append: boolean = false) => {
    const params = new URLSearchParams()
    if (filterLevel) params.set('level', filterLevel)
    if (filterType) params.set('type', filterType)
    params.set('limit', '50')
    params.set('page', String(pageNum))
    if (!append) setLoadingExercises(true)
    setApiError(false)
    fetch(`/api/exercises?${params.toString()}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        const mapped = d?.exercises?.length ? d.exercises.map((e: any) => ({
          id: e.exerciseId, level: e.level, type: e.type, theme: e.theme,
          context: e.context, task: e.task, wordCount: e.wordCount,
          targetConstructions: e.targetConstructions, referenceAnswer: e.referenceAnswer,
        })) : []
        if (append) {
          setDbExercises(prev => [...prev, ...mapped])
        } else {
          setDbExercises(mapped)
        }
        setTotalExercises(d?.total || mapped.length)
        setCurrentPage(pageNum)
      })
      .catch(() => { if (!append) setDbExercises([]); setApiError(true) })
      .finally(() => setLoadingExercises(false))
  }, [filterLevel, filterType])

  useEffect(() => { loadExercises(1, false) }, [loadExercises])

  const filteredExercises = useMemo(() => dbExercises, [dbExercises])

  const hasMore = dbExercises.length < totalExercises

  useEffect(() => {
    setCurrentIndex(0)
    setStudentAnswer('')
    setShowReference(false)
    setAiAnalysis(null)
    setReasoningContent(null)
  }, [filterLevel, filterType])

  // Auto-load more when approaching end
  useEffect(() => {
    if (hasMore && currentIndex >= dbExercises.length - 5 && !loadingExercises) {
      loadExercises(currentPage + 1, true)
    }
  }, [currentIndex, hasMore, dbExercises.length, loadingExercises, currentPage, loadExercises])

  const currentExercise = filteredExercises[currentIndex]
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < filteredExercises.length - 1

  const goNext = useCallback(() => {
    if (hasNext) {
      saveCurrentAnswer()
      setCurrentIndex((i) => i + 1)
      setStudentAnswer('')
      setShowReference(false)
      setAiAnalysis(null)
      setReasoningContent(null)
      startTimeRef.current = Date.now()
    }
  }, [hasNext])

  const goPrev = useCallback(() => {
    if (hasPrev) {
      saveCurrentAnswer()
      setCurrentIndex((i) => i - 1)
      setStudentAnswer('')
      setShowReference(false)
      setAiAnalysis(null)
      setReasoningContent(null)
      startTimeRef.current = Date.now()
    }
  }, [hasPrev])

  const goRandom = useCallback(() => {
    if (filteredExercises.length <= 1) return
    saveCurrentAnswer()
    let next: number
    do { next = Math.floor(Math.random() * filteredExercises.length) } while (next === currentIndex)
    setCurrentIndex(next)
    setStudentAnswer('')
    setShowReference(false)
    setAiAnalysis(null)
    setReasoningContent(null)
    startTimeRef.current = Date.now()
  }, [filteredExercises.length, currentIndex])

  const saveCurrentAnswer = useCallback(() => {
    if (!studentAnswer.trim() || !currentExercise) return
    const duration = Math.round((Date.now() - startTimeRef.current) / 1000)
    const record = {
      id: `local-${Date.now()}`,
      exerciseId: currentExercise.id,
      exerciseType: currentExercise.type,
      exerciseTheme: currentExercise.theme,
      studentAnswer: studentAnswer.trim(),
      wordCount: studentAnswer.split(/\s+/).filter(Boolean).length,
      createdAt: new Date().toISOString(),
      duration,
    }

    // Always save locally
    const saved = localStorage.getItem('cs_practice_records')
    const arr = saved ? JSON.parse(saved) : []
    arr.unshift(record)
    if (arr.length > 200) arr.length = 200 // cap at 200
    localStorage.setItem('cs_practice_records', JSON.stringify(arr))

    // If logged in, save to DB
    if (isAuthenticated) {
      setSaveStatus('saving')
      fetch('/api/user/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseId: currentExercise.id,
          exerciseType: currentExercise.type,
          exerciseTheme: currentExercise.theme,
          studentAnswer: studentAnswer.trim(),
          wordCount: studentAnswer.split(/\s+/).filter(Boolean).length,
          duration,
        }),
      }).then(r => {
        if (r.ok) setSaveStatus('saved')
        else setSaveStatus('idle')
      }).catch(() => setSaveStatus('idle'))
    } else {
      setSaveStatus('saved')
    }
  }, [studentAnswer, currentExercise, isAuthenticated])

  const handleAnalyze = useCallback(async () => {
    if (!studentAnswer.trim() || !currentExercise) return
    setIsAnalyzing(true)
    setAiAnalysis(null)
    setReasoningContent(null)
    setReasoningOpen(true)

    try {
      const skillConfig = getSkillConfig('analyzeAnswer')
      const apiConfig = getAIConfig()

      if (!skillConfig || !apiConfig?.apiKey) {
        throw new Error('API not configured')
      }

      let fullContent = ''
      let fullReasoning = ''
      const skillInput = {
        exerciseType: currentExercise.type,
        exerciseContext: currentExercise.context,
        exerciseTask: currentExercise.task,
        targetConstructions: currentExercise.targetConstructions,
        referenceAnswer: currentExercise.referenceAnswer,
        studentAnswer: studentAnswer.trim(),
      }

      for await (const chunk of callOpenAIStream(skillConfig, skillInput, apiConfig)) {
        if (chunk.type === 'reasoning' && chunk.text) {
          fullReasoning += chunk.text
          setReasoningContent(fullReasoning)
        }
        if (chunk.type === 'content' && chunk.text) {
          if (fullReasoning && reasoningOpen) {
            setReasoningOpen(false)
          }
          fullContent += chunk.text
          setAiAnalysis(fullContent)
        }
      }

      try {
        const parsed = JSON.parse(fullContent)
        const d = parsed
        let md = `# Writing Analysis Report\n\n`
        md += `## Overall Band Score: **${d.overallBand}.0 / 9.0**\n`
        md += `> ${d.summary}\n\n`
        md += `**${d.elevationCount || 0} elevation suggestions · ${d.correctionCount || 0} corrections**\n\n---\n\n`

        if (d.strengths?.length) {
          md += `## Part 1: Strengths\n\n`
          d.strengths.forEach((h: string) => { md += `- ✨ ${h}\n` })
          md += `\n---\n\n`
        }

        // Elevation Table — PRIMARY output, shown first
        if (d.elevatedVersion) {
          md += `## Part 2: Elevated Version (Your Writing, Upgraded)\n\n`
          md += `> ${d.elevatedVersion.replace(/\n/g, '\n> ')}\n\n`
        }
        if (d.elevationTable?.length) {
          md += `### 🚀 Upgrade Breakdown\n\n`
          md += `| Your Original | Elevated | Construction | Why Better |\n|---|---|---|---|\n`
          d.elevationTable.forEach((r: any) => {
            md += `| ${r.original} | ${r.elevated} | **${r.constructionName || r.constructionUsed}** | ${r.whyBetter} |\n`
          })
          md += `\n---\n\n`
        }

        // Corrections — secondary
        if (d.corrections?.length) {
          md += `## Part 3: Corrections (${d.corrections.length} found)\n\n`
          d.corrections.forEach((c: any, i: number) => {
            md += `### ${i + 1}. "${c.original}"\n`
            md += `- ❌ **Error Type:** ${c.errorType}\n`
            md += `- ✅ **Correction:** ${c.correction}\n`
            md += `- 💡 **Reason:** ${c.reason}\n`
            if (c.constructionHint) md += `- 🏗️ **Construction Hint:** ${c.constructionHint}\n`
            md += `\n`
          })
          md += `---\n\n`
        }

        if (d.dimensionScores) {
          md += `## Part 4: Four-Dimension Scores\n\n| Dimension | Score |\n|---|---|\n`
          md += `| Task Response | ${d.dimensionScores.taskResponse}.0 |\n`
          md += `| Coherence & Cohesion | ${d.dimensionScores.coherenceCohesion}.0 |\n`
          md += `| Lexical Resource | ${d.dimensionScores.lexicalResource}.0 |\n`
          md += `| Grammatical Range | ${d.dimensionScores.grammaticalRange}.0 |\n\n---\n\n`
        }
        if (d.nextSteps?.length) {
          md += `## Part 5: Next Steps\n\n`
          d.nextSteps.forEach((s: string, i: number) => { md += `${i + 1}. ${s}\n` })
        }
        setAiAnalysis(md)
      } catch {
        // keep raw streamed content
      }
    } catch (err: any) {
      setAiAnalysis(`## Connection Error\n\n**Error:** ${err.message || 'Failed to connect'}\n\nPlease check API configuration in AI Lab settings.`)
    } finally {
      setIsAnalyzing(false)
    }
  }, [studentAnswer, currentExercise])

  const levelColors: Record<string, string> = {
    junior: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
    senior: 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300',
  }
  const typeLabels: Record<string, string> = {
    D1: 'Micro Continuation',
    D2: 'Long Continuation',
    T1: 'C-E Translation',
  }
  const typeIcons: Record<string, React.ReactNode> = {
    D1: <FileText className="w-4 h-4" />,
    D2: <BookOpen className="w-4 h-4" />,
    T1: <Globe className="w-4 h-4" />,
  }

  if (!currentExercise) {
    if (loadingExercises) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[--lake-blue] mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Loading exercises from database...</p>
          </div>
        </div>
      )
    }
    if (apiError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl font-bold mb-2">Could not load exercises</h1>
            <p className="text-sm text-muted-foreground mb-4">The database connection may be unavailable.</p>
            <button onClick={() => loadExercises(1, false)}
              className="px-4 py-2 rounded-lg bg-[--lake-blue] text-white text-sm">
              Retry
            </button>
          </div>
        </div>
      )
    }
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">No exercises found</h1>
          <p className="text-muted-foreground mb-4">Try clearing the filters.</p>
          <button onClick={() => { setFilterLevel(''); setFilterType('') }}
            className="px-4 py-2 rounded-lg bg-[--lake-blue] text-white text-sm">
            Clear Filters
          </button>
        </div>
      </div>
    )
  }

  const isTranslation = currentExercise.type === 'T1'

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-4">

      {/* ═══════════ Filter Bar + Navigation ═══════════ */}
      <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl border bg-card/50">
        <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)}
          className="px-3 py-1.5 rounded-lg border bg-background text-sm">
          <option value="">All Levels</option>
          {Object.entries(levelNames).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-1.5 rounded-lg border bg-background text-sm">
          <option value="">All Types</option>
          {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        {(filterLevel || filterType) && (
          <button onClick={() => { setFilterLevel(''); setFilterType('') }}
            className="px-3 py-1.5 rounded-lg border hover:bg-accent text-xs text-muted-foreground">
            Clear
          </button>
        )}
        <span className="text-xs text-muted-foreground ml-auto">{currentIndex + 1}/{filteredExercises.length}</span>
        <button onClick={goPrev} disabled={!hasPrev}
          className={cn('p-1.5 rounded-lg transition-colors', hasPrev ? 'hover:bg-accent' : 'opacity-30 cursor-not-allowed')}>
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button onClick={goRandom} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground" title="Random">
          <Shuffle className="w-3.5 h-3.5" />
        </button>
        <button onClick={goNext} disabled={!hasNext}
          className={cn('p-1.5 rounded-lg transition-colors', hasNext ? 'hover:bg-accent' : 'opacity-30 cursor-not-allowed')}>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* ═══════════ Title ═══════════ */}
      <div className="flex items-center gap-2">
        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', levelColors[currentExercise.level])}>
          {levelNames[currentExercise.level]}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-300 font-medium flex items-center gap-1">
          {typeIcons[currentExercise.type]} {typeLabels[currentExercise.type]}
        </span>
        <h1 className="text-lg font-bold ml-1">{currentExercise.theme}</h1>
        <span className="text-xs text-muted-foreground ml-auto">{currentExercise.wordCount}</span>
      </div>

      {/* ═══════════ Two-Column Body (desktop) / Single Column (mobile) ═══════════ */}
      <div className="lg:grid lg:grid-cols-2 lg:gap-6">
        {/* ===== LEFT: Reading Passage + Task ===== */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl border bg-card min-h-0">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              {isTranslation ? 'Chinese Source Text' : 'Reading Passage'}
            </h3>
            <div className="text-sm leading-relaxed whitespace-pre-wrap">{currentExercise.context}</div>
          </div>

          <div className="p-4 rounded-xl border bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
            <h3 className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1.5">Task</h3>
            <p className="text-sm text-amber-800 dark:text-amber-300">{currentExercise.task}</p>
          </div>

          {/* Reference Answer - inline toggle */}
          <button
            onClick={() => setShowReference(!showReference)}
            className="w-full flex items-center justify-between p-3 rounded-xl border hover:bg-accent transition-colors text-sm"
          >
            <span className="flex items-center gap-2 font-medium text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Reference Answer
            </span>
            {showReference ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <AnimatePresence>
            {showReference && currentExercise.referenceAnswer && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="p-4 rounded-xl border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20">
                  <div className="text-sm leading-relaxed whitespace-pre-wrap text-green-800 dark:text-green-300">
                    {currentExercise.referenceAnswer}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ===== RIGHT: Writing Area ===== */}
        <div className="flex flex-col space-y-3 mt-4 lg:mt-0">
          <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {isTranslation ? 'Your Translation' : 'Your Answer'}
          </label>
          <textarea
            value={studentAnswer}
            onChange={(e) => setStudentAnswer(e.target.value)}
            placeholder={isTranslation ? 'Type your English translation here...' : 'Write your continuation here...'}
            className="w-full flex-1 min-h-[380px] lg:min-h-[420px] p-4 rounded-xl border bg-card resize-none text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-[--lake-blue] focus:border-transparent transition-all"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {studentAnswer.split(/\s+/).filter(Boolean).length} words
              </span>
              {saveStatus === 'saved' && <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Saved</span>}
              {saveStatus === 'saving' && <span className="text-xs text-amber-600 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Saving...</span>}
            </div>
            <div className="flex gap-2">
              <button onClick={saveCurrentAnswer}
                className={cn('flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors border hover:bg-accent')}>
                <Save className="w-4 h-4" /> Save
              </button><button
              onClick={handleAnalyze}
              disabled={!studentAnswer.trim() || isAnalyzing}
              className={cn('flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-medium transition-all',
                !studentAnswer.trim() || isAnalyzing
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white hover:shadow-lg hover:-translate-y-0.5')}
            >
              {isAnalyzing ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : <><Sparkles className="w-4 h-4" /> AI Analysis</>}
            </button>
          </div>
            </div>
        </div>
      </div>

      {/* ═══════════ AI Analysis (full width below) ═══════════ */}
      <AnimatePresence>
        {/* Reasoning Panel */}
        {reasoningContent && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20 overflow-hidden">
            <button
              onClick={() => setReasoningOpen(!reasoningOpen)}
              className="w-full flex items-center justify-between px-5 py-3 text-sm font-medium text-amber-700 dark:text-amber-300 hover:bg-amber-100/50 dark:hover:bg-amber-900/20 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                {isAnalyzing ? '💭 Thinking...' : '💭 AI Thinking Process'}
              </span>
              {reasoningOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {reasoningOpen && (
              <div className="px-5 pb-4">
                <pre className="whitespace-pre-wrap text-xs text-amber-800/80 dark:text-amber-300/70 font-mono leading-relaxed max-h-48 overflow-y-auto">{reasoningContent}</pre>
              </div>
            )}
          </motion.div>
        )}
        {aiAnalysis && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-xl border border-violet-200 dark:border-violet-900 bg-white dark:bg-slate-900">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiAnalysis}</ReactMarkdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════ Bottom Navigation ═══════════ */}
      <div className="flex items-center justify-between pt-3 border-t">
        <button onClick={goPrev} disabled={!hasPrev}
          className={cn('flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            hasPrev ? 'hover:bg-accent text-foreground' : 'text-muted-foreground/40 cursor-not-allowed')}>
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>
        <span className="text-xs text-muted-foreground">{currentIndex + 1} of {filteredExercises.length}</span>
        <button onClick={goNext} disabled={!hasNext}
          className={cn('flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            hasNext ? 'hover:bg-accent text-foreground' : 'text-muted-foreground/40 cursor-not-allowed')}>
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default PracticePage
