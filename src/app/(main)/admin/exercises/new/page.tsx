'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Question {
  id: string
  prompt: string
  sentence?: string
  options: string[]
  correctAnswer: string
}

export default function NewExercise() {
  const router = useRouter()
  const { isAdmin, isLoading } = useAuth()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 1,
    category: '',
    isPublished: false,
  })
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: '1',
      prompt: '',
      sentence: '',
      options: ['', '', '', ''],
      correctAnswer: '',
    },
  ])

  if (!isLoading && !isAdmin) {
    router.push('/')
    return null
  }

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now().toString(),
        prompt: '',
        sentence: '',
        options: ['', '', '', ''],
        correctAnswer: '',
      },
    ])
  }

  const removeQuestion = (id: string) => {
    if (questions.length <= 1) {
      alert('至少需要保留一道题目')
      return
    }
    setQuestions(questions.filter((q) => q.id !== id))
  }

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    )
  }

  const updateOption = (questionId: string, index: number, value: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          const newOptions = [...q.options]
          newOptions[index] = value
          return { ...q, options: newOptions }
        }
        return q
      })
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch('/api/admin/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          questions,
          answers: questions.map((q) => ({
            correctAnswer: q.correctAnswer,
            explanation: '',
          })),
        }),
      })

      if (res.ok) {
        router.push('/admin/exercises')
      } else {
        const error = await res.json()
        alert(error.error || '创建失败')
      }
    } catch (error) {
      console.error('Failed to create exercise:', error)
      alert('创建失败')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[--lake-blue]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6" style={{ background: 'var(--bg-color)' }}>
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Button variant="ghost" onClick={() => router.push('/admin/exercises')} className="mb-4 -ml-4 text-[--soft-gray]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回题目列表
          </Button>
          <h1 className="text-2xl font-bold text-[--deep-slate]">新建练习题</h1>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 基本信息 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 border border-[--glass-border]"
          >
            <h2 className="text-lg font-semibold mb-4">基本信息</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>题目名称 *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="输入题目名称"
                />
              </div>
              <div className="md:col-span-2">
                <Label>描述</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="输入题目描述"
                />
              </div>
              <div>
                <Label>分类 *</Label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  placeholder="如：ditransitive"
                />
              </div>
              <div>
                <Label>难度</Label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: parseInt(e.target.value) })}
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
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="rounded"
                  />
                  <span>立即发布</span>
                </label>
              </div>
            </div>
          </motion.div>

          {/* 题目内容 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">题目内容</h2>
              <Button type="button" variant="outline" onClick={addQuestion} className="text-sm">
                <Plus className="w-4 h-4 mr-1" />
                添加题目
              </Button>
            </div>

            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={question.id} className="bg-white rounded-2xl p-6 border border-[--glass-border]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">题目 {index + 1}</h3>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuestion(question.id)}
                      className="text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>问题 *</Label>
                      <Input
                        value={question.prompt}
                        onChange={(e) => updateQuestion(question.id, 'prompt', e.target.value)}
                        required
                        placeholder="输入问题"
                      />
                    </div>
                    <div>
                      <Label>例句</Label>
                      <Input
                        value={question.sentence}
                        onChange={(e) => updateQuestion(question.id, 'sentence', e.target.value)}
                        placeholder="输入例句（可选）"
                      />
                    </div>
                    <div>
                      <Label>选项 *</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {question.options.map((option, optIndex) => (
                          <Input
                            key={optIndex}
                            value={option}
                            onChange={(e) => updateOption(question.id, optIndex, e.target.value)}
                            required
                            placeholder={`选项 ${optIndex + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>正确答案 *</Label>
                      <Input
                        value={question.correctAnswer}
                        onChange={(e) => updateQuestion(question.id, 'correctAnswer', e.target.value)}
                        required
                        placeholder="输入正确答案"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* 提交按钮 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex gap-4"
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/exercises')}
              className="flex-1"
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="flex-1"
              style={{ background: 'var(--lake-blue)' }}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? '保存中...' : '保存题目'}
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  )
}
