import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

function constructionDataFromBody(body: any) {
  const data: any = {}
  for (const key of ['code', 'name', 'template', 'coreWords', 'function', 'usageNote', 'example', 'variants', 'difficulty', 'level', 'category', 'metadataVersion']) {
    if (body[key] !== undefined) data[key] = body[key]
  }
  if (body.rotationWeight !== undefined) data.rotationWeight = Number(body.rotationWeight)
  if (body.metadata !== undefined) data.metadata = body.metadata
  return data
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { const session = await auth(); const { id } = await params
    if (!session?.user || (session.user as any).role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    const c = await prisma.construction.update({ where: { id }, data: constructionDataFromBody(body) })
    return NextResponse.json({ construction: c })
  } catch (error: any) { if (error.code === 'P2002') return NextResponse.json({ error: 'Code exists' }, { status: 400 }); return NextResponse.json({ error: 'Internal error' }, { status: 500 }) }
}
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { const session = await auth(); const { id } = await params
    if (!session?.user || (session.user as any).role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const existing = await prisma.construction.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const metadata = (existing.metadata && typeof existing.metadata === 'object' && !Array.isArray(existing.metadata)) ? existing.metadata as Record<string, unknown> : {}
    const construction = await prisma.construction.update({
      where: { id },
      data: {
        rotationWeight: 0,
        metadata: {
          ...metadata,
          teaching_value: 'low',
          student_growth_value: 'low',
          use_in_generation: false,
          active_for_learning: false,
          vocabulary_only: metadata.vocabulary_only ?? false,
          excluded_reason: 'admin_excluded',
          excluded_at: new Date().toISOString(),
        },
      },
    })
    return NextResponse.json({ success: true, construction })
  } catch (error: any) { if (error.code === 'P2025') return NextResponse.json({ error: 'Not found' }, { status: 404 }); return NextResponse.json({ error: 'Internal error' }, { status: 500 }) }
}
