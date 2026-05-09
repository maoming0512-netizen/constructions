import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

// POST: save a practice record
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Login required to save records' }, { status: 401 })
    }

    const body = await req.json()
    const { exerciseId, exerciseType, exerciseTheme, studentAnswer, wordCount, score, duration } = body

    if (!exerciseId || !studentAnswer) {
      return NextResponse.json({ error: 'exerciseId and studentAnswer are required' }, { status: 400 })
    }

    const record = await prisma.practiceRecord.create({
      data: {
        userId: session.user.id,
        exerciseId,
        exerciseType: exerciseType || '',
        exerciseTheme: exerciseTheme || '',
        studentAnswer,
        wordCount: wordCount || studentAnswer.split(/\s+/).filter(Boolean).length,
        score: score || null,
        duration: duration || null,
      },
    })

    return NextResponse.json({ success: true, record })
  } catch (error: any) {
    console.error('Save record error:', error)
    return NextResponse.json({ error: 'Failed to save record' }, { status: 500 })
  }
}

// GET: user's practice history
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Login required' }, { status: 401 })
    }

    const url = new URL(req.url)
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const page = parseInt(url.searchParams.get('page') || '1')

    const [records, total] = await Promise.all([
      prisma.practiceRecord.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.practiceRecord.count({ where: { userId: session.user.id } }),
    ])

    // Aggregate stats
    const stats = await prisma.practiceRecord.aggregate({
      where: { userId: session.user.id },
      _count: true,
      _avg: { wordCount: true, score: true },
      _sum: { wordCount: true },
    })

    return NextResponse.json({
      records,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      stats: {
        totalRecords: stats._count,
        avgWordCount: Math.round(stats._avg.wordCount || 0),
        avgScore: stats._avg.score ? Math.round(stats._avg.score * 10) / 10 : null,
        totalWords: stats._sum.wordCount || 0,
      },
    })
  } catch (error: any) {
    console.error('Get records error:', error)
    return NextResponse.json({ error: 'Failed to fetch records' }, { status: 500 })
  }
}
