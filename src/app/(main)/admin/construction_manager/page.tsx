'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Award,
  ChevronLeft,
  Save,
  X,
  BookOpen,
  Filter,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Construction {
  id: string
  name: string
  slug: string
  category: string
  difficulty: number
  formPattern: string
  coreMeaning: string
  discourseFunction: string | null
  explanationZh: string | null
  explanationEn: string | null
  semanticAnchors: string
  commonVerbs: string
  tags: string
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

const categoryOptions = [
  'Argument Structure',
  'Motion',
  'Resultative',
  'Question',
  'Information Structure',
  'Transfer',
  'Advanced',
  'Idiomatic',
]

export default function ConstructionManager() {
  const router = useRouter()
  const { isAuthenticated, isAdmin, isLoading } = useAuth()
  const [constructions, setConstructions] = useState<Construction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category: '',
    difficulty: 1,
    formPattern: '',
    coreMeaning: '',
    discourseFunction: '',
    explanationZh: '',
    explanationEn: '',
    semanticAnchors: '',
    commonVerbs: '',
    tags: '',
    isPublished: true,
  })

  useEffect(() => {
    if (!isLoading && isAuthenticated && !isAdmin) {
      router.push('/')
    }
  }, [isLoading, isAuthenticated, isAdmin, router])

  useEffect(() => {
    if (isAdmin) {
      fetchConstructions()
    }
  }, [isAdmin])

  const fetchConstructions = async () => {
    try {
      const res = await fetch('/api/admin/constructions')
      const data = await res.json()
      if (data.constructions) {
        setConstructions(data.constructions)
      }
    } catch (error) {
      console.error('Failed to fetch constructions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingId 
        ? `/api/admin/constructions/${editingId}` 
        : '/api/admin/constructions'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setShowForm(false)
        setEditingId(null)
        resetForm()
        fetchConstructions()
      } else {
        const error = await res.json()
        alert(error.error || '操作失败')
      }
    } catch (error) {
      console.error('Failed to save construction:', error)
      alert('保存失败')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个构式吗？')) return

    try {
      const res = await fetch(`/api/admin/constructions/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchConstructions()
      } else {
        alert('删除失败')
      }
    } catch (error) {
      console.error('Failed to delete construction:', error)
      alert('删除失败')
    }
  }

  const handleEdit = (construction: Construction) => {
    setEditingId(construction.id)
    setFormData({
      name: construction.name,
      slug: construction.slug,
      category: construction.category,
      difficulty: construction.difficulty,
      formPattern: construction.formPattern,
      coreMeaning: construction.coreMeaning,
      discourseFunction: construction.discourseFunction || '',
      explanationZh: construction.explanationZh || '',
      explanationEn: construction.explanationEn || '',
      semanticAnchors: construction.semanticAnchors,
      commonVerbs: construction.commonVerbs,
      tags: construction.tags,
      isPublished: construction.isPublished,
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      category: '',
      difficulty: 1,
      formPattern: '',
      coreMeaning: '',
      discourseFunction: '',
      explanationZh: '',
      explanationEn: '',
      semanticAnchors: '',
      commonVerbs: '',
      tags: '',
      isPublished: true,
    })
  }

  const filteredConstructions = constructions.filter((c) => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.coreMeaning.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory ? c.category === selectedCategory : true
    return matchesSearch && matchesCategory
  })

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
        {/* 头部 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push('/admin')}
              className="flex items-center gap-2 text-[--soft-gray] hover:text-[--deep-slate] transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              返回管理后台
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--lake-blue)' }}
              >
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[--deep-slate]">构式条目管理</h1>
                <p className="text-sm text-[--soft-gray]">管理语法构式条目，共 {constructions.length} 个</p>
              </div>
            </div>
            <Button
              onClick={() => {
                resetForm()
                setEditingId(null)
                setShowForm(true)
              }}
              className="flex items-center gap-2"
              style={{ background: 'var(--lake-blue)' }}
            >
              <Plus className="w-4 h-4" />
              新增构式
            </Button>
          </div>
        </motion.div>

        {/* 搜索和筛选 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--soft-gray]" />
            <Input
              placeholder="搜索构式名称、slug 或核心语义..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[--soft-gray]" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 rounded-lg border border-[--glass-border] bg-white text-sm"
            >
              <option value="">所有分类</option>
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* 构式列表 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-[--glass-border] overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[--mist-gray]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[--soft-gray]">构式名称</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[--soft-gray]">分类</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[--soft-gray]">难度</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[--soft-gray]">形式模板</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[--soft-gray]">状态</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-[--soft-gray]">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[--glass-border]">
                {filteredConstructions.map((construction) => (
                  <tr key={construction.id} className="hover:bg-[--mist-gray] transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-[--deep-slate]">{construction.name}</p>
                        <p className="text-xs text-[--soft-gray]">{construction.slug}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-xs bg-[--lake-blue] text-white">
                        {construction.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        {[1, 2, 3].map((level) => (
                          <div
                            key={level}
                            className={`w-2 h-2 rounded-full ${
                              level <= construction.difficulty
                                ? 'bg-[--lake-blue]'
                                : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {construction.formPattern}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          construction.isPublished
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {construction.isPublished ? '已发布' : '草稿'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(construction)}
                          className="p-2 rounded-lg hover:bg-[--mist-gray] text-[--lake-blue] transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(construction.id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredConstructions.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 mx-auto text-[--soft-gray] mb-4" />
              <p className="text-[--soft-gray]">没有找到匹配的构式</p>
            </div>
          )}
        </motion.div>

        {/* 表单弹窗 */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowForm(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-[--glass-border] flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[--deep-slate]">
                    {editingId ? '编辑构式' : '新增构式'}
                  </h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="p-2 rounded-lg hover:bg-[--mist-gray] transition-colors"
                  >
                    <X className="w-5 h-5 text-[--soft-gray]" />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[--deep-slate] mb-1">
                        构式名称 *
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[--deep-slate] mb-1">
                        Slug *
                      </label>
                      <Input
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        required
                        placeholder="ditransitive"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[--deep-slate] mb-1">
                        分类 *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-[--glass-border]"
                        required
                      >
                        <option value="">选择分类</option>
                        {categoryOptions.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[--deep-slate] mb-1">
                        难度 *
                      </label>
                      <select
                        value={formData.difficulty}
                        onChange={(e) => setFormData({ ...formData, difficulty: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg border border-[--glass-border]"
                        required
                      >
                        <option value={1}>初级</option>
                        <option value={2}>中级</option>
                        <option value={3}>高级</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[--deep-slate] mb-1">
                      形式模板 *
                    </label>
                    <Input
                      value={formData.formPattern}
                      onChange={(e) => setFormData({ ...formData, formPattern: e.target.value })}
                      placeholder="如：Subj V Obj1 Obj2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[--deep-slate] mb-1">
                      核心语义 *
                    </label>
                    <Input
                      value={formData.coreMeaning}
                      onChange={(e) => setFormData({ ...formData, coreMeaning: e.target.value })}
                      placeholder="如：Agent causes Recipient to receive Theme"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[--deep-slate] mb-1">
                      话语功能
                    </label>
                    <Input
                      value={formData.discourseFunction}
                      onChange={(e) => setFormData({ ...formData, discourseFunction: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[--deep-slate] mb-1">
                      中文解释
                    </label>
                    <textarea
                      value={formData.explanationZh}
                      onChange={(e) => setFormData({ ...formData, explanationZh: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-[--glass-border]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[--deep-slate] mb-1">
                      英文解释
                    </label>
                    <textarea
                      value={formData.explanationEn}
                      onChange={(e) => setFormData({ ...formData, explanationEn: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-[--glass-border]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[--deep-slate] mb-1">
                      语义锚点
                    </label>
                    <Input
                      value={formData.semanticAnchors}
                      onChange={(e) => setFormData({ ...formData, semanticAnchors: e.target.value })}
                      placeholder="用逗号分隔"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[--deep-slate] mb-1">
                      常用动词
                    </label>
                    <Input
                      value={formData.commonVerbs}
                      onChange={(e) => setFormData({ ...formData, commonVerbs: e.target.value })}
                      placeholder="用逗号分隔"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[--deep-slate] mb-1">
                      标签
                    </label>
                    <Input
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="用逗号分隔"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isPublished"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                      className="rounded"
                    />
                    <label htmlFor="isPublished" className="text-sm text-[--deep-slate]">
                      发布
                    </label>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                      className="flex-1"
                    >
                      取消
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      style={{ background: 'var(--lake-blue)' }}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      保存
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
