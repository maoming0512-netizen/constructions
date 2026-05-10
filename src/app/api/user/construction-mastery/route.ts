import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Please log in to view construction progress.' }, { status: 401 })

    const url = new URL(req.url)
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100)
    const rows = await prisma.userConstructionMastery.findMany({
      where: { userId: session.user.id },
      take: limit,
      orderBy: [{ lastSeenAt: 'desc' }, { updatedAt: 'desc' }],
      include: {
        construction: {
          select: {
            id: true,
            code: true,
            name: true,
            template: true,
            function: true,
            example: true,
            level: true,
            metadata: true,
          },
        },
      },
    })

    return NextResponse.json({ mastery: rows })
  } catch (error) {
    console.error('Failed to fetch construction mastery:', error)
    return NextResponse.json({ error: 'Could not load your construction progress right now.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Please log in to save construction progress.' }, { status: 401 })

    const body = await req.json()
    const { constructionId, event, notes } = body
    if (!constructionId) return NextResponse.json({ error: 'Missing construction id.' }, { status: 400 })

    const now = new Date()
    const increments: any = {}
    if (event === 'attempted') increments.attemptCount = { increment: 1 }
    if (event === 'successful_use') increments.successfulUseCount = { increment: 1 }
    if (event === 'weak_use') increments.weakUseCount = { increment: 1 }
    if (event === 'recommended_again') increments.recommendedAgainCount = { increment: 1 }

    const row = await prisma.userConstructionMastery.upsert({
      where: { userId_constructionId: { userId: session.user.id, constructionId } },
      update: {
        ...increments,
        lastUsedAt: ['attempted', 'successful_use', 'weak_use'].includes(event) ? now : undefined,
        masteryLevel: event === 'successful_use' ? 'growing' : event === 'weak_use' ? 'review' : undefined,
        notes: notes || undefined,
      },
      create: {
        userId: session.user.id,
        constructionId,
        attemptCount: event === 'attempted' ? 1 : 0,
        successfulUseCount: event === 'successful_use' ? 1 : 0,
        weakUseCount: event === 'weak_use' ? 1 : 0,
        recommendedAgainCount: event === 'recommended_again' ? 1 : 0,
        lastUsedAt: ['attempted', 'successful_use', 'weak_use'].includes(event) ? now : undefined,
        masteryLevel: event === 'successful_use' ? 'growing' : event === 'weak_use' ? 'review' : 'seen',
        notes: notes || undefined,
      },
    })

    return NextResponse.json({ success: true, mastery: row })
  } catch (error) {
    console.error('Failed to update construction mastery:', error)
    return NextResponse.json({ error: 'Could not save construction progress right now.' }, { status: 500 })
  }
}
