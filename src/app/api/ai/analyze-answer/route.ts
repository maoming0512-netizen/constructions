import { NextRequest, NextResponse } from 'next/server'
import { getAIConfig, getSkillConfig } from '@/lib/ai/client'
import { analyzeAnswerSkill } from '@/lib/ai/skills/analyzeAnswer.skill'
import type { AnalyzeAnswerInput } from '@/lib/ai/skills/analyzeAnswer.skill'

async function callAISimple(systemPrompt: string, userContent: string, apiConfig: { baseURL: string; apiKey: string; model: string }): Promise<string> {
  const url = `${apiConfig.baseURL.replace(/\/+$/, '')}/chat/completions`

  const body = {
    model: apiConfig.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    temperature: 0.3,
    max_tokens: 8192,
    stream: false,
  }

  console.log('[analyze-answer] Calling DeepSeek:', { url, model: apiConfig.model, apiKeyPrefix: apiConfig.apiKey?.slice(0, 8) + '...' })

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiConfig.apiKey}` },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errText = await response.text().catch(() => '')
    console.error('[analyze-answer] API error:', response.status, errText.slice(0, 300))
    throw new Error(`API returned ${response.status}: ${errText.slice(0, 150)}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('Empty response from AI')
  return content
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { exerciseType, exerciseContext, exerciseTask, targetConstructions, referenceAnswer, studentAnswer } = body

    if (!studentAnswer || !exerciseContext) {
      return NextResponse.json({ error: 'Student answer and exercise context are required' }, { status: 400 })
    }

    const skillConfig = getSkillConfig('analyzeAnswer')
    const apiConfig = getAIConfig()

    console.log('[analyze-answer] config check:', {
      hasSkillConfig: !!skillConfig,
      hasApiKey: !!apiConfig?.apiKey,
      apiKeyLen: apiConfig?.apiKey?.length || 0,
      model: apiConfig?.model,
      baseURL: apiConfig?.baseURL,
    })

    if (!skillConfig || !apiConfig?.apiKey) {
      console.log('[analyze-answer] No API key, using fallback')
      const fb = analyzeAnswerSkill.fallback({ exerciseContext: '', studentAnswer: '' })
      if (fb.success && fb.data) {
        return NextResponse.json({ success: true, data: fb.data, usedFallback: true })
      }
      return NextResponse.json({ success: false, error: 'API not configured' }, { status: 500 })
    }

    // Non-streaming: simpler, more reliable for structured JSON output
    const systemPrompt = skillConfig.systemPrompt
    const userContent = JSON.stringify({
      exerciseType: exerciseType || 'D1',
      exerciseContext: exerciseContext || '',
      exerciseTask: exerciseTask || '',
      targetConstructions: targetConstructions || '',
      referenceAnswer: referenceAnswer || '',
      studentAnswer,
    })

    console.log('[analyze-answer] Sending to AI...')
    const rawText = await callAISimple(systemPrompt, userContent, apiConfig)
    console.log('[analyze-answer] Response received, length:', rawText.length)

    // Try to parse as JSON
    try {
      const parsed = JSON.parse(rawText)
      return NextResponse.json({ success: true, data: parsed, usedFallback: false })
    } catch {
      const match = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
      if (match) {
        try {
          const parsed = JSON.parse(match[1])
          return NextResponse.json({ success: true, data: parsed, usedFallback: false })
        } catch {}
      }
      // Return raw response with fallback structure
      console.log('[analyze-answer] Could not parse JSON response:', rawText.slice(0, 200))
      return NextResponse.json({
        success: true,
        data: { rawResponse: rawText },
        usedFallback: true,
      })
    }
  } catch (error: any) {
    console.error('[analyze-answer] Full error:', error)
    const fb = analyzeAnswerSkill.fallback({ exerciseContext: '', studentAnswer: '' })
    if (fb.success && fb.data) {
      return NextResponse.json({
        success: true,
        data: fb.data,
        usedFallback: true,
        error: error.message || 'Stream failed, showing fallback',
      })
    }
    return NextResponse.json({ success: false, error: error.message || 'Internal error' }, { status: 500 })
  }
}
