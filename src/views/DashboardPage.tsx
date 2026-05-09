'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Clock,
  BookOpen,
  PenLine,
  ChevronRight,
  Sparkles,
  TrendingUp,
  FileText,
  Globe,
  Rss,
  ArrowRight,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

interface RecentRecord {
  id: string
  exerciseType: string
  exerciseTheme: string
  wordCount: number
  createdAt: string
}

interface DashboardStats {
  totalExercises: number
  totalWords: number
  avgWordsPerExercise: number
  exercisesThisWeek: number
  wordsThisWeek: number
  rssAnalyses: number
}

const typeLabels: Record<string, string> = { D1: 'Micro Continuation', D2: 'Long Continuation', T1: 'C-E Translation' }
const typeIcons: Record<string, React.ReactNode> = {
  D1: <FileText className="w-3 h-3" />,
  D2: <BookOpen className="w-3 h-3" />,
  T1: <Globe className="w-3 h-3" />,
}

export default function DashboardPage() {
  const { isAuthenticated, user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalExercises: 0, totalWords: 0, avgWordsPerExercise: 0,
    exercisesThisWeek: 0, wordsThisWeek: 0, rssAnalyses: 0,
  })
  const [recentRecords, setRecentRecords] = useState<RecentRecord[]>([])

  useEffect(() => {
    if (isAuthenticated) {
      fetch('/api/user/dashboard')
        .then(r => r.ok ? r.json() : null)
        .then(d => {
          if (d?.stats) {
            setStats(d.stats)
            setRecentRecords(d.recentRecords || [])
          }
        })
        .finally(() => setLoading(false))
    } else {
      const saved = localStorage.getItem('cs_practice_records')
      const records = saved ? JSON.parse(saved) : []
      const rssSaved = localStorage.getItem('cs_rss_analyses')
      const rssRecords = rssSaved ? JSON.parse(rssSaved) : []

      const totalWords = records.reduce((s: number, r: any) => s + (r.wordCount || 0), 0)
      const now = Date.now()
      const weekAgo = now - 7 * 24 * 60 * 60 * 1000
      const thisWeek = records.filter((r: any) => new Date(r.createdAt).getTime() > weekAgo)

      setStats({
        totalExercises: records.length,
        totalWords,
        avgWordsPerExercise: records.length ? Math.round(totalWords / records.length) : 0,
        exercisesThisWeek: thisWeek.length,
        wordsThisWeek: thisWeek.reduce((s: number, r: any) => s + (r.wordCount || 0), 0),
        rssAnalyses: rssRecords.length,
      })
      setRecentRecords(
        records.slice(0, 8).map((r: any) => ({
          id: r.id, exerciseType: r.exerciseType,
          exerciseTheme: r.exerciseTheme, wordCount: r.wordCount,
          createdAt: r.createdAt,
        }))
      )
      setLoading(false)
    }
  }, [isAuthenticated])

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) } catch { return '' }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isAuthenticated ? `Welcome back, ${user?.name || user?.email?.split('@')[0]}` : 'Local mode — log in to sync across devices'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/history" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            View History →
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[--lake-blue]" />
        </div>
      ) : (
        <>
          {/* Stats Grid — Writing-Focused */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard icon={<PenLine className="w-4 h-4 text-blue-500" />} label="Exercises" value={stats.totalExercises} sub="total completed" delay={0} />
            <StatCard icon={<FileText className="w-4 h-4 text-emerald-500" />} label="Words Written" value={stats.totalWords.toLocaleString()} sub={`~${stats.avgWordsPerExercise} words/exercise`} delay={0.1} />
            <StatCard icon={<TrendingUp className="w-4 h-4 text-violet-500" />} label="This Week" value={stats.exercisesThisWeek} sub={`${stats.wordsThisWeek.toLocaleString()} words`} delay={0.2} />
            <StatCard icon={<Sparkles className="w-4 h-4 text-amber-500" />} label="RSS Analyses" value={stats.rssAnalyses} sub="articles analyzed" delay={0.3} />
          </div>

          {/* CTA Banner */}
          {stats.totalExercises === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="p-6 rounded-xl border bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Start Your Writing Journey</h2>
                    <p className="text-sm text-muted-foreground">Practice translation and continuation exercises with AI feedback.</p>
                  </div>
                </div>
                <Link href="/practice" className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-2 shrink-0">
                  Start Practicing <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="p-5 rounded-xl border bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                  <div>
                    <h2 className="text-sm font-semibold">Keep Going!</h2>
                    <p className="text-xs text-muted-foreground">
                      {stats.exercisesThisWeek > 0
                        ? `${stats.exercisesThisWeek} exercises and ${stats.wordsThisWeek.toLocaleString()} words this week — great work!`
                        : `${stats.totalExercises.toLocaleString()} exercises completed so far. Pick up where you left off.`}
                    </p>
                  </div>
                </div>
                <Link href="/practice" className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shrink-0">
                  Continue <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          )}

          {/* Recent Practice + Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Recent Practice */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="md:col-span-2 rounded-xl border bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" /> Recent Practice
                </h3>
                {recentRecords.length > 0 && (
                  <Link href="/history" className="text-xs text-[--lake-blue] hover:underline">View all →</Link>
                )}
              </div>

              {recentRecords.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <PenLine className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No practice records yet</p>
                  <Link href="/practice" className="inline-flex items-center gap-1 mt-2 text-sm text-[--lake-blue] hover:underline">
                    Start your first exercise →
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentRecords.map((r) => (
                    <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium flex items-center gap-1 shrink-0">
                          {typeIcons[r.exerciseType]}
                          {typeLabels[r.exerciseType] || r.exerciseType}
                        </span>
                        <span className="text-sm truncate">{r.exerciseTheme}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-3">
                        <span className="text-xs text-muted-foreground">{r.wordCount} words</span>
                        <span className="text-xs text-muted-foreground w-16 text-right">{formatDate(r.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Quick Links */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="rounded-xl border bg-card p-5 flex flex-col gap-2">
              <h3 className="text-sm font-semibold mb-2">Quick Navigation</h3>
              <Link href="/practice" className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors">
                <span className="flex items-center gap-2 text-sm"><PenLine className="w-4 h-4 text-blue-500" /> Practice</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
              <Link href="/history" className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors">
                <span className="flex items-center gap-2 text-sm"><Clock className="w-4 h-4 text-violet-500" /> History</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
              <Link href="/constructions" className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors">
                <span className="flex items-center gap-2 text-sm"><Rss className="w-4 h-4 text-amber-500" /> Reader</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            </motion.div>
          </div>

          {/* RSS Analyses Summary (if any) */}
          {stats.rssAnalyses > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
              className="rounded-xl border bg-card p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-violet-500" />
                  <div>
                    <p className="text-sm font-semibold">{stats.rssAnalyses} Article Analyses</p>
                    <p className="text-xs text-muted-foreground">Saved construction analyses from RSS articles</p>
                  </div>
                </div>
                <Link href="/history" className="text-sm text-[--lake-blue] hover:underline">
                  Browse analyses →
                </Link>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}

function StatCard({ icon, label, value, sub, delay }: {
  icon: React.ReactNode; label: string; value: number | string; sub: string; delay: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="p-4 rounded-xl border bg-card">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </motion.div>
  )
}
