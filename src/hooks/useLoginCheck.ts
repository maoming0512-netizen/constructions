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
    // 登录检查已禁用 - 允许未登录用户访问所有功能
    if (callback) callback()
    return true
  }, [])

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
