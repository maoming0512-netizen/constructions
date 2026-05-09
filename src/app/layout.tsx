import type { Metadata } from 'next'
import { Suspense } from 'react'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'Syntax Lab — Construction Grammar Learning',
  description: 'An interactive platform for learning Construction Grammar based on Adele E. Goldberg\'s theory.',
}

function RootSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 animate-spin"
        style={{ borderColor: 'rgba(107,163,190,0.2)', borderTopColor: 'var(--lake-blue)' }} />
    </div>
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
          <Suspense fallback={<RootSkeleton />}>
            {children}
          </Suspense>
        </Providers>
      </body>
    </html>
  )
}
