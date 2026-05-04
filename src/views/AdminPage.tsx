import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  ClipboardCheck,
  BookOpen,
  MessageCircle,
  Pencil,
  Trash2,
  Search,
  Plus,
  Sparkles,
  CheckCircle2,
  XCircle,
  Edit3,
  ChevronDown,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import Sidebar from '@/components/admin/Sidebar'
import type { AdminTab } from '@/components/admin/Sidebar'
import StatCard from '@/components/admin/StatCard'
import DataTable from '@/components/admin/DataTable'
import ConstructionForm from '@/components/admin/ConstructionForm'
import type { ConstructionFormData } from '@/components/admin/ConstructionForm'
import ExerciseForm from '@/components/admin/ExerciseForm'
import type { ExerciseFormData } from '@/components/admin/ExerciseForm'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import { Button } from '@/components/ui/button'

/* ─────────── demo data ─────────── */

interface ConstructionRow {
  id: string
  name: string
  category: string
  difficulty: number
  examples: number
  exercises: number
  status: 'active' | 'draft'
}

interface ExerciseRow {
  id: string
  question: string
  type: string
  construction: string
  difficulty: string
  used: number
  status: 'active' | 'draft'
}

interface UserRow {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
  exercisesCompleted: number
  joined: string
  lastActive: string
}

interface AIReviewItem {
  id: string
  content: string
  construction: string
  type: string
  confidence: number
  status: 'pending' | 'approved' | 'rejected'
}

const INITIAL_CONSTRUCTIONS: ConstructionRow[] = [
  { id: '1', name: 'Ditransitive', category: 'Argument Structure', difficulty: 1, examples: 12, exercises: 8, status: 'active' },
  { id: '2', name: 'Caused-Motion', category: 'Motion', difficulty: 1, examples: 10, exercises: 6, status: 'active' },
  { id: '3', name: 'Resultative', category: 'Resultative', difficulty: 2, examples: 8, exercises: 4, status: 'active' },
  { id: '4', name: 'Way Construction', category: 'Motion', difficulty: 2, examples: 6, exercises: 3, status: 'draft' },
  { id: '5', name: "What's X Doing Y", category: 'Information Structure', difficulty: 3, examples: 5, exercises: 2, status: 'active' },
  { id: '6', name: 'Subject-Auxiliary Inversion', category: 'Information Structure', difficulty: 2, examples: 7, exercises: 5, status: 'active' },
]

const INITIAL_EXERCISES: ExerciseRow[] = [
  { id: '1', question: 'She gave him a book.', type: 'Meaning from Form', construction: 'Ditransitive', difficulty: 'Easy', used: 142, status: 'active' },
  { id: '2', question: 'He sneezed the napkin off the table.', type: 'Meaning from Form', construction: 'Caused-Motion', difficulty: 'Medium', used: 98, status: 'active' },
  { id: '3', question: 'She hammered the metal flat.', type: 'Identify the Construction', construction: 'Resultative', difficulty: 'Medium', used: 76, status: 'active' },
  { id: '4', question: 'He whistled his way home.', type: 'Fill in the Blank', construction: 'Way Construction', difficulty: 'Hard', used: 45, status: 'draft' },
  { id: '5', question: 'What are you doing reading my mail?', type: 'Error Correction', construction: "What's X Doing Y", difficulty: 'Hard', used: 34, status: 'active' },
]

const INITIAL_USERS: UserRow[] = [
  { id: '1', name: 'Li Wei', email: 'liwei@example.com', role: 'user', exercisesCompleted: 234, joined: '2025-11-02', lastActive: '2 min ago' },
  { id: '2', name: 'Mariko Tanaka', email: 'mariko@example.com', role: 'user', exercisesCompleted: 189, joined: '2025-12-15', lastActive: '5 min ago' },
  { id: '3', name: 'Carlos Mendez', email: 'carlos@example.com', role: 'admin', exercisesCompleted: 312, joined: '2025-10-20', lastActive: '12 min ago' },
  { id: '4', name: 'Sarah Johnson', email: 'sarah@example.com', role: 'user', exercisesCompleted: 156, joined: '2026-01-05', lastActive: '20 min ago' },
  { id: '5', name: 'Admin User', email: 'admin@constructscape.com', role: 'admin', exercisesCompleted: 0, joined: '2025-10-01', lastActive: 'Just now' },
]

const INITIAL_AI_REVIEW: AIReviewItem[] = [
  { id: '1', content: 'The chef baked the cake moist and delicious.', construction: 'Resultative', type: 'Fill in the Blank', confidence: 92, status: 'pending' },
  { id: '2', content: 'She sang herself hoarse.', construction: 'Resultative', type: 'Meaning from Form', confidence: 87, status: 'pending' },
  { id: '3', content: 'He pushed the door open with his shoulder.', construction: 'Caused-Motion', type: 'Pattern Matching', confidence: 78, status: 'pending' },
  { id: '4', content: 'They danced the night away.', construction: 'Way Construction', type: 'Identify the Construction', confidence: 65, status: 'pending' },
]

const ACTIVITY_DATA = [
  { day: 'Mon', count: 45 },
  { day: 'Tue', count: 62 },
  { day: 'Wed', count: 38 },
  { day: 'Thu', count: 74 },
  { day: 'Fri', count: 56 },
  { day: 'Sat', count: 89 },
  { day: 'Sun', count: 67 },
]

const RECENT_ACTIVITY = [
  { id: '1', user: 'Li Wei', action: 'Completed exercise', construction: 'Ditransitive', time: '2 min ago' },
  { id: '2', user: 'Mariko T.', action: 'Bookmarked', construction: 'Caused-Motion', time: '5 min ago' },
  { id: '3', user: 'Carlos M.', action: 'AI analysis', construction: 'Resultative', time: '12 min ago' },
  { id: '4', user: 'Anonymous', action: 'Started exercise', construction: 'Way Construction', time: '20 min ago' },
  { id: '5', user: 'Sarah J.', action: 'Completed exercise', construction: 'Ditransitive', time: '35 min ago' },
]

/* ─────────── difficulty stars ─────────── */
function DifficultyStars({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="w-2.5 h-2.5 rounded-full"
          style={{
            background: i <= level ? 'var(--lake-blue)' : 'rgba(0,0,0,0.08)',
          }}
        />
      ))}
    </div>
  )
}

/* ─────────── status badge ─────────── */
function StatusBadge({ status }: { status: 'active' | 'draft' }) {
  const color = status === 'active' ? 'var(--lake-green)' : 'var(--warning)'
  const bg = status === 'active' ? 'rgba(107,203,119,0.12)' : 'var(--warning-bg)'
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 text-caption font-medium rounded-full capitalize"
      style={{ background: bg, color }}
    >
      {status}
    </span>
  )
}

/* ─────────── main page component ─────────── */

export default function AdminPage() {
  const { isAdmin } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard')

  /* Redirect non-admin users */
  if (!isAdmin) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center" style={{ background: 'var(--warm-white)' }}>
        <div className="text-center">
          <h1 className="text-h2 font-display mb-4" style={{ color: 'var(--deep-slate)' }}>Access Denied</h1>
          <p className="text-body mb-6" style={{ color: 'var(--soft-gray)' }}>You need admin privileges to access this page.</p>
          <Button
            onClick={() => router.push('/dashboard')}
            className="text-white font-semibold"
            style={{ background: 'var(--lake-blue)', borderRadius: 'var(--border-radius-full)', padding: 'var(--space-3) var(--space-6)' }}
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh]" style={{ background: 'var(--warm-white)' }}>
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main content */}
      <main
        className="lg:ml-[260px] min-h-[100dvh]"
        style={{ padding: 'var(--space-8) var(--space-6)' }}
      >
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && <DashboardTab key="dashboard" />}
          {activeTab === 'constructions' && <ConstructionsTab key="constructions" />}
          {activeTab === 'exercises' && <ExercisesTab key="exercises" />}
          {activeTab === 'users' && <UsersTab key="users" />}
          {activeTab === 'ai-review' && <AIReviewTab key="ai-review" />}
        </AnimatePresence>
      </main>
    </div>
  )
}

/* ═══════════════ Dashboard Tab ═══════════════ */

function DashboardTab() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('7d')

  const maxCount = Math.max(...ACTIVITY_DATA.map((d) => d.count))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-h1 font-display" style={{ color: 'var(--deep-slate)' }}>Dashboard</h1>
        <div className="flex items-center gap-3">
          <span className="text-body-sm" style={{ color: 'var(--soft-gray)' }}>
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
          <div className="relative group">
            <Button
              variant="outline"
              className="text-body-sm gap-2"
              style={{ borderRadius: 'var(--border-radius-full)', border: '1px solid rgba(0,0,0,0.08)' }}
            >
              Quick Actions <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 mt-6"
        style={{ gap: 'var(--space-5)' }}
      >
        <StatCard title="Total Users" value="1,247" subtitle="32 this week" icon={Users} color="var(--lake-blue)" />
        <StatCard title="Total Exercises" value="3,842" subtitle="Completed all time" icon={ClipboardCheck} color="var(--lake-green)" />
        <StatCard title="Constructions" value="12" subtitle="4 awaiting review" icon={BookOpen} color="var(--warning)" />
        <StatCard title="AI Requests" value="8,291" subtitle="This month" icon={MessageCircle} color="var(--lavender)" />
      </div>

      {/* Activity chart */}
      <div
        className="mt-8"
        style={{
          borderRadius: 'var(--border-radius-lg)',
          background: 'white',
          border: '1px solid rgba(0,0,0,0.06)',
          padding: 'var(--space-6)',
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-h4 font-semibold" style={{ color: 'var(--deep-slate)' }}>Exercise Activity</h3>
          <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'var(--mist-white)' }}>
            {(['7d', '30d', '90d'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className="px-3 py-1 text-caption font-medium rounded-full transition-all duration-[var(--duration-fast)]"
                style={{
                  background: period === p ? 'white' : 'transparent',
                  color: period === p ? 'var(--deep-slate)' : 'var(--soft-gray)',
                  boxShadow: period === p ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {p === '7d' ? '7 days' : p === '30d' ? '30 days' : '90 days'}
              </button>
            ))}
          </div>
        </div>

        {/* CSS Bar Chart */}
        <div className="flex items-end gap-3" style={{ height: '180px' }}>
          {ACTIVITY_DATA.map((d) => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-2 group">
              <div className="relative w-full flex justify-center">
                <div
                  className="w-full max-w-[48px] rounded-t-md transition-all duration-[var(--duration-slow)] group-hover:opacity-90 relative"
                  style={{
                    height: `${(d.count / maxCount) * 140}px`,
                    background: 'var(--lake-blue)',
                    opacity: 0.8,
                  }}
                  title={`${d.day}: ${d.count} exercises`}
                >
                  {/* Tooltip on hover */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 rounded text-caption font-medium whitespace-nowrap pointer-events-none"
                    style={{ background: 'var(--deep-slate)', color: 'white' }}
                  >
                    {d.count}
                  </div>
                </div>
              </div>
              <span className="text-caption font-medium" style={{ color: 'var(--soft-gray)' }}>{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div
        className="mt-8"
        style={{
          borderRadius: 'var(--border-radius-lg)',
          background: 'white',
          border: '1px solid rgba(0,0,0,0.06)',
          padding: 'var(--space-6)',
        }}
      >
        <h3 className="text-h4 font-semibold mb-4" style={{ color: 'var(--deep-slate)' }}>Recent Activity</h3>
        <DataTable
          columns={[
            { key: 'user', header: 'User', render: (row) => row.user },
            { key: 'action', header: 'Action', render: (row) => row.action },
            { key: 'construction', header: 'Construction', render: (row) => (
              <span style={{ color: 'var(--lake-blue)' }}>{row.construction}</span>
            )},
            { key: 'time', header: 'Time', render: (row) => (
              <span style={{ color: 'var(--soft-gray)' }}>{row.time}</span>
            )},
          ]}
          data={RECENT_ACTIVITY}
        />
      </div>
    </motion.div>
  )
}

/* ═══════════════ Constructions Tab ═══════════════ */

function ConstructionsTab() {
  const [items, setItems] = useState<ConstructionRow[]>(INITIAL_CONSTRUCTIONS)
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ConstructionFormData | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const filtered = useMemo(
    () => items.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())),
    [items, search]
  )

  const handleSave = (data: ConstructionFormData) => {
    if (data.id) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === data.id
            ? {
                ...item,
                name: data.name,
                category: data.category,
                difficulty: data.difficulty,
                status: data.status,
              }
            : item
        )
      )
    } else {
      const newItem: ConstructionRow = {
        id: `${Date.now()}`,
        name: data.name,
        category: data.category,
        difficulty: data.difficulty,
        examples: 0,
        exercises: 0,
        status: data.status,
      }
      setItems((prev) => [...prev, newItem])
    }
  }

  const handleEdit = (item: ConstructionRow) => {
    setEditingItem({
      id: item.id,
      name: item.name,
      slug: item.name.toLowerCase().replace(/\s+/g, '-'),
      category: item.category,
      difficulty: item.difficulty as 1 | 2 | 3,
      formTemplate: '',
      semanticFormula: '',
      meaningDescription: '',
      status: item.status,
    })
    setFormOpen(true)
  }

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
    setConfirmDelete(null)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-h1 font-display" style={{ color: 'var(--deep-slate)' }}>Constructions</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--soft-gray)' }} />
            <input
              type="text"
              placeholder="Search constructions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 text-body-sm outline-none focus:ring-2"
              style={{
                borderRadius: 'var(--border-radius-full)',
                border: '1px solid rgba(0,0,0,0.08)',
                width: '280px',
                background: 'white',
                color: 'var(--deep-slate)',
              }}
            />
          </div>
          <Button
            onClick={() => { setEditingItem(null); setFormOpen(true) }}
            className="text-white font-semibold text-body-sm gap-2 transition-all duration-[var(--duration-fast)] hover:-translate-y-0.5"
            style={{
              background: 'var(--lake-blue)',
              borderRadius: 'var(--border-radius-full)',
              padding: 'var(--space-3) var(--space-5)',
            }}
          >
            <Plus className="w-4 h-4" /> Add Construction
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6">
        <DataTable
          columns={[
            { key: 'name', header: 'Name', render: (row) => (
              <span className="font-medium">{row.name}</span>
            )},
            { key: 'category', header: 'Category', render: (row) => row.category },
            { key: 'difficulty', header: 'Difficulty', render: (row) => <DifficultyStars level={row.difficulty} /> },
            { key: 'examples', header: 'Examples', render: (row) => row.examples },
            { key: 'exercises', header: 'Exercises', render: (row) => row.exercises },
            { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
            {
              key: 'actions',
              header: 'Actions',
              render: (row) => (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(row)}
                    className="p-1.5 rounded-md transition-all duration-[var(--duration-fast)] hover:bg-[rgba(107,163,190,0.10)]"
                    aria-label={`Edit ${row.name}`}
                  >
                    <Pencil className="w-4 h-4" style={{ color: 'var(--lake-blue)' }} />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(row.id)}
                    className="p-1.5 rounded-md transition-all duration-[var(--duration-fast)] hover:bg-[rgba(231,111,81,0.10)]"
                    aria-label={`Delete ${row.name}`}
                  >
                    <Trash2 className="w-4 h-4" style={{ color: 'var(--error)' }} />
                  </button>
                </div>
              ),
            },
          ]}
          data={filtered}
        />
      </div>

      <ConstructionForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        initialData={editingItem}
      />

      <ConfirmDialog
        isOpen={!!confirmDelete}
        title="Delete Construction"
        message="Are you sure you want to delete this construction? This action cannot be undone."
        variant="danger"
        confirmLabel="Delete"
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </motion.div>
  )
}

/* ═══════════════ Exercises Tab ═══════════════ */

function ExercisesTab() {
  const [items, setItems] = useState<ExerciseRow[]>(INITIAL_EXERCISES)
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ExerciseFormData | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [showAIGenerate, setShowAIGenerate] = useState(false)
  const [aiConstruction, setAiConstruction] = useState('ditransitive')
  const [aiType, setAiType] = useState('Meaning from Form')
  const [aiCount, setAiCount] = useState(5)
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiResults, setAiResults] = useState<ExerciseFormData[]>([])

  const filtered = useMemo(
    () => items.filter((e) => e.question.toLowerCase().includes(search.toLowerCase())),
    [items, search]
  )

  const handleSave = (data: ExerciseFormData) => {
    if (data.id) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === data.id
            ? {
                ...item,
                question: data.question,
                type: data.type,
                construction: data.constructionName,
                difficulty: data.difficulty.charAt(0).toUpperCase() + data.difficulty.slice(1),
                status: data.status,
              }
            : item
        )
      )
    } else {
      const newItem: ExerciseRow = {
        id: `${Date.now()}`,
        question: data.question,
        type: data.type,
        construction: data.constructionName,
        difficulty: data.difficulty.charAt(0).toUpperCase() + data.difficulty.slice(1),
        used: 0,
        status: data.status,
      }
      setItems((prev) => [...prev, newItem])
    }
  }

  const handleEdit = (item: ExerciseRow) => {
    setEditingItem({
      id: item.id,
      question: item.question,
      type: item.type,
      constructionId: item.construction.toLowerCase().replace(/\s+/g, '-'),
      constructionName: item.construction,
      difficulty: item.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard',
      explanation: '',
      status: item.status,
    })
    setFormOpen(true)
  }

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
    setConfirmDelete(null)
  }

  const handleAIGenerate = () => {
    setAiGenerating(true)
    setTimeout(() => {
      const constructionNames: Record<string, string> = {
        ditransitive: 'Ditransitive',
        'caused-motion': 'Caused-Motion',
        resultative: 'Resultative',
        'way-construction': 'Way Construction',
        'whats-doing': "What's X Doing Y",
        sai: 'Subject-Auxiliary Inversion',
      }
      const generated: ExerciseFormData[] = Array.from({ length: aiCount }, (_, i) => ({
        question: `AI-generated exercise ${i + 1} for ${constructionNames[aiConstruction] || aiConstruction} (${aiType})...`,
        type: aiType,
        constructionId: aiConstruction,
        constructionName: constructionNames[aiConstruction] || aiConstruction,
        difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)] as 'easy' | 'medium' | 'hard',
        explanation: 'Auto-generated explanation for this exercise.',
        status: 'draft',
      }))
      setAiResults(generated)
      setAiGenerating(false)
    }, 1500)
  }

  const handleAddSelectedAI = () => {
    aiResults.forEach((data) => {
      const newItem: ExerciseRow = {
        id: `ai-${Date.now()}-${Math.random()}`,
        question: data.question,
        type: data.type,
        construction: data.constructionName,
        difficulty: data.difficulty.charAt(0).toUpperCase() + data.difficulty.slice(1),
        used: 0,
        status: 'draft',
      }
      setItems((prev) => [...prev, newItem])
    })
    setAiResults([])
    setShowAIGenerate(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-h1 font-display" style={{ color: 'var(--deep-slate)' }}>Exercises</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--soft-gray)' }} />
            <input
              type="text"
              placeholder="Search exercises..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 text-body-sm outline-none focus:ring-2"
              style={{
                borderRadius: 'var(--border-radius-full)',
                border: '1px solid rgba(0,0,0,0.08)',
                width: '280px',
                background: 'white',
                color: 'var(--deep-slate)',
              }}
            />
          </div>
          <Button
            onClick={() => setShowAIGenerate((p) => !p)}
            className="text-body-sm font-semibold gap-2 transition-all duration-[var(--duration-fast)] hover:-translate-y-0.5"
            variant="outline"
            style={{
              border: '1px solid var(--lavender)',
              color: 'var(--lavender)',
              borderRadius: 'var(--border-radius-full)',
              padding: 'var(--space-3) var(--space-5)',
              background: 'transparent',
            }}
          >
            <Sparkles className="w-4 h-4" /> AI Generate
          </Button>
          <Button
            onClick={() => { setEditingItem(null); setFormOpen(true) }}
            className="text-white font-semibold text-body-sm gap-2 transition-all duration-[var(--duration-fast)] hover:-translate-y-0.5"
            style={{
              background: 'var(--lake-blue)',
              borderRadius: 'var(--border-radius-full)',
              padding: 'var(--space-3) var(--space-5)',
            }}
          >
            <Plus className="w-4 h-4" /> Add Exercise
          </Button>
        </div>
      </div>

      {/* AI Generate Panel */}
      <AnimatePresence>
        {showAIGenerate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div
              className="mt-4"
              style={{
                borderRadius: 'var(--border-radius-lg)',
                background: 'white',
                border: '1px solid rgba(0,0,0,0.06)',
                padding: 'var(--space-6)',
              }}
            >
              <h3 className="text-h4 font-semibold mb-4" style={{ color: 'var(--deep-slate)' }}>AI Exercise Generation</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-body-sm font-medium" style={{ color: 'var(--deep-slate)' }}>Construction</label>
                  <select
                    value={aiConstruction}
                    onChange={(e) => setAiConstruction(e.target.value)}
                    className="px-3 py-2 text-body-sm rounded-md outline-none"
                    style={{ border: '1px solid rgba(0,0,0,0.08)', background: 'var(--mist-white)', color: 'var(--deep-slate)' }}
                  >
                    <option value="ditransitive">Ditransitive</option>
                    <option value="caused-motion">Caused-Motion</option>
                    <option value="resultative">Resultative</option>
                    <option value="way-construction">Way Construction</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-body-sm font-medium" style={{ color: 'var(--deep-slate)' }}>Exercise Type</label>
                  <select
                    value={aiType}
                    onChange={(e) => setAiType(e.target.value)}
                    className="px-3 py-2 text-body-sm rounded-md outline-none"
                    style={{ border: '1px solid rgba(0,0,0,0.08)', background: 'var(--mist-white)', color: 'var(--deep-slate)' }}
                  >
                    <option>Meaning from Form</option>
                    <option>Fill in the Blank</option>
                    <option>Identify the Construction</option>
                    <option>Pattern Matching</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-body-sm font-medium" style={{ color: 'var(--deep-slate)' }}>Count (1-20)</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={aiCount}
                    onChange={(e) => setAiCount(Math.min(20, Math.max(1, Number(e.target.value))))}
                    className="px-3 py-2 text-body-sm rounded-md outline-none"
                    style={{ border: '1px solid rgba(0,0,0,0.08)', background: 'var(--mist-white)', color: 'var(--deep-slate)' }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <Button
                  onClick={handleAIGenerate}
                  disabled={aiGenerating}
                  className="text-white font-semibold gap-2 transition-all duration-[var(--duration-fast)] hover:-translate-y-0.5"
                  style={{
                    background: 'var(--lavender)',
                    borderRadius: 'var(--border-radius-full)',
                    padding: 'var(--space-3) var(--space-6)',
                  }}
                >
                  <Sparkles className="w-4 h-4" />
                  {aiGenerating ? 'Generating...' : 'Generate with AI'}
                </Button>
                {aiResults.length > 0 && (
                  <Button
                    onClick={handleAddSelectedAI}
                    className="text-white font-semibold gap-2"
                    style={{
                      background: 'var(--lake-green)',
                      borderRadius: 'var(--border-radius-full)',
                      padding: 'var(--space-3) var(--space-6)',
                    }}
                  >
                    Add All ({aiResults.length})
                  </Button>
                )}
              </div>

              {/* AI Results Preview */}
              {aiResults.length > 0 && (
                <div className="mt-4 flex flex-col gap-2 max-h-[200px] overflow-y-auto">
                  {aiResults.map((result, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-3 py-2 rounded-md"
                      style={{ background: 'var(--mist-white)' }}
                    >
                      <span className="text-caption font-medium px-2 py-0.5 rounded-full" style={{ background: 'var(--lavender)', color: 'white' }}>
                        {Math.round(70 + Math.random() * 25)}%
                      </span>
                      <span className="text-body-sm flex-1 truncate" style={{ color: 'var(--deep-slate)' }}>
                        {result.question}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="mt-6">
        <DataTable
          columns={[
            { key: 'question', header: 'Question', render: (row) => (
              <span className="font-medium truncate max-w-[240px] block">{row.question}</span>
            )},
            { key: 'type', header: 'Type', render: (row) => row.type },
            { key: 'construction', header: 'Construction', render: (row) => row.construction },
            { key: 'difficulty', header: 'Difficulty', render: (row) => (
              <span
                className="text-caption font-medium px-2 py-0.5 rounded-full capitalize"
                style={{
                  background: row.difficulty === 'Easy' ? 'var(--success-bg)' : row.difficulty === 'Medium' ? 'var(--warning-bg)' : 'rgba(231,111,81,0.15)',
                  color: row.difficulty === 'Easy' ? 'var(--lake-green)' : row.difficulty === 'Medium' ? 'var(--warning)' : 'var(--error)',
                }}
              >
                {row.difficulty}
              </span>
            )},
            { key: 'used', header: 'Used', render: (row) => `${row.used}x` },
            { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
            {
              key: 'actions',
              header: 'Actions',
              render: (row) => (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(row)}
                    className="p-1.5 rounded-md transition-all duration-[var(--duration-fast)] hover:bg-[rgba(107,163,190,0.10)]"
                    aria-label={`Edit exercise ${row.id}`}
                  >
                    <Pencil className="w-4 h-4" style={{ color: 'var(--lake-blue)' }} />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(row.id)}
                    className="p-1.5 rounded-md transition-all duration-[var(--duration-fast)] hover:bg-[rgba(231,111,81,0.10)]"
                    aria-label={`Delete exercise ${row.id}`}
                  >
                    <Trash2 className="w-4 h-4" style={{ color: 'var(--error)' }} />
                  </button>
                </div>
              ),
            },
          ]}
          data={filtered}
        />
      </div>

      <ExerciseForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        initialData={editingItem}
      />

      <ConfirmDialog
        isOpen={!!confirmDelete}
        title="Delete Exercise"
        message="Are you sure you want to delete this exercise?"
        variant="danger"
        confirmLabel="Delete"
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </motion.div>
  )
}

/* ═══════════════ Users Tab ═══════════════ */

function UsersTab() {
  const [users, setUsers] = useState<UserRow[]>(INITIAL_USERS)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all')

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
      const matchRole = roleFilter === 'all' || u.role === roleFilter
      return matchSearch && matchRole
    })
  }, [users, search, roleFilter])

  const toggleRole = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, role: u.role === 'admin' ? 'user' : 'admin' } : u
      )
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-h1 font-display" style={{ color: 'var(--deep-slate)' }}>Users</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--soft-gray)' }} />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 text-body-sm outline-none focus:ring-2"
              style={{
                borderRadius: 'var(--border-radius-full)',
                border: '1px solid rgba(0,0,0,0.08)',
                width: '240px',
                background: 'white',
                color: 'var(--deep-slate)',
              }}
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as 'all' | 'user' | 'admin')}
            className="px-3 py-2 text-body-sm rounded-full outline-none"
            style={{
              border: '1px solid rgba(0,0,0,0.08)',
              background: 'white',
              color: 'var(--deep-slate)',
            }}
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6">
        <DataTable
          columns={[
            {
              key: 'user',
              header: 'User',
              render: (row) => (
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
                    style={{ background: 'var(--lake-blue)', color: 'white' }}
                  >
                    {row.name[0]}
                  </div>
                  <div>
                    <p className="font-medium text-body-sm" style={{ color: 'var(--deep-slate)' }}>{row.name}</p>
                    <p className="text-caption" style={{ color: 'var(--soft-gray)' }}>{row.email}</p>
                  </div>
                </div>
              ),
            },
            {
              key: 'role',
              header: 'Role',
              render: (row) => (
                <span
                  className="inline-flex items-center px-2.5 py-0.5 text-caption font-medium rounded-full capitalize cursor-pointer transition-all duration-[var(--duration-fast)] hover:opacity-80"
                  style={{
                    background: row.role === 'admin' ? 'rgba(107,163,190,0.12)' : 'rgba(0,0,0,0.04)',
                    color: row.role === 'admin' ? 'var(--lake-blue)' : 'var(--soft-gray)',
                  }}
                  onClick={() => toggleRole(row.id)}
                  title="Click to toggle role"
                >
                  {row.role}
                </span>
              ),
            },
            { key: 'exercises', header: 'Exercises', render: (row) => row.exercisesCompleted },
            { key: 'joined', header: 'Joined', render: (row) => row.joined },
            { key: 'lastActive', header: 'Last Active', render: (row) => (
              <span style={{ color: 'var(--soft-gray)' }}>{row.lastActive}</span>
            )},
          ]}
          data={filtered}
        />
      </div>
    </motion.div>
  )
}

/* ═══════════════ AI Review Tab ═══════════════ */

function AIReviewTab() {
  const [items, setItems] = useState<AIReviewItem[]>(INITIAL_AI_REVIEW)
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [animatingId, setAnimatingId] = useState<string | null>(null)
  const [animateDirection, setAnimateDirection] = useState<'approve' | 'reject' | null>(null)

  const filtered = items.filter((item) => item.status === filter)
  const pendingCount = items.filter((i) => i.status === 'pending').length

  const handleApprove = (id: string) => {
    setAnimatingId(id)
    setAnimateDirection('approve')
    setTimeout(() => {
      setItems((prev) => prev.map((item) => item.id === id ? { ...item, status: 'approved' } : item))
      setAnimatingId(null)
    }, 400)
  }

  const handleReject = (id: string) => {
    setAnimatingId(id)
    setAnimateDirection('reject')
    setTimeout(() => {
      setItems((prev) => prev.map((item) => item.id === id ? { ...item, status: 'rejected' } : item))
      setAnimatingId(null)
    }, 400)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-h1 font-display" style={{ color: 'var(--deep-slate)' }}>AI Content Review</h1>
          {pendingCount > 0 && (
            <span
              className="text-caption font-medium px-2.5 py-0.5 rounded-full"
              style={{ background: 'var(--warning)', color: 'white' }}
            >
              {pendingCount} pending
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'var(--mist-white)' }}>
          {(['pending', 'approved', 'rejected'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-1.5 text-caption font-medium rounded-full transition-all duration-[var(--duration-fast)] capitalize"
              style={{
                background: filter === f ? 'white' : 'transparent',
                color: filter === f ? 'var(--deep-slate)' : 'var(--soft-gray)',
                boxShadow: filter === f ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Review Cards */}
      <div className="mt-6 flex flex-col gap-4">
        {filtered.length === 0 ? (
          <div
            className="text-center py-16 text-body-sm"
            style={{ color: 'var(--soft-gray)', background: 'white', borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(0,0,0,0.06)' }}
          >
            No {filter} items to review.
          </div>
        ) : (
          filtered.map((item) => {
            const isAnimating = animatingId === item.id
            const animStyle = isAnimating
              ? {
                  transform: animateDirection === 'approve' ? 'translateX(100%)' : 'translateX(-100%)',
                  opacity: 0,
                  background: animateDirection === 'approve' ? 'rgba(107,203,119,0.10)' : 'rgba(231,111,81,0.10)',
                }
              : {}

            return (
              <div
                key={item.id}
                className="transition-all"
                style={{
                  borderRadius: 'var(--border-radius-lg)',
                  background: 'white',
                  border: '1px solid rgba(0,0,0,0.06)',
                  padding: 'var(--space-6)',
                  ...animStyle,
                  transitionDuration: 'var(--duration-slow)',
                  transitionTimingFunction: 'var(--ease-smooth)',
                }}
              >
                {/* Exercise content */}
                <p className="text-body font-medium mb-3" style={{ color: 'var(--deep-slate)' }}>
                  &ldquo;{item.content}&rdquo;
                </p>

                {/* Metadata */}
                <div className="flex items-center gap-4 mb-4 flex-wrap">
                  <span className="text-caption" style={{ color: 'var(--soft-gray)' }}>
                    Generated for: <span style={{ color: 'var(--lake-blue)' }}>{item.construction}</span>
                  </span>
                  <span className="text-caption" style={{ color: 'var(--soft-gray)' }}>
                    Type: {item.type}
                  </span>
                  <span
                    className="text-caption font-medium px-2 py-0.5 rounded-full"
                    style={{
                      background: item.confidence >= 80 ? 'var(--success-bg)' : item.confidence >= 60 ? 'var(--warning-bg)' : 'var(--error-bg)',
                      color: item.confidence >= 80 ? 'var(--lake-green)' : item.confidence >= 60 ? 'var(--warning)' : 'var(--error)',
                    }}
                  >
                    Confidence: {item.confidence}%
                  </span>
                </div>

                {/* Actions (only for pending) */}
                {filter === 'pending' && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleApprove(item.id)}
                      className="flex items-center gap-2 px-4 py-2 text-body-sm font-medium rounded-full transition-all duration-[var(--duration-fast)] hover:-translate-y-0.5"
                      style={{ background: 'var(--lake-green)', color: 'white' }}
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(item.id)}
                      className="flex items-center gap-2 px-4 py-2 text-body-sm font-medium rounded-full transition-all duration-[var(--duration-fast)] hover:-translate-y-0.5"
                      style={{ border: '1px solid var(--error)', color: 'var(--error)', background: 'transparent' }}
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                    <button
                      className="flex items-center gap-2 px-4 py-2 text-body-sm font-medium rounded-full transition-all duration-[var(--duration-fast)] hover:-translate-y-0.5"
                      style={{ border: '1px solid var(--lake-blue)', color: 'var(--lake-blue)', background: 'transparent' }}
                    >
                      <Edit3 className="w-4 h-4" /> Edit
                    </button>
                  </div>
                )}

                {/* Status for approved/rejected */}
                {filter !== 'pending' && (
                  <span
                    className="inline-flex items-center px-3 py-1 text-caption font-medium rounded-full capitalize"
                    style={{
                      background: item.status === 'approved' ? 'var(--success-bg)' : 'var(--error-bg)',
                      color: item.status === 'approved' ? 'var(--lake-green)' : 'var(--error)',
                    }}
                  >
                    {item.status}
                  </span>
                )}
              </div>
            )
          })
        )}
      </div>
    </motion.div>
  )
}
