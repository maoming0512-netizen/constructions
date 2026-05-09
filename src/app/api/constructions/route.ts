import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const constructions = await prisma.construction.findMany({ take: 50, orderBy: { code: 'asc' } })
    return NextResponse.json(constructions)
  } catch (error) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
