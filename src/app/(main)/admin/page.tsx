'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Users, BookOpen, Award, Eye, Activity, Settings, ChevronRight,
  Leaf, BarChart3, Calendar, TrendingUp, Zap, PenTool, History,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

const COLORS = ['#6BA3BE', '#8AB89A', '#B8A9C9', '#E8B86D', '#E76F51', '#2A9D8F']
const levelNames: Record<string, string> = { junior: 'Junior High', senior: 'Senior High', ielts_basic: 'IELTS Basic', ielts_advanced: 'IELTS Advanced' }
const typeNames: Record<string, string> = { D1: 'Micro Continuation', D2: 'Long Continuation', T1: 'C-E Translation' }
const roleNames: Record<string, string> = { admin: 'Admin', user: 'Learner' }

function StatCard({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: any; color: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-5" style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)' }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-[--soft-gray] uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold mt-1" style={{ color }}>{value}</p>
        </div>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
    </motion.div>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-5" style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)' }}>
      <h3 className="text-sm font-semibold text-[--deep-slate] mb-4">{title}</h3>
      <div className="h-64">{children}</div>
    </motion.div>
  )
}

export default function AdminDashboard() {
  const router = useRouter()
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (!isLoading && isAuthenticated && !isAdmin) router.push('/') }, [isLoading, isAuthenticated, isAdmin, router])

  useEffect(() => {
    if (isAdmin) {
      fetch('/api/admin/stats').then(r => r.ok ? r.json() : null).then(d => { if (d) setStats(d) }).finally(() => setLoading(false))
    }
  }, [isAdmin])

  if (isLoading || loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[--lake-blue]" /></div>
  if (!isAdmin) return null
  if (!stats) return <div className="min-h-screen pt-20 text-center text-muted-foreground">Loading stats...</div>

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6" style={{ background: 'var(--bg-color)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--lake-blue)' }}>
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[--deep-slate]">Admin Dashboard</h1>
              <p className="text-sm text-[--soft-gray]">Welcome back, {user?.name || user?.email}</p>
            </div>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="#6BA3BE" />
          <StatCard title="Practice Records" value={stats.totalRecords} icon={History} color="#8AB89A" />
          <StatCard title="Official Exercises" value={stats.totalExercises} icon={BookOpen} color="#B8A9C9" />
          <StatCard title="Constructions" value={stats.totalConstructions} icon={Award} color="#E8B86D" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard title="AI-Generated" value={stats.totalAIExercises} icon={PenTool} color="#E76F51" />
          <StatCard title="Today Visits" value={stats.todayVisits} icon={Eye} color="#2A9D8F" />
          <StatCard title="Total Visits" value={stats.totalVisits} icon={Activity} color="#6BA3BE" />
          <StatCard title="Total API Calls" value={stats.totalAPICalls} icon={Zap} color="#B8A9C9" />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ChartCard title="📈 Daily Visits (7 days)">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.visitTrend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={(v: string) => v.slice(5)} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#6BA3BE" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="📊 API Calls (7 days)">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.apiTrend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={(v: string) => v.slice(5)} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#E76F51" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <ChartCard title="Exercises by Level">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.byLevel?.map((l: any) => ({ ...l, name: levelNames[l.level] || l.level })) || []} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, count }: any) => `${name}: ${count}`}>
                  {(stats.byLevel || []).map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Exercises by Type">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byType?.map((t: any) => ({ ...t, name: typeNames[t.type] || t.type })) || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#8AB89A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Users by Role">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.usersByRole?.map((u: any) => ({ ...u, name: roleNames[u.role] || u.role })) || []} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, count }: any) => `${name}: ${count}`}>
                  {[{ role: 'admin' }, { role: 'user' }].map((_: any, i: number) => <Cell key={i} fill={i === 0 ? '#E76F51' : '#6BA3BE'} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {[
            { title: 'User Management', desc: 'View and manage users', icon: Users, href: '/admin/users' },
            { title: 'Exercise Manager', desc: 'Manage exercise bank', icon: BookOpen, href: '/admin/exercises' },
            { title: 'Construction Library', desc: `${stats.totalConstructions} entries`, icon: Award, href: '/admin/construction_manager' },
            { title: 'Analytics Detail', desc: 'Full data breakdown', icon: BarChart3, href: '/admin/analytics' },
          ].map((a, i) => (
            <Link key={i} href={a.href}>
              <motion.div whileHover={{ y: -2 }} className="rounded-xl p-4 flex items-center gap-3 transition-all hover:shadow-md"
                style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)' }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--mist-gray)' }}>
                  <a.icon className="w-5 h-5 text-[--lake-blue]" />
                </div>
                <div className="flex-1"><h3 className="font-medium text-sm text-[--deep-slate]">{a.title}</h3><p className="text-xs text-[--soft-gray]">{a.desc}</p></div>
                <ChevronRight className="w-4 h-4 text-[--soft-gray]" />
              </motion.div>
            </Link>
          ))}
        </div>

        {/* System Status */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-6" style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)' }}>
          <h2 className="text-sm font-semibold text-[--deep-slate] mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-green-500" /> System Status</h2>
          <div className="grid grid-cols-3 gap-4 text-sm">
            {[{ label: 'Database', status: 'Online' }, { label: 'AI API', status: 'Online' }, { label: 'Auth Service', status: 'Online' }].map((s, i) => (
              <div key={i} className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500" /><span className="text-[--deep-slate]">{s.label}</span><span className="text-green-500 text-xs ml-auto">{s.status}</span></div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
