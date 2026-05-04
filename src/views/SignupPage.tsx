import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Leaf, User, Mail, Lock, Eye, EyeOff, Github } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

const easeSpring = [0.175, 0.885, 0.32, 1.275] as [number, number, number, number]

type Strength = 0 | 1 | 2 | 3 | 4

function getPasswordStrength(password: string): Strength {
  if (!password) return 0
  let score = 0
  if (password.length >= 8) score++
  if (/[a-zA-Z]/.test(password) && /\d/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++
  if (password.length >= 12 && score >= 2) score++
  return score as Strength
}

function strengthLabel(strength: Strength): string {
  switch (strength) {
    case 0: return 'Too short'
    case 1: return 'Weak'
    case 2: return 'Fair'
    case 3: return 'Good'
    case 4: return 'Strong'
  }
}

function strengthColor(strength: Strength): string {
  switch (strength) {
    case 0: return 'var(--soft-gray)'
    case 1: return 'var(--error)'
    case 2: return 'var(--warning)'
    case 3: return 'var(--lake-blue)'
    case 4: return 'var(--lake-green)'
  }
}

export default function SignupPage() {
  const router = useRouter()
  const { register, isAuthenticated } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const passwordStrength = getPasswordStrength(password)

  // 如果已登录，使用 useEffect 跳转（避免渲染时调用 setState）
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Name is required'
    else if (name.trim().length > 100) errs.name = 'Name must be 100 characters or less'
    if (!email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Invalid email format'
    if (!password) errs.password = 'Password is required'
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters'
    else if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) errs.password = 'Password must contain at least one letter and one number'
    if (!confirmPassword) errs.confirmPassword = 'Please confirm your password'
    else if (confirmPassword !== password) errs.confirmPassword = 'Passwords do not match'
    if (!agreeTerms) errs.terms = 'You must agree to the terms'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setIsLoading(true)
    try {
      const result = await register(email, password, name)
      if (!result.error) {
        router.push('/dashboard')
      } else {
        setErrors({ general: result.error })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center relative overflow-hidden py-8"
      style={{
        background: 'linear-gradient(135deg, rgba(107,163,190,0.15) 0%, rgba(184,169,201,0.12) 40%, rgba(138,184,154,0.10) 100%)',
      }}
    >
      {/* Animated gradient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div
          className="absolute rounded-full"
          style={{
            width: '600px',
            height: '600px',
            top: '-10%',
            left: '-10%',
            background: 'radial-gradient(circle, rgba(107,163,190,0.08) 0%, transparent 70%)',
            animation: 'float-up-sway 25s linear infinite',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: '500px',
            height: '500px',
            bottom: '-5%',
            right: '-5%',
            background: 'radial-gradient(circle, rgba(184,169,201,0.06) 0%, transparent 70%)',
            animation: 'float-up-sway 30s linear infinite reverse',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: easeSpring }}
        className="relative w-full max-w-[440px] mx-4"
        style={{ zIndex: 1 }}
      >
        <div
          className="w-full"
          style={{
            borderRadius: 'var(--border-radius-xl)',
            background: 'var(--glass-bg)',
            backdropFilter: 'var(--glass-blur-heavy)',
            WebkitBackdropFilter: 'var(--glass-blur-heavy)',
            border: '1px solid var(--glass-border)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.10)',
            padding: 'var(--space-10)',
          }}
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="flex items-center justify-center gap-2 mb-2"
          >
            <Leaf className="w-5 h-5" style={{ color: 'var(--lake-green)' }} />
            <span
              className="text-2xl"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontWeight: 600,
                color: 'var(--deep-slate)',
              }}
            >
              Syntax Lab
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.3 }}
            className="text-h2 font-display text-center mt-4"
            style={{ color: 'var(--deep-slate)' }}
          >
            Create Your Account
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="text-body text-center mt-2"
            style={{ color: 'var(--soft-gray)' }}
          >
            Start your journey into English constructions.
          </motion.p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" style={{ marginTop: 'var(--space-8)' }}>
            {errors.general && (
              <div className="text-caption px-3 py-2 rounded-md" style={{ color: 'var(--error)', background: 'var(--error-bg)' }}>
                {errors.general}
              </div>
            )}

            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-body-sm font-medium" style={{ color: 'var(--deep-slate)' }}>
                Full Name
              </Label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: 'var(--soft-gray)' }}
                />
                <Input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })) }}
                  className="pl-10 w-full"
                  style={{
                    borderRadius: 'var(--border-radius-md)',
                    border: errors.name ? '1px solid var(--error)' : '1px solid var(--glass-border)',
                    background: 'rgba(255,255,255,0.60)',
                    padding: 'var(--space-3) var(--space-4)',
                    paddingLeft: '2.5rem',
                  }}
                />
              </div>
              {errors.name && (
                <span className="text-caption" style={{ color: 'var(--error)' }}>{errors.name}</span>
              )}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-body-sm font-medium" style={{ color: 'var(--deep-slate)' }}>
                Email
              </Label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: 'var(--soft-gray)' }}
                />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })) }}
                  className="pl-10 w-full"
                  style={{
                    borderRadius: 'var(--border-radius-md)',
                    border: errors.email ? '1px solid var(--error)' : '1px solid var(--glass-border)',
                    background: 'rgba(255,255,255,0.60)',
                    padding: 'var(--space-3) var(--space-4)',
                    paddingLeft: '2.5rem',
                  }}
                />
              </div>
              {errors.email && (
                <span className="text-caption" style={{ color: 'var(--error)' }}>{errors.email}</span>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-body-sm font-medium" style={{ color: 'var(--deep-slate)' }}>
                Password
              </Label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: 'var(--soft-gray)' }}
                />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })) }}
                  className="pl-10 pr-10 w-full"
                  style={{
                    borderRadius: 'var(--border-radius-md)',
                    border: errors.password ? '1px solid var(--error)' : '1px solid var(--glass-border)',
                    background: 'rgba(255,255,255,0.60)',
                    padding: 'var(--space-3) var(--space-4)',
                    paddingLeft: '2.5rem',
                    paddingRight: '2.5rem',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" style={{ color: 'var(--soft-gray)' }} />
                  ) : (
                    <Eye className="w-4 h-4" style={{ color: 'var(--soft-gray)' }} />
                  )}
                </button>
              </div>
              {errors.password && (
                <span className="text-caption" style={{ color: 'var(--error)' }}>{errors.password}</span>
              )}

              {/* Password strength indicator */}
              {password && (
                <div className="flex flex-col gap-1 mt-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="flex-1 h-1 rounded-full transition-all duration-[var(--duration-normal)]"
                        style={{
                          background: i <= passwordStrength ? strengthColor(passwordStrength) : 'rgba(0,0,0,0.08)',
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-caption" style={{ color: strengthColor(passwordStrength) }}>
                    Password strength: {strengthLabel(passwordStrength)}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-body-sm font-medium" style={{ color: 'var(--deep-slate)' }}>
                Confirm Password
              </Label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: 'var(--soft-gray)' }}
                />
                <Input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: '' })) }}
                  className="pl-10 pr-10 w-full"
                  style={{
                    borderRadius: 'var(--border-radius-md)',
                    border: errors.confirmPassword ? '1px solid var(--error)' : '1px solid var(--glass-border)',
                    background: 'rgba(255,255,255,0.60)',
                    padding: 'var(--space-3) var(--space-4)',
                    paddingLeft: '2.5rem',
                    paddingRight: '2.5rem',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? (
                    <EyeOff className="w-4 h-4" style={{ color: 'var(--soft-gray)' }} />
                  ) : (
                    <Eye className="w-4 h-4" style={{ color: 'var(--soft-gray)' }} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="text-caption" style={{ color: 'var(--error)' }}>{errors.confirmPassword}</span>
              )}
            </div>

            {/* Terms checkbox */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="terms"
                  checked={agreeTerms}
                  onCheckedChange={(checked) => { setAgreeTerms(checked as boolean); setErrors((p) => ({ ...p, terms: '' })) }}
                />
                <label htmlFor="terms" className="text-body-sm" style={{ color: 'var(--soft-gray)' }}>
                  I agree to the{' '}
                  <span
                    className="cursor-pointer hover:underline"
                    style={{ color: 'var(--lake-blue)' }}
                    onClick={(e) => { e.preventDefault(); alert('Terms would open here') }}
                  >
                    Terms
                  </span>
                  {' '}and{' '}
                  <span
                    className="cursor-pointer hover:underline"
                    style={{ color: 'var(--lake-blue)' }}
                    onClick={(e) => { e.preventDefault(); alert('Privacy Policy would open here') }}
                  >
                    Privacy Policy
                  </span>
                </label>
              </div>
              {errors.terms && (
                <span className="text-caption" style={{ color: 'var(--error)' }}>{errors.terms}</span>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 text-white font-semibold text-body-lg transition-all duration-[var(--duration-fast)] hover:-translate-y-0.5"
              style={{
                background: 'var(--lake-blue)',
                borderRadius: 'var(--border-radius-full)',
                padding: 'var(--space-3)',
              }}
            >
              {isLoading ? 'Creating...' : 'Create Account'}
            </Button>

            {/* Divider */}
            <div className="relative flex items-center my-4">
              <div className="flex-1 h-px" style={{ background: 'var(--glass-border)' }} />
              <span
                className="text-caption px-3"
                style={{
                  color: 'var(--soft-gray)',
                  background: 'var(--glass-bg)',
                }}
              >
                or
              </span>
              <div className="flex-1 h-px" style={{ background: 'var(--glass-border)' }} />
            </div>

            {/* Social buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-all duration-[var(--duration-fast)] hover:border-[--lake-blue]"
                style={{
                  border: '1px solid var(--glass-border)',
                  background: 'rgba(255,255,255,0.60)',
                  color: 'var(--deep-slate)',
                  borderRadius: 'var(--border-radius-full)',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-all duration-[var(--duration-fast)] hover:border-[--lake-blue]"
                style={{
                  border: '1px solid var(--glass-border)',
                  background: 'rgba(255,255,255,0.60)',
                  color: 'var(--deep-slate)',
                  borderRadius: 'var(--border-radius-full)',
                }}
              >
                <Github className="w-4 h-4" />
                GitHub
              </button>
            </div>
          </form>

          {/* Log in link */}
          <p className="text-body text-center mt-6" style={{ color: 'var(--soft-gray)' }}>
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="font-medium transition-all duration-[var(--duration-fast)] hover:underline"
              style={{ color: 'var(--lake-blue)' }}
            >
              Log in
            </Link>
          </p>

          {/* Terms note */}
          <p className="text-caption text-center mt-4" style={{ color: 'var(--soft-gray)' }}>
            By signing up, you agree to our{' '}
            <span
              className="cursor-pointer hover:underline"
              style={{ color: 'var(--lake-blue)' }}
              onClick={() => alert('Terms would open here')}
            >
              Terms
            </span>
            {' '}and{' '}
            <span
              className="cursor-pointer hover:underline"
              style={{ color: 'var(--lake-blue)' }}
              onClick={() => alert('Privacy Policy would open here')}
            >
              Privacy Policy
            </span>
            .
          </p>
        </div>
      </motion.div>
    </div>
  )
}
