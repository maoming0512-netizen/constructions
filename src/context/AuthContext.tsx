'use client'

import React, { createContext, useContext } from 'react'
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react'

export type UserRole = 'user' | 'admin' | 'teacher' | 'content_editor'

export interface User {
  id: string
  email: string
  name?: string | null
  role: UserRole
  avatar?: string | null
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ error?: string }>
  logout: () => void
  register: (email: string, password: string, name: string) => Promise<{ error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()

  const user = session?.user ? {
    id: session.user.id || '',
    email: session.user.email || '',
    name: session.user.name,
    role: (session.user as any).role || 'user',
    avatar: session.user.image,
  } as User : null

  const isLoading = status === 'loading'
  const isAuthenticated = status === 'authenticated'
  const isAdmin = user?.role === 'admin'

  const login = async (email: string, password: string) => {
    try {
      const result = await nextAuthSignIn('credentials', {
        email,
        password,
        redirect: false,
      })
      console.log('[AuthContext] SignIn result:', result)
      return { error: result?.error }
    } catch (error: any) {
      console.error('[AuthContext] SignIn error:', error)
      return { error: error?.message || 'Authentication failed' }
    }
  }

  const logout = () => {
    nextAuthSignOut({ redirect: true, callbackUrl: '/' })
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })
      if (!response.ok) {
        const data = await response.json()
        return { error: data.error || '注册失败' }
      }
      const result = await nextAuthSignIn('credentials', {
        email,
        password,
        redirect: false,
      })
      return { error: result?.error }
    } catch (error) {
      return { error: '注册失败' }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        isLoading,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
