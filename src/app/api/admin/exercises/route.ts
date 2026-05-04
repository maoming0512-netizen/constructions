import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const exercises = await prisma.exercise.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        difficulty: true,
        category: true,
        isPublished: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    
    return NextResponse.json({ exercises })
  } catch (error) {
    console.error('Failed to get exercises:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { title, description, difficulty, category, questions, answers } = body

    const exercise = await prisma.exercise.create({
      data: {
        title,
        description,
        difficulty: parseInt(difficulty),
        category,
        questions: JSON.stringify(questions || []),
        answers: JSON.stringify(answers || []),
      },
    })
    
    return NextResponse.json({ exercise })
  } catch (error) {
    console.error('Failed to create exercise:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
