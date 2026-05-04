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
    name: '句子分析',
    description: '输入任意英文句子，AI会识别其中的构式，评估自然度，标注语义角色，并给出中文解释。适合检查自己写的句子是否符合英语构式习惯。',
    icon: <FileText className="w-5 h-5" />,
    skillName: 'analyzeSentence',
    placeholder: '输入一个英文句子进行分析...',
    inputLabel: '英文句子',
    inputType: 'textarea',
    extraParams: [
      {
        key: 'learnerLevel',
        label: '学习者水平',
        type: 'select',
        options: [
          { value: 'beginner', label: '初级' },
          { value: 'intermediate', label: '中级' },
          { value: 'advanced', label: '高级' },
        ],
      },
    ],
  },
  {
    id: 'exercise',
    name: '练习生成',
    description: '选择构式、难度和练习类型，AI自动生成一道练习题。生成的题目可以保存到题库，扩充你的练习资源。适合针对薄弱环节专项训练。',
    icon: <BookOpen className="w-5 h-5" />,
    skillName: 'generateExercise',
    placeholder: '例如：ditransitive, caused-motion, resultative...',
    inputLabel: '构式名称',
    inputType: 'text',
    extraParams: [
      {
        key: 'difficulty',
        label: '难度等级',
        type: 'select',
        options: [
          { value: '1', label: '等级 1 - 基础' },
          { value: '2', label: '等级 2 - 中等' },
          { value: '3', label: '等级 3 - 高级' },
        ],
      },
      {
        key: 'exerciseType',
        label: '练习类型',
        type: 'select',
        options: [
          { value: 'meaning-from-form', label: '根据形式判断意义' },
          { value: 'naturalness-judgment', label: '自然度判断' },
          { value: 'prototype-to-extension', label: '原型到扩展' },
          { value: 'repair-sentence', label: '句子修正' },
          { value: 'generate-by-construction', label: '按构式生成' },
        ],
      },
    ],
  },
  {
    id: 'minimal-pair',
    name: '最小对',
    description: 'AI生成两个相关构式的对比例句，帮助你感受同一动词在不同构式中的语义差异。例如：双及物构式 vs. 致使移动构式。适合理解构式之间的微妙区别。',
    icon: <Scale className="w-5 h-5" />,
    skillName: 'minimalPair',
    placeholder: '例如：ditransitive vs caused-motion',
    inputLabel: '构式对（可选）',
    inputType: 'text',
    extraParams: [
      {
        key: 'count',
        label: '对比例句数量',
        type: 'select',
        options: [
          { value: '2', label: '2 对' },
          { value: '3', label: '3 对' },
          { value: '4', label: '4 对' },
        ],
      },
    ],
  },
  {
    id: 'explain',
    name: '教师讲解',
    description: '选择一个构式，AI会用中文进行系统讲解，包括形式模板、核心意义、典型动词、常见例句等。可以指定讲解深度（初级/中级/高级）和侧重点。适合学习新构式或复习巩固。',
    icon: <Lightbulb className="w-5 h-5" />,
    skillName: 'teacherExplain',
    placeholder: '例如：ditransitive, caused-motion, way-construction...',
    inputLabel: '构式名称',
    inputType: 'text',
    extraParams: [
      {
        key: 'difficulty',
        label: '讲解深度',
        type: 'select',
        options: [
          { value: 'beginner', label: '初学者易懂' },
          { value: 'intermediate', label: '中级' },
          { value: 'advanced', label: '高级（含理论）' },
        ],
      },
      {
        key: 'focusArea',
        label: '侧重方向',
        type: 'select',
        options: [
          { value: 'all', label: '全面讲解' },
          { value: 'form', label: '形式模板' },
          { value: 'meaning', label: '核心意义' },
          { value: 'verbs', label: '典型动词' },
          { value: 'comparison', label: '相关构式对比' },
        ],
      },
    ],
  },
  {
    id: 'expand',
    name: '构式扩展',
    description: '输入一个原型例句（如She put the book on the table），AI会生成同一构式但使用不同动词的扩展例句，从常见用法到创造性用法。适合体会构式的能产性和边界。',
    icon: <Expand className="w-5 h-5" />,
    skillName: 'constructionExpand',
    placeholder: '输入一个原型例句...',
    inputLabel: '原型例句',
    inputType: 'textarea',
    extraParams: [
      {
        key: 'creativityLevel',
        label: '扩展程度',
        type: 'select',
        options: [
          { value: 'low', label: '低——仅常用动词' },
          { value: 'medium', label: '中——包含一些创意用法' },
          { value: 'high', label: '高——大胆扩展' },
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
    idle: { icon: <Info className="w-3.5 h-3.5" />, text: '就绪', color: 'var(--soft-gray)' },
    loading: { icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />, text: '处理中', color: 'var(--lake-blue)' },
    success: { icon: <CheckCircle2 className="w-3.5 h-3.5" />, text: '成功', color: 'var(--success)' },
    error: { icon: <AlertCircle className="w-3.5 h-3.5" />, text: '出错了', color: 'var(--error)' },
    fallback: { icon: <RefreshCw className="w-3.5 h-3.5" />, text: '降级响应', color: 'var(--warning)' },
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
          API 配置
        </h3>
        <button onClick={onClose} className="p-1 rounded-md hover:bg-black/5 transition-colors">
          <X className="w-4 h-4 text-[--soft-gray]" />
        </button>
      </div>

      {/* Presets */}
      <div className="mb-4">
        <label className="text-caption text-[--soft-gray] block mb-2">快速预设</label>
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
          <label className="text-caption text-[--soft-gray] block mb-1">API 密钥</label>
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
          <label className="text-caption text-[--soft-gray] block mb-1">接口地址</label>
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
          <label className="text-caption text-[--soft-gray] block mb-1">模型</label>
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
          支持任何兼容 OpenAI 的 API 接口
        </p>
        <button
          onClick={handleSave}
          className="px-5 py-2 rounded-lg text-sm font-medium text-white transition-all hover:-translate-y-0.5"
          style={{ background: saved ? 'var(--success)' : 'var(--lake-blue)' }}
        >
          {saved ? '已保存！' : '保存配置'}
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

function ExerciseResult({ data, onSave }: { data: GenerateExerciseOutput; onSave?: () => void }) {
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    // Save to localStorage question bank
    const existing = JSON.parse(localStorage.getItem('cs_generated_exercises') || '[]')
    const toSave = {
      ...data,
      id: data.id || `ai-${Date.now()}`,
      source: 'ai-generated',
      generatedAt: new Date().toISOString(),
    }
    localStorage.setItem('cs_generated_exercises', JSON.stringify([...existing, toSave]))
    setSaved(true)
    onSave?.()
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-caption px-3 py-1 rounded-full" style={{ background: 'rgba(107,163,190,0.10)', color: 'var(--lake-blue)' }}>
            {data.constructionId}
          </span>
          <span className="text-caption px-3 py-1 rounded-full" style={{ background: 'rgba(138,184,154,0.10)', color: 'var(--lake-green)' }}>
            Level {data.difficulty}
          </span>
          <span className="text-caption px-3 py-1 rounded-full" style={{ background: 'rgba(184,169,201,0.10)', color: 'var(--lavender)' }}>
            {data.exerciseType}
          </span>
        </div>
        <button
          onClick={handleSave}
          disabled={saved}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
          style={{
            background: saved ? 'rgba(107,203,119,0.15)' : 'rgba(107,163,190,0.10)',
            color: saved ? 'var(--success)' : 'var(--lake-blue)',
            border: '1px solid var(--glass-border)',
          }}
        >
          {saved ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {saved ? '已保存到题库' : '保存到题库'}
        </button>
      </div>

      <div className="p-4 rounded-lg" style={{ background: 'rgba(245,247,250,0.60)', border: '1px solid var(--glass-border)' }}>
        <h4 className="text-sm font-semibold text-[--deep-slate] mb-3">Prompt</h4>
        <p className="text-body text-[--deep-slate]">{data.prompt}</p>
      </div>

      {data.options && data.options.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-[--deep-slate] mb-2">Options</h4>
          <div className="space-y-2">
            {data.options.map((opt: any, i: number) => (
              <div
                key={i}
                className="p-3 rounded-lg text-sm"
                style={{
                  background: opt === data.correctAnswer ? 'rgba(107,203,119,0.10)' : 'rgba(245,247,250,0.40)',
                  border: `1px solid ${opt === data.correctAnswer ? 'rgba(107,203,119,0.30)' : 'var(--glass-border)'}`,
                }}
              >
                <span className="font-mono text-[--soft-gray] mr-3">{String.fromCharCode(65 + i)}.</span>
                {opt}
                {opt === data.correctAnswer && (
                  <span className="ml-2 text-caption" style={{ color: 'var(--success)' }}>correct</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg" style={{ background: 'rgba(107,163,190,0.06)', border: '1px solid rgba(107,163,190,0.12)' }}>
          <h4 className="text-sm font-semibold text-[--lake-blue] mb-2">Explanation (Chinese)</h4>
          <p className="text-body-sm text-[--deep-slate] whitespace-pre-line">{data.explanationZh}</p>
        </div>
        <div className="p-4 rounded-lg" style={{ background: 'rgba(184,169,201,0.06)', border: '1px solid rgba(184,169,201,0.12)' }}>
          <h4 className="text-sm font-semibold text-[--lavender] mb-2">Explanation (English)</h4>
          <p className="text-body-sm text-[--deep-slate]">{data.explanationEn}</p>
        </div>
      </div>

      <div className="p-4 rounded-lg" style={{ background: 'rgba(244,162,97,0.06)', border: '1px solid rgba(244,162,97,0.15)' }}>
        <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--warning)' }}>Conventionality Note</h4>
        <p className="text-body-sm text-[--deep-slate]">{data.conventionalityNote}</p>
      </div>

      {data.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {data.tags.map((tag: any, i: number) => (
            <span key={i} className="text-caption px-2 py-1 rounded-md bg-black/5 text-[--soft-gray]">
              #{tag}
            </span>
          ))}
        </div>
      )}
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
        setStreamText(`\n\n❌ **网络连接失败**\n\n错误信息：${msg}\n\n可能原因：\n1. 浏览器安全策略阻止了跨域请求\n2. API Key 不正确\n3. 网络连接不稳定\n\n**建议操作**：\n- 在「设置」页面检查 API Key 是否正确\n- 尝试更换 API 地址\n- 检查网络连接\n\n--- 以下为本地模拟结果 ---\n\n`)
      } else {
        setStreamText(`\n\n❌ **请求失败**：${msg}\n\n--- 以下为本地模拟结果 ---\n\n`)
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
                AI 驱动的构式语法工具 — 基于 Goldberg 理论构建
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
                未配置 AI API。将使用<strong>降级响应</strong>返回结果。
              </span>
            </div>
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="text-sm font-medium flex items-center gap-1 transition-colors hover:text-[--deep-slate]"
              style={{ color: 'var(--lake-blue)' }}
            >
              <Settings className="w-3.5 h-3.5" />
              {showConfig ? '隐藏' : '配置'}
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

        {/* 功能说明卡片 */}
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
                  加载示例
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
                {status === 'loading' ? '处理中...' : '运行'}
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
                设置
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
                {/* Reasoning Area - 显示AI思考过程 */}
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
                      <span className="font-medium">AI 思考中...</span>
                    </div>
                    <div className="text-[--soft-gray] whitespace-pre-wrap font-mono text-xs">
                      {reasoningText}
                    </div>
                  </div>
                )}
                
                {/* Content Area - 显示正式回复 */}
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
                      AI 服务不可用 — 基于内置知识返回<strong>降级响应</strong>。
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
                      {showRawJson ? '隐藏' : '显示'} 原始 JSON
                    </button>
                    {showRawJson && (
                      <div className="mt-2">
                        <JsonDisplay data={result.data} title="原始 JSON 响应" />
                      </div>
                    )}
                  </div>
                )}

                {/* Raw Response */}
                {result.rawResponse && (
                  <div className="mt-4 p-3 rounded-lg" style={{ background: 'rgba(231,111,81,0.04)' }}>
                    <span className="text-caption text-[--soft-gray]">原始响应日志：</span>
                    <p className="text-caption text-[--deep-slate] mt-1">{result.rawResponse}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Skill Info Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {[
            {
              icon: <Bot className="w-5 h-5" />,
              title: '5 项内置技能',
              desc: '每项技能都有独立的提示词、JSON 模式和降级响应。',
            },
            {
              icon: <BookOpen className="w-5 h-5" />,
              title: '基于 Goldberg 理论',
              desc: '所有提示词均参考 Goldberg 的构式语法框架。',
            },
            {
              icon: <RefreshCw className="w-5 h-5" />,
              title: '优雅降级',
              desc: '内置降级响应确保即使无 API 也能正常运行。',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="p-4 rounded-lg flex items-start gap-3"
              style={{
                background: 'rgba(245,247,250,0.40)',
                border: '1px solid var(--glass-border)',
              }}
            >
              <div style={{ color: 'var(--lake-blue)' }}>{item.icon}</div>
              <div>
                <p className="text-body-sm font-medium text-[--deep-slate]">{item.title}</p>
                <p className="text-caption text-[--soft-gray] mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
