import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const PAGE_SIZE_MAX = 100
const STUDIO_CATEGORY = 'recommended'

const select = {
  id: true,
  code: true,
  name: true,
  template: true,
  function: true,
  usageNote: true,
  example: true,
  difficulty: true,
  level: true,
  category: true,
  metadata: true,
  rotationWeight: true,
  usageCount: true,
}

function metadataArray(metadata: any, key: string): string[] {
  const value = metadata?.[key]
  return Array.isArray(value) ? value.filter(Boolean) : []
}

function isActiveConstruction(row: any) {
  const metadata = row.metadata || {}
  if (row.rotationWeight <= 0) return false
  if (metadata.use_in_generation === false) return false
  if (metadata.active_for_learning === false) return false
  if (metadata.vocabulary_only === true) return false
  if (metadata.construction_type === 'vocabulary_only') return false
  if (metadata.teaching_value === 'low' || metadata.student_growth_value === 'low') return false
  if (metadata.exclusion_reason) return false
  return true
}

function toPublicConstruction(row: any) {
  const metadata = row.metadata || {}
  const construction = row.template || row.name
  return {
    id: row.id,
    code: row.code,
    construction,
    meaning_zh: row.function,
    communicative_function: metadataArray(metadata, 'communicative_function').concat(metadataArray(metadata, 'expression_function')).slice(0, 3),
    usage_note: row.usageNote,
    example_sentence: row.example,
    school_level: metadata.school_level || row.level,
    fine_level: metadata.fine_level || row.difficulty,
    construction_type: metadata.construction_type || row.category,
    topic_tags: metadataArray(metadata, 'scene_type').concat(metadataArray(metadata, 'narrative_function')).slice(0, 4),
    emotional_tags: metadataArray(metadata, 'emotional_function').slice(0, 3),
    category: row.category,
  }
}

function dayKey() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

function hashText(text: string) {
  let hash = 2166136261
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function dailyRank(row: any, dateKey: string) {
  const metadata = row.metadata || {}
  const priority = metadata.curated_priority === 'core_high_value' ? 0 : 1
  const weightBoost = Math.round((row.rotationWeight || 1) * -100)
  return `${priority}:${weightBoost}:${hashText(`${dateKey}:${row.code}:${row.id}`)}`
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const mode = url.searchParams.get('mode') || 'list'
    const page = Math.max(1, Number(url.searchParams.get('page') || '1'))
    const pageSize = Math.min(PAGE_SIZE_MAX, Math.max(6, Number(url.searchParams.get('pageSize') || '12')))
    const category = url.searchParams.get('category') || ''
    const search = (url.searchParams.get('search') || '').trim()
    const level = url.searchParams.get('level') || ''
    const all = url.searchParams.get('all') === 'true'
    const today = dayKey()

    if (mode === 'categories') {
      const count = await prisma.construction.count({
        where: {
          rotationWeight: { gt: 0 },
          ...(all ? {} : { category: { startsWith: 'curated_' } }),
          NOT: [
            { metadata: { path: ['use_in_generation'], equals: false } as any },
            { metadata: { path: ['active_for_learning'], equals: false } as any },
            { metadata: { path: ['vocabulary_only'], equals: true } as any },
          ],
        },
      })

      return NextResponse.json({
        dayKey: today,
        refresh: 'Asia/Shanghai midnight',
        categories: [{ id: STUDIO_CATEGORY, label: 'Recommended Today', count }],
      })
    }

    const where: any = {
      rotationWeight: { gt: 0 },
      ...(all ? {} : { category: { startsWith: 'curated_' } }),
      ...(level ? { level } : {}),
      ...(search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { template: { contains: search, mode: 'insensitive' } },
          { function: { contains: search, mode: 'insensitive' } },
          { usageNote: { contains: search, mode: 'insensitive' } },
          { example: { contains: search, mode: 'insensitive' } },
        ],
      } : {}),
    }

    const rawRows = await prisma.construction.findMany({
      where,
      select,
      take: 500,
      orderBy: [{ rotationWeight: 'desc' }, { code: 'asc' }],
    })

    const filtered = rawRows
      .filter(all ? (row: any) => {
        const metadata = row.metadata || {}
        if (metadata.use_in_generation === false) return false
        if (metadata.vocabulary_only === true) return false
        if (metadata.construction_type === 'vocabulary_only') return false
        return true
      } : isActiveConstruction)
      .filter((row) => {
        if (!category || category === STUDIO_CATEGORY) return true
        const metadata = row.metadata as any
        return [
          row.category,
          metadata?.construction_type,
          ...metadataArray(metadata, 'communicative_function'),
          ...metadataArray(metadata, 'expression_function'),
          ...metadataArray(metadata, 'narrative_function'),
        ].includes(category)
      })
      .sort((a, b) => dailyRank(a, today).localeCompare(dailyRank(b, today)))

    const start = (page - 1) * pageSize
    const pageRows = filtered.slice(start, start + pageSize)

    return NextResponse.json({
      constructions: pageRows.map(toPublicConstruction),
      page,
      pageSize,
      hasMore: start + pageSize < filtered.length,
      total: filtered.length,
      dayKey: today,
      refresh: 'Asia/Shanghai midnight',
    })
  } catch (error) {
    console.error('Construction studio list error:', error)
    return NextResponse.json({ error: 'Failed to load constructions' }, { status: 500 })
  }
}
