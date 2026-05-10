import { NextRequest } from 'next/server'
import OpenAI from 'openai'
import { analyzeAnswerSkill } from '@/lib/ai/skills/analyzeAnswer.skill'

export const runtime = 'nodejs'

function sse(payload: Record<string, unknown>) {
  return `data: ${JSON.stringify(payload)}\n\n`
}

function parseJson(raw: string) {
  const trimmed = raw.trim()
  try {
    return JSON.parse(trimmed)
  } catch {
    const match = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
    if (match) return JSON.parse(match[1])
    throw new Error('The AI response was not valid JSON.')
  }
}

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (payload: Record<string, unknown>) => controller.enqueue(encoder.encode(sse(payload)))

      try {
        const body = await req.json()
        const { exerciseType, exerciseContext, exerciseTask, targetConstructions, referenceAnswer, studentAnswer } = body

        if (!studentAnswer || !exerciseContext) {
          send({ type: 'error', text: 'Student answer and exercise context are required.' })
          controller.close()
          return
        }

        const apiKey = process.env.DEEPSEEK_API_KEY || process.env.AI_API_KEY
        if (!apiKey) {
          const fallback = analyzeAnswerSkill.fallback({ exerciseContext, studentAnswer } as any)
          send({ type: 'done', data: fallback.data, usedFallback: true })
          controller.close()
          return
        }

        const openai = new OpenAI({
          baseURL: process.env.DEEPSEEK_BASE_URL || process.env.AI_BASE_URL || 'https://api.deepseek.com',
          apiKey,
        })

        const input = {
          exerciseType: exerciseType || 'D1',
          exerciseContext: exerciseContext || '',
          exerciseTask: exerciseTask || '',
          targetConstructions: targetConstructions || '',
          referenceAnswer: referenceAnswer || '',
          studentAnswer,
        }

        send({ type: 'status', text: 'Connecting to the construction feedback engine...' })
        send({ type: 'status', text: 'Reading your answer and locating expression-growth points...' })

        const response = await openai.chat.completions.create({
          model: process.env.DEEPSEEK_MODEL || process.env.AI_MODEL || 'deepseek-chat',
          messages: [
            { role: 'system', content: analyzeAnswerSkill.config.systemPrompt },
            { role: 'user', content: JSON.stringify(input) },
          ],
          temperature: analyzeAnswerSkill.config.temperature ?? 0.25,
          max_tokens: analyzeAnswerSkill.config.maxTokens ?? 8192,
          stream: true,
          response_format: { type: 'json_object' },
        } as any)

        let fullContent = ''
        for await (const chunk of response as any) {
          const delta = chunk.choices?.[0]?.delta
          const text = delta?.content || ''
          if (!text) continue
          fullContent += text
          send({ type: 'content', text })
        }

        const data = parseJson(fullContent)
        send({ type: 'done', data, usedFallback: false })
      } catch (error: any) {
        const fallback = analyzeAnswerSkill.fallback({ exerciseContext: '', studentAnswer: '' } as any)
        send({
          type: 'done',
          data: fallback.data,
          usedFallback: true,
          error: error?.message || 'Analysis failed, showing fallback.',
        })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
