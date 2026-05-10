import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import { profileConstruction } from '../src/lib/exercises/adaptiveExercise'

const prisma = new PrismaClient()

type Classification = {
  construction_type: string
  teaching_value: 'high' | 'medium' | 'low'
  student_growth_value: 'high' | 'medium' | 'low'
  expression_function: string[]
  use_in_generation: boolean
  exclusion_reason?: string
}

function words(text: string) {
  return (text.match(/[A-Za-z]+(?:[-'][A-Za-z]+)*/g) || [])
}

function hasPatternSignal(row: { name: string; template: string; coreWords: string; function: string; usageNote: string; example: string; category: string }) {
  const text = `${row.name} ${row.template} ${row.coreWords} ${row.function} ${row.usageNote} ${row.example}`.toLowerCase()
  return /(\.\.\.| sb | sth | one's | someone|because|although|instead of|compared with|what |it is|there is|would you|i see|i wonder|not only|but also|so that|as soon as|used to|be willing to|take part in|play .* role|make .* choice|show respect|let me|i did not mean)/i.test(text)
}

function inferExpressionFunctions(text: string) {
  const functions = new Set<string>()
  if (/explain|reason|because|meaning|show|culture|custom/i.test(text)) functions.add('explain')
  if (/compare|unlike|similar|different|than|compared/i.test(text)) functions.add('compare')
  if (/clarify|mean|another way|wonder if/i.test(text)) functions.add('clarify')
  if (/invite|would you|join|take part/i.test(text)) functions.add('invite')
  if (/realize|learned|think of|reflect|from this/i.test(text)) functions.add('reflect')
  if (/feel|proud|curious|grateful|sorry|comfort|relief/i.test(text)) functions.add('describe_emotion')
  if (/move|take|put|give|walk|show|hand/i.test(text)) functions.add('describe_action')
  if (/first|later|however|instead|therefore|as a result/i.test(text)) functions.add('connect_ideas')
  if (/respect|polite|comfortable|point/i.test(text)) functions.add('show_respect')
  if (/sorry|did not mean|misunderstanding|repair|apolog/i.test(text)) functions.add('repair_misunderstanding')
  if (/like|prefer|favorite|what i like/i.test(text)) functions.add('express_preference')
  if (/future|career|internship|plan|goal/i.test(text)) functions.add('discuss_future')
  if (/experience|story|once|when i/i.test(text)) functions.add('share_experience')
  if (!functions.size) functions.add('general_expression')
  return Array.from(functions)
}

function classify(row: { name: string; template: string; coreWords: string; function: string; usageNote: string; example: string; category: string }): Classification {
  const text = `${row.name} ${row.template} ${row.coreWords} ${row.function} ${row.usageNote} ${row.example}`
  const englishTokens = words(`${row.template} ${row.coreWords}`)
  const exampleTokens = words(row.example)
  const patternSignal = hasPatternSignal(row)
  const vocabularyCategory = /^Exp[A-Z]_/.test(row.category)
  const tooSparse = englishTokens.length <= 1 && exampleTokens.length < 5 && !patternSignal
  const expression_function = inferExpressionFunctions(text)

  if (tooSparse || (vocabularyCategory && !patternSignal && englishTokens.length <= 2)) {
    return {
      construction_type: 'vocabulary_only',
      teaching_value: 'low',
      student_growth_value: 'low',
      expression_function,
      use_in_generation: false,
      exclusion_reason: tooSparse ? 'single_word' : 'vocabulary_only',
    }
  }

  if (/would you|i see your point|did not mean|let me explain|in my culture|unlike|it may look like|what i like|the reason why|what impressed|began to realize|behind this/i.test(text)) {
    return {
      construction_type: /i see|would you|did not mean|let me/i.test(text)
        ? 'communicative_expression'
        : /in my culture|unlike|custom|culture/i.test(text)
          ? 'intercultural_expression'
          : /reason why|what impressed|began to realize|behind this/i.test(text)
            ? 'discourse_pattern'
            : 'sentence_pattern',
      teaching_value: 'high',
      student_growth_value: 'high',
      expression_function,
      use_in_generation: true,
    }
  }

  if (patternSignal || englishTokens.length >= 3) {
    return {
      construction_type: /^(be|take|make|show|play|express|share|solve|build|face|achieve)\b/i.test(row.template || row.coreWords)
        ? 'collocation'
        : 'phrase',
      teaching_value: expression_function.includes('general_expression') ? 'medium' : 'high',
      student_growth_value: expression_function.includes('general_expression') ? 'medium' : 'high',
      expression_function,
      use_in_generation: true,
    }
  }

  return {
    construction_type: 'phrase',
    teaching_value: 'medium',
    student_growth_value: 'medium',
    expression_function,
    use_in_generation: true,
  }
}

async function backup(rows: any[]) {
  const affected = rows.filter((row) => {
    const c = classify(row)
    return c.teaching_value === 'low' || c.construction_type === 'vocabulary_only'
  })
  const dir = path.resolve(__dirname, 'backups')
  fs.mkdirSync(dir, { recursive: true })
  const backupPath = path.join(dir, `construction-cleanup-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`)
  fs.writeFileSync(backupPath, JSON.stringify({
    createdAt: new Date().toISOString(),
    affectedCount: affected.length,
    affected,
  }, null, 2), 'utf-8')
  console.log(`Backup written: ${backupPath}`)
}

async function main() {
  console.log('Inspecting construction library for teaching value...')
  const rows = await prisma.construction.findMany({
    select: {
      id: true,
      code: true,
      name: true,
      template: true,
      coreWords: true,
      function: true,
      usageNote: true,
      example: true,
      difficulty: true,
      level: true,
      category: true,
      metadata: true,
    },
  })

  await backup(rows)

  let low = 0
  let high = 0
  let medium = 0

  for (let i = 0; i < rows.length; i += 200) {
    const batch = rows.slice(i, i + 200)
    await prisma.$transaction(batch.map((row) => {
      const classification = classify(row)
      if (classification.teaching_value === 'low') low += 1
      else if (classification.teaching_value === 'high') high += 1
      else medium += 1

      const existing = (row.metadata as any) || {}
      const profile = existing?.recommended_exercise_types ? existing : profileConstruction(row)
      return prisma.construction.update({
        where: { id: row.id },
        data: {
          metadata: {
            ...profile,
            ...existing,
            ...classification,
            cleanup_version: 'expression-value-2026-05',
            cleanup_reviewed_at: new Date().toISOString(),
            source_category: row.category,
          },
          metadataVersion: 'expression-value-2026-05',
          rotationWeight: classification.use_in_generation ? (profile.rotation_weight || 1) : 0,
        },
      })
    }))
  }

  console.log(`Teaching-value classification complete. high=${high}, medium=${medium}, low/excluded=${low}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
