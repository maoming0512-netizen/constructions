import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const constructions = await prisma.construction.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })
    
    return NextResponse.json({ constructions })
  } catch (error) {
    console.error('Failed to get constructions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { 
      name, 
      slug, 
      category, 
      difficulty, 
      formPattern, 
      coreMeaning,
      discourseFunction,
      explanationZh,
      explanationEn,
      semanticAnchors,
      commonVerbs,
      tags 
    } = body

    if (!name || !slug || !category || !formPattern || !coreMeaning) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const construction = await prisma.construction.create({
      data: {
        name,
        slug,
        category,
        difficulty: parseInt(difficulty) || 1,
        formPattern,
        coreMeaning,
        discourseFunction: discourseFunction || null,
        explanationZh: explanationZh || null,
        explanationEn: explanationEn || null,
        semanticAnchors: semanticAnchors || '',
        commonVerbs: commonVerbs || '',
        tags: tags || '',
      },
    })
    
    return NextResponse.json({ construction })
  } catch (error: any) {
    console.error('Failed to create construction:', error)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
