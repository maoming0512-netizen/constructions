'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ExternalLink, Loader2, Sparkles, Clock, Rss, FileText, BookOpen, Users, Globe, ChevronDown, ChevronUp, CheckCircle2, Save, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { callOpenAIStream, getAIConfig, getSkillConfig } from '@/lib/ai'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

/* ─────────────────────── Types ─────────────────────── */
interface RSSItem {
  title: string
  link: string
  pubDate: string
  creator: string
  contentSnippet: string
  content: string
  categories: string[]
  guid: string
  imageUrl: string | null
}

interface RSSFeed {
  source: string
  title: string
  description: string
  items: RSSItem[]
}

const SOURCES = [
  { id: 'b-markets', name: 'B-Markets', icon: <Globe className="w-4 h-4" /> },
  { id: 'r-world', name: 'R-World China', icon: <Users className="w-4 h-4" /> },
]

/* ─────────────────────── Main Component ─────────────────────── */
export default function RSSReaderPage() {
  const { isAuthenticated } = useAuth()
  const [activeSource, setActiveSource] = useState('b-markets')
  const [feed, setFeed] = useState<RSSFeed | null>(null)
  const [loadingFeed, setLoadingFeed] = useState(true)
  const [selectedArticle, setSelectedArticle] = useState<RSSItem | null>(null)
  const [viewMode, setViewMode] = useState<'snippet' | 'full'>(() => 'snippet')
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<string | null>(null)
  const [analysisJson, setAnalysisJson] = useState<any>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [showSavedHint, setShowSavedHint] = useState(false)
  const articleRef = useRef<HTMLDivElement>(null)

  // Fetch RSS feed
  useEffect(() => {
    setLoadingFeed(true)
    setSelectedArticle(null)
    setAnalysisResult(null)
    setAnalysisJson(null)
    fetch(`/api/rss?source=${activeSource}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.items) setFeed(d); else setFeed(null) })
      .catch(() => setFeed(null))
      .finally(() => setLoadingFeed(false))
  }, [activeSource])

  const handleSelectArticle = (item: RSSItem) => {
    setSelectedArticle(item)
    setAnalysisResult(null)
    setAnalysisJson(null)
    setSaveStatus('idle')
    setShowSavedHint(false)
    articleRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleFindConstructions = useCallback(async () => {
    if (!selectedArticle) return
    const articleText = selectedArticle.content
      ? selectedArticle.content.replace(/<[^>]*>/g, '\n').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\n{3,}/g, '\n\n').slice(0, 5000)
      : selectedArticle.contentSnippet

    if (!articleText) return
    setAnalyzing(true)
    setAnalysisResult(null)
    setAnalysisJson(null)

    try {
      const skillConfig = getSkillConfig('findConstructions')
      const apiConfig = getAIConfig()
      if (!skillConfig || !apiConfig?.apiKey) throw new Error('API not configured')

      const skillInput = {
        articleTitle: selectedArticle.title,
        articleContent: articleText,
      }

      let fullContent = ''
      setAnalysisResult('💭 Thinking...')
      for await (const chunk of callOpenAIStream(skillConfig, skillInput, apiConfig)) {
        if (chunk.type === 'reasoning' && chunk.text) {
          setAnalysisResult('💭 Thinking...')
        }
        if (chunk.type === 'content' && chunk.text) {
          fullContent += chunk.text
          setAnalysisResult(fullContent)
        }
      }

      try {
        const parsed = JSON.parse(fullContent)
        setAnalysisJson(parsed)
        setAnalysisResult(null)
      } catch {
        // Keep raw text, but it's in analysisResult already
      }
    } catch (err: any) {
      setAnalysisResult(`## Error\n\n${err.message || 'Failed to analyze'}`)
    } finally {
      setAnalyzing(false)
    }
  }, [selectedArticle])

  const handleSaveAnalysis = useCallback(async () => {
    if (!selectedArticle || !(analysisResult || analysisJson)) return
    setSaveStatus('saving')
    const content = analysisJson ? JSON.stringify(analysisJson) : analysisResult || ''

    // Always save locally
    const record = {
      id: `local-rss-${Date.now()}`,
      feedSource: activeSource,
      articleTitle: selectedArticle.title,
      articleLink: selectedArticle.link,
      analysis: content,
      createdAt: new Date().toISOString(),
    }
    const saved = localStorage.getItem('cs_rss_analyses')
    const arr = saved ? JSON.parse(saved) : []
    arr.unshift(record)
    if (arr.length > 100) arr.length = 100
    localStorage.setItem('cs_rss_analyses', JSON.stringify(arr))

    // Save to DB if logged in
    if (isAuthenticated) {
      try {
        const res = await fetch('/api/user/rss-analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ feedSource: activeSource, articleTitle: selectedArticle.title, articleLink: selectedArticle.link, analysis: content }),
        })
        if (res.ok) { setSaveStatus('saved'); setShowSavedHint(true) }
        else setSaveStatus('idle')
      } catch { setSaveStatus('idle') }
    } else {
      setSaveStatus('saved')
      setShowSavedHint(true)
    }
  }, [selectedArticle, analysisResult, analysisJson, activeSource, isAuthenticated])

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) } catch { return d }
  }

  const stripHtml = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim()

  return (
    <div className="w-full h-[calc(100vh-4rem)] flex">
      {/* ─────────── LEFT 1/3 ─────────── */}
      <div className="w-[420px] shrink-0 border-r flex flex-col bg-card/30">
        {/* Source Switcher (top half of left) */}
        <div className="p-3 border-b">
          <div className="flex gap-2">
            {SOURCES.map(s => (
              <button key={s.id} onClick={() => setActiveSource(s.id)}
                className={cn('flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  activeSource === s.id ? 'bg-[--lake-blue] text-white' : 'border hover:bg-accent')}>
                {s.icon} {s.name}
              </button>
            ))}
          </div>
          {feed && (
            <p className="text-xs text-muted-foreground mt-2 truncate">{feed.title} — {feed.items.length} articles</p>
          )}
        </div>

        {/* Article List (bottom half) */}
        <div className="flex-1 overflow-y-auto">
          {loadingFeed ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : !feed ? (
            <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
              Failed to load feed. Try refreshing.
            </div>
          ) : (
            feed.items.map((item, i) => (
              <button key={item.guid || i}
                onClick={() => handleSelectArticle(item)}
                className={cn('w-full text-left p-3 border-b last:border-b-0 transition-colors hover:bg-accent/50 flex gap-3',
                  selectedArticle?.guid === item.guid ? 'bg-accent/70 border-l-2 border-l-[--lake-blue]' : '')}
              >
                {item.imageUrl ? (
                  <div className="w-16 h-16 shrink-0 rounded-md overflow-hidden bg-muted">
                    <img src={item.imageUrl} alt="" className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none' }} />
                  </div>
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium line-clamp-2 leading-snug">{item.title}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDate(item.pubDate)}</span>
                    {item.creator && <span className="text-xs text-muted-foreground">by {item.creator}</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.contentSnippet}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ─────────── RIGHT 2/3 ─────────── */}
      <div className="flex-1 flex flex-col overflow-hidden" ref={articleRef}>
        {!selectedArticle ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Rss className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">Select an article to read</p>
              <p className="text-sm mt-1">Choose from the article list on the left</p>
            </div>
          </div>
        ) : (
          <>
            {/* Featured Image — only if content doesn't already contain it */}
            {selectedArticle.imageUrl && viewMode === 'full' && !selectedArticle.content?.includes(selectedArticle.imageUrl) && (
              <div className="shrink-0 w-full max-h-64 overflow-hidden bg-muted">
                <img src={selectedArticle.imageUrl} alt="" className="w-full h-64 object-cover"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none' }} />
              </div>
            )}
            {/* Article Header */}
            <div className="p-4 sm:p-6 border-b bg-card/50 shrink-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <button onClick={() => setViewMode(viewMode === 'snippet' ? 'full' : 'snippet')}
                    className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border hover:bg-accent')}>
                    {viewMode === 'snippet' ? <><BookOpen className="w-3.5 h-3.5" /> Full Text</> : <><FileText className="w-3.5 h-3.5" /> Snippet</>}
                  </button>
                  <button onClick={handleFindConstructions} disabled={analyzing}
                    className={cn('flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-all text-white',
                      analyzing ? 'bg-muted cursor-not-allowed' : 'bg-gradient-to-r from-violet-500 to-indigo-500 hover:shadow-lg hover:-translate-y-0.5')}>
                    {analyzing ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing...</> : <><Sparkles className="w-3.5 h-3.5" /> Find Constructions</>}
                  </button>
                  <span className="text-[10px] text-muted-foreground hidden sm:inline">⏱ ~2–3 min for full articles</span>
                </div>
                <a href={selectedArticle.link} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-[--lake-blue] hover:underline">
                  <ExternalLink className="w-3 h-3" /> Original
                </a>
              </div>
              <h1 className="text-lg font-bold leading-snug">{selectedArticle.title}</h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-muted-foreground">{formatDate(selectedArticle.pubDate)}</span>
                {selectedArticle.creator && <span className="text-xs text-muted-foreground">· {selectedArticle.creator}</span>}
              </div>
            </div>

            {/* Article Content  */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
              {viewMode === 'snippet' ? (
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{selectedArticle.contentSnippet}</p>
                  {!selectedArticle.content && (
                    <p className="text-sm text-muted-foreground mt-4 italic">No full content available for this article. Try opening the original link.</p>
                  )}
                </div>
              ) : selectedArticle.content ? (
                <div className="prose prose-slate dark:prose-invert max-w-none
                  prose-img:rounded-lg prose-img:my-4 prose-img:max-w-full prose-img:h-auto
                  prose-a:text-[--lake-blue] prose-a:no-underline hover:prose-a:underline"
                  dangerouslySetInnerHTML={{ __html: selectedArticle.content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') }} />
              ) : (
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedArticle.contentSnippet}</p>
                </div>
              )}

              {/* ─── AI Analysis Result ─── */}
              <AnimatePresence>
                {(analysisResult || analysisJson) && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="mt-8 border-t pt-6">
                    {/* Save Button */}
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-bold flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-violet-500" />
                        Construction Analysis
                      </h2>
                      <div className="flex items-center gap-2">
                        <button onClick={handleSaveAnalysis} disabled={saveStatus === 'saving'}
                          className={cn('flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                            saveStatus === 'saved' ? 'bg-green-100 text-green-700' : 'border hover:bg-accent')}>
                          {saveStatus === 'saved' ? <><CheckCircle2 className="w-4 h-4" /> Saved</> : saveStatus === 'saving' ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Analysis</>}
                        </button>
                      </div>
                    </div>
                    {showSavedHint && (
                      <div className="mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                        <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Saved! <Link href="/history" className="font-semibold underline hover:no-underline inline-flex items-center gap-0.5">View in History <ArrowRight className="w-3 h-3" /></Link> — all your analyses are there.
                        </p>
                      </div>
                    )}

                    {analysisJson ? (
                      <div className="space-y-6">
                        <p className="text-sm text-muted-foreground italic">{analysisJson.summary}</p>

                        <div>
                          <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">🏗️ Notable Constructions</h3>
                          <div className="space-y-3">
                            {analysisJson.constructions?.map((c: any, i: number) => (
                              <div key={i} className="p-4 rounded-lg border bg-blue-50/40 dark:bg-blue-950/10">
                                <p className="text-sm font-mono text-blue-700 dark:text-blue-300 italic mb-1">{c.originalText}</p>
                                <p className="text-xs font-semibold text-blue-600">{c.constructionName} · <code className="px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30">{c.pattern}</code></p>
                                <p className="text-xs text-muted-foreground mt-1">💡 {c.whyNotable}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">📝 {c.howToUse}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {analysisJson.discoursePatterns?.length > 0 && (
                          <div>
                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">📐 Discourse Patterns</h3>
                            <div className="space-y-2">
                              {analysisJson.discoursePatterns.map((dp: any, i: number) => (
                                <div key={i} className="p-3 rounded-lg border bg-amber-50/40 dark:bg-amber-950/10">
                                  <p className="text-sm font-semibold">{dp.pattern}</p>
                                  <p className="text-xs text-muted-foreground mt-1">📍 {dp.location} — {dp.effect}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {analysisJson.vocabularyHighlights?.length > 0 && (
                          <div>
                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">📚 Vocabulary Highlights</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {analysisJson.vocabularyHighlights.map((v: any, i: number) => (
                                <div key={i} className="p-3 rounded-lg border bg-green-50/40 dark:bg-green-950/10">
                                  <p className="text-sm font-semibold text-green-700 dark:text-green-300">{v.word}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5 italic">"{v.usage}"</p>
                                  <p className="text-xs text-muted-foreground mt-0.5">{v.suggestion}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {analysisJson.writingTakeaway && (
                          <div className="p-4 rounded-lg border bg-violet-50/40 dark:bg-violet-950/10">
                            <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">✍️ Writing Takeaway</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{analysisJson.writingTakeaway}</p>
                          </div>
                        )}
                      </div>
                    ) : analysisResult ? (
                      analyzing ? (
                        <div className="relative">
                          <div className="flex items-center gap-2 mb-2">
                            <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
                            <span className="text-xs text-muted-foreground">Streaming AI analysis...</span>
                          </div>
                          <pre className="whitespace-pre-wrap text-sm text-muted-foreground bg-muted/30 rounded-lg p-4 max-h-64 overflow-y-auto font-mono leading-relaxed">{analysisResult}</pre>
                        </div>
                      ) : (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{analysisResult}</ReactMarkdown>
                        </div>
                      )
                    ) : null}
                  </motion.div>
                )}
              </AnimatePresence>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
