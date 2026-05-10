﻿﻿﻿﻿﻿﻿'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Bot,
  Sparkles,
  FileText,
  Scale,
  GitBranch,
  Lightbulb,
  Expand,
  Settings,
  Loader2,
  CheckCircle2,
  Plus,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  X,
  Key,
  Server,
  RefreshCw,
  BookOpen,
  Save,
  Globe,
  Users,
  PenTool,
} from 'lucide-react'

import {
  streamSkill,
  setAIConfig,
  getAIConfig,
  isAIConfigured,
  callOpenAIStream,
  getSkillConfig,
  type AISkillResult,
} from '@/lib/ai'

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

type Construction = {
  id: string
  code: string
  construction: string
  meaning_zh: string
  communicative_function: string[]
  usage_note?: string
  example_sentence: string
  school_level: string
  fine_level: string
  construction_type: string
  topic_tags: string[]
  emotional_tags: string[]
  category: string
}

type ToolId = 'analyze' | 'exercise' | 'minimal-pair' | 'explain' | 'expand'

interface ToolConfig {
  id: ToolId
  name: string
  description: string
  icon: React.ReactNode
  skillName: string
  placeholder: string
  inputLabel: string
  inputType: 'text' | 'select' | 'textarea'
  extraParams?: Array<{
    key: string
    label: string
    type: 'select' | 'text'
    options?: { value: string; label: string }[]
  }>
}

const tools: ToolConfig[] = [
  {
    id: 'analyze',
    name: 'Sentence Analysis',
    description: 'Enter any English sentence. The AI identifies constructions, evaluates naturalness, labels semantic roles, and provides explanations grounded in Construction Grammar theory.',
    icon: <FileText className="w-5 h-5" />,
    skillName: 'analyzeSentence',
    placeholder: 'Enter an English sentence to analyze...',
    inputLabel: 'English Sentence',
    inputType: 'textarea',
    extraParams: [
      {
        key: 'learnerLevel',
        label: 'Learner Level',
        type: 'select',
        options: [
          { value: 'junior', label: 'Junior High' },
          { value: 'senior', label: 'Senior High' },
          { value: 'college', label: 'College' },
        ],
      },
    ],
  },
  {
    id: 'exercise',
    name: 'Writing Exercise',
    description: 'Generate a database-guided writing exercise. Teaching constructions, explanations, and examples come from PostgreSQL.',
    icon: <PenTool className="w-5 h-5" />,
    skillName: 'genWriting',
    placeholder: 'Select topic and goal to generate an exercise',
    inputLabel: 'Database-guided exercise',
    inputType: 'text',
  },
  {
    id: 'minimal-pair',
    name: 'Minimal Pair',
    description: 'Generate contrasting sentence pairs showing the same verb in different constructions. Compare, for example, two related constructions to understand subtle semantic differences.',
    icon: <Scale className="w-5 h-5" />,
    skillName: 'minimalPair',
    placeholder: 'Select two constructions to compare (optional)',
    inputLabel: 'Construction Pair (optional)',
    inputType: 'text',
    extraParams: [
      {
        key: 'count',
        label: 'Number of Pairs',
        type: 'select',
        options: [
          { value: '2', label: '2 pairs' },
          { value: '3', label: '3 pairs' },
          { value: '4', label: '4 pairs' },
        ],
      },
    ],
  },
  {
    id: 'explain',
    name: 'Teacher Explanation',
    description: 'Select a construction from the database and the AI will provide an in-depth explanation: form template, core meaning, typical verbs, example sentences.',
    icon: <Lightbulb className="w-5 h-5" />,
    skillName: 'teacherExplain',
    placeholder: 'Select a construction to explain',
    inputLabel: 'Construction Name',
    inputType: 'select',
    extraParams: [
      {
        key: 'difficulty',
        label: 'Teaching Depth',
        type: 'select',
        options: [
          { value: 'junior', label: 'Junior High Friendly' },
          { value: 'senior', label: 'Senior High' },
          { value: 'college', label: 'Advanced (with theory)' },
        ],
      },
      {
        key: 'focusArea',
        label: 'Focus Area',
        type: 'select',
        options: [
          { value: 'all', label: 'Comprehensive' },
          { value: 'form', label: 'Form Template' },
          { value: 'meaning', label: 'Core Meaning' },
          { value: 'verbs', label: 'Typical Verbs' },
          { value: 'comparison', label: 'Construction Comparison' },
        ],
      },
    ],
  },
  {
    id: 'expand',
    name: 'Construction Extension',
    description: 'Enter a prototype sentence (optional) and the AI generates extended examples of the same construction using different verbs — from common to creative uses.',
    icon: <Expand className="w-5 h-5" />,
    skillName: 'constructionExpand',
    placeholder: 'Enter a prototype sentence (optional)',
    inputLabel: 'Prototype Sentence',
    inputType: 'textarea',
    extraParams: [
      {
        key: 'creativityLevel',
        label: 'Extension Level',
        type: 'select',
        options: [
          { value: 'low', label: 'Low — common verbs only' },
          { value: 'medium', label: 'Medium — some creative uses' },
          { value: 'high', label: 'High — bold extensions' },
        ],
      },
    ],
  },
]

const easeGentle = [0.22, 1, 0.36, 1] as [number, number, number, number]

function StatusBadge({ status }: { status: 'idle' | 'loading' | 'success' | 'error' | 'fallback' }) {
  const config = {
    idle: { icon: <Info className="w-3.5 h-3.5" />, text: 'Ready', color: 'var(--soft-gray)' },
    loading: { icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />, text: 'Processing', color: 'var(--lake-blue)' },
    success: { icon: <CheckCircle2 className="w-3.5 h-3.5" />, text: 'Success', color: 'var(--success)' },
    error: { icon: <AlertCircle className="w-3.5 h-3.5" />, text: 'Error', color: 'var(--error)' },
    fallback: { icon: <RefreshCw className="w-3.5 h-3.5" />, text: 'Fallback', color: 'var(--warning)' },
  }
  const c = config[status]
  return (
    <span className="inline-flex items-center gap-1.5 text-caption" style={{ color: c.color }}>
      {c.icon}
      {c.text}
    </span>
  )
}

function ApiConfigPanel({ onClose }: { onClose: () => void }) {
  const existing = getAIConfig()
  const [apiKey, setApiKey] = useState(existing?.apiKey || '')
  const [baseURL, setBaseURL] = useState(existing?.baseURL || 'https://api.deepseek.com')
  const [model, setModel] = useState(existing?.model || 'deepseek-chat')
  const [saved, setSaved] = useState(false)

  const presets = [
    { name: 'DeepSeek', baseURL: 'https://api.deepseek.com', model: 'deepseek-chat' },
  ]

  const applyPreset = (preset: typeof presets[0]) => {
    setBaseURL(preset.baseURL)
    setModel(preset.model)
  }

  const handleSave = () => {
    if (apiKey.trim()) {
      setAIConfig({ apiKey: apiKey.trim(), baseURL: baseURL.trim(), model: model.trim() })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="rounded-xl p-5 mb-6"
      style={{
        background: 'var(--warm-white)',
        border: '1px solid var(--glass-border)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-h4 text-[--deep-slate] flex items-center gap-2">
          <Key className="w-4 h-4" />
          API Configuration
        </h3>
        <button onClick={onClose} className="p-1 rounded-md hover:bg-black/5 transition-colors">
          <X className="w-4 h-4 text-[--soft-gray]" />
        </button>
      </div>

      <div className="mb-4">
        <label className="text-caption text-[--soft-gray] block mb-2">Quick Preset</label>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset, i) => (
            <button
              key={i}
              onClick={() => applyPreset(preset)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:-translate-y-0.5"
              style={{
                background: baseURL === preset.baseURL ? 'rgba(107,163,190,0.15)' : 'rgba(245,247,250,0.60)',
                color: baseURL === preset.baseURL ? 'var(--lake-blue)' : 'var(--deep-slate)',
                border: '1px solid var(--glass-border)',
              }}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-caption text-[--soft-gray] block mb-1">API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full px-3 py-2 rounded-lg border text-sm"
            style={{ borderColor: 'var(--glass-border)', background: 'white' }}
          />
        </div>
        <div>
          <label className="text-caption text-[--soft-gray] block mb-1">Base URL</label>
          <input
            type="text"
            value={baseURL}
            onChange={(e) => setBaseURL(e.target.value)}
            placeholder="https://api.deepseek.com"
            className="w-full px-3 py-2 rounded-lg border text-sm"
            style={{ borderColor: 'var(--glass-border)', background: 'white' }}
          />
        </div>
        <div>
          <label className="text-caption text-[--soft-gray] block mb-1">Model</label>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="deepseek-chat"
            className="w-full px-3 py-2 rounded-lg border text-sm"
            style={{ borderColor: 'var(--glass-border)', background: 'white' }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <p className="text-caption text-[--soft-gray]">
          <Server className="w-3 h-3 inline mr-1" />
          Uses the configured DeepSeek-compatible API path
        </p>
        <button
          onClick={handleSave}
          className="px-5 py-2 rounded-lg text-sm font-medium text-white transition-all hover:-translate-y-0.5"
          style={{ background: saved ? 'var(--success)' : 'var(--lake-blue)' }}
        >
          {saved ? 'Saved!' : 'Save Config'}
        </button>
      </div>
    </motion.div>
  )
}

function JsonDisplay({ data, title }: { data: any; title?: string }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--glass-border)' }}>
      {title && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-left"
          style={{ background: 'rgba(107,163,190,0.08)' }}
        >
          <span className="text-sm font-medium text-[--deep-slate]">{title}</span>
          {collapsed ? <ChevronDown className="w-4 h-4 text-[--soft-gray]" /> : <ChevronUp className="w-4 h-4 text-[--soft-gray]" />}
        </button>
      )}
      {!collapsed && (
        <pre
          className="p-4 text-xs overflow-x-auto"
          style={{
            background: 'rgba(245,247,250,0.60)',
            color: 'var(--deep-slate)',
            maxHeight: '480px',
            overflowY: 'auto',
          }}
        >
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  )
}

function ExerciseResult({ data, onSave }: { data: any; onSave?: () => void }) {
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (saving || saved) return
    setSaving(true)
    try {
      const res = await fetch('/api/ai/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseId: data.exerciseId || `AI-${Date.now()}`,
          level: data.level || 'senior',
          type: data.type || 'D1',
          theme: data.theme || '',
          context: data.context || '',
          task: data.task || '',
          wordCount: data.wordCount || '',
          targetConstructions: data.targetConstructions || '',
          referenceAnswer: data.referenceAnswer || '',
          metadata: data.metadata || undefined,
        }),
      })
      if (res.ok) {
        setSaved(true)
        onSave?.()
      }
    } catch (err) {
      console.error('Save failed:', err)
    } finally {
      setSaving(false)
    }
  }

  const typeIcons: Record<string, React.ReactNode> = {
    D1: <PenTool className="w-4 h-4" />,
    D2: <BookOpen className="w-4 h-4" />,
    GAP: <FileText className="w-4 h-4" />,
    CG: <Sparkles className="w-4 h-4" />,
    T1: <Globe className="w-4 h-4" />,
  }
  const typeNames: Record<string, string> = {
    D1: 'Micro Continuation',
    D2: 'Long Continuation',
    GAP: 'Gap Continuation',
    CG: 'Construction-guided Practice',
    T1: 'C-E Translation',
  }
  const levelColors: Record<string, string> = {
    junior: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    senior: 'bg-violet-100 text-violet-700 border-violet-200',
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${levelColors[data.level] || levelColors['senior']}`}>
            {data.level === 'junior' ? 'Junior High' : 'Senior High'}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full border bg-blue-50 text-blue-700 border-blue-200 font-medium flex items-center gap-1">
            {typeIcons[data.type] || <PenTool className="w-3 h-3" />}
            {typeNames[data.type] || data.type || 'Writing Practice'}
          </span>
          <span className="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
            {data.theme || 'General'}
          </span>
        </div>
        <button
          onClick={handleSave}
          disabled={saved || saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
          style={{
            background: saved ? 'rgba(107,203,119,0.15)' : 'rgba(107,163,190,0.10)',
            color: saved ? 'var(--success)' : 'var(--lake-blue)',
            border: '1px solid var(--glass-border)',
          }}
        >
          {saved ? <CheckCircle2 className="w-4 h-4" /> : saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saved ? 'Saved to Bank' : saving ? 'Saving...' : 'Save to Bank'}
        </button>
      </div>

      <div className="p-4 rounded-lg" style={{ background: 'rgba(245,247,250,0.60)', border: '1px solid var(--glass-border)' }}>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          {data.type === 'GAP' ? 'Passage with Blanks' : data.type === 'T1' ? 'Chinese Source Text' : 'Reading Passage'}
        </h4>
        <p className="text-sm leading-relaxed">{data.context || 'No context provided.'}</p>
      </div>

      <div className="p-4 rounded-lg bg-amber-50/60 border border-amber-200">
        <h4 className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Task</h4>
        <p className="text-sm text-amber-800">{data.task || 'Complete the exercise.'}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-200">
          <span className="text-xs text-blue-600 font-medium">Word Count</span>
          <p className="text-sm text-blue-800 mt-0.5">{data.wordCount || 'N/A'}</p>
        </div>
        <div className="p-3 rounded-lg bg-violet-50/60 border border-violet-200">
          <span className="text-xs text-violet-600 font-medium">Constructions</span>
          <p className="text-sm text-violet-800 mt-0.5">{data.targetConstructions || 'N/A'}</p>
        </div>
      </div>

      {data.metadata?.target_constructions?.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {data.metadata.target_constructions.map((item: any, idx: number) => (
            <div key={idx} className="p-4 rounded-lg bg-white/80 border border-amber-100 shadow-sm">
              <div className="flex items-center justify-between gap-2 mb-2">
                <h4 className="text-sm font-semibold text-[--deep-slate]">{item.construction || item.name}</h4>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">{item.code || idx + 1}</span>
              </div>
              <p className="text-xs text-[--soft-gray] mb-2">{item.meaning_zh || item.function}</p>
              <p className="text-sm leading-relaxed text-[--deep-slate]">{item.example_sentence || item.example}</p>
            </div>
          ))}
        </div>
      )}

      {data.referenceAnswer && (
        <div className="p-4 rounded-lg bg-green-50/60 border border-green-200">
          <h4 className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Reference Answer
          </h4>
          <p className="text-sm text-green-800 leading-relaxed whitespace-pre-wrap">{data.referenceAnswer}</p>
        </div>
      )}
    </div>
  )
}

export default function AILabPage() {
  const [activeTool, setActiveTool] = useState<ToolId>('analyze')
  const [input, setInput] = useState('')
  const [extraParams, setExtraParams] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'fallback'>('idle')
  const [result, setResult] = useState<AISkillResult<any> | null>(null)
  const [showConfig, setShowConfig] = useState(false)
  const [showRawJson, setShowRawJson] = useState(false)
  const [streamText, setStreamText] = useState('')
  const [reasoningText, setReasoningText] = useState('')
  const resultRef = useRef<HTMLDivElement>(null)

  const [topics, setTopics] = useState<PracticeTopic[]>([])
  const [goals, setGoals] = useState<PracticeGoal[]>([])
  const [levels, setLevels] = useState<PracticeLevel[]>([])
  const [constructions, setConstructions] = useState<Construction[]>([])
  const [loadingOptions, setLoadingOptions] = useState(true)

  const [selectedTopicId, setSelectedTopicId] = useState('')
  const [selectedGoalId, setSelectedGoalId] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('senior')
  const [selectedConstructionId, setSelectedConstructionId] = useState('')

  useEffect(() => {
    async function loadOptions() {
      try {
        const [optionsRes, constructionsRes] = await Promise.all([
          fetch('/api/practice/options'),
          fetch('/api/construction-studio/constructions?pageSize=50&all=true'),
        ])

        const options = await optionsRes.json()
        const constructionsData = await constructionsRes.json()

        setTopics(options.topics || [])
        setGoals(options.goals || [])
        setLevels(options.levels || [])
        setConstructions(constructionsData.constructions || [])

        if (options.topics?.[0]?.id) setSelectedTopicId(options.topics[0].id)
        if (options.goals?.[0]?.id) setSelectedGoalId(options.goals[0].id)
        if (options.levels?.[0]?.value) setSelectedLevel(options.levels[0].value)
        if (constructionsData.constructions?.[0]?.id) setSelectedConstructionId(constructionsData.constructions[0].id)
      } catch (error) {
        console.error('Failed to load options:', error)
      } finally {
        setLoadingOptions(false)
      }
    }
    loadOptions()
  }, [])

  const currentTool = tools.find((t) => t.id === activeTool)!
  const apiConfigured = isAIConfigured()

  const selectedConstruction = useMemo(() => {
    return constructions.find(c => c.id === selectedConstructionId)
  }, [constructions, selectedConstructionId])

  const handleStream = useCallback(async () => {
    if (currentTool.id === 'exercise') {
      if (!selectedTopicId || !selectedGoalId || !selectedLevel) {
        setStreamText('\n\n❌ Please select a topic, goal, and level first.')
        setStatus('error')
        return
      }

      setStatus('loading')
      setResult(null)
      setStreamText('')
      setReasoningText('')

      try {
        const res = await fetch('/api/ai/generate-writing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topicId: selectedTopicId, goalId: selectedGoalId, level: selectedLevel, studentLevel: selectedLevel }),
        })
        const data = await res.json()
        if (!res.ok) {
          setStreamText(`\n\n❌ Request failed: ${data.error || 'Failed to generate exercise'}`)
          if (data.friendlyMessage) {
            setStreamText(prev => `${prev}\n\n💡 ${data.friendlyMessage}`)
          }
          setStatus('error')
          return
        }
        setResult({ success: true, data: data.exercise, usedFallback: data.usedFallback })
        setStatus(data.usedFallback ? 'fallback' : 'success')
      } catch (err: any) {
        setStreamText(`\n\n❌ Request failed: ${err?.message || String(err)}`)
        setStatus('error')
      }
      return
    }

    if (currentTool.id === 'explain' && !input.trim() && selectedConstruction) {
      setInput(selectedConstruction.construction)
    }

    if (!input.trim() && currentTool.id !== 'explain') return

    setStatus('loading')
    setResult(null)
    setStreamText('')
    setReasoningText('')

    const skillInput: Record<string, any> = { ...extraParams }
    if (currentTool.id === 'explain' && selectedConstruction) {
      skillInput.construction = selectedConstruction.construction
      skillInput.constructionId = selectedConstruction.id
    } else if (currentTool.id === 'expand' && selectedConstruction) {
      skillInput.construction = selectedConstruction.construction
      skillInput.constructionId = selectedConstruction.id
    } else if (currentTool.id === 'analyze') {
      skillInput.sentence = input
    }

    try {
      let fullContent = ''
      let fullReasoning = ''
      console.log('[AILab] Starting stream...')

      const skillConfig = getSkillConfig(currentTool.skillName)
      const apiConfig = getAIConfig()

      if (!skillConfig || !apiConfig?.apiKey) {
        throw new Error('API not configured')
      }

      for await (const chunk of callOpenAIStream(skillConfig, skillInput, apiConfig)) {
        console.log('[AILab] Received chunk:', chunk)
        if (chunk.type === 'reasoning') {
          fullReasoning += chunk.text
          setReasoningText(fullReasoning)
        } else if (chunk.type === 'content') {
          fullContent += chunk.text
          setStreamText(fullContent)
        }
      }

      console.log('[AILab] Stream finished, content:', fullContent)
      try {
        const parsed = JSON.parse(fullContent)
        setResult({ success: true, data: parsed, usedFallback: false })
      } catch {
      }
      setStatus('success')
    } catch (err: any) {
      const msg = err?.message || String(err)
      if (msg.includes('fetch') || msg.includes('network') || msg.includes('CORS') || msg.includes('Failed to fetch')) {
        setStreamText(`\n\n❌ **Network connection failed**\n\nError: ${msg}\n\nPossible causes:\n1. CORS policy blocked the request\n2. Incorrect API Key\n3. Network connection issue\n\n**Suggestions:**\n- Check your API Key in the Settings page\n- Try a different API endpoint\n- Check your internet connection\n\n--- Fallback simulation below ---\n\n`)
      } else {
        setStreamText(`\n\n❌ **Request failed**: ${msg}\n\n--- Fallback simulation below ---\n\n`)
      }
      setStatus('fallback')
    }
  }, [input, extraParams, currentTool, selectedTopicId, selectedGoalId, selectedLevel, selectedConstruction])

  useEffect(() => {
    setInput('')
    setExtraParams({})
    setResult(null)
    setStreamText('')
    setReasoningText('')
    setStatus('idle')
    setShowRawJson(false)
  }, [activeTool])

  const loadExample = useCallback(() => {
    if (currentTool.id === 'analyze' && selectedConstruction?.example_sentence) {
      setInput(selectedConstruction.example_sentence)
    } else if (currentTool.id === 'explain' && selectedConstruction) {
      setInput(selectedConstruction.construction)
    } else if (currentTool.id === 'expand' && selectedConstruction?.example_sentence) {
      setInput(selectedConstruction.example_sentence)
    } else if (currentTool.id === 'minimal-pair' && constructions.length >= 2) {
      setInput(`${constructions[0]?.construction} vs ${constructions[1]?.construction}`)
    } else if (selectedConstruction?.example_sentence) {
      setInput(selectedConstruction.example_sentence)
    }
  }, [currentTool, selectedConstruction, constructions])

  return (
    <div className="min-h-[60vh] py-8 px-4 sm:px-6">
      <div className="max-w-[var(--container-max)] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeGentle }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(107,163,190,0.10)' }}
            >
              <Bot className="w-5 h-5" style={{ color: 'var(--lake-blue)' }} />
            </div>
            <div>
              <h1 className="text-h2 text-[--deep-slate]">AI Lab</h1>
              <p className="text-body-sm text-[--soft-gray]">
                AI-powered tools grounded in Construction Grammar theory and real PostgreSQL data
              </p>
            </div>
          </div>
        </motion.div>

        {!apiConfigured && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 rounded-xl flex items-center justify-between"
            style={{
              background: 'rgba(244,162,97,0.08)',
              border: '1px solid rgba(244,162,97,0.15)',
            }}
          >
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4" style={{ color: 'var(--warning)' }} />
              <span className="text-body-sm text-[--deep-slate]">
                AI API not configured. Will use <strong>local fallback</strong> responses.
              </span>
            </div>
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="text-sm font-medium flex items-center gap-1 transition-colors hover:text-[--deep-slate]"
              style={{ color: 'var(--lake-blue)' }}
            >
              <Settings className="w-3.5 h-3.5" />
              {showConfig ? 'Hide' : 'Configure'}
            </button>
          </motion.div>
        )}

        <AnimatePresence>
          {showConfig && <ApiConfigPanel onClose={() => setShowConfig(false)} />}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: easeGentle }}
          className="mb-6"
        >
          <div className="flex flex-wrap gap-2">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-[var(--duration-fast)]"
                style={{
                  background: activeTool === tool.id ? 'var(--lake-blue)' : 'rgba(245,247,250,0.60)',
                  color: activeTool === tool.id ? 'white' : 'var(--deep-slate)',
                  border: activeTool === tool.id ? 'none' : '1px solid var(--glass-border)',
                }}
              >
                {tool.icon}
                <span>{tool.name}</span>
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15, ease: easeGentle }}
          className="mb-6"
        >
          <div
            className="p-4 rounded-xl"
            style={{
              background: 'rgba(107,163,190,0.06)',
              border: '1px solid var(--glass-border)',
            }}
          >
            <h3
              className="font-medium text-base mb-1 flex items-center gap-2"
              style={{ color: 'var(--deep-slate)' }}
            >
              <Info className="w-4 h-4" style={{ color: 'var(--lake-blue)' }} />
              {currentTool.name}
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--soft-gray)' }}>
              {currentTool.description}
            </p>
          </div>
        </motion.div>

        <motion.div
          key={activeTool}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: easeGentle }}
          className="rounded-xl p-5 sm:p-6"
          style={{
            background: 'rgba(255,255,255,0.70)',
            border: '1px solid var(--glass-border)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-h4 text-[--deep-slate] flex items-center gap-2">
                {currentTool.icon}
                {currentTool.name}
              </h2>
              <p className="text-body-sm text-[--soft-gray] mt-1">{currentTool.description}</p>
            </div>
            <StatusBadge status={status} />
          </div>

          <div className="space-y-4 mb-5">
            {activeTool === 'exercise' && !loadingOptions && (
              <div className="p-4 rounded-lg bg-white/60 border border-[--glass-border] space-y-4">
                <h4 className="text-sm font-semibold text-[--deep-slate]">Select Parameters</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-caption text-[--soft-gray] block mb-1">Topic</label>
                    <select
                      value={selectedTopicId}
                      onChange={(e) => setSelectedTopicId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border text-sm"
                      style={{ borderColor: 'var(--glass-border)', background: 'white' }}
                    >
                      {topics.map((t) => (
                        <option key={t.id} value={t.id}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-caption text-[--soft-gray] block mb-1">Goal</label>
                    <select
                      value={selectedGoalId}
                      onChange={(e) => setSelectedGoalId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border text-sm"
                      style={{ borderColor: 'var(--glass-border)', background: 'white' }}
                    >
                      {goals.map((g) => (
                        <option key={g.id} value={g.id}>{g.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-caption text-[--soft-gray] block mb-1">Level</label>
                    <select
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border text-sm"
                      style={{ borderColor: 'var(--glass-border)', background: 'white' }}
                    >
                      {levels.map((l) => (
                        <option key={l.value} value={l.value}>{l.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {selectedTopicId && selectedGoalId && (
                  <div className="text-xs text-[--soft-gray]">
                    <span className="font-medium text-[--deep-slate]">Selected: </span>
                    {topics.find(t => t.id === selectedTopicId)?.label} + {goals.find(g => g.id === selectedGoalId)?.label}
                  </div>
                )}
              </div>
            )}

            {(activeTool === 'explain' || activeTool === 'expand') && !loadingOptions && (
              <div className="p-4 rounded-lg bg-white/60 border border-[--glass-border]">
                <h4 className="text-sm font-semibold text-[--deep-slate] mb-2">Select a Construction</h4>
                <select
                  value={selectedConstructionId}
                  onChange={(e) => {
                    setSelectedConstructionId(e.target.value)
                    if (activeTool === 'explain') {
                      const c = constructions.find(c => c.id === e.target.value)
                      if (c) setInput(c.construction)
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ borderColor: 'var(--glass-border)', background: 'white' }}
                >
                  {constructions.map((c) => (
                    <option key={c.id} value={c.id}>{c.code} — {c.construction}</option>
                  ))}
                </select>
                {selectedConstruction && (
                  <div className="mt-3 text-xs text-[--soft-gray] space-y-1">
                    <p><span className="font-medium text-[--deep-slate]">Meaning:</span> {selectedConstruction.meaning_zh}</p>
                    <p><span className="font-medium text-[--deep-slate]">Example:</span> {selectedConstruction.example_sentence}</p>
                  </div>
                )}
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-caption text-[--soft-gray]">{currentTool.inputLabel}</label>
                <button
                  onClick={loadExample}
                  className="text-caption flex items-center gap-1 transition-colors hover:text-[--deep-slate]"
                  style={{ color: 'var(--lake-blue)' }}
                >
                  <Sparkles className="w-3 h-3" />
                  Load Example
                </button>
              </div>
              {currentTool.inputType === 'textarea' ? (
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={currentTool.placeholder}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border text-sm resize-none"
                  style={{ borderColor: 'var(--glass-border)', background: 'white' }}
                />
              ) : currentTool.inputType === 'select' ? null : (
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={currentTool.placeholder}
                  className="w-full px-4 py-3 rounded-lg border text-sm"
                  style={{ borderColor: 'var(--glass-border)', background: 'white' }}
                />
              )}
            </div>

            {currentTool.extraParams && currentTool.extraParams.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentTool.extraParams.map((param) => (
                  <div key={param.key}>
                    <label className="text-caption text-[--soft-gray] block mb-1">{param.label}</label>
                    {param.type === 'select' && param.options ? (
                      <select
                        value={extraParams[param.key] || ''}
                        onChange={(e) => setExtraParams((prev) => ({ ...prev, [param.key]: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border text-sm"
                        style={{ borderColor: 'var(--glass-border)', background: 'white' }}
                      >
                        {param.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={extraParams[param.key] || ''}
                        onChange={(e) => setExtraParams((prev) => ({ ...prev, [param.key]: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border text-sm"
                        style={{ borderColor: 'var(--glass-border)', background: 'white' }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={handleStream}
                disabled={status === 'loading' || loadingOptions}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                style={{ background: 'var(--lake-blue)' }}
              >
                {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
                {status === 'loading' ? 'Processing...' : 'Run'}
              </button>
              <button
                onClick={() => setShowConfig(!showConfig)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm transition-all hover:-translate-y-0.5"
                style={{
                  background: 'transparent',
                  color: 'var(--soft-gray)',
                  border: '1px solid var(--glass-border)',
                }}
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {(streamText || reasoningText) && !result && (
              <motion.div
                key="stream"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="mt-6 space-y-4"
              >
                {reasoningText && (
                  <div
                    className="p-4 rounded-lg text-sm leading-relaxed"
                    style={{
                      background: 'rgba(138,184,154,0.08)',
                      border: '1px solid rgba(138,184,154,0.2)',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2 text-[--lake-green]">
                      <Loader2 className={`w-4 h-4 ${status === 'loading' ? 'animate-spin' : ''}`} />
                      <span className="font-medium">AI is thinking...</span>
                    </div>
                    <div className="text-[--soft-gray] whitespace-pre-wrap font-mono text-xs">
                      {reasoningText}
                    </div>
                  </div>
                )}

                {streamText && (
                  <div
                    className="p-4 rounded-lg text-sm leading-relaxed markdown-content"
                    style={{
                      background: 'rgba(107,163,190,0.04)',
                      border: '1px solid var(--glass-border)',
                      minHeight: '120px',
                    }}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {streamText || ''}
                    </ReactMarkdown>
                    {status === 'loading' && (
                      <span className="inline-block w-2 h-4 ml-1 bg-[--lake-blue] animate-pulse" />
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {result && result.success && result.data && currentTool.id === 'exercise' && (
              <motion.div
                key="result"
                ref={resultRef}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="mt-6"
              >
                {result.usedFallback && (
                  <div
                    className="mb-4 p-3 rounded-lg flex items-center gap-2"
                    style={{ background: 'rgba(244,162,97,0.08)', border: '1px solid rgba(244,162,97,0.15)' }}
                  >
                    <RefreshCw className="w-4 h-4" style={{ color: 'var(--warning)' }} />
                    <span className="text-body-sm text-[--deep-slate]">
                      AI service unavailable — using <strong>local fallback</strong> response.
                    </span>
                  </div>
                )}
                {result.error && !result.usedFallback && (
                  <div
                    className="mb-4 p-3 rounded-lg flex items-center gap-2"
                    style={{ background: 'rgba(231,111,81,0.08)', border: '1px solid rgba(231,111,81,0.15)' }}
                  >
                    <AlertCircle className="w-4 h-4" style={{ color: 'var(--error)' }} />
                    <span className="text-body-sm text-[--deep-slate]">{result.error}</span>
                  </div>
                )}
                <ExerciseResult data={result.data} />
                {result.data && (
                  <div className="mt-6">
                    <button
                      onClick={() => setShowRawJson(!showRawJson)}
                      className="text-caption flex items-center gap-1 transition-colors hover:text-[--deep-slate]"
                      style={{ color: 'var(--soft-gray)' }}
                    >
                      {showRawJson ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      {showRawJson ? 'Hide' : 'Show'} Raw JSON
                    </button>
                    {showRawJson && <JsonDisplay data={result.data} title="Raw JSON Response" />}
                  </div>
                )}
              </motion.div>
            )}

            {result && result.success && result.data && currentTool.id !== 'exercise' && (
              <motion.div
                key="result"
                ref={resultRef}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="mt-6"
              >
                {result.usedFallback && (
                  <div
                    className="mb-4 p-3 rounded-lg flex items-center gap-2"
                    style={{ background: 'rgba(244,162,97,0.08)', border: '1px solid rgba(244,162,97,0.15)' }}
                  >
                    <RefreshCw className="w-4 h-4" style={{ color: 'var(--warning)' }} />
                    <span className="text-body-sm text-[--deep-slate]">
                      AI service unavailable — using <strong>local fallback</strong> response.
                    </span>
                  </div>
                )}
                {result.error && !result.usedFallback && (
                  <div
                    className="mb-4 p-3 rounded-lg flex items-center gap-2"
                    style={{ background: 'rgba(231,111,81,0.08)', border: '1px solid rgba(231,111,81,0.15)' }}
                  >
                    <AlertCircle className="w-4 h-4" style={{ color: 'var(--error)' }} />
                    <span className="text-body-sm text-[--deep-slate]">{result.error}</span>
                  </div>
                )}
                <JsonDisplay data={result.data} title="Response" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
