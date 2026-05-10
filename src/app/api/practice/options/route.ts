import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getActiveTeachingOptions, publicGoal, publicTopic } from '@/lib/teaching/catalog'

export async function GET() {
  try {
    const { topics, goals, learningPaths, levels } = await getActiveTeachingOptions(prisma)
    return NextResponse.json({
      topics: topics.map(publicTopic),
      goals: goals.map(publicGoal),
      learningPaths,
      levels,
    })
  } catch (error) {
    console.error('Failed to load practice options:', error)
    return NextResponse.json({ error: 'Failed to load practice options' }, { status: 500 })
  }
}
