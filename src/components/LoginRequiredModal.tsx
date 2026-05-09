'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LoginRequiredModalProps {
  isOpen: boolean
  onClose: () => void
  onLogin: () => void
}

export default function LoginRequiredModal({
  isOpen,
  onClose,
  onLogin,
}: LoginRequiredModalProps) {
  const router = useRouter()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background overlay */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0, 0, 0, 0.5)' }}
        onClick={onClose}
      />

      {/* Modal content */}
      <div
        className="relative max-w-md w-full mx-4 rounded-2xl shadow-xl animate-in fade-in zoom-in duration-200"
        style={{ background: 'white' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-full transition-colors hover:bg-gray-100"
        >
          <X className="w-5 h-5" style={{ color: 'var(--soft-gray)' }} />
        </button>

        {/* Modal body */}
        <div className="p-8">
          <div className="mb-6 text-center">
            <div
              className="mx-auto mb-4 flex items-center justify-center rounded-full w-12 h-12"
              style={{ background: 'var(--mist-white)' }}
            >
              <span className="text-2xl">🔐</span>
            </div>
            <h2
              className="text-xl font-semibold mb-2 font-display"
              style={{ color: 'var(--deep-slate)' }}
            >
              Login Required
            </h2>
            <p className="text-body" style={{ color: 'var(--soft-gray)' }}>
              You need to be logged in to access this feature.
              Register now for free and start learning!
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => {
                onClose()
                onLogin()
              }}
              className="w-full text-white font-semibold"
              style={{
                background: 'var(--lake-blue)',
                borderRadius: 'var(--border-radius-full)',
                padding: 'var(--space-3) var(--space-6)',
              }}
            >
              Log In
            </Button>
            <Button
              onClick={() => {
                onClose()
                router.push('/signup')
              }}
              variant="outline"
              className="w-full font-semibold"
              style={{
                borderRadius: 'var(--border-radius-full)',
                padding: 'var(--space-3) var(--space-6)',
                border: '1px solid var(--soft-gray)',
                color: 'var(--deep-slate)',
              }}
            >
              Register for Free
            </Button>
          </div>

          <p
            className="mt-6 text-center text-caption"
            style={{ color: 'var(--soft-gray)' }}
          >
            No credit card required • Free to use
          </p>
        </div>
      </div>
    </div>
  )
}
