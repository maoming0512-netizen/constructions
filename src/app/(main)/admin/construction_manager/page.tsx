'use client'

import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronLeft, ChevronRight, Edit2, Plus, Search, ShieldOff, Save, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Construction = {
  id: string
  code: string
  name: string
  template: string
  coreWords: string
  function: string
  usageNote: string
  example: string
  variants: string | null
  difficulty: string
  level: string
  category: string
  metadata: Record<string, unknown> | null
  metadataVersion: string
  rotationWeight: number
}

type FormState = {
  code: string
  name: string
  template: string
  coreWords: string
  function: string
  usageNote: string
  example: string
  variants: string
  difficulty: string
  level: string
  category: string
  rotationWeight: string
  metadata: string
}

const emptyForm: FormState = {
  code: '',
  name: '',
  template: '',
  coreWords: '',
  function: '',
  usageNote: '',
  example: '',
  variants: '',
  difficulty: 'Senior High',
  level: 'senior',
  category: 'manual_curated',
  rotationWeight: '1',
  metadata: JSON.stringify({
    construction_type: 'phrase',
    teaching_value: 'high',
    student_growth_value: 'high',
    use_in_generation: true,
    active_for_learning: true,
    vocabulary_only: false,
  }, null, 2),
}

function statusOf(construction: Construction) {
  const metadata = construction.metadata || {}
  if (construction.rotationWeight <= 0 || metadata.use_in_generation === false || metadata.active_for_learning === false) return 'Excluded'
  if (metadata.teaching_value === 'high') return 'Active high'
  return 'Active'
}

function formFromConstruction(construction: Construction): FormState {
  return {
    code: construction.code,
    name: construction.name,
    template: construction.template,
    coreWords: construction.coreWords,
    function: construction.function,
    usageNote: construction.usageNote,
    example: construction.example,
    variants: construction.variants || '',
    difficulty: construction.difficulty,
    level: construction.level,
    category: construction.category,
    rotationWeight: String(construction.rotationWeight),
    metadata: JSON.stringify(construction.metadata || {}, null, 2),
  }
}

export default function ConstructionManager() {
  const router = useRouter()
  const { isAuthenticated, isAdmin, isLoading } = useAuth()
  const [constructions, setConstructions] = useState<Construction[]>([])
  const [categories, setCategories] = useState<{ category: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('active')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const pageSize = 30

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total])

  useEffect(() => {
    if (!isLoading && isAuthenticated && !isAdmin) router.push('/')
  }, [isLoading, isAuthenticated, isAdmin, router])

  useEffect(() => {
    if (!isAdmin) return
    const controller = new AbortController()
    async function load() {
      setLoading(true)
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        status,
        search,
      })
      const res = await fetch(`/api/admin/constructions?${params}`, { signal: controller.signal })
      const data = await res.json()
      setConstructions(data.constructions || [])
      setCategories(data.categories || [])
      setTotal(data.total || 0)
      setLoading(false)
    }
    load().catch((error) => {
      if (error.name !== 'AbortError') setLoading(false)
    })
    return () => controller.abort()
  }, [isAdmin, page, search, status])

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  function openEdit(construction: Construction) {
    setEditingId(construction.id)
    setForm(formFromConstruction(construction))
    setShowForm(true)
  }

  async function saveConstruction(event: FormEvent) {
    event.preventDefault()
    let metadata: Record<string, unknown>
    try {
      metadata = JSON.parse(form.metadata || '{}')
    } catch {
      alert('Metadata 必须是有效 JSON')
      return
    }

    const body = {
      ...form,
      metadata,
      variants: form.variants || null,
      rotationWeight: Number(form.rotationWeight || 0),
    }
    const res = await fetch(editingId ? `/api/admin/constructions/${editingId}` : '/api/admin/constructions', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      alert(error.error || '保存失败')
      return
    }
    setShowForm(false)
    setEditingId(null)
    setPage(1)
    const params = new URLSearchParams({ page: '1', pageSize: String(pageSize), status, search })
    const data = await fetch(`/api/admin/constructions?${params}`).then((r) => r.json())
    setConstructions(data.constructions || [])
    setCategories(data.categories || [])
    setTotal(data.total || 0)
  }

  async function softExclude(construction: Construction) {
    if (!confirm(`确认将「${construction.template || construction.name}」移出主动生成池？数据会保留，不会物理删除。`)) return
    const res = await fetch(`/api/admin/constructions/${construction.id}`, { method: 'DELETE' })
    if (!res.ok) {
      alert('排除失败')
      return
    }
    setConstructions((current) => current.filter((item) => item.id !== construction.id))
    setTotal((value) => Math.max(0, value - 1))
  }

  if (isLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading construction library...</div>
  }

  if (!isAdmin) return null

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6" style={{ background: 'var(--bg-color)' }}>
      <div className="mx-auto max-w-7xl">
        <button onClick={() => router.push('/admin')} className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" />
          返回管理后台
        </button>

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-sky-700">Construction Knowledge Base</p>
            <h1 className="mt-1 text-3xl font-semibold text-slate-900">构式库管理</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              这里管理真正进入学习与生成系统的表达构式。旧词条不会直接删除，而是软排除，保留审计痕迹。
            </p>
          </div>
          <Button onClick={openCreate} className="gap-2 bg-sky-700 hover:bg-sky-800">
            <Plus className="h-4 w-4" />
            新增高质量构式
          </Button>
        </div>

        <div className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm md:grid-cols-[1fr_190px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} className="pl-9" placeholder="搜索构式、模板、功能、例句" />
          </div>
          <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1) }} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
            <option value="active">主动学习池</option>
            <option value="excluded">已排除/词汇类</option>
            <option value="all">全部</option>
          </select>
        </div>

        <div className="mb-4 flex flex-wrap gap-2 text-xs text-slate-500">
          {categories.slice(0, 10).map((item) => (
            <span key={item.category} className="rounded-full border border-slate-200 bg-white px-3 py-1">
              {item.category} · {item.count}
            </span>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">构式</th>
                  <th className="px-5 py-3">功能与用法</th>
                  <th className="px-5 py-3">层级</th>
                  <th className="px-5 py-3">状态</th>
                  <th className="px-5 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {constructions.map((construction) => (
                  <tr key={construction.id} className="align-top hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">{construction.template || construction.name}</div>
                      <div className="mt-1 text-xs text-slate-400">{construction.code} · {construction.category}</div>
                      {construction.example && <div className="mt-2 max-w-md text-xs leading-5 text-slate-500">{construction.example}</div>}
                    </td>
                    <td className="px-5 py-4">
                      <div className="max-w-md text-slate-700">{construction.function}</div>
                      <div className="mt-2 max-w-md text-xs leading-5 text-slate-500">{construction.usageNote}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      <div>{construction.level}</div>
                      <div className="text-xs">{construction.difficulty}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">{statusOf(construction)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(construction)} className="rounded-lg p-2 text-sky-700 hover:bg-sky-50" title="编辑">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => softExclude(construction)} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50" title="移出生成池">
                          <ShieldOff className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {constructions.length === 0 && <div className="p-10 text-center text-sm text-slate-500">没有找到匹配的构式。</div>}
        </div>

        <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
          <span>共 {total} 条 · 第 {page} / {totalPages} 页</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <form onSubmit={saveConstruction} className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">{editingId ? '编辑构式' : '新增构式'}</h2>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {(['code', 'name', 'template', 'coreWords', 'difficulty', 'level', 'category', 'rotationWeight'] as const).map((key) => (
                <label key={key} className="text-sm font-medium text-slate-700">
                  {key}
                  <Input value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} className="mt-1" required={['name', 'template'].includes(key)} />
                </label>
              ))}
            </div>

            <label className="mt-4 block text-sm font-medium text-slate-700">
              Chinese meaning / communicative function
              <textarea value={form.function} onChange={(event) => setForm({ ...form, function: event.target.value })} rows={2} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
            </label>
            <label className="mt-4 block text-sm font-medium text-slate-700">
              Usage note
              <textarea value={form.usageNote} onChange={(event) => setForm({ ...form, usageNote: event.target.value })} rows={3} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
            </label>
            <label className="mt-4 block text-sm font-medium text-slate-700">
              Example sentence
              <textarea value={form.example} onChange={(event) => setForm({ ...form, example: event.target.value })} rows={3} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
            </label>
            <label className="mt-4 block text-sm font-medium text-slate-700">
              Variants
              <Input value={form.variants} onChange={(event) => setForm({ ...form, variants: event.target.value })} className="mt-1" />
            </label>
            <label className="mt-4 block text-sm font-medium text-slate-700">
              Metadata JSON
              <textarea value={form.metadata} onChange={(event) => setForm({ ...form, metadata: event.target.value })} rows={10} className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs" />
            </label>

            <div className="mt-6 flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowForm(false)}>取消</Button>
              <Button type="submit" className="flex-1 gap-2 bg-sky-700 hover:bg-sky-800">
                <Save className="h-4 w-4" />
                保存
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
