import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const level = url.searchParams.get('level')
    const type = url.searchParams.get('type')
    const topicId = url.searchParams.get('topicId')
    const goalId = url.searchParams.get('goalId')
    const qualityStatus = url.searchParams.get('qualityStatus') || 'approved'
    const limit = parseInt(url.searchParams.get('limit') || '210')
    const page = parseInt(url.searchParams.get('page') || '1')
    const search = url.searchParams.get('search')

    const where: any = {
      isPublished: true,
      isPublic: true,
      source: 'official',
      AND: [
        {
          OR: [
            { publishStatus: 'published' },
            { publishStatus: 'approved' },
          ],
        },
      ],
    }
    if (level) where.level = level
    if (type) where.type = type
    if (topicId) where.topicId = topicId
    if (goalId) where.goalId = goalId
    if (qualityStatus) where.qualityStatus = qualityStatus
    if (search) {
      where.AND.push({
        OR: [
          { theme: { contains: search, mode: 'insensitive' } },
          { context: { contains: search, mode: 'insensitive' } },
          { task: { contains: search, mode: 'insensitive' } },
        ],
      })
    }

    const [exercises, total, levels, types] = await Promise.all([
      prisma.exercise.findMany({
        where,
        orderBy: [{ pedagogicalFitScore: 'desc' }, { exerciseId: 'asc' }],
        take: limit,
        skip: (page - 1) * limit,
        include: {
          topic: { select: { id: true, label: true, category: true, description: true } },
          goal: { select: { id: true, label: true, description: true, communicativePurpose: true } },
        },
      }),
      prisma.exercise.count({ where }),
      prisma.exercise.groupBy({ by: ['level'], where, _count: true, orderBy: { level: 'asc' } }),
      prisma.exercise.groupBy({ by: ['type'], where, _count: true, orderBy: { type: 'asc' } }),
    ])

    return NextResponse.json({
      exercises,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      filters: {
        levels: levels.map(l => ({ value: l.level, count: l._count })),
        types: types.map(t => ({ value: t.type, count: t._count })),
      },
    })
  } catch (error) {
    console.error('Failed to fetch exercises:', error)
    return NextResponse.json({ error: 'Failed to fetch exercises' }, { status: 500 })
  }
}
