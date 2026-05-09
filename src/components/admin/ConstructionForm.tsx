import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export interface ConstructionFormData {
  id?: string
  name: string
  slug: string
  category: string
  difficulty: 1 | 2 | 3
  formTemplate: string
  semanticFormula: string
  meaningDescription: string
  status: 'active' | 'draft'
}

const CATEGORIES = [
  'Argument Structure',
  'Information Structure',
  'Motion',
  'Resultative',
  'Caused-Motion',
  'Way Construction',
  'Other',
]

interface ConstructionFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: ConstructionFormData) => void
  initialData?: ConstructionFormData | null
}

const emptyForm: ConstructionFormData = {
  name: '',
  slug: '',
  category: 'Argument Structure',
  difficulty: 1,
  formTemplate: '',
  semanticFormula: '',
  meaningDescription: '',
  status: 'draft',
}

export default function ConstructionForm({ isOpen, onClose, onSave, initialData }: ConstructionFormProps) {
  const [form, setForm] = useState<ConstructionFormData>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialData) {
      setForm(initialData)
    } else {
      setForm(emptyForm)
    }
    setErrors({})
  }, [initialData, isOpen])

  const update = (field: keyof ConstructionFormData, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  // Auto-generate slug from name
  useEffect(() => {
    if (!initialData && form.name && !form.slug) {
      setForm((prev) => ({
        ...prev,
        slug: prev.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      }))
    }
  }, [form.name, initialData, form.slug])

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.slug.trim()) errs.slug = 'Slug is required'
    if (!form.formTemplate.trim()) errs.formTemplate = 'Form template is required'
    if (!form.meaningDescription.trim()) errs.meaningDescription = 'Description is required'
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
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
            style={{ background: 'rgba(45, 55, 72, 0.40)', backdropFilter: 'var(--glass-blur)' }}
            onClick={onClose}
          />

          {/* Modal */}
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
              {initialData ? 'Edit Construction' : 'Add Construction'}
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-body-sm font-medium" style={{ color: 'var(--deep-slate)' }}>
                  Name
                </Label>
                <Input
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  placeholder="e.g., Ditransitive"
                  className="w-full"
                  style={{
                    borderRadius: 'var(--border-radius-md)',
                    border: errors.name ? '1px solid var(--error)' : '1px solid var(--glass-border)',
                    background: 'rgba(255,255,255,0.60)',
                  }}
                />
                {errors.name && <span className="text-caption" style={{ color: 'var(--error)' }}>{errors.name}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-body-sm font-medium" style={{ color: 'var(--deep-slate)' }}>
                  Slug
                </Label>
                <Input
                  value={form.slug}
                  onChange={(e) => update('slug', e.target.value)}
                  placeholder="e.g., ditransitive"
                  className="w-full"
                  style={{
                    borderRadius: 'var(--border-radius-md)',
                    border: errors.slug ? '1px solid var(--error)' : '1px solid var(--glass-border)',
                    background: 'rgba(255,255,255,0.60)',
                  }}
                />
                {errors.slug && <span className="text-caption" style={{ color: 'var(--error)' }}>{errors.slug}</span>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-body-sm font-medium" style={{ color: 'var(--deep-slate)' }}>
                    Category
                  </Label>
                  <select
                    value={form.category}
                    onChange={(e) => update('category', e.target.value)}
                    className="w-full text-body-sm rounded-md px-3 py-2 outline-none focus:ring-2"
                    style={{
                      borderRadius: 'var(--border-radius-md)',
                      border: '1px solid var(--glass-border)',
                      background: 'rgba(255,255,255,0.60)',
                      color: 'var(--deep-slate)',
                    }}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-body-sm font-medium" style={{ color: 'var(--deep-slate)' }}>
                    Difficulty
                  </Label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => update('difficulty', level)}
                        className="w-8 h-8 rounded-md flex items-center justify-center text-sm font-semibold transition-all duration-[var(--duration-fast)]"
                        style={{
                          background: form.difficulty === level ? 'var(--lake-blue)' : 'rgba(255,255,255,0.60)',
                          color: form.difficulty === level ? 'white' : 'var(--soft-gray)',
                          border: '1px solid var(--glass-border)',
                        }}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-body-sm font-medium" style={{ color: 'var(--deep-slate)' }}>
                  Form Template
                </Label>
                <Input
                  value={form.formTemplate}
                  onChange={(e) => update('formTemplate', e.target.value)}
                  placeholder="e.g., Subj V Obj1 Obj2"
                  className="w-full"
                  style={{
                    borderRadius: 'var(--border-radius-md)',
                    border: errors.formTemplate ? '1px solid var(--error)' : '1px solid var(--glass-border)',
                    background: 'rgba(255,255,255,0.60)',
                  }}
                />
                {errors.formTemplate && <span className="text-caption" style={{ color: 'var(--error)' }}>{errors.formTemplate}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-body-sm font-medium" style={{ color: 'var(--deep-slate)' }}>
                  Semantic Formula
                </Label>
                <Input
                  value={form.semanticFormula}
                  onChange={(e) => update('semanticFormula', e.target.value)}
                  placeholder="e.g., cause-receive(x, y, z)"
                  className="w-full"
                  style={{
                    borderRadius: 'var(--border-radius-md)',
                    border: '1px solid var(--glass-border)',
                    background: 'rgba(255,255,255,0.60)',
                  }}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-body-sm font-medium" style={{ color: 'var(--deep-slate)' }}>
                  Meaning Description
                </Label>
                <textarea
                  value={form.meaningDescription}
                  onChange={(e) => update('meaningDescription', e.target.value)}
                  placeholder="Describe the construction's meaning..."
                  rows={3}
                  className="w-full text-body-sm rounded-md px-3 py-2 outline-none resize-none focus:ring-2"
                  style={{
                    borderRadius: 'var(--border-radius-md)',
                    border: errors.meaningDescription ? '1px solid var(--error)' : '1px solid var(--glass-border)',
                    background: 'rgba(255,255,255,0.60)',
                    color: 'var(--deep-slate)',
                  }}
                />
                {errors.meaningDescription && <span className="text-caption" style={{ color: 'var(--error)' }}>{errors.meaningDescription}</span>}
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
                  {initialData ? 'Save Changes' : 'Create Construction'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
