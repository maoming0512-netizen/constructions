import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try { const session = await auth()
    if (!session?.user || (session.user as any).role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const url = new URL(req.url)
    const page = Math.max(1, Number(url.searchParams.get('page') || '1'))
    const pageSize = Math.min(100, Math.max(10, Number(url.searchParams.get('pageSize') || '30')))
    const search = (url.searchParams.get('search') || '').trim()
    const status = url.searchParams.get('status') || 'all'

    const searchFilter = search ? {
      OR: [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { template: { contains: search, mode: 'insensitive' } },
        { function: { contains: search, mode: 'insensitive' } },
        { usageNote: { contains: search, mode: 'insensitive' } },
        { example: { contains: search, mode: 'insensitive' } },
      ],
    } : {}

    const where: any = { ...searchFilter }

    if (status === 'active') where.rotationWeight = { gt: 0 }
    if (status === 'excluded') {
      where.AND = [
        searchFilter,
        {
          OR: [
            { rotationWeight: { lte: 0 } },
            { metadata: { path: ['use_in_generation'], equals: false } as any },
            { metadata: { path: ['vocabulary_only'], equals: true } as any },
          ],
        },
      ]
      delete where.OR
    }

    const [constructions, total, categories] = await Promise.all([
      prisma.construction.findMany({
        where,
        orderBy: [{ updatedAt: 'desc' }, { code: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.construction.count({ where }),
      prisma.construction.groupBy({ by: ['category'], _count: true, orderBy: { _count: { category: 'desc' } }, take: 80 }),
    ])
    return NextResponse.json({ constructions, total, page, pageSize, categories: categories.map((item) => ({ category: item.category, count: item._count })) })
  } catch (error) { return NextResponse.json({ error: 'Internal error' }, { status: 500 }) }
}
export async function POST(req: NextRequest) {
  try { const session = await auth()
    if (!session?.user || (session.user as any).role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    const c = await prisma.construction.create({
      data: {
        code: body.code || `MANUAL-${Date.now()}`,
        name: body.name || body.template,
        template: body.template || body.name,
        coreWords: body.coreWords || body.template || body.name,
        function: body.function || '',
        usageNote: body.usageNote || '',
        example: body.example || '',
        variants: body.variants || null,
        difficulty: body.difficulty || '高中',
        level: body.level || 'senior',
        category: body.category || 'manual_curated',
        metadata: body.metadata || {
          construction_type: body.constructionType || 'phrase',
          teaching_value: 'high',
          student_growth_value: 'high',
          use_in_generation: true,
          active_for_learning: true,
          vocabulary_only: false,
        },
        metadataVersion: body.metadataVersion || 'manual-admin',
        rotationWeight: Number(body.rotationWeight ?? 1),
      },
    })
    return NextResponse.json({ construction: c })
  } catch (error: any) { return NextResponse.json({ error: error.code === 'P2002' ? 'Code exists' : 'Internal error' }, { status: 400 }) }
}
