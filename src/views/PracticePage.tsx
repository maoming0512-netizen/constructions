'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Loader2,
  PenLine,
  RefreshCw,
  Save,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

type PracticeTopic = {
  id: string
  label: string
  category: string
  description: string
  minLevel?: string
  maxLevel?: string
  communicativeFunctions?: string[]
  emotionalFunctions?: string[]
  metadata?: any
}

type PracticeGoal = {
  id: string
  label: string
  description: string
  communicativePurpose: string
  recommendedExerciseTypes?: string[]
}

type PracticeLevel = {
  value: string
  label: string
  description: string
}

type Exercise = {
  id?: string
  exerciseId: string
  level: string
  type: string
  theme: string
  context: string
  task: string
  wordCount: string
  targetConstructions: string
  referenceAnswer: string
  source?: string
  qualityStatus?: string
  exerciseType?: string
  metadata?: any
  topic?: PracticeTopic
  goal?: PracticeGoal
}

function words(text: string) {
  return text.split(/\s+/).filter(Boolean).length
}

function levelAllowed(level: string, item?: { minLevel?: string | null; maxLevel?: string | null }) {
  if (!item) return true
  const order = ['primary', 'junior', 'senior', 'college', 'advanced']
  const value = order.indexOf(level)
  const min = item.minLevel ? order.indexOf(item.minLevel) : -1
  const max = item.maxLevel ? order.indexOf(item.maxLevel) : -1
  if (value < 0) return true
  if (min >= 0 && value < min) return false
  if (max >= 0 && value > max) return false
  return true
}

function saveLocalGenerated(exercise: Exercise) {
  try {
    const raw = localStorage.getItem('cs_local_generated_exercises')
    const list = raw ? JSON.parse(raw) : []
    list.unshift({ ...exercise, savedAt: new Date().toISOString() })
    if (list.length > 30) list.length = 30
    localStorage.setItem('cs_local_generated_exercises', JSON.stringify(list))
  } catch {
    // Browser storage may be unavailable; the exercise is still usable in the current session.
  }
}

function HighlightedModelSentence({ sentence, construction }: { sentence: string; construction: string }) {
  if (!sentence || !construction) return <>{sentence}</>
  const normalized = construction
    .replace(/\s+/g, ' ')
    .replace(/\([^)]*\)/g, '')
    .trim()
  if (!normalized) return <>{sentence}</>

  const escaped = normalized
    .split('...')
    .map((part) => part.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .filter(Boolean)
    .join('[\\s\\S]{0,120}?')
    .replace(/\\\//g, '|')

  if (!escaped) return <>{sentence}</>
  const regex = new RegExp(`(${escaped})`, 'i')
  const parts = sentence.split(regex)
  return (
    <>
      {parts.map((part, index) => (
        regex.test(part) ? (
          <mark key={`${part}-${index}`} className="rounded-sm bg-amber-100 px-1 py-0.5 text-amber-900 underline decoration-amber-500 decoration-2 underline-offset-4">
            {part}
          </mark>
        ) : part
      ))}
    </>
  )
}

type ParsedConstructionContext = {
  targetConstruction?: string
  meaning?: string
  usage?: string
  tone?: string
  commonPitfall?: string
  commonScene?: string
  modelSentence?: string
  modelSentenceChinese?: string
  nowTry?: string
}

function parseConstructionContext(context: string): ParsedConstructionContext | null {
  const lines = context.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  const looksLikeCard = lines.some((line) => /^construction card$/i.test(line))
    || lines.some((line) => /^target construction:/i.test(line))
  if (!looksLikeCard) return null

  const parsed: ParsedConstructionContext = {}
  for (const line of lines) {
    const separator = line.indexOf(':')
    if (separator < 0) continue
    const key = line.slice(0, separator).trim().toLowerCase()
    const value = line.slice(separator + 1).trim()
    if (!value) continue

    if (key === 'target construction') parsed.targetConstruction = value
    if (key === 'meaning' || key === 'chinese meaning') {
      if (parsed.modelSentence) parsed.modelSentenceChinese = value
      else parsed.meaning = value
    }
    if (key === 'usage' || key === 'communicative usage') parsed.usage = value
    if (key === 'tone') parsed.tone = value
    if (key === 'common pitfall') parsed.commonPitfall = value
    if (key === 'common scene') parsed.commonScene = value
    if (key === 'model sentence') parsed.modelSentence = value
    if (key === 'model sentence chinese') parsed.modelSentenceChinese = value
    if (key === 'now try') parsed.nowTry = value
  }

  return parsed.targetConstruction ? parsed : null
}

function PracticeContextBlock({
  context,
  parsed,
  constructionHint,
}: {
  context: string
  parsed: ParsedConstructionContext | null
  constructionHint?: string
}) {
  if (parsed) {
    const target = parsed.targetConstruction || constructionHint || ''
    return (
      <div className="space-y-4">
        <div className="rounded-[24px] border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-emerald-50/70 p-5">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">Target construction</p>
          <div className="inline-flex max-w-full rounded-2xl bg-white px-4 py-3 text-xl font-semibold leading-snug text-slate-950 shadow-sm ring-1 ring-amber-200 underline decoration-amber-400 decoration-2 underline-offset-8">
            {target}
          </div>
          {parsed.meaning && <p className="mt-3 text-sm font-medium leading-6 text-amber-800">{parsed.meaning}</p>}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {parsed.usage && (
            <div className="rounded-[20px] border border-slate-100 bg-white/85 p-4">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Usage</p>
              <p className="text-sm leading-6 text-slate-700">{parsed.usage}</p>
            </div>
          )}
          {parsed.commonScene && (
            <div className="rounded-[20px] border border-emerald-100 bg-emerald-50/60 p-4">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">Scene</p>
              <p className="text-sm leading-6 text-emerald-900">{parsed.commonScene}</p>
            </div>
          )}
          {parsed.tone && (
            <div className="rounded-[20px] border border-sky-100 bg-sky-50/60 p-4">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700">Tone</p>
              <p className="text-sm leading-6 text-sky-900">{parsed.tone}</p>
            </div>
          )}
        </div>

        {parsed.commonPitfall && (
          <div className="rounded-[20px] border border-rose-100 bg-rose-50/70 p-4">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-700">Common pitfall</p>
            <p className="text-sm leading-6 text-rose-900">{parsed.commonPitfall}</p>
          </div>
        )}

        {parsed.modelSentence && (
          <div className="rounded-[24px] border border-amber-100 bg-white p-5 shadow-sm">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-700">Model sentence</p>
            <p className="text-lg leading-9 text-slate-900">
              <HighlightedModelSentence sentence={parsed.modelSentence} construction={target} />
            </p>
            {parsed.modelSentenceChinese && <p className="mt-2 text-sm leading-6 text-slate-500">{parsed.modelSentenceChinese}</p>}
          </div>
        )}

        {parsed.nowTry && (
          <div className="rounded-[24px] border border-sky-100 bg-sky-50/70 p-5">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700">Now try</p>
            <p className="text-base font-medium leading-8 text-slate-900">{parsed.nowTry}</p>
          </div>
        )}
      </div>
    )
  }

  const paragraphs = context.split(/\n{2,}/).map((item) => item.trim()).filter(Boolean)
  return (
    <div className="rounded-[24px] border border-slate-100 bg-slate-50/70 p-5">
      <div className="space-y-4 text-[15px] leading-8 text-slate-700">
        {paragraphs.length ? paragraphs.map((paragraph, index) => (
          <p key={index} className="whitespace-pre-line">{paragraph}</p>
        )) : <p>{context}</p>}
      </div>
    </div>
  )
}

function formatFeedbackMarkdown(d: any) {
  let md = `## Expression Upgrade\n\n${d.summary || 'Here are ways to make your expression clearer and more natural.'}\n\n`
  if (d.strengths?.length) {
    md += `### What already works\n\n`
    d.strengths.slice(0, 2).forEach((item: string) => {
      md += `- ${item}\n`
    })
    md += `\n`
  }
  if (d.elevationTable?.length) {
    d.elevationTable.forEach((row: any) => {
      md += `**Original:** ${row.original}\n\n`
      md += `**Better:** ${row.elevated}\n\n`
      md += `**Useful construction:** ${row.constructionName || row.constructionUsed}\n\n`
      md += `**Why it works:** ${row.whyBetter}\n\n`
      if (row.transferExample) md += `**Try it again:** ${row.transferExample}\n\n`
      md += `---\n\n`
    })
  }
  if (d.elevatedVersion) md += `## Upgraded Version\n\n${d.elevatedVersion}\n\n`
  if (d.corrections?.length) {
    md += `## Helpful Corrections\n\n`
    d.corrections.slice(0, 3).forEach((row: any) => {
      md += `- ${row.original} -> ${row.correction}. ${row.reason}\n`
    })
  }
  return md
}

function parseSseChunk(buffer: string, onData: (payload: any) => void) {
  const parts = buffer.split('\n\n')
  const rest = parts.pop() || ''
  for (const part of parts) {
    const line = part.split('\n').find((item) => item.startsWith('data: '))
    if (!line) continue
    try {
      onData(JSON.parse(line.slice(6)))
    } catch {
      // Ignore malformed heartbeat or partial lines.
    }
  }
  return rest
}

export default function PracticePage() {
  const { isAuthenticated } = useAuth()
  const startTimeRef = useRef(Date.now())

  const [topics, setTopics] = useState<PracticeTopic[]>([])
  const [goals, setGoals] = useState<PracticeGoal[]>([])
  const [levels, setLevels] = useState<PracticeLevel[]>([])
  const [selectedTopicId, setSelectedTopicId] = useState('')
  const [selectedGoalId, setSelectedGoalId] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('')
  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [studentAnswer, setStudentAnswer] = useState('')
  const [feedback, setFeedback] = useState('')
  const [friendlyMessage, setFriendlyMessage] = useState('')
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [loadingExercise, setLoadingExercise] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  useEffect(() => {
    setLoadingOptions(true)
    fetch('/api/practice/options')
      .then((res) => res.ok ? res.json() : Promise.reject(new Error('options')))
      .then((data) => {
        const apiTopics = data.topics || []
        const apiGoals = data.goals || []
        const apiLevels = data.levels || []
        setTopics(apiTopics)
        setGoals(apiGoals)
        setLevels(apiLevels)
        setSelectedTopicId((current) => current || apiTopics[0]?.id || '')
        setSelectedGoalId((current) => current || apiGoals[0]?.id || '')
        setSelectedLevel((current) => current || apiLevels[0]?.value || 'senior')
      })
      .catch(() => setFriendlyMessage('We could not load the learning options right now. Please try again in a moment.'))
      .finally(() => setLoadingOptions(false))
  }, [])

  const selectedTopic = useMemo(() => topics.find((topic) => topic.id === selectedTopicId), [topics, selectedTopicId])
  const selectedGoal = useMemo(() => goals.find((goal) => goal.id === selectedGoalId), [goals, selectedGoalId])

  const availableTopics = useMemo(
    () => topics.filter((topic) => levelAllowed(selectedLevel, topic)),
    [topics, selectedLevel]
  )

  const loadRecommendedExercise = useCallback(() => {
    if (!selectedTopicId || !selectedGoalId || !selectedLevel) return
    setLoadingExercise(true)
    setFriendlyMessage('')
    setFeedback('')
    setStudentAnswer('')
    const params = new URLSearchParams({ topicId: selectedTopicId, goalId: selectedGoalId, level: selectedLevel })
    fetch(`/api/exercises/recommend?${params.toString()}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          setExercise(null)
          setFriendlyMessage(data.message || data.error || 'This topic needs more suitable constructions. Please choose another goal for now.')
          return
        }
        setExercise(data.exercise)
        startTimeRef.current = Date.now()
      })
      .catch(() => {
        setExercise(null)
        setFriendlyMessage('We could not load an official exercise right now. Please try again shortly.')
      })
      .finally(() => setLoadingExercise(false))
  }, [selectedTopicId, selectedGoalId, selectedLevel])

  useEffect(() => {
    if (!loadingOptions) loadRecommendedExercise()
  }, [loadingOptions, loadRecommendedExercise])

  const generateExercise = useCallback(() => {
    if (!selectedTopicId || !selectedGoalId || !selectedLevel) return
    setGenerating(true)
    setFriendlyMessage('')
    fetch('/api/ai/generate-writing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topicId: selectedTopicId, goalId: selectedGoalId, level: selectedLevel, studentLevel: selectedLevel }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (!res.ok || !data.exercise) {
          setFriendlyMessage(data.friendlyMessage || data.error || 'The AI response was not stable enough, so we did not publish this exercise.')
          return
        }
        setExercise(data.exercise)
        if (!isAuthenticated) saveLocalGenerated(data.exercise)
        startTimeRef.current = Date.now()
      })
      .catch(() => setFriendlyMessage('The generation service is busy. You can continue with official exercises for now.'))
      .finally(() => setGenerating(false))
  }, [selectedTopicId, selectedGoalId, selectedLevel, isAuthenticated])

  const saveCurrentAnswer = useCallback(() => {
    if (!studentAnswer.trim() || !exercise) return
    const record = {
      id: `local-${Date.now()}`,
      exerciseId: exercise.exerciseId,
      exerciseType: exercise.exerciseType || exercise.type,
      exerciseTheme: exercise.theme,
      studentAnswer: studentAnswer.trim(),
      wordCount: words(studentAnswer),
      createdAt: new Date().toISOString(),
      duration: Math.round((Date.now() - startTimeRef.current) / 1000),
    }

    try {
      const raw = localStorage.getItem('cs_practice_records')
      const list = raw ? JSON.parse(raw) : []
      list.unshift(record)
      if (list.length > 200) list.length = 200
      localStorage.setItem('cs_practice_records', JSON.stringify(list))
    } catch {
      setFriendlyMessage('Your browser could not save locally, but your answer is still visible here.')
    }

    if (isAuthenticated) {
      setSaveStatus('saving')
      fetch('/api/user/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      }).then((res) => setSaveStatus(res.ok ? 'saved' : 'idle')).catch(() => setSaveStatus('idle'))
    } else {
      setSaveStatus('saved')
    }
  }, [studentAnswer, exercise, isAuthenticated])

  const analyzeAnswer = useCallback(() => {
    if (!studentAnswer.trim() || !exercise) return
    saveCurrentAnswer()
    setAnalyzing(true)
    setFeedback('## Live AI analysis\n\nConnecting to the construction feedback engine...')
    fetch('/api/ai/analyze-answer/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        exerciseType: exercise.exerciseType || exercise.type,
        exerciseContext: exercise.context,
        exerciseTask: exercise.task,
        targetConstructions: exercise.targetConstructions,
        referenceAnswer: exercise.referenceAnswer,
        studentAnswer: studentAnswer.trim(),
      }),
    })
      .then(async (res) => {
        if (!res.ok || !res.body) {
          throw new Error('We could not start streaming feedback right now.')
        }

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let liveText = ''

        const handlePayload = (payload: any) => {
          if (payload.type === 'status') {
            liveText += `\n\n${payload.text}`
            setFeedback(`## Live AI analysis\n${liveText}`)
          }
          if (payload.type === 'content' && payload.text) {
            liveText += payload.text
            setFeedback(`## Live AI analysis\n\nThe model is streaming structured feedback now...\n\n\`\`\`json\n${liveText.slice(-2400)}\n\`\`\``)
          }
          if (payload.type === 'done' && payload.data) {
            setFeedback(formatFeedbackMarkdown(payload.data))
            if (payload.error) setFriendlyMessage(payload.error)
          }
          if (payload.type === 'error') {
            setFriendlyMessage(payload.text || 'We could not analyze this answer right now.')
          }
        }

        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          buffer = parseSseChunk(buffer, handlePayload)
        }
        if (buffer) parseSseChunk(`${buffer}\n\n`, handlePayload)
      })
      .catch(() => {
        setFriendlyMessage('Feedback is temporarily unavailable. Your writing has not been lost.')
      })
      .finally(() => setAnalyzing(false))
  }, [studentAnswer, exercise, saveCurrentAnswer])
  const analyzeAnswerLegacy = useCallback(() => {
    if (!studentAnswer.trim() || !exercise) return
    saveCurrentAnswer()
    setAnalyzing(true)
    setFeedback('')
    fetch('/api/ai/analyze-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        exerciseType: exercise.exerciseType || exercise.type,
        exerciseContext: exercise.context,
        exerciseTask: exercise.task,
        targetConstructions: exercise.targetConstructions,
        referenceAnswer: exercise.referenceAnswer,
        studentAnswer: studentAnswer.trim(),
      }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (!res.ok || !data.data) {
          setFriendlyMessage(data.error || 'We could not analyze this answer right now.')
          return
        }
        setFeedback(formatFeedbackMarkdown(data.data))
      })
      .catch(() => setFriendlyMessage('Feedback is temporarily unavailable. Your writing has not been lost.'))
      .finally(() => setAnalyzing(false))
  }, [studentAnswer, exercise, saveCurrentAnswer])

  const targetConstructions = exercise?.metadata?.target_constructions || []
  const parsedContext = useMemo(
    () => exercise?.context ? parseConstructionContext(exercise.context) : null,
    [exercise?.context]
  )
  const showConstructionCards = targetConstructions.length > 0 && !parsedContext

  if (loadingOptions) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[--lake-blue]" />
      </div>
    )
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-[#f7fbf8]">
      <div className="absolute inset-x-0 top-0 -z-10 h-80 bg-[url('/hero-landscape.jpg')] bg-cover bg-center opacity-20" />
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(135deg,#fffaf0_0%,#eef9fb_46%,#f2fbf2_100%)]" />

      <main className="mx-auto w-full max-w-[1380px] px-4 py-8 sm:px-6">
        <section className="mb-6 rounded-[28px] border border-white/80 bg-white/80 p-5 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="min-w-0 flex-1">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[--lake-blue]">Writing Studio</p>
              <h1 className="font-display text-3xl text-slate-800">Choose a real communication scene</h1>
            </div>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Level
              <select value={selectedLevel} onChange={(event) => setSelectedLevel(event.target.value)} className="min-w-44 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
                {levels.map((level) => <option key={level.value} value={level.value}>{level.label}</option>)}
              </select>
            </label>
            <button onClick={loadRecommendedExercise} disabled={loadingExercise} className="inline-flex items-center gap-2 rounded-2xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">
              {loadingExercise ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Load Exercise
            </button>
          </div>
        </section>

        <section className="mb-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] border border-white/80 bg-white/80 p-5 shadow-sm backdrop-blur">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <BookOpen className="w-4 h-4 text-[--lake-blue]" />
              Topics from the teaching database
            </div>
            <div className="space-y-3">
              <select
                value={selectedTopicId}
                onChange={(event) => setSelectedTopicId(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[--lake-blue] focus:ring-2 focus:ring-sky-100"
              >
                {availableTopics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.label}
                  </option>
                ))}
              </select>
              {selectedTopic && (
                <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <h2 className="text-sm font-semibold text-slate-900">{selectedTopic.label}</h2>
                    <span className="rounded-full bg-white px-2 py-1 text-[11px] text-sky-700">{selectedTopic.category}</span>
                  </div>
                  <p className="text-sm leading-6 text-slate-600">{selectedTopic.description}</p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/80 bg-white/80 p-5 shadow-sm backdrop-blur">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <PenLine className="w-4 h-4 text-[--lake-green]" />
              Writing goals
            </div>
            <div className="space-y-3">
              <select
                value={selectedGoalId}
                onChange={(event) => setSelectedGoalId(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[--lake-green] focus:ring-2 focus:ring-emerald-100"
              >
                {goals.map((goal) => (
                  <option key={goal.id} value={goal.id}>
                    {goal.label}
                  </option>
                ))}
              </select>
              {selectedGoal && (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                  <h2 className="mb-1 text-sm font-semibold text-slate-900">{selectedGoal.label}</h2>
                  <p className="text-sm leading-6 text-slate-600">{selectedGoal.description}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {friendlyMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{friendlyMessage}</span>
          </div>
        )}

        {!exercise ? (
          <section className="rounded-[28px] border border-white/80 bg-white/80 p-8 text-center shadow-sm">
            <h2 className="mb-2 font-display text-2xl text-slate-800">No approved official exercise yet</h2>
            <p className="mx-auto mb-5 max-w-2xl text-sm leading-7 text-slate-600">This combination may need a more carefully prepared exercise. You can try another goal, or ask the controlled generation pipeline to prepare a draft.</p>
            <button onClick={generateExercise} disabled={generating} className="inline-flex items-center gap-2 rounded-2xl bg-[--lake-blue] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Generate a Quality Draft
            </button>
          </section>
        ) : (
          <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.82fr)]">
            <div className="space-y-4">
              <div className="rounded-[28px] border border-white/80 bg-white/90 p-6 shadow-sm">
                <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-700">{selectedTopic?.label || exercise.theme}</span>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">{selectedGoal?.label}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{exercise.metadata?.exercise_type_label || exercise.exerciseType || exercise.type}</span>
                  <span className="ml-auto text-slate-500">{exercise.wordCount}</span>
                </div>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {parsedContext ? 'Construction card' : 'Context'}
                </h2>
                <PracticeContextBlock
                  context={exercise.context}
                  parsed={parsedContext}
                  constructionHint={targetConstructions[0]?.template || targetConstructions[0]?.construction}
                />
              </div>

              {showConstructionCards && (
                <div className="grid gap-3 md:grid-cols-2">
                  {targetConstructions.map((item: any) => (
                    <article key={item.id || item.code} className="rounded-[24px] border border-emerald-100 bg-white/90 p-4 shadow-sm">
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <h3 className="text-base font-semibold text-slate-900 underline decoration-amber-400 decoration-2 underline-offset-4">{item.construction}</h3>
                        <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] text-emerald-700">{item.code}</span>
                      </div>
                      <p className="mb-2 text-xs leading-5 text-emerald-700">{item.meaning_zh}</p>
                      <div className="mb-3 rounded-2xl bg-amber-50/70 p-3">
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-700">Model sentence</p>
                        <p className="text-sm leading-7 text-slate-800">
                          <HighlightedModelSentence sentence={item.example} construction={item.template || item.construction} />
                        </p>
                      </div>
                      <div className="space-y-1 text-xs leading-5 text-slate-500">
                        {item.communicative_function?.length > 0 && <p>Usage: {item.communicative_function.join(', ')}</p>}
                        {item.usage_scene && <p>Scene: {item.usage_scene}</p>}
                        {item.emotional_function?.length > 0 && <p>Tone: {item.emotional_function.join(', ')}</p>}
                        {item.common_error && <p className="text-rose-700">Common pitfall: {item.common_error}</p>}
                      </div>
                      {item.why_useful && <p className="mt-3 text-xs leading-5 text-slate-500">{item.why_useful}</p>}
                    </article>
                  ))}
                </div>
              )}

              <div className="rounded-[28px] border border-amber-100 bg-amber-50/80 p-5 shadow-sm">
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">Task</h2>
                <p className="text-sm leading-7 text-amber-900">{exercise.task}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-sm">
                <label className="mb-3 block text-sm font-semibold text-slate-700">Your writing</label>
                <textarea value={studentAnswer} onChange={(event) => setStudentAnswer(event.target.value)}
                  className="min-h-[420px] w-full resize-none rounded-3xl border border-slate-200 bg-white p-5 text-base leading-8 outline-none focus:border-[--lake-blue] focus:ring-2 focus:ring-sky-100"
                  placeholder="Write your answer here..." />
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-slate-500">{words(studentAnswer)} words</span>
                  <div className="flex gap-2">
                    <button onClick={saveCurrentAnswer} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">
                      <Save className="h-4 w-4" />
                      {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : 'Save'}
                    </button>
                    <button onClick={analyzeAnswer} disabled={!studentAnswer.trim() || analyzing} className="inline-flex items-center gap-2 rounded-2xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                      {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      Improve Expression
                    </button>
                  </div>
                </div>
              </div>

              {exercise.referenceAnswer && (
                <details className="rounded-[24px] border border-emerald-100 bg-emerald-50/70 p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-emerald-800">Reference answer</summary>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-emerald-900">{exercise.referenceAnswer}</p>
                </details>
              )}

              {feedback && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-[28px] border border-sky-100 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <CheckCircle2 className="h-4 w-4 text-[--lake-blue]" />
                    Construction-upgrade feedback
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{feedback}</ReactMarkdown>
                  </div>
                </motion.div>
              )}
            </div>
          </section>
        )}

        <div className="mt-8 flex justify-end">
          <button onClick={generateExercise} disabled={generating} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50">
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
            Prepare another draft
          </button>
        </div>
      </main>
    </div>
  )
}
