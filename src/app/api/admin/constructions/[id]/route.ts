import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

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
    const { 
      name, slug, category, difficulty, formPattern, coreMeaning,
      discourseFunction, explanationZh, explanationEn,
      semanticAnchors, commonVerbs, tags, isPublished 
    } = body

    const construction = await prisma.construction.update({
      where: { id },
      data: {
        name, slug, category,
        difficulty: parseInt(difficulty) || 1,
        formPattern, coreMeaning,
        discourseFunction: discourseFunction || null,
        explanationZh: explanationZh || null,
        explanationEn: explanationEn || null,
        semanticAnchors: semanticAnchors || '',
        commonVerbs: commonVerbs || '',
        tags: tags || '',
        isPublished: isPublished !== undefined ? isPublished : true,
      },
    })
    
    return NextResponse.json({ construction })
  } catch (error: any) {
    console.error('Failed to update construction:', error)
    if (error.code === 'P2002') return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
    if (error.code === 'P2025') return NextResponse.json({ error: 'Construction not found' }, { status: 404 })
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

    await prisma.construction.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Failed to delete construction:', error)
    if (error.code === 'P2025') return NextResponse.json({ error: 'Construction not found' }, { status: 404 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
