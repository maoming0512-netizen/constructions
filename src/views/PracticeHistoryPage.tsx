'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { Clock, BookOpen, ArrowRight, FileText, BarChart3, Award, Calendar, Trash2, Rss, Sparkles, Globe, Users, X } from 'lucide-react'
import { cn } from '@/lib/utils'

/* ─────────────────────── Types ─────────────────────── */
interface PracticeRecord {
  id: string
  exerciseId: string
  exerciseType: string
  exerciseTheme: string
  studentAnswer: string
  wordCount: number
  score: number | null
  duration: number | null
  createdAt: string
}

interface RSSAnalysisRecord {
  id: string
  feedSource: string
  articleTitle: string
  articleLink: string
  analysis: string
  createdAt: string
}

type Tab = 'practice' | 'rss'

const SOURCE_NAMES: Record<string, string> = { 'b-markets': 'B-Markets', 'r-world': 'R-World China' }
const typeLabels: Record<string, string> = { D1: 'Micro Continuation', D2: 'Long Continuation', T1: 'C-E Translation', GAP: 'Gap Continuation', CG: 'Construction-guided', 'construction-loop': 'Construction Loop' }

export default function PracticeHistoryPage() {
  const { isAuthenticated, user } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('practice')

  const [records, setRecords] = useState<PracticeRecord[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [rssRecords, setRssRecords] = useState<RSSAnalysisRecord[]>([])
  const [rssLoading, setRssLoading] = useState(false)
  const [rssExpanded, setRssExpanded] = useState<string | null>(null)

  useEffect(() => {
    if (activeTab !== 'practice') return
    if (!isAuthenticated) {
      const saved = localStorage.getItem('cs_practice_records')
      if (saved) {
        const r = JSON.parse(saved)
        setRecords(r.slice((page - 1) * 20, page * 20))
        setTotalPages(Math.ceil(r.length / 20))
        setStats({ totalRecords: r.length, avgWordCount: Math.round(r.reduce((s: number, x: PracticeRecord) => s + x.wordCount, 0) / Math.max(r.length, 1)) })
      }
      setLoading(false)
      return
    }

    setLoading(true)
    fetch(`/api/user/records?limit=20&page=${page}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d) { setRecords(d.records); setStats(d.stats); setTotalPages(d.totalPages) }
      })
      .finally(() => setLoading(false))
  }, [isAuthenticated, page, activeTab])

  useEffect(() => {
    if (activeTab !== 'rss') return
    setRssLoading(true)
    if (!isAuthenticated) {
      const saved = localStorage.getItem('cs_construction_articles')
      if (saved) {
        setRssRecords(JSON.parse(saved).map((article: any) => ({
          id: article.id,
          feedSource: 'construction-studio',
          articleTitle: article.title,
          articleLink: '',
          analysis: JSON.stringify({
            summary: article.article,
            constructions: article.highlighted_constructions || [],
            writingTakeaway: article.teaching_notes?.[0] || '',
          }),
          createdAt: article.createdAt,
        })))
      }
      setRssLoading(false)
      return
    }

    fetch('/api/user/rss-analysis?limit=50')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.records) setRssRecords(d.records)
      })
      .finally(() => setRssLoading(false))
  }, [isAuthenticated, activeTab])

  const deleteLocalRecord = (id: string) => {
    const saved = localStorage.getItem('cs_practice_records')
    if (!saved) return
    const r = JSON.parse(saved)
    const filtered = r.filter((x: any) => x.id !== id)
    localStorage.setItem('cs_practice_records', JSON.stringify(filtered))
    setRecords(filtered.slice((page - 1) * 20, page * 20))
    setTotalPages(Math.ceil(filtered.length / 20))
  }

  const deleteLocalRss = (id: string) => {
    const saved = localStorage.getItem('cs_construction_articles')
    if (!saved) return
    const r = JSON.parse(saved)
    const filtered = r.filter((x: any) => x.id !== id)
    localStorage.setItem('cs_construction_articles', JSON.stringify(filtered))
    setRssRecords(filtered)
  }

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) } catch { return d }
  }

  const getAnalysisPreview = (analysis: string) => {
    try {
      const parsed = JSON.parse(analysis)
      return parsed.summary || parsed.writingTakeaway || analysis.slice(0, 200)
    } catch {
      return analysis.slice(0, 200).replace(/[#*`]/g, '')
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My History</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isAuthenticated ? `Account: ${user?.email}` : 'Local storage mode — records saved in your browser'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/practice" className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[--lake-blue] text-white text-sm font-medium hover:opacity-90 transition-opacity">
            <ArrowRight className="w-4 h-4" /> Practice
          </Link>
          <Link href="/constructions" className="flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-medium hover:bg-accent transition-colors">
            <Sparkles className="w-4 h-4" /> Studio
          </Link>
        </div>
      </div>

      {/* ───── Tabs ───── */}
      <div className="flex gap-1 p-1 rounded-xl bg-muted w-fit">
        <button onClick={() => setActiveTab('practice')}
          className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            activeTab === 'practice' ? 'bg-white dark:bg-slate-800 shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
          <FileText className="w-4 h-4" /> Practice Records
        </button>
        <button onClick={() => setActiveTab('rss')}
          className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            activeTab === 'rss' ? 'bg-white dark:bg-slate-800 shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
          <Sparkles className="w-4 h-4" /> Studio Articles
        </button>
      </div>

      {/* ───── Practice Tab Content ───── */}
      {activeTab === 'practice' && (
        <>
          {stats && (
            <div className="grid grid-cols-3 gap-4">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl border bg-card">
                <div className="flex items-center gap-2 mb-1"><BookOpen className="w-4 h-4 text-blue-500" /><span className="text-xs text-muted-foreground">Total</span></div>
                <p className="text-2xl font-bold">{stats.totalRecords}</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="p-4 rounded-xl border bg-card">
                <div className="flex items-center gap-2 mb-1"><BarChart3 className="w-4 h-4 text-violet-500" /><span className="text-xs text-muted-foreground">Avg Words</span></div>
                <p className="text-2xl font-bold">{stats.avgWordCount}</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-4 rounded-xl border bg-card">
                <div className="flex items-center gap-2 mb-1"><Award className="w-4 h-4 text-amber-500" /><span className="text-xs text-muted-foreground">Avg Score</span></div>
                <p className="text-2xl font-bold">{stats.avgScore ? `${stats.avgScore}` : '—'}</p>
              </motion.div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[--lake-blue]" /></div>
          ) : records.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No practice records yet</p>
              <p className="text-sm mt-1">Start practicing to see your history here.</p>
              <Link href="/practice" className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-lg bg-[--lake-blue] text-white text-sm font-medium">Start Practicing <ArrowRight className="w-3.5 h-3.5" /></Link>
            </div>
          ) : (
            <div className="space-y-3">
              {records.map((r) => (
                <div key={r.id} className="p-4 rounded-xl border bg-card hover:bg-accent/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                          {typeLabels[r.exerciseType] || r.exerciseType}
                        </span>
                        <span className="text-xs text-muted-foreground">{r.exerciseId}</span>
                        <span className={cn('text-xs px-1.5 py-0.5 rounded-full font-medium',
                          (r.score || 0) >= 7 ? 'bg-green-100 text-green-700' : (r.score || 0) >= 5 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700')}>
                          {r.score ? `Band ${r.score}` : '—'}
                        </span>
                      </div>
                      <p className="text-sm font-medium truncate">{r.exerciseTheme || 'Exercise'}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{r.studentAnswer.slice(0, 150)}</p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end"><Calendar className="w-3 h-3" />{formatDate(r.createdAt)}</p>
                      <p className="text-xs text-muted-foreground mt-1">{r.wordCount} words</p>
                      {!isAuthenticated && (
                        <button onClick={() => deleteLocalRecord(r.id)} className="text-xs text-red-400 hover:text-red-600 mt-1">
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={cn('w-8 h-8 rounded-lg text-sm font-medium transition-colors',
                    page === i + 1 ? 'bg-[--lake-blue] text-white' : 'border hover:bg-accent')}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Studio Article Tab Content */}
      {activeTab === 'rss' && (
        <>
          {rssLoading ? (
            <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[--lake-blue]" /></div>
          ) : rssRecords.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No studio articles yet</p>
              <p className="text-sm mt-1">Generate a construction-guided reading in the Studio.</p>
              <Link href="/constructions" className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-lg bg-[--lake-blue] text-white text-sm font-medium">Open Studio <ArrowRight className="w-3.5 h-3.5" /></Link>
            </div>
          ) : (
            <div className="space-y-3">
              {rssRecords.map((r) => (
                <div key={r.id} className="rounded-xl border bg-card overflow-hidden">
                  <button onClick={() => setRssExpanded(rssExpanded === r.id ? null : r.id)}
                    className="w-full text-left p-4 hover:bg-accent/30 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200 font-medium flex items-center gap-1">
                            {SOURCE_NAMES[r.feedSource] === 'B-Markets' ? <Globe className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                            {SOURCE_NAMES[r.feedSource] || r.feedSource}
                          </span>
                          <span className="text-xs text-muted-foreground"><Calendar className="w-3 h-3 inline mr-1" />{formatDate(r.createdAt)}</span>
                        </div>
                        <p className="text-sm font-medium line-clamp-2">{r.articleTitle}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 italic">{getAnalysisPreview(r.analysis)}</p>
                      </div>
                      <Sparkles className="w-4 h-4 text-violet-400 shrink-0 mt-1" />
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {rssExpanded === r.id && (
                    <div className="px-4 pb-4 pt-0 border-t mx-4">
                      <div className="mt-3">
                        {(() => {
                          try {
                            const parsed = JSON.parse(r.analysis)
                            return (
                              <div className="space-y-4">
                                <p className="text-sm text-muted-foreground italic">{parsed.summary}</p>
                                {parsed.constructions?.length > 0 && (
                                  <div>
                                    <h4 className="text-xs font-semibold mb-2">🏗️ Constructions</h4>
                                    <div className="space-y-2">
                                      {parsed.constructions.map((c: any, i: number) => (
                                        <div key={i} className="p-3 rounded-lg border bg-blue-50/40 dark:bg-blue-950/10 text-xs">
                                          <p className="font-mono italic text-blue-700 dark:text-blue-300 mb-0.5">{c.originalText}</p>
                                          <p className="font-semibold text-blue-600">{c.constructionName} · {c.pattern}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {parsed.writingTakeaway && (
                                  <div className="p-3 rounded-lg border bg-violet-50/40 dark:bg-violet-950/10">
                                    <h4 className="text-xs font-semibold mb-1">✍️ Takeaway</h4>
                                    <p className="text-xs text-muted-foreground">{parsed.writingTakeaway}</p>
                                  </div>
                                )}
                              </div>
                            )
                          } catch {
                            return <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">{r.analysis.slice(0, 800)}</p>
                          }
                        })()}
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-3 border-t">
                        {r.articleLink && (
                          <a href={r.articleLink} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-[--lake-blue] hover:underline inline-flex items-center gap-1">
                            <ExternalLinkIcon className="w-3 h-3" /> Original Article
                          </a>
                        )}
                        <span className="text-[10px] text-muted-foreground ml-auto">{formatDate(r.createdAt)}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}
