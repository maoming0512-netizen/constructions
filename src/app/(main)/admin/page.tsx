'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Users,
  BookOpen,
  Activity,
  TrendingUp,
  Settings,
  ChevronRight,
  Leaf,
  BarChart3,
  Eye,
  Award,
  Calendar,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'

// 统计卡片组件
function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color 
}: { 
  title: string
  value: string | number
  icon: any
  trend?: string
  color: string 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-6"
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--glass-border)',
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[--soft-gray]">{title}</p>
          <p className="text-3xl font-bold mt-2" style={{ color }}>{value}</p>
          {trend && (
            <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {trend}
            </p>
          )}
        </div>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: `${color}20` }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
      </div>
    </motion.div>
  )
}

// 快捷入口组件
function QuickAction({ 
  title, 
  description, 
  icon: Icon, 
  href 
}: { 
  title: string
  description: string
  icon: any
  href: string 
}) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ y: -2 }}
        className="rounded-xl p-4 flex items-center gap-4 transition-all hover:shadow-md"
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--glass-border)',
        }}
      >
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--mist-gray)' }}
        >
          <Icon className="w-5 h-5 text-[--lake-blue]" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-[--deep-slate]">{title}</h3>
          <p className="text-xs text-[--soft-gray]">{description}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-[--soft-gray]" />
      </motion.div>
    </Link>
  )
}

export default function AdminDashboard() {
  const router = useRouter()
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalExercises: 0,
    totalConstructions: 0,
    todayVisits: 0,
  })
  const [loading, setLoading] = useState(true)

  // 如果不是管理员，重定向到首页
  useEffect(() => {
    if (!isLoading && isAuthenticated && !isAdmin) {
      router.push('/')
    }
  }, [isLoading, isAuthenticated, isAdmin, router])

  // 获取统计数据
  useEffect(() => {
    if (isAdmin) {
      fetchStats()
    }
  }, [isAdmin])

  const fetchStats = async () => {
    try {
      const [usersRes, exercisesRes, constructionsRes] = await Promise.all([
        fetch('/api/admin/stats/users'),
        fetch('/api/admin/stats/exercises'),
        fetch('/api/admin/stats/constructions'),
      ])

      const users = usersRes.ok ? await usersRes.json() : { count: 0 }
      const exercises = exercisesRes.ok ? await exercisesRes.json() : { count: 0 }
      const constructions = constructionsRes.ok ? await constructionsRes.json() : { count: 0 }

      setStats({
        totalUsers: users.count || 0,
        totalExercises: exercises.count || 0,
        totalConstructions: constructions.count || 0,
        todayVisits: 0, // 需要额外的统计服务
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[--lake-blue]" />
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6" style={{ background: 'var(--bg-color)' }}>
      <div className="max-w-7xl mx-auto">
        {/* 欢迎区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--lake-blue)' }}
            >
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[--deep-slate]">管理后台</h1>
              <p className="text-sm text-[--soft-gray]">欢迎回来，{user?.name || user?.email}</p>
            </div>
          </div>
        </motion.div>

        {/* 统计数据 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="总用户数"
            value={stats.totalUsers}
            icon={Users}
            color="#6BA3BE"
          />
          <StatCard
            title="总练习题"
            value={stats.totalExercises}
            icon={BookOpen}
            color="#8AB89A"
          />
          <StatCard
            title="构式条目"
            value={stats.totalConstructions}
            icon={Award}
            color="#B8A9C9"
          />
          <StatCard
            title="今日访问"
            value={stats.todayVisits}
            icon={Eye}
            color="#E8B86D"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 快捷入口 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div
              className="rounded-2xl p-6"
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--glass-border)',
              }}
            >
              <h2 className="text-lg font-semibold text-[--deep-slate] mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-[--lake-blue]" />
                快捷操作
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <QuickAction
                  title="用户管理"
                  description="查看和管理注册用户"
                  icon={Users}
                  href="/admin/users"
                />
                <QuickAction
                  title="题目管理"
                  description="管理练习题目和答案"
                  icon={BookOpen}
                  href="/admin/exercises"
                />
                <QuickAction
                  title="构式管理"
                  description="编辑构式条目内容"
                  icon={Award}
                  href="/admin/construction_manager"
                />
                <QuickAction
                  title="数据统计"
                  description="查看详细数据分析"
                  icon={BarChart3}
                  href="/admin/analytics"
                />
              </div>
            </div>

            {/* 最近活动 */}
            <div
              className="rounded-2xl p-6 mt-6"
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--glass-border)',
              }}
            >
              <h2 className="text-lg font-semibold text-[--deep-slate] mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-[--lake-green]" />
                系统状态
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-[--glass-border]">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-[--deep-slate]">数据库连接</span>
                  </div>
                  <span className="text-xs text-green-500">正常</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[--glass-border]">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-[--deep-slate]">AI API 服务</span>
                  </div>
                  <span className="text-xs text-green-500">正常</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-[--deep-slate]">认证服务</span>
                  </div>
                  <span className="text-xs text-green-500">正常</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 右侧信息 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div
              className="rounded-2xl p-6"
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--glass-border)',
              }}
            >
              <h2 className="text-lg font-semibold text-[--deep-slate] mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[--lake-blue]" />
                版本信息
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[--soft-gray]">系统版本</span>
                  <span className="text-[--deep-slate]">v1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[--soft-gray]">Next.js</span>
                  <span className="text-[--deep-slate]">15.5.15</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[--soft-gray]">数据库</span>
                  <span className="text-[--deep-slate]">PostgreSQL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[--soft-gray]">部署状态</span>
                  <span className="text-green-500">运行中</span>
                </div>
              </div>
            </div>

            {/* 快速链接 */}
            <div
              className="rounded-2xl p-6 mt-6"
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--glass-border)',
              }}
            >
              <h2 className="text-lg font-semibold text-[--deep-slate] mb-4">快速链接</h2>
              <div className="space-y-2">
                <Link
                  href="/"
                  className="block p-3 rounded-lg hover:bg-[--mist-gray] transition-colors text-sm text-[--deep-slate]"
                >
                  🏠 返回首页
                </Link>
                <Link
                  href="/profile"
                  className="block p-3 rounded-lg hover:bg-[--mist-gray] transition-colors text-sm text-[--deep-slate]"
                >
                  👤 个人资料
                </Link>
                <Link
                  href="/ai-lab"
                  className="block p-3 rounded-lg hover:bg-[--mist-gray] transition-colors text-sm text-[--deep-slate]"
                >
                  🤖 AI Lab
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
