'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Users,
  Search,
  Shield,
  User,
  ArrowLeft,
  Trash2,
  Edit,
  Mail,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface UserData {
  id: string
  email: string
  name: string | null
  role: string
  createdAt: string
}

export default function UsersManagement() {
  const router = useRouter()
  const { isAdmin, isLoading, user: currentUser } = useAuth()
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingUser, setEditingUser] = useState<UserData | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'user',
  })

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/')
    }
  }, [isLoading, isAdmin, router])

  useEffect(() => {
    if (isAdmin) {
      fetchUsers()
    }
  }, [isAdmin])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user: UserData) => {
    setEditingUser(user)
    setEditForm({
      name: user.name || '',
      email: user.email,
      role: user.role,
    })
    setShowEditDialog(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })

      if (res.ok) {
        setShowEditDialog(false)
        fetchUsers()
      } else {
        const error = await res.json()
        alert(error.error || '更新失败')
      }
    } catch (error) {
      console.error('Failed to update user:', error)
      alert('更新失败')
    }
  }

  const handleDelete = async (userId: string) => {
    if (userId === currentUser?.id) {
      alert('不能删除自己')
      return
    }

    if (!confirm('确定要删除这个用户吗？此操作不可恢复。')) return

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchUsers()
      } else {
        const error = await res.json()
        alert(error.error || '删除失败')
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
      alert('删除失败')
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase()))
  )

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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--lake-blue)' }}
              >
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[--deep-slate]">用户管理</h1>
                <p className="text-sm text-[--soft-gray]">共 {users.length} 位注册用户</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 搜索栏 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--soft-gray]" />
            <Input
              placeholder="搜索用户邮箱或名称..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </motion.div>

        {/* 用户列表 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--glass-border)',
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[--glass-border]">
                  <th className="text-left p-4 text-sm font-medium text-[--soft-gray]">用户</th>
                  <th className="text-left p-4 text-sm font-medium text-[--soft-gray]">角色</th>
                  <th className="text-left p-4 text-sm font-medium text-[--soft-gray]">注册时间</th>
                  <th className="text-right p-4 text-sm font-medium text-[--soft-gray]">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-[--glass-border] last:border-0 hover:bg-[--mist-gray]/30"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[--lake-blue]/20 flex items-center justify-center">
                          <User className="w-4 h-4 text-[--lake-blue]" />
                        </div>
                        <div>
                          <p className="font-medium text-[--deep-slate]">
                            {user.name || '未设置名称'}
                          </p>
                          <p className="text-sm text-[--soft-gray]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {user.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700">
                          <Shield className="w-3 h-3" />
                          管理员
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                          <User className="w-3 h-3" />
                          普通用户
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-[--soft-gray]">
                      {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500"
                          onClick={() => handleDelete(user.id)}
                          disabled={user.id === currentUser?.id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredUsers.length === 0 && (
            <div className="p-8 text-center text-[--soft-gray]">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>没有找到匹配的用户</p>
            </div>
          )}
        </motion.div>

        {/* 编辑对话框 */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>编辑用户</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">名称</label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="用户名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">邮箱 *</label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">角色</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[--glass-border]"
                  disabled={editingUser?.id === currentUser?.id}
                >
                  <option value="user">普通用户</option>
                  <option value="admin">管理员</option>
                </select>
                {editingUser?.id === currentUser?.id && (
                  <p className="text-xs text-[--soft-gray] mt-1">不能修改自己的角色</p>
                )}
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowEditDialog(false)}
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  style={{ background: 'var(--lake-blue)' }}
                >
                  保存修改
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
