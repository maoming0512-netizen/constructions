import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Clock,
  Heart,
  History,
  TrendingUp,
  BookOpen,
  CheckCircle2,
  BarChart3,
  ChevronRight,
  Award,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PracticeRecord {
  exerciseId: string
  isCorrect: boolean
  userAnswer: string | string[] | number
  completedAt: string
}

interface FavoriteConstruction {
  id: string
  name: string
  form: string
  meaning: string
  slug: string
}

/**
 * DashboardPage — 学习仪表盘
 *
 * "最近练习""收藏的构式""练习历史""学习进度""继续学习"
 */
export default function DashboardPage() {
  const [records, setRecords] = useState<PracticeRecord[]>([])
  const [favorites, setFavorites] = useState<FavoriteConstruction[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('practiceResults')
    if (saved) {
      const parsed = JSON.parse(saved)
      setRecords(
        parsed.map((r: any, index: number) => ({
          ...r,
          completedAt: new Date(Date.now() - index * 3600000).toISOString(),
        }))
      )
    }

    const fav = localStorage.getItem('favoriteConstructions')
    if (fav) {
      setFavorites(JSON.parse(fav))
    } else {
      // Default favorites for demo
      setFavorites([
        {
          id: 'ditransitive',
          name: '双及物构式',
          form: 'Subj V Obj1 Obj2',
          meaning: '施事成功致使接受者收到受事',
          slug: 'ditransitive',
        },
        {
          id: 'caused-motion',
          name: '使移构式',
          form: 'Subj V Obj Path',
          meaning: '致使者致使客体沿路径移动',
          slug: 'caused-motion',
        },
        {
          id: 'resultative',
          name: '结果构式',
          form: 'Subj V Obj Result-AP',
          meaning: '施事致使受事进入结果状态',
          slug: 'resultative',
        },
      ])
    }
  }, [])

  const completedCount = records.length
  const correctCount = records.filter((r) => r.isCorrect).length
  const accuracy = completedCount > 0 ? Math.round((correctCount / completedCount) * 100) : 0
  const streak = 5 // Demo streak

  const recentRecords = records.slice(-5).reverse()

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 py-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">学习仪表盘</h1>
        <p className="text-sm text-muted-foreground mt-1">追踪你的构式学习进度</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="p-4 rounded-xl border bg-card"
        >
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-muted-foreground">已完成</span>
          </div>
          <p className="text-2xl font-bold">{completedCount}</p>
          <p className="text-xs text-muted-foreground">道练习题</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-xl border bg-card"
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-xs text-muted-foreground">正确</span>
          </div>
          <p className="text-2xl font-bold">{correctCount}</p>
          <p className="text-xs text-muted-foreground">道答对</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-xl border bg-card"
        >
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-violet-500" />
            <span className="text-xs text-muted-foreground">正确率</span>
          </div>
          <p className="text-2xl font-bold">{accuracy}%</p>
          <p className="text-xs text-muted-foreground">平均正确率</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-xl border bg-card"
        >
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-muted-foreground">连续学习</span>
          </div>
          <p className="text-2xl font-bold">{streak}</p>
          <p className="text-xs text-muted-foreground">天</p>
        </motion.div>
      </div>

      {/* Continue learning */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-6 rounded-xl border bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">继续学习</h2>
              <p className="text-sm text-muted-foreground">
                你已完成 {completedCount} 道题，还有进步空间，继续练习吧！
              </p>
            </div>
          </div>
          <Link
            href="/practice"
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            继续学习
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 最近练习 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl border bg-card p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-semibold">最近练习</h3>
          </div>

          {recentRecords.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              暂无练习记录，开始你的第一道题吧！
            </p>
          ) : (
            <div className="space-y-3">
              {recentRecords.map((record, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    {record.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-red-500" />
                    )}
                    <span className="text-sm">{record.exerciseId}</span>
                  </div>
                  <span
                    className={cn(
                      'text-xs font-medium',
                      record.isCorrect
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    )}
                  >
                    {record.isCorrect ? '正确' : '错误'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* 收藏的构式 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-xl border bg-card p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-4 h-4 text-rose-500" />
            <h3 className="text-sm font-semibold">收藏的构式</h3>
          </div>

          {favorites.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              暂无收藏的构式
            </p>
          ) : (
            <div className="space-y-3">
              {favorites.map((fav) => (
                <Link
                  key={fav.id}
                  href={`/constructions/${fav.slug}`}
                  className="block p-3 rounded-lg bg-muted/50 hover:bg-accent transition-colors"
                >
                  <p className="text-sm font-medium">{fav.name}</p>
                  <p className="text-xs font-mono text-muted-foreground mt-1">
                    {fav.form}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {fav.meaning}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* 练习历史 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="rounded-xl border bg-card p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <History className="w-4 h-4 text-violet-500" />
          <h3 className="text-sm font-semibold">练习历史</h3>
        </div>

        {records.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            暂无历史记录
          </p>
        ) : (
          <div className="space-y-2">
            {records.slice().reverse().map((record, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-6">
                    {records.length - i}
                  </span>
                  {record.isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-red-500" />
                  )}
                  <span className="text-sm">{record.exerciseId}</span>
                </div>
                <span
                  className={cn(
                    'text-xs font-medium px-2 py-0.5 rounded-full',
                    record.isCorrect
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  )}
                >
                  {record.isCorrect ? '正确' : '错误'}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* 学习进度 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="rounded-xl border bg-card p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          <h3 className="text-sm font-semibold">学习进度</h3>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-muted-foreground">总体进度</span>
              <span className="text-sm font-medium">{Math.min(completedCount, 30)} / 30</span>
            </div>
            <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${Math.min((completedCount / 30) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-muted-foreground">正确率趋势</span>
              <span className="text-sm font-medium">{accuracy}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500 transition-all"
                style={{ width: `${accuracy}%` }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
