'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Leaf, Menu, X, User, Settings, LogOut, ChevronDown, LayoutDashboard } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'


const navLinks = [
  { label: 'Practice', href: '/practice', requiresAuth: false },
  { label: 'Studio', href: '/constructions', requiresAuth: false },
  { label: 'History', href: '/history', requiresAuth: false },
  { label: 'AI Lab', href: '/ai-lab', requiresAuth: false },
  { label: 'About', href: '/about', requiresAuth: false },
]

export default function Navbar() {
  const router = useRouter()
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleNavClick = (e: React.MouseEvent, href: string, requiresAuth: boolean) => {
    // 登录限制已禁用 - 允许未登录用户访问所有页面
    router.push(href)
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const handleLogout = () => {
    logout()
    setUserMenuOpen(false)
  }

  // 用户头像或首字母
  const getUserInitial = () => {
    if (user?.name) return user.name.charAt(0).toUpperCase()
    if (user?.email) return user.email.charAt(0).toUpperCase()
    return 'U'
  }

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center transition-all duration-300"
        style={{
          backdropFilter: 'var(--glass-blur-heavy)',
          WebkitBackdropFilter: 'var(--glass-blur-heavy)',
          background: scrolled ? 'rgba(255,255,255,0.90)' : 'rgba(255,255,255,0.70)',
          borderBottom: '1px solid var(--glass-border)',
          boxShadow: scrolled ? '0 2px 16px rgba(0,0,0,0.06)' : 'none',
        }}
      >
        <div className="w-full max-w-[var(--container-max)] mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Leaf className="w-5 h-5 text-[--lake-green]" />
            <span
              className="text-xl tracking-tight"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontWeight: 600,
                color: 'var(--deep-slate)',
              }}
            >
              Syntax Lab
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  // 登录限制已禁用 - 允许未登录用户访问所有页面
                }}
                className="relative text-sm font-medium transition-colors duration-[var(--duration-fast)] group"
                style={{ color: 'var(--soft-gray)' }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.color = 'var(--deep-slate)' }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.color = 'var(--soft-gray)' }}
                prefetch={true}
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-[1.5px] bg-[--lake-blue] transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* Desktop Right - Auth */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 hover:bg-[--mist-gray]"
                >
                  {/* 用户头像 */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-white"
                    style={{ background: 'var(--lake-blue)' }}
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name || ''} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      getUserInitial()
                    )}
                  </div>
                  {/* 用户名 */}
                  <span className="text-sm font-medium text-[--deep-slate] max-w-[100px] truncate">
                    {user?.name || user?.email?.split('@')[0] || 'User'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-[--soft-gray] transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* 用户下拉菜单 */}
                {userMenuOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-48 rounded-xl overflow-hidden shadow-lg"
                    style={{
                      background: 'rgba(255,255,255,0.95)',
                      backdropFilter: 'var(--glass-blur)',
                      border: '1px solid var(--glass-border)',
                    }}
                  >
                    {/* Admin */}
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-[--deep-slate] hover:bg-[--mist-gray] transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Admin Panel
                      </Link>
                    )}
                    
                    {/* Profile */}
                    <Link
                      href="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-[--deep-slate] hover:bg-[--mist-gray] transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    
                    {/* Settings */}
                    <Link
                      href="/profile/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-[--deep-slate] hover:bg-[--mist-gray] transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                    
                    <div className="h-px bg-[--glass-border]" />
                    
                    {/* Sign Out */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium transition-colors duration-[var(--duration-fast)]"
                  style={{ color: 'var(--soft-gray)' }}
                  onMouseEnter={(e) => { (e.target as HTMLElement).style.color = 'var(--deep-slate)' }}
                  onMouseLeave={(e) => { (e.target as HTMLElement).style.color = 'var(--soft-gray)' }}
                >
                  Log In
                </Link>
                <Link
                  href="/auth/signup"
                  className="text-sm font-semibold text-white px-5 py-2 rounded-full transition-all duration-[var(--duration-fast)] hover:-translate-y-0.5"
                  style={{ background: 'var(--lake-blue)' }}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 rounded-lg"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6 text-[--deep-slate]" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
            style={{
              backdropFilter: 'var(--glass-blur-heavy)',
              WebkitBackdropFilter: 'var(--glass-blur-heavy)',
              background: 'rgba(245, 247, 250, 0.95)',
            }}
          >
            <button
              className="absolute top-4 right-4 p-2 rounded-lg"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X className="w-6 h-6 text-[--deep-slate]" />
            </button>

            <div className="flex flex-col items-center gap-8">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                >
                  <Link
                    href={link.href}
                    onClick={() => {
                      setMobileOpen(false)
                      // 登录限制已禁用
                    }}
                    className="text-h3 font-display text-[--deep-slate] hover:text-[--lake-blue] transition-colors block"
                    prefetch={true}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              {/* Mobile Auth */}
              {isAuthenticated ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: navLinks.length * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                  className="flex flex-col items-center gap-4 mt-4"
                >
                  {/* 用户信息 */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-medium text-white"
                      style={{ background: 'var(--lake-blue)' }}
                    >
                      {getUserInitial()}
                    </div>
                    <span className="text-lg font-medium text-[--deep-slate]">
                      {user?.name || user?.email?.split('@')[0]}
                    </span>
                  </div>
                  
                  {/* 菜单项 */}
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="text-body text-[--soft-gray] hover:text-[--deep-slate] transition-colors"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="text-body text-[--soft-gray] hover:text-[--deep-slate] transition-colors"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/profile/settings"
                    onClick={() => setMobileOpen(false)}
                    className="text-body text-[--soft-gray] hover:text-[--deep-slate] transition-colors"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      setMobileOpen(false)
                    }}
                    className="text-body text-red-500 hover:text-red-600 transition-colors"
                  >
                    Sign Out
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: navLinks.length * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                  className="flex flex-col items-center gap-4 mt-4"
                >
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileOpen(false)}
                    className="text-body text-[--soft-gray] hover:text-[--deep-slate] transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setMobileOpen(false)}
                    className="text-base font-semibold text-white px-8 py-3 rounded-full"
                    style={{ background: 'var(--lake-blue)' }}
                  >
                    Get Started
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>


    </>
  )
}
