import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const construction = await prisma.construction.findUnique({ where: { code: slug } })
    if (!construction) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(construction)
  } catch (error) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
