import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const count = await prisma.construction.count()
    
    return NextResponse.json({ count })
  } catch (error) {
    console.error('Failed to get construction count:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
