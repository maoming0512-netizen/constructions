'use client'

import { SessionProvider } from 'next-auth/react'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'
import { ErrorSuppressor } from '@/components/ErrorSuppressor'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider 
      refetchInterval={0}
      refetchOnWindowFocus={false}
      refetchWhenOffline={false}
    >
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <AuthProvider>
          <ErrorSuppressor />
          {children}
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
