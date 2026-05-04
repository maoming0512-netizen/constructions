import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const ConstructionSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  category: z.string().min(1),
  difficulty: z.number().int().min(1).max(5),
  formPattern: z.string().min(1),
  coreMeaning: z.string().min(1),
  discourseFunction: z.string().optional(),
  explanationZh: z.string().optional(),
  explanationEn: z.string().optional(),
  semanticAnchors: z.array(z.string()).optional(),
  commonVerbs: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().optional().default(true),
})

export async function GET() {
  try {
    const constructions = await prisma.construction.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(constructions)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch constructions' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = ConstructionSchema.parse(body)

    // 检查slug是否已存在
    const existing = await prisma.construction.findUnique({
      where: { slug: validated.slug },
    })
    if (existing) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
    }

    const createData: any = { ...validated }
    if (validated.semanticAnchors) createData.semanticAnchors = validated.semanticAnchors.join(',')
    if (validated.commonVerbs) createData.commonVerbs = validated.commonVerbs.join(',')
    if (validated.tags) createData.tags = validated.tags.join(',')

    const construction = await prisma.construction.create({
      data: createData,
    })
    return NextResponse.json(construction, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create construction' }, { status: 500 })
  }
}
