import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { const session = await auth(); const { id } = await params
    if (!session?.user || (session.user as any).role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const exercise = await prisma.exercise.findUnique({ where: { id } })
    if (!exercise) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ exercise })
  } catch (error) { return NextResponse.json({ error: 'Internal error' }, { status: 500 }) }
}
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { const session = await auth(); const { id } = await params
    if (!session?.user || (session.user as any).role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    const { exerciseId, level, type, theme, context, task, wordCount, targetConstructions, referenceAnswer, isPublished } = body
    const exercise = await prisma.exercise.update({ where: { id }, data: { exerciseId, level, type, theme, context, task, wordCount, targetConstructions, referenceAnswer, isPublished } })
    return NextResponse.json({ exercise })
  } catch (error: any) { if (error.code === 'P2025') return NextResponse.json({ error: 'Not found' }, { status: 404 }); return NextResponse.json({ error: 'Internal error' }, { status: 500 }) }
}
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { const session = await auth(); const { id } = await params
    if (!session?.user || (session.user as any).role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await prisma.exercise.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) { if (error.code === 'P2025') return NextResponse.json({ error: 'Not found' }, { status: 404 }); return NextResponse.json({ error: 'Internal error' }, { status: 500 }) }
}
