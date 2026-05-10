import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { callSkill } from '@/lib/ai/client'

const PROMPT_VERSION = 'construction-article-v1'
const GENERATION_VERSION = 'construction-article-v1'

function isActiveConstruction(row: any) {
  const metadata = row.metadata || {}
  if (row.rotationWeight <= 0) return false
  if (metadata.use_in_generation === false) return false
  if (metadata.active_for_learning === false) return false
  if (metadata.vocabulary_only === true) return false
  if (metadata.construction_type === 'vocabulary_only') return false
  if (metadata.teaching_value === 'low' || metadata.student_growth_value === 'low') return false
  if (metadata.exclusion_reason) return false
  return true
}

function constructionPayload(row: any) {
  const metadata = row.metadata || {}
  return {
    id: row.id,
    code: row.code,
    construction: row.template || row.name,
    name: row.name,
    template: row.template,
    meaning_zh: row.function,
    communicative_function: metadata.communicative_function || metadata.expression_function || [],
    usage_note: row.usageNote,
    example_sentence: row.example,
    school_level: metadata.school_level || row.level,
    fine_level: metadata.fine_level || row.difficulty,
    construction_type: metadata.construction_type || row.category,
    topic_tags: metadata.scene_type || [],
    emotional_tags: metadata.emotional_function || [],
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    const body = await req.json()
    const selectedIds = Array.isArray(body.selectedConstructionIds) ? body.selectedConstructionIds.slice(0, 5) : []
    const topicDirection = typeof body.topicDirection === 'string' ? body.topicDirection.trim().slice(0, 120) : ''
    const studentLevel = typeof body.studentLevel === 'string' ? body.studentLevel : 'senior'

    if (selectedIds.length < 1 || selectedIds.length > 5) {
      return NextResponse.json({ error: 'Please select 1 to 5 constructions.' }, { status: 400 })
    }

    const rows = await prisma.construction.findMany({
      where: { id: { in: selectedIds }, rotationWeight: { gt: 0 } },
      select: {
        id: true,
        code: true,
        name: true,
        template: true,
        function: true,
        usageNote: true,
        example: true,
        difficulty: true,
        level: true,
        category: true,
        metadata: true,
        rotationWeight: true,
      },
    })

    const usable = rows.filter(isActiveConstruction)
    if (usable.length !== selectedIds.length) {
      return NextResponse.json({ error: 'One or more selected items are vocabulary-only or inactive for learning.' }, { status: 422 })
    }

    const ordered = selectedIds
      .map((id: string) => usable.find((row) => row.id === id))
      .filter(Boolean)
      .map(constructionPayload)

    const result = await callSkill('constructionArticleGenerate', {
      constructions: ordered,
      topicDirection,
      studentLevel,
      requirements: {
        articleLength: '120-350 words',
        style: 'modern, student-life relevant, coherent, emotionally believable',
        mustAvoid: ['forced insertion', 'generic AI writing', 'textbook fake English', 'empty slogan ending'],
      },
    })

    if (!result.success || !result.data) {
      return NextResponse.json({ error: result.error || 'Failed to generate article' }, { status: 500 })
    }

    const article = result.data as any
    let savedArticle = null
    if (session?.user?.id) {
      savedArticle = await prisma.generatedConstructionArticle.create({
        data: {
          ownerUserId: session.user.id,
          selectedConstructionIds: ordered.map((item: any) => item.id),
          title: article.title,
          topic: article.topic,
          tone: article.tone,
          articleContent: article.article,
          highlightedConstructionData: article.highlighted_constructions || [],
          teachingNotes: article.teaching_notes || [],
          constructionUsageExplanations: article.construction_usage_explanations || [],
          promptVersion: PROMPT_VERSION,
          generationVersion: GENERATION_VERSION,
        },
      })
    }

    return NextResponse.json({
      success: true,
      article: {
        ...article,
        id: savedArticle?.id || `local-article-${Date.now()}`,
        selected_constructions: ordered,
        prompt_version: PROMPT_VERSION,
        generation_version: GENERATION_VERSION,
      },
      storage: session?.user?.id ? 'account' : 'local',
      usedFallback: result.usedFallback,
    })
  } catch (error: any) {
    console.error('Construction article generation error:', error)
    return NextResponse.json({ error: error.message || 'Failed to generate article' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ articles: [] })

    const url = new URL(req.url)
    const limit = Math.min(30, Math.max(1, Number(url.searchParams.get('limit') || '12')))
    const articles = await prisma.generatedConstructionArticle.findMany({
      where: { ownerUserId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json({ articles })
  } catch (error) {
    console.error('Construction article fetch error:', error)
    return NextResponse.json({ error: 'Failed to load articles' }, { status: 500 })
  }
}
