import { Suspense } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import VisitTracker from '@/components/VisitTracker'

function PageSkeleton() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 animate-spin"
        style={{ borderColor: 'rgba(107,163,190,0.2)', borderTopColor: 'var(--lake-blue)' }} />
    </div>
  )
}

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-[100dvh] flex flex-col">
      <VisitTracker />
      <Navbar />
      <main className="flex-1 pt-16">
        <Suspense fallback={<PageSkeleton />}>
          {children}
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
