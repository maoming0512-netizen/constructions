'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { User, Mail, Calendar, Award, Settings, ChevronRight, Leaf } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(user?.name || '')
  const [saving, setSaving] = useState(false)

  // 如果未登录，重定向到登录页
  if (!isLoading && !isAuthenticated) {
    router.push('/auth/login')
    return null
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (response.ok) {
        setIsEditing(false)
        // 刷新页面以获取最新数据
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const getUserInitial = () => {
    if (user?.name) return user.name.charAt(0).toUpperCase()
    if (user?.email) return user.email.charAt(0).toUpperCase()
    return 'U'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[--lake-blue]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6" style={{ background: 'var(--bg-color)' }}>
      <div className="max-w-4xl mx-auto">
        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-[--deep-slate]">个人资料</h1>
          <p className="text-[--soft-gray] mt-2">管理您的账户信息和学习进度</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 左侧：用户信息卡片 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="md:col-span-1"
          >
            <div
              className="rounded-2xl p-6"
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--glass-border)',
              }}
            >
              {/* 头像 */}
              <div className="flex flex-col items-center">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-4"
                  style={{ background: 'var(--lake-blue)' }}
                >
                  {getUserInitial()}
                </div>
                
                {isEditing ? (
                  <div className="w-full space-y-3">
                    <Label htmlFor="name">昵称</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="输入您的昵称"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1"
                        style={{ background: 'var(--lake-blue)' }}
                      >
                        {saving ? '保存中...' : '保存'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false)
                          setName(user?.name || '')
                        }}
                        className="flex-1"
                      >
                        取消
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-semibold text-[--deep-slate]">
                      {user?.name || '未设置昵称'}
                    </h2>
                    <p className="text-sm text-[--soft-gray] mt-1">{user?.email}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="mt-4"
                    >
                      编辑资料
                    </Button>
                  </>
                )}
              </div>

              {/* 用户统计 */}
              <div className="mt-6 pt-6 border-t border-[--glass-border]">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-[--lake-blue]">0</div>
                    <div className="text-xs text-[--soft-gray]">完成练习</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[--lake-green]">0</div>
                    <div className="text-xs text-[--soft-gray]">掌握构式</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 快速链接 */}
            <div
              className="rounded-2xl p-4 mt-4"
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--glass-border)',
              }}
            >
              <Link
                href="/profile/settings"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-[--mist-gray] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-[--soft-gray]" />
                  <span className="text-[--deep-slate]">账户设置</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[--soft-gray]" />
              </Link>
            </div>
          </motion.div>

          {/* 右侧：详细信息 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="md:col-span-2 space-y-6"
          >
            {/* 基本信息 */}
            <div
              className="rounded-2xl p-6"
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--glass-border)',
              }}
            >
              <h3 className="text-lg font-semibold text-[--deep-slate] mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-[--lake-blue]" />
                基本信息
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-[--glass-border]">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-[--soft-gray]" />
                    <span className="text-[--soft-gray]">邮箱</span>
                  </div>
                  <span className="text-[--deep-slate]">{user?.email}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-[--glass-border]">
                  <div className="flex items-center gap-3">
                    <Award className="w-4 h-4 text-[--soft-gray]" />
                    <span className="text-[--soft-gray]">角色</span>
                  </div>
                  <span className="text-[--deep-slate]">
                    {user?.role === 'admin' ? '管理员' : '学习者'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-[--soft-gray]" />
                    <span className="text-[--soft-gray]">注册时间</span>
                  </div>
                  <span className="text-[--deep-slate]">刚刚</span>
                </div>
              </div>
            </div>

            {/* 学习进度 */}
            <div
              className="rounded-2xl p-6"
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--glass-border)',
              }}
            >
              <h3 className="text-lg font-semibold text-[--deep-slate] mb-4 flex items-center gap-2">
                <Leaf className="w-5 h-5 text-[--lake-green]" />
                学习进度
              </h3>
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🌱</div>
                <p className="text-[--soft-gray]">开始学习构式语法，记录您的进步！</p>
                <Link href="/constructions">
                  <Button
                    className="mt-4"
                    style={{ background: 'var(--lake-blue)' }}
                  >
                    开始学习
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
