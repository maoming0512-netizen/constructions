'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  PenLine,
  Search,
  Sparkles,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

interface ConstructionCategory {
  id: string
  label: string
  count: number
}

interface StudioConstruction {
  id: string
  code: string
  construction: string
  meaning_zh: string
  communicative_function: string[]
  usage_note: string
  example_sentence: string
  school_level: string
  fine_level: string
  construction_type: string
  topic_tags: string[]
  emotional_tags: string[]
}

interface GeneratedArticle {
  id: string
  title: string
  topic: string
  tone: string
  article: string
  highlighted_constructions: Array<{
    construction_id: string
    construction: string
    occurrences: string[]
  }>
  teaching_notes: string[]
  construction_usage_explanations: Array<{
    construction_id: string
    construction: string
    explanation_zh: string
  }>
  selected_constructions: StudioConstruction[]
}

function normalizeLabel(text: string) {
  return text.replace(/_/g, ' ')
}

function storeLocalArticle(article: GeneratedArticle) {
  const saved = localStorage.getItem('cs_construction_articles')
  const rows = saved ? JSON.parse(saved) : []
  rows.unshift({ ...article, createdAt: new Date().toISOString() })
  if (rows.length > 50) rows.length = 50
  localStorage.setItem('cs_construction_articles', JSON.stringify(rows))
}

function HighlightedArticle({ article }: { article: GeneratedArticle }) {
  const highlights = useMemo(() => {
    const phrases = article.highlighted_constructions
      .flatMap((item) => item.occurrences?.length ? item.occurrences : [item.construction])
      .filter(Boolean)
      .sort((a, b) => b.length - a.length)
    return Array.from(new Set(phrases))
  }, [article])

  if (!highlights.length) {
    return <p className="whitespace-pre-wrap leading-8 text-[15px] text-slate-700">{article.article}</p>
  }

  const escaped = highlights.map((phrase) => phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const regex = new RegExp(`(${escaped.join('|')})`, 'gi')
  const parts = article.article.split(regex)

  return (
    <p className="whitespace-pre-wrap leading-8 text-[15px] text-slate-700">
      {parts.map((part, index) => {
        const isHit = highlights.some((phrase) => phrase.toLowerCase() === part.toLowerCase())
        return isHit ? (
          <mark key={`${part}-${index}`} className="rounded-sm bg-[#fff1bd] px-1 py-0.5 text-[#7a4b00] underline decoration-[#d59b21] decoration-2 underline-offset-4">
            {part}
          </mark>
        ) : part
      })}
    </p>
  )
}

export default function RSSReaderPage() {
  const { isAuthenticated } = useAuth()
  const [categories, setCategories] = useState<ConstructionCategory[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [constructions, setConstructions] = useState<StudioConstruction[]>([])
  const [selected, setSelected] = useState<StudioConstruction[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [topicDirection, setTopicDirection] = useState('')
  const [generating, setGenerating] = useState(false)
  const [generatedArticle, setGeneratedArticle] = useState<GeneratedArticle | null>(null)
  const [message, setMessage] = useState('')
  const [dayKey, setDayKey] = useState('')

  useEffect(() => {
    fetch('/api/construction-studio/constructions?mode=categories&all=true')
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories || [])
        setDayKey(data.dayKey || '')
      })
      .catch(() => setCategories([{ id: 'recommended', label: 'Recommended', count: 0 }]))
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    const params = new URLSearchParams({
      page: String(page),
      pageSize: '12',
      category: 'recommended',
      search,
      all: 'true',
    })
    fetch(`/api/construction-studio/constructions?${params.toString()}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        setConstructions(data.constructions || [])
        setHasMore(Boolean(data.hasMore))
        setDayKey(data.dayKey || '')
      })
      .catch(() => {
        if (!controller.signal.aborted) setConstructions([])
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [page, search])

  const toggleSelect = useCallback((item: StudioConstruction) => {
    setMessage('')
    setSelected((current) => {
      if (current.some((row) => row.id === item.id)) return current.filter((row) => row.id !== item.id)
      if (current.length >= 5) {
        setMessage('Choose up to 5 constructions so the article stays natural.')
        return current
      }
      return [...current, item]
    })
  }, [])

  const generateArticle = useCallback(async () => {
    if (!selected.length) {
      setMessage('Select at least one construction first.')
      return
    }
    setGenerating(true)
    setMessage('')
    try {
      const res = await fetch('/api/construction-studio/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedConstructionIds: selected.map((item) => item.id),
          topicDirection,
          studentLevel: 'senior',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setGeneratedArticle(data.article)
      if (data.storage === 'local') storeLocalArticle(data.article)
      setMessage(data.storage === 'account' ? 'Saved to your account.' : 'Saved locally in this browser.')
    } catch (error: any) {
      setMessage(error.message || 'Generation failed. Please try again.')
    } finally {
      setGenerating(false)
    }
  }, [selected, topicDirection])

  return (
    <main className="relative isolate min-h-[calc(100vh-4rem)] overflow-x-hidden bg-[#f8f6f1] pt-20 text-slate-900">
      <div className="pointer-events-none absolute inset-x-0 top-16 -z-10 h-[420px] bg-[radial-gradient(circle_at_18%_20%,rgba(255,231,179,0.55),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(174,219,208,0.42),transparent_30%),linear-gradient(180deg,#fbf7ed_0%,rgba(248,246,241,0)_100%)]" />
      <section className="relative z-10 mx-auto grid w-full max-w-6xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <div className="rounded-[18px] border border-[#e6dfd2] bg-white/85 p-5 shadow-sm backdrop-blur">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9b6b2f]">Construction Studio</p>
                <h1 className="mt-2 font-display text-3xl font-semibold tracking-normal text-slate-950">AI Expression Workshop</h1>
              </div>
              <div className="rounded-full bg-[#e9f2ee] p-2 text-[#2e7667]">
                <BookOpen className="h-5 w-5" />
              </div>
            </div>
            <p className="text-sm leading-6 text-slate-600">
              Select meaningful constructions, then generate a short reading piece that shows how they work in real communication.
            </p>
            <div className="mt-4 rounded-[14px] bg-[#f4ead9] px-3 py-2 text-xs leading-5 text-[#7a4b00]">
              Recommended constructions refresh every midnight. Today focuses on high-frequency, easy-to-misuse expression patterns.
            </div>
          </div>

          <div className="rounded-[18px] border border-[#e6dfd2] bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Selected Constructions</h2>
              <span className="rounded-full bg-[#f4ead9] px-2.5 py-1 text-xs font-medium text-[#8a5a1e]">{selected.length}/5</span>
            </div>
            <div className="space-y-2">
              {selected.length === 0 ? (
                <p className="rounded-[14px] border border-dashed border-[#ded3c0] p-4 text-sm text-slate-500">Choose 1 to 5 constructions from the library.</p>
              ) : selected.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 rounded-[14px] bg-[#f8f6f1] px-3 py-2">
                  <span className="text-sm font-semibold text-slate-800">{item.construction}</span>
                  <button onClick={() => toggleSelect(item)} className="rounded-full p-1 text-slate-500 hover:bg-white hover:text-slate-900" aria-label="Remove construction">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <textarea
              value={topicDirection}
              onChange={(event) => setTopicDirection(event.target.value)}
              className="mt-4 min-h-20 w-full resize-none rounded-[8px] border border-[#ded3c0] bg-white px-3 py-2 text-sm outline-none transition focus:border-[#2e7667] focus:ring-2 focus:ring-[#2e7667]/15"
              placeholder="Optional topic direction, such as teamwork, online communication, study pressure..."
            />
            <button
              onClick={generateArticle}
              disabled={generating || selected.length === 0}
              className={cn(
                'mt-3 flex w-full items-center justify-center gap-2 rounded-[14px] px-4 py-3 text-sm font-semibold text-white transition',
                generating || selected.length === 0 ? 'bg-slate-300' : 'bg-[#2e7667] hover:bg-[#245f53]'
              )}
            >
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Generate Article
            </button>
            {message && <p className="mt-3 text-xs text-slate-500">{message}</p>}
            {!isAuthenticated && <p className="mt-2 text-xs text-slate-500">Anonymous articles are stored locally in this browser.</p>}
          </div>
        </aside>

        <section className="space-y-5">
          <div className="rounded-[18px] border border-[#e6dfd2] bg-white/90 p-4 shadow-sm backdrop-blur">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-[8px] border border-[#ded3c0] bg-[#fbfaf7] px-3 py-2">
                <Search className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => {
                    setPage(1)
                    setSearch(event.target.value)
                  }}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                  placeholder="Search constructions, meanings, examples..."
                />
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1} className="rounded-[8px] border border-[#ded3c0] p-2 text-slate-600 disabled:opacity-40" aria-label="Previous page">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="w-16 text-center text-xs font-medium text-slate-500">Page {page}</span>
                <button onClick={() => setPage((value) => value + 1)} disabled={!hasMore} className="rounded-[8px] border border-[#ded3c0] p-2 text-slate-600 disabled:opacity-40" aria-label="Next page">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#2e7667] bg-[#e9f2ee] px-3 py-1.5 text-xs font-medium text-[#245f53]">
                Recommended Today
              </span>
              <span className="text-xs text-slate-500">
                {dayKey ? `${dayKey} / ` : ''}{categories[0]?.count || 0} curated constructions / refreshed at 00:00
              </span>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-56 animate-pulse rounded-[18px] border border-[#e6dfd2] bg-white" />
              ))
            ) : constructions.map((item) => {
              const isSelected = selected.some((row) => row.id === item.id)
              return (
                <button
                  key={item.id}
                  onClick={() => toggleSelect(item)}
                  className={cn(
                    'group flex min-h-56 flex-col rounded-[18px] border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md',
                    isSelected ? 'border-[#2e7667] ring-2 ring-[#2e7667]/20' : 'border-[#e6dfd2]'
                  )}
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold leading-snug text-slate-950 decoration-[#d59b21] decoration-2 underline-offset-4 group-hover:underline">
                      {item.construction}
                    </h3>
                    <span className={cn('grid h-6 w-6 shrink-0 place-items-center rounded-full border', isSelected ? 'border-[#2e7667] bg-[#2e7667] text-white' : 'border-[#d8ccb9] text-transparent')}>
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <p className="text-sm font-medium text-[#8a5a1e]">{item.meaning_zh || 'Natural expression construction'}</p>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{item.usage_note || 'Use this construction to express meaning naturally in communication.'}</p>
                  <p className="mt-3 line-clamp-2 border-l-2 border-[#d59b21] pl-3 text-sm italic leading-6 text-slate-700">{item.example_sentence}</p>
                  <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
                    {[item.construction_type, item.school_level, ...item.communicative_function, ...item.emotional_tags].filter(Boolean).slice(0, 4).map((tag) => (
                      <span key={tag} className="rounded-full bg-[#f4ead9] px-2 py-1 text-[11px] font-medium text-[#8a5a1e]">{normalizeLabel(tag)}</span>
                    ))}
                  </div>
                </button>
              )
            })}
          </div>

          {generatedArticle && (
            <motion.article
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[18px] border border-[#e0d5c3] bg-white p-5 shadow-sm sm:p-7"
            >
              <div className="mb-5 flex flex-col gap-3 border-b border-[#eee5d8] pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9b6b2f]">{generatedArticle.topic}</p>
                  <h2 className="mt-2 font-display text-3xl font-semibold tracking-normal text-slate-950">{generatedArticle.title}</h2>
                  <p className="mt-2 text-sm text-slate-500">{generatedArticle.tone}</p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-[#e9f2ee] px-3 py-1.5 text-xs font-medium text-[#245f53]">
                  <PenLine className="h-3.5 w-3.5" />
                  Highlighted reading
                </div>
              </div>

              <HighlightedArticle article={generatedArticle} />

              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {generatedArticle.construction_usage_explanations?.map((item) => (
                  <div key={item.construction_id} className="rounded-[14px] bg-[#f8f6f1] p-4">
                    <p className="text-sm font-semibold text-slate-900">{item.construction}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{item.explanation_zh}</p>
                  </div>
                ))}
              </div>
            </motion.article>
          )}
        </section>
      </section>
    </main>
  )
}
