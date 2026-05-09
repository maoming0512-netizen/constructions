﻿'use client'

/**
 * AI Lab Page
 *
 * Interactive playground for AI-powered construction grammar tools.
 * Uses the new skill-based AI system with built-in prompts and fallbacks.
 *
 * Features:
 * - Sentence analysis with Goldberg theory grounding
 * - Exercise generation
 * - Minimal pair comparison
 * - Teacher explanation
 * - Construction expansion (prototype → extensions)
 * - API configuration UI
 * - Skill call status indicators
 */

import { useState, useRef, useEffect, useCallback } from 'react'
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

// Output types — using any since skill responses vary
type AnalyzeSentenceOutput = any
type GenerateExerciseOutput = any
type MinimalPairOutput = any
type TeacherExplainOutput = any
type ConstructionExpandOutput = any

/* ─────────────────────────── Types ─────────────────────────── */

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

/* ─────────────────────────── Tool Definitions ─────────────────────────── */

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
          { value: 'beginner', label: 'Beginner' },
          { value: 'intermediate', label: 'Intermediate' },
          { value: 'advanced', label: 'Advanced' },
        ],
      },
    ],
  },
  {
    id: 'exercise',
    name: 'Writing Exercise',
    description: 'Select the level, exercise type, and theme, and the AI will generate a complete writing exercise following the official exercise format. You can save it to your personal exercise bank.',
    icon: <PenTool className="w-5 h-5" />,
    skillName: 'genWriting',
    placeholder: 'e.g., food, festivals, study abroad...',
    inputLabel: 'Theme (optional)',
    inputType: 'text',
    extraParams: [
      {
        key: 'level',
        label: 'Level',
        type: 'select',
        options: [
          { value: 'junior', label: 'Junior High' },
          { value: 'senior', label: 'Senior High' },
        ],
      },
      {
        key: 'type',
        label: 'Exercise Type',
        type: 'select',
        options: [
          { value: 'D1', label: 'D1 — Micro Continuation' },
          { value: 'D2', label: 'D2 — Long Continuation' },
          { value: 'T1', label: 'T1 — C-E Translation' },
        ],
      },
    ],
  },
  {
    id: 'minimal-pair',
    name: 'Minimal Pair',
    description: 'Generate contrasting sentence pairs showing the same verb in different constructions. Compare, for example, the ditransitive vs. caused-motion construction to understand subtle semantic differences.',
    icon: <Scale className="w-5 h-5" />,
    skillName: 'minimalPair',
    placeholder: 'e.g., ditransitive vs caused-motion',
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
    description: 'Select a construction and the AI will provide an in-depth explanation: form template, core meaning, typical verbs, example sentences. Choose teaching depth and focus areas. Ideal for learning new constructions or review.',
    icon: <Lightbulb className="w-5 h-5" />,
    skillName: 'teacherExplain',
    placeholder: 'e.g., ditransitive, caused-motion...',
    inputLabel: 'Construction Name',
    inputType: 'text',
    extraParams: [
      {
        key: 'difficulty',
        label: 'Teaching Depth',
        type: 'select',
        options: [
          { value: 'beginner', label: 'Beginner-friendly' },
          { value: 'intermediate', label: 'Intermediate' },
          { value: 'advanced', label: 'Advanced (with theory)' },
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
    description: "Enter a prototype sentence (e.g., 'She put the book on the table'). The AI generates extended examples of the same construction using different verbs — from common to creative uses. Explore the productivity and boundaries of constructions.",
    icon: <Expand className="w-5 h-5" />,
    skillName: 'constructionExpand',
    placeholder: 'Enter a prototype sentence...',
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

/* ─────────────────────────── Easing ─────────────────────────── */

const easeGentle = [0.22, 1, 0.36, 1] as [number, number, number, number]

/* ─────────────────────────── Status Badge ─────────────────────────── */

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

/* ─────────────────────────── API Config Panel ─────────────────────────── */

function ApiConfigPanel({ onClose }: { onClose: () => void }) {
  const existing = getAIConfig()
  const [apiKey, setApiKey] = useState(existing?.apiKey || '')
  const [baseURL, setBaseURL] = useState(existing?.baseURL || 'https://api.moonshot.cn/v1')
  const [model, setModel] = useState(existing?.model || 'kimi-k2.6')
  const [saved, setSaved] = useState(false)

  const presets = [
    { name: 'Kimi (Moonshot)', baseURL: 'https://api.moonshot.cn/v1', model: 'kimi-k2.6' },
    { name: 'SiliconFlow', baseURL: 'https://api.siliconflow.cn', model: 'deepseek-ai/DeepSeek-V4-Flash' },
    { name: 'OpenAI', baseURL: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
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

      {/* Presets */}
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
            placeholder="https://api.openai.com/v1"
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
            placeholder="kimi-k2.6"
            className="w-full px-3 py-2 rounded-lg border text-sm"
            style={{ borderColor: 'var(--glass-border)', background: 'white' }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <p className="text-caption text-[--soft-gray]">
          <Server className="w-3 h-3 inline mr-1" />
          Compatible with any OpenAI-compatible API provider
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

/* ─────────────────────────── JSON Display ─────────────────────────── */

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

/* ─────────────────────────── Specialized Result Renderers ─────────────────────────── */

function AnalyzeResult({ data }: { data: AnalyzeSentenceOutput }) {
  return (
    <div className="space-y-5">
      {/* Detected Constructions */}
      <div>
        <h4 className="text-sm font-semibold text-[--deep-slate] mb-2">Detected Constructions</h4>
        <div className="space-y-2">
          {data.detectedConstructions.map((c: any, i: number) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 rounded-lg"
              style={{ background: 'rgba(107,163,190,0.06)' }}
            >
              <span
                className="text-caption px-2 py-0.5 rounded-full mt-0.5"
                style={{
                  background:
                    c.confidence === 'high'
                      ? 'rgba(107,203,119,0.15)'
                      : c.confidence === 'medium'
                        ? 'rgba(244,162,97,0.15)'
                        : 'rgba(231,111,81,0.15)',
                  color:
                    c.confidence === 'high'
                      ? 'var(--success)'
                      : c.confidence === 'medium'
                        ? 'var(--warning)'
                        : 'var(--error)',
                }}
              >
                {c.confidence}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-[--deep-slate]">{c.name}</p>
                <p className="text-caption text-[--soft-gray] font-mono">{c.formDescription}</p>
                <p className="text-body-sm text-[--deep-slate] mt-1">{c.meaning}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Naturalness */}
      <div className="p-4 rounded-lg" style={{ background: 'rgba(138,184,154,0.08)' }}>
        <h4 className="text-sm font-semibold text-[--deep-slate] mb-2">Naturalness Assessment</h4>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-h3" style={{ color: 'var(--lake-green)' }}>{data.naturalness.score}</span>
          <span className="text-caption px-2 py-0.5 rounded-full" style={{ background: 'rgba(138,184,154,0.15)', color: 'var(--lake-green)' }}>
            {data.naturalness.level}
          </span>
        </div>
        <p className="text-body-sm text-[--deep-slate]">{data.naturalness.explanation}</p>
      </div>

      {/* Semantic Roles */}
      <div>
        <h4 className="text-sm font-semibold text-[--deep-slate] mb-2">Semantic Roles</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {data.semanticRoles.map((role: any, i: number) => (
            <div
              key={i}
              className="p-3 rounded-lg flex items-start gap-2"
              style={{ background: 'rgba(184,169,201,0.08)' }}
            >
              <span className="text-caption font-mono px-2 py-0.5 rounded bg-white/60">{role.phrase}</span>
              <div>
                <span className="text-caption font-semibold" style={{ color: 'var(--lavender)' }}>{role.role}</span>
                <p className="text-caption text-[--soft-gray]">{role.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chinese Feedback */}
      <div className="p-4 rounded-lg" style={{ background: 'rgba(107,163,190,0.08)', border: '1px solid rgba(107,163,190,0.15)' }}>
        <h4 className="text-sm font-semibold text-[--lake-blue] mb-2 flex items-center gap-1.5">
          <Bot className="w-4 h-4" />
          AI Feedback
        </h4>
        <p className="text-body-sm text-[--deep-slate] whitespace-pre-line leading-relaxed">{data.feedbackZh}</p>
      </div>

      {/* Alternatives */}
      {data.suggestedAlternatives.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-[--deep-slate] mb-2">Suggested Alternatives</h4>
          <ul className="space-y-1.5">
            {data.suggestedAlternatives.map((alt: any, i: number) => (
              <li key={i} className="text-body-sm text-[--deep-slate] pl-4 relative before:content-['→'] before:absolute before:left-0 before:text-[--lake-blue]">
                {alt}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Practice Prompts */}
      {data.practicePrompts.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-[--deep-slate] mb-2">Practice Prompts</h4>
          <div className="flex flex-wrap gap-2">
            {data.practicePrompts.map((p: any, i: number) => (
              <span
                key={i}
                className="text-caption px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(107,163,190,0.10)', color: 'var(--lake-blue)' }}
              >
                {p}
              </span>
            ))}
          </div>
        </div>
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
    T1: <Globe className="w-4 h-4" />,
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
            {data.type === 'D1' ? 'Micro Continuation' : data.type === 'D2' ? 'Long Continuation' : 'C-E Translation'}
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
          {data.type === 'T1' ? 'Chinese Source Text' : 'Reading Passage'}
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

      <div className="p-4 rounded-lg bg-green-50/60 border border-green-200">
        <h4 className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Reference Answer
        </h4>
        <p className="text-sm text-green-800 leading-relaxed whitespace-pre-wrap">{data.referenceAnswer || 'No reference answer.'}</p>
      </div>
    </div>
  )
}

function MinimalPairResult({ data }: { data: MinimalPairOutput }) {
  return (
    <div className="space-y-6">
      {data.pairs.map((pair: any, i: number) => (
        <div
          key={i}
          className="rounded-xl p-5"
          style={{
            background: 'rgba(245,247,250,0.60)',
            border: '1px solid var(--glass-border)',
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Sentence A */}
            <div className="p-4 rounded-lg" style={{ background: 'rgba(107,163,190,0.08)' }}>
              <span className="text-caption font-semibold" style={{ color: 'var(--lake-blue)' }}>A</span>
              <p className="text-body font-medium text-[--deep-slate] mt-1 italic">{pair.sentenceA}</p>
              <p className="text-caption text-[--soft-gray] mt-2 font-semibold">{pair.constructionA.name}</p>
              <p className="text-caption text-[--soft-gray] font-mono">{pair.constructionA.form}</p>
              <p className="text-caption text-[--deep-slate] mt-1">{pair.constructionA.meaning}</p>
            </div>
            {/* Sentence B */}
            <div className="p-4 rounded-lg" style={{ background: 'rgba(184,169,201,0.08)' }}>
              <span className="text-caption font-semibold" style={{ color: 'var(--lavender)' }}>B</span>
              <p className="text-body font-medium text-[--deep-slate] mt-1 italic">{pair.sentenceB}</p>
              <p className="text-caption text-[--soft-gray] mt-2 font-semibold">{pair.constructionB.name}</p>
              <p className="text-caption text-[--soft-gray] font-mono">{pair.constructionB.form}</p>
              <p className="text-caption text-[--deep-slate] mt-1">{pair.constructionB.meaning}</p>
            </div>
          </div>

          {/* Difference */}
          <div className="p-4 rounded-lg" style={{ background: 'rgba(138,184,154,0.06)', border: '1px solid rgba(138,184,154,0.12)' }}>
            <h5 className="text-caption font-semibold text-[--lake-green] mb-1">Difference</h5>
            <p className="text-body-sm text-[--deep-slate] leading-relaxed">{pair.difference}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-3">
            <p className="text-caption text-[--deep-slate]">
              <span className="text-[--lake-blue]">A:</span> {pair.meaningA}
            </p>
            <p className="text-caption text-[--deep-slate]">
              <span className="text-[--lavender]">B:</span> {pair.meaningB}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

function ExplainResult({ data }: { data: TeacherExplainOutput }) {
  return (
    <div className="space-y-6">
      {/* Concept Header */}
      <div className="text-center p-5 rounded-xl" style={{ background: 'rgba(107,163,190,0.08)', border: '1px solid rgba(107,163,190,0.15)' }}>
        <h3 className="text-h3 text-[--deep-slate]">{data.concept.name}</h3>
        <p className="text-body-lg mt-1" style={{ color: 'var(--lake-blue)' }}>{data.concept.nameZh}</p>
        <p className="text-body text-[--deep-slate] mt-2">{data.concept.definition}</p>
        <div className="mt-3 p-3 rounded-lg bg-white/40 inline-block">
          <p className="text-caption text-[--deep-slate] italic">{data.concept.keyIdea}</p>
        </div>
      </div>

      {/* Form Pattern */}
      <div>
        <h4 className="text-sm font-semibold text-[--deep-slate] mb-3 flex items-center gap-1.5">
          <GitBranch className="w-4 h-4" />
          Form Pattern
        </h4>
        <div className="p-4 rounded-lg font-mono text-sm text-center mb-3" style={{ background: 'rgba(245,247,250,0.80)', border: '1px solid var(--glass-border)' }}>
          {data.formPattern.pattern}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {data.formPattern.slots.map((slot: any, i: number) => (
            <div key={i} className="p-3 rounded-lg flex items-start gap-3" style={{ background: 'rgba(107,163,190,0.04)' }}>
              <span className="text-caption font-semibold text-[--lake-blue]">{slot.slot}</span>
              <div>
                <p className="text-caption text-[--deep-slate]">{slot.description}</p>
                <p className="text-caption text-[--soft-gray] font-mono">e.g., {slot.example}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Core Meaning */}
      <div className="p-4 rounded-lg" style={{ background: 'rgba(138,184,154,0.06)', border: '1px solid rgba(138,184,154,0.12)' }}>
        <h4 className="text-sm font-semibold text-[--lake-green] mb-2">Core Meaning</h4>
        <p className="text-body text-[--deep-slate]">{data.coreMeaning.meaning}</p>
        <p className="text-body-sm text-[--soft-gray] mt-1">{data.coreMeaning.meaningEn}</p>
        <blockquote className="mt-3 pl-4 border-l-2 text-caption text-[--soft-gray] italic" style={{ borderColor: 'var(--lake-green)' }}>
          {data.coreMeaning.goldbergQuote}
        </blockquote>
      </div>

      {/* Typical Verbs */}
      <div>
        <h4 className="text-sm font-semibold text-[--deep-slate] mb-3">Typical Verbs</h4>
        <div className="space-y-2">
          {data.typicalVerbs.map((v: any, i: number) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'rgba(245,247,250,0.40)' }}>
              <span className="text-body font-medium text-[--deep-slate] w-20">{v.verb}</span>
              <span className="text-caption text-[--soft-gray] flex-1">{v.category}</span>
              <span
                className="text-caption px-2 py-0.5 rounded-full"
                style={{
                  background: v.naturalness === 'high' ? 'rgba(107,203,119,0.10)' : v.naturalness === 'medium' ? 'rgba(244,162,97,0.10)' : 'rgba(231,111,81,0.10)',
                  color: v.naturalness === 'high' ? 'var(--success)' : v.naturalness === 'medium' ? 'var(--warning)' : 'var(--error)',
                }}
              >
                {v.naturalness}
              </span>
              <span className="text-caption text-[--deep-slate] italic">{v.example}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Examples */}
      <div>
        <h4 className="text-sm font-semibold text-[--deep-slate] mb-3">Examples</h4>
        <div className="space-y-3">
          {data.examples.map((ex: any, i: number) => (
            <div
              key={i}
              className="p-4 rounded-lg"
              style={{
                background:
                  ex.type === 'prototype'
                    ? 'rgba(107,203,119,0.06)'
                    : ex.type === 'extension'
                      ? 'rgba(107,163,190,0.06)'
                      : 'rgba(244,162,97,0.06)',
                border: `1px solid ${
                  ex.type === 'prototype'
                    ? 'rgba(107,203,119,0.15)'
                    : ex.type === 'extension'
                      ? 'rgba(107,163,190,0.15)'
                      : 'rgba(244,162,97,0.15)'
                }`,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-caption px-2 py-0.5 rounded-full"
                  style={{
                    background:
                      ex.type === 'prototype'
                        ? 'rgba(107,203,119,0.12)'
                        : ex.type === 'extension'
                          ? 'rgba(107,163,190,0.12)'
                          : 'rgba(244,162,97,0.12)',
                    color:
                      ex.type === 'prototype'
                        ? 'var(--success)'
                        : ex.type === 'extension'
                          ? 'var(--lake-blue)'
                          : 'var(--warning)',
                  }}
                >
                  {ex.type}
                </span>
              </div>
              <p className="text-body font-medium text-[--deep-slate] italic">{ex.sentence}</p>
              <p className="text-body-sm text-[--deep-slate] mt-1">{ex.annotation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Learning Tips */}
      <div>
        <h4 className="text-sm font-semibold text-[--deep-slate] mb-3 flex items-center gap-1.5">
          <Lightbulb className="w-4 h-4" />
          Learning Tips
        </h4>
        <div className="space-y-2">
          {data.learningTips.map((tip: any, i: number) => (
            <div key={i} className="p-3 rounded-lg flex items-start gap-3" style={{ background: 'rgba(107,163,190,0.04)' }}>
              <span className="text-caption font-semibold text-[--lake-blue] mt-0.5">{i + 1}</span>
              <div>
                <p className="text-body-sm text-[--deep-slate]">{tip.tip}</p>
                <span className="text-caption text-[--soft-gray]">{tip.focus}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Related Constructions */}
      {data.relatedConstructions.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-[--deep-slate] mb-3">Related Constructions</h4>
          <div className="space-y-2">
            {data.relatedConstructions.map((rel: any, i: number) => (
              <div key={i} className="p-3 rounded-lg" style={{ background: 'rgba(184,169,201,0.06)', border: '1px solid rgba(184,169,201,0.10)' }}>
                <div className="flex items-center gap-2">
                  <span className="text-body-sm font-medium text-[--deep-slate]">{rel.name}</span>
                  <span className="text-caption px-2 py-0.5 rounded-full bg-white/50 text-[--soft-gray]">{rel.relation}</span>
                </div>
                <p className="text-body-sm text-[--deep-slate] mt-1">{rel.comparison}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ExpandResult({ data }: { data: ConstructionExpandOutput }) {
  return (
    <div className="space-y-6">
      {/* Prototype */}
      <div
        className="rounded-xl p-5"
        style={{
          background: 'rgba(107,203,119,0.06)',
          border: '1px solid rgba(107,203,119,0.15)',
        }}
      >
        <span className="text-caption px-2 py-0.5 rounded-full" style={{ background: 'rgba(107,203,119,0.12)', color: 'var(--success)' }}>
          Prototype
        </span>
        <p className="text-body-lg font-medium text-[--deep-slate] mt-2 italic">{data.prototype.sentence}</p>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-caption text-[--lake-blue]">{data.prototype.construction}</span>
          <span className="text-caption text-[--soft-gray]">{data.prototype.verbType}</span>
        </div>
        <p className="text-body-sm text-[--deep-slate] mt-2">{data.prototype.whyPrototype}</p>
      </div>

      {/* Extensions */}
      <div>
        <h4 className="text-sm font-semibold text-[--deep-slate] mb-3">Extensions (radial network)</h4>
        <div className="space-y-4">
          {data.extensions.map((ext: any, i: number) => {
            const hue = 120 - (ext.level - 1) * 25
            const sat = 70 - ext.level * 8
            return (
              <div
                key={i}
                className="relative pl-6"
              >
                {/* Connector line */}
                {i < data.extensions.length - 1 && (
                  <div
                    className="absolute left-2.5 top-8 w-px bottom-[-16px]"
                    style={{ background: `linear-gradient(to bottom, hsl(${hue}, ${sat}%, 60%), transparent)` }}
                  />
                )}
                {/* Level dot */}
                <div
                  className="absolute left-1 top-2 w-3 h-3 rounded-full border-2 border-white"
                  style={{ background: `hsl(${hue}, ${sat}%, 50%)` }}
                />

                <div
                  className="p-4 rounded-lg"
                  style={{
                    background: `hsla(${hue}, ${sat}%, 50%, 0.05)`,
                    border: `1px solid hsla(${hue}, ${sat}%, 50%, 0.12)`,
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-caption px-2 py-0.5 rounded-full"
                      style={{
                        background: `hsla(${hue}, ${sat}%, 50%, 0.10)`,
                        color: `hsl(${hue}, ${sat}%, 40%)`,
                      }}
                    >
                      Level {ext.level}
                    </span>
                    <span className="text-caption font-medium text-[--deep-slate]">{ext.verb}</span>
                  </div>
                  <p className="text-body font-medium text-[--deep-slate] italic">{ext.sentence}</p>
                  <p className="text-body-sm text-[--deep-slate] mt-2 leading-relaxed">{ext.note}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────── Dynamic Result Renderer ─────────────────────────── */

function SkillResult({ toolId, data }: { toolId: ToolId; data: any }) {
  switch (toolId) {
    case 'analyze':
      return <AnalyzeResult data={data as AnalyzeSentenceOutput} />
    case 'exercise':
      return <ExerciseResult data={data as GenerateExerciseOutput} />
    case 'minimal-pair':
      return <MinimalPairResult data={data as MinimalPairOutput} />
    case 'explain':
      return <ExplainResult data={data as TeacherExplainOutput} />
    case 'expand':
      return <ExpandResult data={data as ConstructionExpandOutput} />
    default:
      return <JsonDisplay data={data} title="Raw Response" />
  }
}

/* ─────────────────────────── Main Page ─────────────────────────── */

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

  const currentTool = tools.find((t) => t.id === activeTool)!
  const apiConfigured = isAIConfigured()

  const handleStream = useCallback(async () => {
    if (!input.trim() && currentTool.id !== 'explain') return

    setStatus('loading')
    setResult(null)
    setStreamText('')
    setReasoningText('')

    const skillInput: Record<string, any> = { ...extraParams }

    switch (currentTool.id) {
      case 'analyze':
        skillInput.sentence = input
        break
      case 'explain':
        skillInput.construction = input.trim() || 'ditransitive'
        if (!skillInput.focusArea) skillInput.focusArea = 'all'
        break
      case 'expand':
        if (input.trim()) skillInput.prototypeSentence = input
        skillInput.construction = 'ditransitive'
        if (!skillInput.creativityLevel) skillInput.creativityLevel = 'medium'
        break
      default:
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
      // After streaming ends, try to parse as JSON for structured display
      try {
        const parsed = JSON.parse(fullContent)
        setResult({ success: true, data: parsed, usedFallback: false })
      } catch {
        // Not valid JSON, keep markdown text display
      }
      setStatus('success')
    } catch (err: any) {
      const msg = err?.message || String(err)
      if (msg.includes('fetch') || msg.includes('network') || msg.includes('CORS') || msg.includes('Failed to fetch')) {
        setStreamText(`\n\n❌ **Network connection failed**\n\nError: ${msg}\n\nPossible causes: \n1. CORS policy blocked the request\n2. Incorrect API Key\n3. Network connection issue\n\n**Suggestions**:\n- Check your API Key in the Settings page\n- Try a different API endpoint\n- Check your internet connection\n\n--- Fallback simulation below ---\n\n`)
      } else {
        setStreamText(`\n\n❌ **Request failed**: ${msg}\n\n--- Fallback simulation below ---\n\n`)
      }
      // Still show fallback data
      setStatus('fallback')
    }
  }, [input, extraParams, currentTool])

  // Reset input when switching tools
  useEffect(() => {
    setInput('')
    setExtraParams({})
    setResult(null)
    setStreamText('')
    setReasoningText('')
    setStatus('idle')
    setShowRawJson(false)
  }, [activeTool])

  const exampleInputs: Record<ToolId, string> = {
    analyze: 'She gave him a book.',
    exercise: 'ditransitive',
    'minimal-pair': 'ditransitive vs caused-motion',
    explain: 'ditransitive',
    expand: 'She gave him a book.',
  }

  const loadExample = () => {
    setInput(exampleInputs[activeTool])
  }

  return (
    <div className="min-h-[60vh] py-8 px-4 sm:px-6">
      <div className="max-w-[var(--container-max)] mx-auto">
        {/* Header */}
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
                AI-powered tools grounded in Construction Grammar theory
              </p>
            </div>
          </div>
        </motion.div>

        {/* API Config Banner */}
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

        {/* API Config Panel */}
        <AnimatePresence>
          {showConfig && <ApiConfigPanel onClose={() => setShowConfig(false)} />}
        </AnimatePresence>

        {/* Tool Tabs */}
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

        {/* Tool Description */}
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

        {/* Active Tool Panel */}
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
          {/* Tool Header */}
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

          {/* Input Area */}
          <div className="space-y-4 mb-5">
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
              ) : (
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

            {/* Extra Parameters */}
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
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
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

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleStream}
                disabled={status === 'loading' || (!input.trim() && currentTool.id !== 'exercise' && currentTool.id !== 'explain' && currentTool.id !== 'minimal-pair' && currentTool.id !== 'expand')}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
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

          {/* Result Area */}
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
                {/* Reasoning Area - Show AI reasoning */}
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
                
                {/* Content Area - Show response */}
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

            {result && (
              <motion.div
                key="result"
                ref={resultRef}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="mt-6"
              >
                {/* Status indicator */}
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

                {/* Rendered Result */}
                {result.success && result.data && (
                  <SkillResult toolId={activeTool} data={result.data} />
                )}

                {/* Raw JSON Toggle */}
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
                    {showRawJson && (
                      <div className="mt-2">
                        <JsonDisplay data={result.data} title="Raw JSON Response" />
                      </div>
                    )}
                  </div>
                )}

                {/* Raw Response */}
                {result.rawResponse && (
                  <div className="mt-4 p-3 rounded-lg" style={{ background: 'rgba(231,111,81,0.04)' }}>
                    <span className="text-caption text-[--soft-gray]">Raw response log:</span>
                    <p className="text-caption text-[--deep-slate] mt-1">{result.rawResponse}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
