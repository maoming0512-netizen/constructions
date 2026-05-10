import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Login required' }, { status: 401 })
    }

    const body = await req.json()
    const { feedSource, articleTitle, articleLink, analysis } = body

    if (!articleTitle || !analysis) {
      return NextResponse.json({ error: 'articleTitle and analysis are required' }, { status: 400 })
    }

    const record = await prisma.rSSAnalysis.create({
      data: {
        userId: session.user.id,
        feedSource: feedSource || 'unknown',
        articleTitle,
        articleLink: articleLink || '',
        analysis,
      },
    })

    return NextResponse.json({ success: true, record })
  } catch (error: any) {
    console.error('Save RSS analysis error:', error)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Login required' }, { status: 401 })
    }

    const url = new URL(req.url)
    const limit = parseInt(url.searchParams.get('limit') || '20')

    const articles = await prisma.generatedConstructionArticle.findMany({
      where: { ownerUserId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json({
      records: articles.map((article) => ({
        id: article.id,
        feedSource: 'construction-studio',
        articleTitle: article.title,
        articleLink: '',
        analysis: JSON.stringify({
          summary: article.articleContent.slice(0, 240),
          constructions: article.highlightedConstructionData,
          writingTakeaway: Array.isArray(article.teachingNotes) ? article.teachingNotes[0] : '',
        }),
        createdAt: article.createdAt,
      })),
    })
  } catch (error: any) {
    console.error('Get RSS analysis error:', error)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
