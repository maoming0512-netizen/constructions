import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { findApprovedOfficialExercise, normalizeBlankDisplay } from '@/lib/exercises/exerciseBank'
import { resolveTeachingSelection } from '@/lib/teaching/catalog'

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const topicId = url.searchParams.get('topicId')
    const goalId = url.searchParams.get('goalId')
    const level = url.searchParams.get('level') || 'senior'

    const selection = await resolveTeachingSelection(prisma, { topicId, goalId, level })
    const exercise = await findApprovedOfficialExercise(prisma, {
      topicId: selection.topic.id,
      goalId: selection.goal.id,
      level: selection.level,
    })

    if (!exercise) {
      return NextResponse.json({
        exercise: null,
        canGenerate: true,
        message: 'No approved official exercise exists for this combination yet.',
      }, { status: 404 })
    }

    return NextResponse.json({
      exercise: {
        ...exercise,
        context: normalizeBlankDisplay(exercise.context),
        source: exercise.source || 'official',
        topic: {
          id: selection.topic.id,
          label: selection.topic.label,
          category: selection.topic.category,
          description: selection.topic.description,
        },
        goal: {
          id: selection.goal.id,
          label: selection.goal.label,
          description: selection.goal.description,
          communicativePurpose: selection.goal.communicativePurpose,
        },
      },
      canGenerate: false,
    })
  } catch (error: any) {
    console.error('Failed to recommend exercise:', error)
    return NextResponse.json({ error: error.message || 'Failed to recommend exercise' }, { status: 500 })
  }
}
