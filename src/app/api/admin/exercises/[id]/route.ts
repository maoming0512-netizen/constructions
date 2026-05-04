import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params
    
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const exercise = await prisma.exercise.findUnique({ where: { id } })
    if (!exercise) return NextResponse.json({ error: 'Exercise not found' }, { status: 404 })
    return NextResponse.json({ exercise })
  } catch (error) {
    console.error('Failed to get exercise:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params
    
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { title, description, difficulty, category, questions, answers, isPublished } = body

    const exercise = await prisma.exercise.update({
      where: { id },
      data: {
        title, description,
        difficulty: parseInt(difficulty),
        category,
        questions: JSON.stringify(questions || []),
        answers: JSON.stringify(answers || []),
        isPublished: isPublished !== undefined ? isPublished : true,
      },
    })
    
    return NextResponse.json({ exercise })
  } catch (error: any) {
    console.error('Failed to update exercise:', error)
    if (error.code === 'P2025') return NextResponse.json({ error: 'Exercise not found' }, { status: 404 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params
    
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.exercise.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Failed to delete exercise:', error)
    if (error.code === 'P2025') return NextResponse.json({ error: 'Exercise not found' }, { status: 404 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
