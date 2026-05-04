'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Plus,
  Search,
  ArrowLeft,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
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

interface Exercise {
  id: string
  title: string
  description: string | null
  difficulty: number
  category: string
  isPublished: boolean
  createdAt: string
  questions?: string
  answers?: string
}

interface Question {
  id: string
  prompt: string
  sentence?: string
  options: string[]
  correctAnswer: string
}

export default function ExercisesManagement() {
  const router = useRouter()
  const { isAdmin, isLoading } = useAuth()
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    difficulty: 1,
    category: '',
    isPublished: false,
    questions: [] as Question[],
  })

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/')
    }
  }, [isLoading, isAdmin, router])

  useEffect(() => {
    if (isAdmin) {
      fetchExercises()
    }
  }, [isAdmin])

  const fetchExercises = async () => {
    try {
      const res = await fetch('/api/admin/exercises')
      if (res.ok) {
        const data = await res.json()
        setExercises(data.exercises || [])
      }
    } catch (error) {
      console.error('Failed to fetch exercises:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这道题目吗？此操作不可恢复。')) return

    try {
      const res = await fetch(`/api/admin/exercises/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchExercises()
      } else {
        alert('删除失败')
      }
    } catch (error) {
      console.error('Failed to delete exercise:', error)
      alert('删除失败')
    }
  }

  const handleEdit = async (exercise: Exercise) => {
    try {
      const res = await fetch(`/api/admin/exercises/${exercise.id}`)
      if (res.ok) {
        const data = await res.json()
        const fullExercise = data.exercise
        
        let questions: Question[] = []
        try {
          questions = JSON.parse(fullExercise.questions || '[]')
        } catch (e) {
          questions = []
        }

        setEditingExercise(fullExercise)
        setEditForm({
          title: fullExercise.title,
          description: fullExercise.description || '',
          difficulty: fullExercise.difficulty,
          category: fullExercise.category,
          isPublished: fullExercise.isPublished,
          questions: questions.length > 0 ? questions : [{
            id: '1',
            prompt: '',
            sentence: '',
            options: ['', '', '', ''],
            correctAnswer: '',
          }],
        })
        setShowEditDialog(true)
      }
    } catch (error) {
      console.error('Failed to fetch exercise details:', error)
      alert('获取题目详情失败')
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingExercise) return

    try {
      const res = await fetch(`/api/admin/exercises/${editingExercise.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description,
          difficulty: editForm.difficulty,
          category: editForm.category,
          questions: editForm.questions,
          answers: editForm.questions.map((q) => ({
            correctAnswer: q.correctAnswer,
            explanation: '',
          })),
          isPublished: editForm.isPublished,
        }),
      })

      if (res.ok) {
        setShowEditDialog(false)
        fetchExercises()
      } else {
        alert('更新失败')
      }
    } catch (error) {
      console.error('Failed to update exercise:', error)
      alert('更新失败')
    }
  }

  const addQuestion = () => {
    setEditForm({
      ...editForm,
      questions: [
        ...editForm.questions,
        {
          id: Date.now().toString(),
          prompt: '',
          sentence: '',
          options: ['', '', '', ''],
          correctAnswer: '',
        },
      ],
    })
  }

  const removeQuestion = (index: number) => {
    if (editForm.questions.length <= 1) {
      alert('至少需要保留一道题目')
      return
    }
    const newQuestions = [...editForm.questions]
    newQuestions.splice(index, 1)
    setEditForm({ ...editForm, questions: newQuestions })
  }

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const newQuestions = [...editForm.questions]
    newQuestions[index] = { ...newQuestions[index], [field]: value }
    setEditForm({ ...editForm, questions: newQuestions })
  }

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...editForm.questions]
    const newOptions = [...newQuestions[questionIndex].options]
    newOptions[optionIndex] = value
    newQuestions[questionIndex] = { ...newQuestions[questionIndex], options: newOptions }
    setEditForm({ ...editForm, questions: newQuestions })
  }

  const filteredExercises = exercises.filter(
    (e) =>
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getDifficultyLabel = (level: number) => {
    const labels = ['入门', '简单', '中等', '困难', '专家']
    const colors = [
      'bg-green-100 text-green-700',
      'bg-blue-100 text-blue-700',
      'bg-yellow-100 text-yellow-700',
      'bg-orange-100 text-orange-700',
      'bg-red-100 text-red-700',
    ]
    return {
      label: labels[level - 1] || '未知',
      color: colors[level - 1] || 'bg-gray-100 text-gray-600',
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
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
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--lake-green)' }}>
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[--deep-slate]">题目管理</h1>
                <p className="text-sm text-[--soft-gray]">共 {exercises.length} 道练习题</p>
              </div>
            </div>
            <Button
              onClick={() => router.push('/admin/exercises/new')}
              className="bg-[--lake-blue] hover:bg-[--lake-blue]/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              新建题目
            </Button>
          </div>
        </motion.div>

        {/* 搜索栏 */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--soft-gray]" />
            <Input
              placeholder="搜索题目名称或分类..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </motion.div>

        {/* 题目列表 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[--glass-border]">
                  <th className="text-left p-4 text-sm font-medium text-[--soft-gray]">题目</th>
                  <th className="text-left p-4 text-sm font-medium text-[--soft-gray]">分类</th>
                  <th className="text-left p-4 text-sm font-medium text-[--soft-gray]">难度</th>
                  <th className="text-left p-4 text-sm font-medium text-[--soft-gray]">状态</th>
                  <th className="text-right p-4 text-sm font-medium text-[--soft-gray]">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredExercises.map((exercise) => {
                  const diff = getDifficultyLabel(exercise.difficulty)
                  return (
                    <tr
                      key={exercise.id}
                      className="border-b border-[--glass-border] last:border-0 hover:bg-[--mist-gray]/30"
                    >
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-[--deep-slate]">{exercise.title}</p>
                          <p className="text-sm text-[--soft-gray] truncate max-w-xs">
                            {exercise.description || '暂无描述'}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded-full text-xs bg-[--mist-gray] text-[--deep-slate]">
                          {exercise.category}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${diff.color}`}>{diff.label}</span>
                      </td>
                      <td className="p-4">
                        {exercise.isPublished ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle className="w-3 h-3" />
                            已发布
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                            <XCircle className="w-3 h-3" />
                            草稿
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(exercise)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(exercise.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {filteredExercises.length === 0 && (
            <div className="p-8 text-center text-[--soft-gray]">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>暂无题目</p>
              <p className="text-sm mt-2">点击上方按钮创建第一道练习题</p>
            </div>
          )}
        </motion.div>

        {/* 编辑对话框 */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>编辑题目</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">题目名称 *</label>
                  <Input
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">描述</label>
                  <Input
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">分类 *</label>
                  <Input
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">难度</label>
                  <select
                    value={editForm.difficulty}
                    onChange={(e) => setEditForm({ ...editForm, difficulty: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-[--glass-border]"
                  >
                    <option value={1}>入门 (1)</option>
                    <option value={2}>简单 (2)</option>
                    <option value={3}>中等 (3)</option>
                    <option value={4}>困难 (4)</option>
                    <option value={5}>专家 (5)</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editForm.isPublished}
                      onChange={(e) => setEditForm({ ...editForm, isPublished: e.target.checked })}
                      className="rounded"
                    />
                    <span>已发布</span>
                  </label>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">题目内容</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                    <Plus className="w-4 h-4 mr-1" />
                    添加题目
                  </Button>
                </div>
                <div className="space-y-4">
                  {editForm.questions.map((question, index) => (
                    <div key={question.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium">题目 {index + 1}</span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeQuestion(index)} className="text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-3">
                        <Input
                          value={question.prompt}
                          onChange={(e) => updateQuestion(index, 'prompt', e.target.value)}
                          placeholder="问题"
                          required
                        />
                        <Input
                          value={question.sentence}
                          onChange={(e) => updateQuestion(index, 'sentence', e.target.value)}
                          placeholder="例句（可选）"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          {question.options.map((option, optIndex) => (
                            <Input
                              key={optIndex}
                              value={option}
                              onChange={(e) => updateOption(index, optIndex, e.target.value)}
                              placeholder={`选项 ${optIndex + 1}`}
                              required
                            />
                          ))}
                        </div>
                        <Input
                          value={question.correctAnswer}
                          onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
                          placeholder="正确答案"
                          required
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowEditDialog(false)}>
                  取消
                </Button>
                <Button type="submit" className="flex-1" style={{ background: 'var(--lake-blue)' }}>
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
