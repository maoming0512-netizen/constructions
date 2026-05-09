import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try { const session = await auth()
    if (!session?.user || (session.user as any).role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const constructions = await prisma.construction.findMany({ orderBy: { code: 'asc' }, take: 200 })
    const total = await prisma.construction.count()
    return NextResponse.json({ constructions, total })
  } catch (error) { return NextResponse.json({ error: 'Internal error' }, { status: 500 }) }
}
export async function POST(req: NextRequest) {
  try { const session = await auth()
    if (!session?.user || (session.user as any).role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    const c = await prisma.construction.create({ data: body })
    return NextResponse.json({ construction: c })
  } catch (error: any) { return NextResponse.json({ error: error.code === 'P2002' ? 'Code exists' : 'Internal error' }, { status: 400 }) }
}
