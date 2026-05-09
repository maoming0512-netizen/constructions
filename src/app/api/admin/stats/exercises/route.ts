import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try { const session = await auth()
    if (!session?.user || (session.user as any).role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const count = await prisma.exercise.count()
    return NextResponse.json({ count })
  } catch (error) { return NextResponse.json({ error: 'Internal error' }, { status: 500 }) }
}
