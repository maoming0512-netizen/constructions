import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const totalUsers = await prisma.user.count()
    const totalExercises = await prisma.exercise.count()
    const totalConstructions = await prisma.construction.count()

    const usersByRole = await prisma.user.groupBy({ by: ['role'], _count: { role: true } })
    const constructionsByLevel = await prisma.construction.groupBy({ by: ['level'], _count: { level: true } })
    const exercisesByType = await prisma.exercise.groupBy({ by: ['type'], _count: { type: true } })

    return NextResponse.json({
      totalUsers, totalExercises, totalConstructions,
      usersByRole: usersByRole.map(u => ({ role: u.role, count: u._count.role })),
      constructionsByLevel: constructionsByLevel.map(c => ({ level: c.level, count: c._count.level })),
      exercisesByType: exercisesByType.map(e => ({ type: e.type, count: e._count.type })),
    })
  } catch (error) { return NextResponse.json({ error: 'Internal error' }, { status: 500 }) }
}
