import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 获取基本统计
    const totalUsers = await prisma.user.count()
    const totalExercises = await prisma.exercise.count()
    const totalConstructions = await prisma.construction.count()

    // 用户角色分布
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true,
      },
    })

    // 构式分类分布
    const constructionsByCategory = await prisma.construction.groupBy({
      by: ['category'],
      _count: {
        category: true,
      },
    })

    // 题目难度分布
    const exercisesByDifficulty = await prisma.exercise.groupBy({
      by: ['difficulty'],
      _count: {
        difficulty: true,
      },
    })

    return NextResponse.json({
      totalUsers,
      totalExercises,
      totalConstructions,
      usersByRole: usersByRole.map((u) => ({
        role: u.role,
        count: u._count.role,
      })),
      constructionsByCategory: constructionsByCategory.map((c) => ({
        category: c.category,
        count: c._count.category,
      })),
      exercisesByDifficulty: exercisesByDifficulty.map((e) => ({
        difficulty: e.difficulty,
        count: e._count.difficulty,
      })),
    })
  } catch (error) {
    console.error('Failed to get analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
