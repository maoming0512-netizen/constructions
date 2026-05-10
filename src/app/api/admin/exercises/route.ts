import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const exercises = await prisma.exercise.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ exercises })
  } catch (error) { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }) }
}
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    const { exerciseId, level, type, theme, context, task, wordCount, targetConstructions, referenceAnswer, metadata } = body
    const exercise = await prisma.exercise.create({
      data: { exerciseId: exerciseId || `EX-${Date.now()}`, level, type, theme, context, task, wordCount, targetConstructions, referenceAnswer, metadata: metadata || undefined },
    })
    return NextResponse.json({ exercise })
  } catch (error) { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }) }
}
