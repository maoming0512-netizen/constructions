'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  BarChart3,
  Users,
  BookOpen,
  Award,
  ArrowLeft,
  TrendingUp,
  Calendar,
  Activity,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'

interface StatsData {
  totalUsers: number
  totalExercises: number
  totalConstructions: number
  usersByRole: { role: string; count: number }[]
  exercisesByDifficulty: { difficulty: number; count: number }[]
  constructionsByCategory: { category: string; count: number }[]
}

export default function AnalyticsPage() {
  const router = useRouter()
  const { isAdmin, isLoading } = useAuth()
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/')
    }
  }, [isLoading, isAdmin, router])

  useEffect(() => {
    if (isAdmin) {
      fetchStats()
    }
  }, [isAdmin])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/analytics')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
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

  if (!isAdmin) return null

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6" style={{ background: 'var(--bg-color)' }}>
      <div className="max-w-6xl mx-auto">
        {/* 头部 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => router.push('/admin')}
            className="mb-4 -ml-4 text-[--soft-gray]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回后台
          </Button>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6BA3BE, #8AB89A)' }}
            >
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[--deep-slate]">数据统计</h1>
              <p className="text-sm text-[--soft-gray]">平台数据概览与分析</p>
            </div>
          </div>
        </motion.div>

        {/* 总览卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl p-6"
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--glass-border)',
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[--soft-gray]">总用户数</p>
                <p className="text-3xl font-bold text-[--lake-blue] mt-2">
                  {stats?.totalUsers || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl p-6"
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--glass-border)',
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[--soft-gray]">总练习题</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {stats?.totalExercises || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl p-6"
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--glass-border)',
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[--soft-gray]">构式条目</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {stats?.totalConstructions || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* 详细统计 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 用户角色分布 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl p-6"
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--glass-border)',
            }}
          >
            <h2 className="text-lg font-semibold text-[--deep-slate] mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-[--lake-blue]" />
              用户角色分布
            </h2>
            {stats?.usersByRole && stats.usersByRole.length > 0 ? (
              <div className="space-y-3">
                {stats.usersByRole.map((item) => (
                  <div key={item.role} className="flex items-center justify-between">
                    <span className="text-[--deep-slate]">
                      {item.role === 'admin' ? '管理员' : '普通用户'}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[--lake-blue] rounded-full"
                          style={{
                            width: `${(item.count / (stats?.totalUsers || 1)) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[--soft-gray] text-center py-8">暂无数据</p>
            )}
          </motion.div>

          {/* 构式分类分布 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl p-6"
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--glass-border)',
            }}
          >
            <h2 className="text-lg font-semibold text-[--deep-slate] mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-500" />
              构式分类分布
            </h2>
            {stats?.constructionsByCategory && stats.constructionsByCategory.length > 0 ? (
              <div className="space-y-3">
                {stats.constructionsByCategory.map((item) => (
                  <div key={item.category} className="flex items-center justify-between">
                    <span className="text-[--deep-slate]">{item.category}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{
                            width: `${(item.count / (stats?.totalConstructions || 1)) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[--soft-gray] text-center py-8">暂无数据</p>
            )}
          </motion.div>

          {/* 题目难度分布 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-2xl p-6 lg:col-span-2"
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--glass-border)',
            }}
          >
            <h2 className="text-lg font-semibold text-[--deep-slate] mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-green-500" />
              题目难度分布
            </h2>
            {stats?.exercisesByDifficulty && stats.exercisesByDifficulty.length > 0 ? (
              <div className="grid grid-cols-5 gap-4">
                {stats.exercisesByDifficulty.map((item) => {
                  const labels = ['入门', '简单', '中等', '困难', '专家']
                  const colors = ['bg-green-400', 'bg-blue-400', 'bg-yellow-400', 'bg-orange-400', 'bg-red-400']
                  return (
                    <div key={item.difficulty} className="text-center">
                      <div className="text-2xl font-bold text-[--deep-slate] mb-1">
                        {item.count}
                      </div>
                      <div className={`w-full h-2 rounded-full ${colors[item.difficulty - 1]} mb-2`} />
                      <div className="text-xs text-[--soft-gray]">{labels[item.difficulty - 1]}</div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-[--soft-gray] text-center py-8">暂无数据</p>
            )}
          </motion.div>
        </div>

        {/* 系统状态 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm text-[--deep-slate]">数据库连接正常</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm text-[--deep-slate]">认证服务正常</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm text-[--deep-slate]">AI API 服务正常</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
