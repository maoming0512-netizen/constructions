import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Leaf,
  LayoutDashboard,
  Library,
  ClipboardList,
  Users,
  Bot,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export type AdminTab = 'dashboard' | 'constructions' | 'exercises' | 'users' | 'ai-review'

interface SidebarProps {
  activeTab: AdminTab
  onTabChange: (tab: AdminTab) => void
}

const navItems: { id: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'constructions', label: 'Constructions', icon: Library },
  { id: 'exercises', label: 'Exercises', icon: ClipboardList },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'ai-review', label: 'AI Review', icon: Bot },
]

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const sidebarWidth = collapsed ? '64px' : '260px'

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const NavContent = () => (
    <>
      {/* Header */}
      <div
        className="flex items-center gap-2"
        style={{ padding: 'var(--space-5)' }}
      >
        <Leaf className="w-5 h-5 shrink-0" style={{ color: 'var(--lake-green)' }} />
        {!collapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <span
              className="text-base whitespace-nowrap"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontWeight: 600,
              }}
            >
              Syntax Lab
            </span>
            <span
              className="text-caption shrink-0"
              style={{
                background: 'rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.80)',
                borderRadius: 'var(--border-radius-full)',
                padding: '0.125rem 0.5rem',
              }}
            >
              Admin
            </span>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav
        className="flex-1 flex flex-col"
        style={{ marginTop: 'var(--space-6)', gap: 'var(--space-1)' }}
        role="navigation"
        aria-label="Admin navigation"
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id)
                setMobileOpen(false)
              }}
              className="flex items-center transition-all duration-[var(--duration-fast)] w-full"
              style={{
                padding: 'var(--space-3) var(--space-5)',
                gap: collapsed ? '0' : 'var(--space-3)',
                borderRadius: 'var(--border-radius-md)',
                justifyContent: collapsed ? 'center' : 'flex-start',
                background: isActive ? 'rgba(107,163,190,0.25)' : 'transparent',
                color: isActive ? 'white' : 'rgba(255,255,255,0.60)',
                borderLeft: isActive ? '3px solid var(--lake-blue)' : '3px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'
                  ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.90)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent'
                  ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.60)'
                }
              }}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" style={{ color: 'inherit' }} />
              {!collapsed && (
                <span className="text-body-sm font-medium whitespace-nowrap">{item.label}</span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Bottom: user info + logout */}
      {!collapsed && (
        <div
          className="flex items-center gap-3 mt-auto"
          style={{
            padding: 'var(--space-4) var(--space-5)',
            borderTop: '1px solid rgba(255,255,255,0.10)',
          }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
            style={{ background: 'var(--lake-blue)', color: 'white' }}
          >
            {(user?.name || 'A')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-body-sm font-medium truncate" style={{ color: 'rgba(255,255,255,0.90)' }}>
              {user?.name || 'Admin'}
            </p>
            <p className="text-caption truncate" style={{ color: 'rgba(255,255,255,0.50)' }}>
              {user?.email || 'admin@constructscape.com'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-md transition-all duration-[var(--duration-fast)] hover:bg-[rgba(255,255,255,0.10)]"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.50)' }} />
          </button>
        </div>
      )}

      {/* Collapse toggle (desktop only) */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="hidden lg:flex items-center justify-center w-8 h-8 mx-auto mb-3 rounded-full transition-all duration-[var(--duration-fast)] hover:bg-[rgba(255,255,255,0.10)]"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.50)' }} />
        ) : (
          <ChevronLeft className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.50)' }} />
        )}
      </button>
    </>
  )

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-[60] p-2 rounded-md"
        style={{ background: 'var(--deep-slate)' }}
        aria-label="Open admin menu"
      >
        <Menu className="w-5 h-5 text-white" />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 z-[70]"
              style={{ background: 'rgba(45,55,72,0.50)', backdropFilter: 'blur(4px)' }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-[80] flex flex-col"
              style={{
                width: '260px',
                background: 'var(--deep-slate)',
                color: 'white',
              }}
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-1 rounded-md"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.60)' }} />
              </button>
              <NavContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex fixed left-0 top-0 bottom-0 z-50 flex-col transition-all duration-[var(--duration-normal)]"
        style={{
          width: sidebarWidth,
          background: 'var(--deep-slate)',
          color: 'white',
        }}
      >
        <NavContent />
      </aside>
    </>
  )
}
