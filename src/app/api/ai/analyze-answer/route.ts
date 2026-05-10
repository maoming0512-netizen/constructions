import { NextRequest, NextResponse } from 'next/server'
import { callSkill } from '@/lib/ai/client'
import { analyzeAnswerSkill } from '@/lib/ai/skills/analyzeAnswer.skill'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { exerciseType, exerciseContext, exerciseTask, targetConstructions, referenceAnswer, studentAnswer } = body

    if (!studentAnswer || !exerciseContext) {
      return NextResponse.json({ error: 'Student answer and exercise context are required' }, { status: 400 })
    }

    const result = await callSkill('analyzeAnswer', {
      exerciseType: exerciseType || 'D1',
      exerciseContext: exerciseContext || '',
      exerciseTask: exerciseTask || '',
      targetConstructions: targetConstructions || '',
      referenceAnswer: referenceAnswer || '',
      studentAnswer,
    })

    if (!result.success) {
      const fallback = analyzeAnswerSkill.fallback({ exerciseContext, studentAnswer } as any)
      return NextResponse.json({
        success: true,
        data: fallback.data,
        usedFallback: true,
        error: result.error,
      })
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      usedFallback: result.usedFallback,
    })
  } catch (error: any) {
    console.error('[analyze-answer] failed:', error)
    const fallback = analyzeAnswerSkill.fallback({ exerciseContext: '', studentAnswer: '' } as any)
    return NextResponse.json({
      success: true,
      data: fallback.data,
      usedFallback: true,
      error: error.message || 'Analysis failed, showing fallback.',
    })
  }
}
