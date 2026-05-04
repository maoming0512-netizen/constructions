import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const ConstructionUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  difficulty: z.number().int().min(1).max(5).optional(),
  formPattern: z.string().min(1).optional(),
  coreMeaning: z.string().min(1).optional(),
  discourseFunction: z.string().optional(),
  explanationZh: z.string().optional(),
  explanationEn: z.string().optional(),
  semanticAnchors: z.array(z.string()).optional(),
  commonVerbs: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const construction = await prisma.construction.findUnique({
      where: { slug },
    })

    if (!construction) {
      return NextResponse.json({ error: 'Construction not found' }, { status: 404 })
    }

    if (!construction.isPublished) {
      const session = await auth()
      if (!session?.user || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    return NextResponse.json(construction)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch construction' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug } = await params
    const body = await request.json()
    const validated = ConstructionUpdateSchema.parse(body)

    if (validated.slug && validated.slug !== slug) {
      const existing = await prisma.construction.findUnique({
        where: { slug: validated.slug },
      })
      if (existing) {
        return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
      }
    }

    const updateData: any = { ...validated }
    if (validated.semanticAnchors) updateData.semanticAnchors = validated.semanticAnchors.join(',')
    if (validated.commonVerbs) updateData.commonVerbs = validated.commonVerbs.join(',')
    if (validated.tags) updateData.tags = validated.tags.join(',')

    const construction = await prisma.construction.update({
      where: { slug },
      data: updateData,
    })

    return NextResponse.json(construction)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update construction' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug } = await params

    await prisma.construction.delete({ where: { slug } })
    return NextResponse.json({ message: 'Construction deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete construction' }, { status: 500 })
  }
}
