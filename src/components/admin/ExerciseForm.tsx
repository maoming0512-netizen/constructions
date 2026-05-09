import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export interface ExerciseFormData {
  id?: string
  question: string
  type: string
  constructionId: string
  constructionName: string
  difficulty: 'easy' | 'medium' | 'hard'
  explanation: string
  status: 'active' | 'draft'
}

const EXERCISE_TYPES = [
  'Meaning from Form',
  'Form from Meaning',
  'Fill in the Blank',
  'Identify the Construction',
  'Pattern Matching',
  'Error Correction',
]

const CONSTRUCTION_OPTIONS = [
  { id: 'ditransitive', name: 'Ditransitive' },
  { id: 'caused-motion', name: 'Caused-Motion' },
  { id: 'resultative', name: 'Resultative' },
  { id: 'way-construction', name: 'Way Construction' },
  { id: 'whats-doing', name: "What's X Doing Y" },
  { id: 'sai', name: 'Subject-Auxiliary Inversion' },
]

interface ExerciseFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: ExerciseFormData) => void
  initialData?: ExerciseFormData | null
}

const emptyForm: ExerciseFormData = {
  question: '',
  type: 'Meaning from Form',
  constructionId: 'ditransitive',
  constructionName: 'Ditransitive',
  difficulty: 'easy',
  explanation: '',
  status: 'draft',
}

export default function ExerciseForm({ isOpen, onClose, onSave, initialData }: ExerciseFormProps) {
  const [form, setForm] = useState<ExerciseFormData>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialData) {
      setForm(initialData)
    } else {
      setForm(emptyForm)
    }
    setErrors({})
  }, [initialData, isOpen])

  const update = (field: keyof ExerciseFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (field === 'constructionId') {
      const found = CONSTRUCTION_OPTIONS.find((c) => c.id === value)
      if (found) {
        setForm((prev) => ({ ...prev, constructionName: found.name }))
      }
    }
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.question.trim()) errs.question = 'Question content is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    onSave(form)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 'var(--z-modal-overlay)' }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
            style={{ background: 'rgba(45, 55, 72, 0.40)', backdropFilter: 'var(--glass-blur)' }}
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.175, 0.885, 0.32, 1.275] as [number, number, number, number] }}
            className="relative w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto"
            style={{
              zIndex: 'var(--z-modal-content)',
              borderRadius: 'var(--border-radius-xl)',
              background: 'var(--glass-bg)',
              backdropFilter: 'var(--glass-blur-heavy)',
              WebkitBackdropFilter: 'var(--glass-blur-heavy)',
              border: '1px solid var(--glass-border)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.16)',
              padding: 'var(--space-8)',
            }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-[var(--duration-fast)] hover:bg-[rgba(255,255,255,0.10)]"
              aria-label="Close"
            >
              <X className="w-4 h-4" style={{ color: 'var(--soft-gray)' }} />
            </button>

            <h2 className="text-h3 font-display mb-6" style={{ color: 'var(--deep-slate)' }}>
              {initialData ? 'Edit Exercise' : 'Add Exercise'}
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-body-sm font-medium" style={{ color: 'var(--deep-slate)' }}>
                  Question Content
                </Label>
                <textarea
                  value={form.question}
                  onChange={(e) => update('question', e.target.value)}
                  placeholder="Enter the exercise question..."
                  rows={3}
                  className="w-full text-body-sm rounded-md px-3 py-2 outline-none resize-none focus:ring-2"
                  style={{
                    borderRadius: 'var(--border-radius-md)',
                    border: errors.question ? '1px solid var(--error)' : '1px solid var(--glass-border)',
                    background: 'rgba(255,255,255,0.60)',
                    color: 'var(--deep-slate)',
                  }}
                />
                {errors.question && <span className="text-caption" style={{ color: 'var(--error)' }}>{errors.question}</span>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-body-sm font-medium" style={{ color: 'var(--deep-slate)' }}>
                    Exercise Type
                  </Label>
                  <select
                    value={form.type}
                    onChange={(e) => update('type', e.target.value)}
                    className="w-full text-body-sm rounded-md px-3 py-2 outline-none focus:ring-2"
                    style={{
                      borderRadius: 'var(--border-radius-md)',
                      border: '1px solid var(--glass-border)',
                      background: 'rgba(255,255,255,0.60)',
                      color: 'var(--deep-slate)',
                    }}
                  >
                    {EXERCISE_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-body-sm font-medium" style={{ color: 'var(--deep-slate)' }}>
                    Difficulty
                  </Label>
                  <select
                    value={form.difficulty}
                    onChange={(e) => update('difficulty', e.target.value)}
                    className="w-full text-body-sm rounded-md px-3 py-2 outline-none focus:ring-2 capitalize"
                    style={{
                      borderRadius: 'var(--border-radius-md)',
                      border: '1px solid var(--glass-border)',
                      background: 'rgba(255,255,255,0.60)',
                      color: 'var(--deep-slate)',
                    }}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-body-sm font-medium" style={{ color: 'var(--deep-slate)' }}>
                  Construction
                </Label>
                <select
                  value={form.constructionId}
                  onChange={(e) => update('constructionId', e.target.value)}
                  className="w-full text-body-sm rounded-md px-3 py-2 outline-none focus:ring-2"
                  style={{
                    borderRadius: 'var(--border-radius-md)',
                    border: '1px solid var(--glass-border)',
                    background: 'rgba(255,255,255,0.60)',
                    color: 'var(--deep-slate)',
                  }}
                >
                  {CONSTRUCTION_OPTIONS.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-body-sm font-medium" style={{ color: 'var(--deep-slate)' }}>
                  Explanation
                </Label>
                <textarea
                  value={form.explanation}
                  onChange={(e) => update('explanation', e.target.value)}
                  placeholder="Explanation shown after answering..."
                  rows={2}
                  className="w-full text-body-sm rounded-md px-3 py-2 outline-none resize-none focus:ring-2"
                  style={{
                    borderRadius: 'var(--border-radius-md)',
                    border: '1px solid var(--glass-border)',
                    background: 'rgba(255,255,255,0.60)',
                    color: 'var(--deep-slate)',
                  }}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-body-sm font-medium" style={{ color: 'var(--deep-slate)' }}>
                  Status
                </Label>
                <div className="flex items-center gap-3">
                  {(['draft', 'active'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => update('status', s)}
                      className="px-4 py-2 text-body-sm font-medium rounded-full transition-all duration-[var(--duration-fast)] capitalize"
                      style={{
                        background: form.status === s ? (s === 'active' ? 'var(--lake-green)' : 'var(--warning)') : 'rgba(255,255,255,0.60)',
                        color: form.status === s ? 'white' : 'var(--soft-gray)',
                        border: '1px solid var(--glass-border)',
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  className="text-body-sm"
                  style={{ color: 'var(--soft-gray)' }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="text-white font-semibold transition-all duration-[var(--duration-fast)] hover:-translate-y-0.5"
                  style={{
                    background: 'var(--lake-blue)',
                    borderRadius: 'var(--border-radius-full)',
                    padding: 'var(--space-3) var(--space-6)',
                  }}
                >
                  {initialData ? 'Save Changes' : 'Create Exercise'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
