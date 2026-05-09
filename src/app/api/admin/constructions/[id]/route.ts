import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { const session = await auth(); const { id } = await params
    if (!session?.user || (session.user as any).role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    const c = await prisma.construction.update({ where: { id }, data: body })
    return NextResponse.json({ construction: c })
  } catch (error: any) { if (error.code === 'P2002') return NextResponse.json({ error: 'Code exists' }, { status: 400 }); return NextResponse.json({ error: 'Internal error' }, { status: 500 }) }
}
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { const session = await auth(); const { id } = await params
    if (!session?.user || (session.user as any).role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await prisma.construction.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) { if (error.code === 'P2025') return NextResponse.json({ error: 'Not found' }, { status: 404 }); return NextResponse.json({ error: 'Internal error' }, { status: 500 }) }
}
