import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = new Date().toISOString().split('T')[0]

    const [totalUsers, totalExercises, totalConstructions, totalAIExercises,
      totalRecords, todayVisits, totalVisits, todayAPICalls, totalAPICalls] = await Promise.all([
      prisma.user.count(),
      prisma.exercise.count(),
      prisma.construction.count(),
      prisma.aIGeneratedExercise.count(),
      prisma.practiceRecord.count(),
      prisma.visitLog.findUnique({ where: { date: today } }).then(r => r?.count || 0),
      prisma.visitLog.aggregate({ _sum: { count: true } }).then(r => r._sum.count || 0),
      prisma.aPIUsageLog.findUnique({ where: { date: today } }).then(r => r?.count || 0),
      prisma.aPIUsageLog.aggregate({ _sum: { count: true } }).then(r => r._sum.count || 0),
    ])

    // Recent 7 days visits
    const dates: string[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      dates.push(d.toISOString().split('T')[0])
    }
    const visitData = await prisma.visitLog.findMany({ where: { date: { in: dates } } })
    const apiData = await prisma.aPIUsageLog.findMany({ where: { date: { in: dates } } })

    // Level distribution
    const byLevel = await prisma.exercise.groupBy({ by: ['level'], _count: true })
    const byType = await prisma.exercise.groupBy({ by: ['type'], _count: true })
    const usersByRole = await prisma.user.groupBy({ by: ['role'], _count: true })
    const constructionsByLevel = await prisma.construction.groupBy({ by: ['level'], _count: true })

    return NextResponse.json({
      totalUsers, totalExercises, totalConstructions, totalAIExercises, totalRecords,
      todayVisits, totalVisits, todayAPICalls, totalAPICalls,
      visitTrend: dates.map(d => ({ date: d, count: visitData.find(v => v.date === d)?.count || 0 })),
      apiTrend: dates.map(d => ({ date: d, count: apiData.find(v => v.date === d)?.count || 0 })),
      byLevel: byLevel.map(l => ({ level: l.level, count: l._count })),
      byType: byType.map(t => ({ type: t.type, count: t._count })),
      usersByRole: usersByRole.map(u => ({ role: u.role, count: u._count })),
      constructionsByLevel: constructionsByLevel.map(c => ({ level: c.level, count: c._count })),
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type } = body
    const today = new Date().toISOString().split('T')[0]

    if (type === 'visit') {
      await prisma.visitLog.upsert({
        where: { date: today }, create: { date: today, count: 1 },
        update: { count: { increment: 1 } },
      })
    } else if (type === 'api_call') {
      await prisma.aPIUsageLog.upsert({
        where: { date: today }, create: { date: today, count: 1 },
        update: { count: { increment: 1 } },
      })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
