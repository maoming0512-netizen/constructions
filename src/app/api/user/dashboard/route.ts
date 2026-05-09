import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Login required' }, { status: 401 })
    }

    const userId = session.user.id
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const [practiceStats, rssCount, recentRecords, weeklyStats] = await Promise.all([
      prisma.practiceRecord.aggregate({
        where: { userId },
        _count: true,
        _sum: { wordCount: true },
        _avg: { wordCount: true },
      }),
      prisma.rSSAnalysis.count({ where: { userId } }),
      prisma.practiceRecord.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 8,
        select: {
          id: true,
          exerciseType: true,
          exerciseTheme: true,
          wordCount: true,
          createdAt: true,
        },
      }),
      prisma.practiceRecord.aggregate({
        where: { userId, createdAt: { gte: weekAgo } },
        _count: true,
        _sum: { wordCount: true },
      }),
    ])

    return NextResponse.json({
      stats: {
        totalExercises: practiceStats._count,
        totalWords: practiceStats._sum.wordCount || 0,
        avgWordsPerExercise: Math.round(practiceStats._avg.wordCount || 0),
        exercisesThisWeek: weeklyStats._count,
        wordsThisWeek: weeklyStats._sum.wordCount || 0,
        rssAnalyses: rssCount,
      },
      recentRecords,
    })
  } catch (error: any) {
    console.error('Dashboard fetch error:', error)
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 })
  }
}
