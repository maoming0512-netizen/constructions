'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export function useLoginCheck() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)

  const checkLogin = useCallback((
    callback?: () => void,
    redirectUrl?: string
  ) => {
    if (!isAuthenticated) {
      setShowLoginModal(true)
      return false
    }
    if (callback) callback()
    return true
  }, [isAuthenticated])

  const handleLoginRedirect = useCallback(() => {
    setShowLoginModal(false)
    router.push('/auth/login')
  }, [router])

  return {
    showLoginModal,
    setShowLoginModal,
    checkLogin,
    handleLoginRedirect,
  }
}
