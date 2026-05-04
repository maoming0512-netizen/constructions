import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'default'
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
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
            onClick={onCancel}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.175, 0.885, 0.32, 1.275] as [number, number, number, number] }}
            className="relative w-full max-w-sm mx-4"
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
            <div className="flex flex-col items-center text-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                style={{
                  background: variant === 'danger' ? 'var(--error-bg)' : 'rgba(107,163,190,0.15)',
                }}
              >
                <AlertTriangle
                  className="w-6 h-6"
                  style={{ color: variant === 'danger' ? 'var(--error)' : 'var(--lake-blue)' }}
                />
              </div>

              <h3 className="text-h4 font-semibold mb-2" style={{ color: 'var(--deep-slate)' }}>
                {title}
              </h3>
              <p className="text-body-sm mb-6" style={{ color: 'var(--soft-gray)' }}>
                {message}
              </p>

              <div className="flex items-center gap-3 w-full">
                <Button
                  variant="outline"
                  onClick={onCancel}
                  className="flex-1 text-body-sm"
                  style={{
                    borderRadius: 'var(--border-radius-full)',
                    border: '1px solid var(--glass-border)',
                  }}
                >
                  {cancelLabel}
                </Button>
                <Button
                  onClick={onConfirm}
                  className="flex-1 text-white text-body-sm font-semibold transition-all duration-[var(--duration-fast)] hover:-translate-y-0.5"
                  style={{
                    background: variant === 'danger' ? 'var(--error)' : 'var(--lake-blue)',
                    borderRadius: 'var(--border-radius-full)',
                  }}
                >
                  {confirmLabel}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
