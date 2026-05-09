import { NextRequest, NextResponse } from 'next/server'
import Parser from 'rss-parser'

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['enclosure', 'enclosure'],
    ],
  },
})

const RSS_SOURCES: Record<string, { name: string; url: string }> = {
  'b-markets': {
    name: 'B-Markets',
    url: 'https://yzcw.dpdns.org/users/1/web_requests/388/B-Markets.xml',
  },
  'r-world': {
    name: 'R-World China',
    url: 'https://yzcw.dpdns.org/users/1/web_requests/486/R-World-China.xml',
  },
}

function extractImageFromContent(html: string): string | null {
  if (!html) return null
  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i)
  return imgMatch ? imgMatch[1] : null
}

function extractImageUrl(item: any): string | null {
  // 1. Check media:content
  if (item.mediaContent) {
    const mc = item.mediaContent
    if (typeof mc === 'object' && mc.$) {
      if (mc.$.type?.startsWith('image/') && mc.$.url) return mc.$.url
      if (mc.$.url) return mc.$.url
    }
    if (typeof mc === 'string') return mc
  }

  // 2. Check media:thumbnail
  if (item.mediaThumbnail) {
    const mt = item.mediaThumbnail
    if (typeof mt === 'object' && mt.$?.url) return mt.$.url
    if (typeof mt === 'string') return mt
  }

  // 3. Check enclosure
  if (item.enclosure) {
    const enc = item.enclosure
    if (typeof enc === 'object') {
      if (enc.type?.startsWith('image/') && enc.url) return enc.url
      if (enc.url) return enc.url
    }
  }

  // 4. Extract from content HTML
  const content = item.content || item['content:encoded'] || ''
  return extractImageFromContent(content)
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const source = url.searchParams.get('source') || 'b-markets'

    const feedConfig = RSS_SOURCES[source]
    if (!feedConfig) {
      return NextResponse.json({ error: 'Unknown source' }, { status: 400 })
    }

    const feed = await parser.parseURL(feedConfig.url)

    const items = (feed.items || []).map((item: any) => ({
      title: item.title || '',
      link: item.link || '',
      pubDate: item.pubDate || item.isoDate || '',
      creator: item.creator || item.author || '',
      contentSnippet: item.contentSnippet || item.content?.replace(/<[^>]*>/g, '').slice(0, 300) || '',
      content: item.content || item['content:encoded'] || '',
      categories: item.categories || [],
      guid: item.guid || '',
      imageUrl: extractImageUrl(item),
    }))

    return NextResponse.json({
      source: feedConfig.name,
      title: feed.title || '',
      description: feed.description || '',
      items,
    })
  } catch (error: any) {
    console.error('RSS fetch error:', error.message)
    return NextResponse.json({ error: 'Failed to fetch RSS feed', detail: error.message }, { status: 500 })
  }
}
