import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { exerciseId, level, type, theme, context, task, wordCount, targetConstructions, referenceAnswer } = body

    if (!exerciseId || !context || !task) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const exercise = await prisma.aIGeneratedExercise.create({
      data: {
        exerciseId: exerciseId || `AI-${Date.now()}`,
        userId: session.user.id,
        level: level || 'senior',
        type: type || 'D1',
        theme: theme || '',
        context,
        task,
        wordCount: wordCount || '',
        targetConstructions: targetConstructions || '',
        referenceAnswer: referenceAnswer || '',
      },
    })

    return NextResponse.json({ success: true, exercise })
  } catch (error: any) {
    console.error('Save AI exercise error:', error)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Exercise ID already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to save exercise' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const exercises = await prisma.aIGeneratedExercise.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ exercises })
  } catch (error) {
    console.error('Get AI exercises error:', error)
    return NextResponse.json({ error: 'Failed to fetch exercises' }, { status: 500 })
  }
}
