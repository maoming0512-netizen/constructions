import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const VERSION = 'active-construction-refinement-2026-05'

type ConstructionRow = Awaited<ReturnType<typeof prisma.construction.findMany>>[number]

const morphologySignals = [
  'S8',
  '词法形态',
  'Prefix',
  'Suffix',
  'prefix',
  'suffix',
  '前缀',
  '后缀',
  '词根',
  '派生',
  '复合词',
  '缩写',
]

function metadataObject(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
}

function compactText(row: ConstructionRow) {
  return [row.code, row.name, row.template, row.category, row.function, row.usageNote].join(' ')
}

function isSingleWordEntry(row: ConstructionRow) {
  const template = (row.template || row.name || '').trim()
  return /^[A-Za-z]+$/.test(template)
}

function isMorphologyOnly(row: ConstructionRow) {
  const text = compactText(row)
  return morphologySignals.some((signal) => text.includes(signal))
}

function hasUsefulExpressionShape(row: ConstructionRow) {
  const template = (row.template || row.name || '').trim()
  const name = (row.name || '').trim()
  const example = (row.example || '').trim()
  if (!template || !example) return false
  if (isSingleWordEntry(row) || isMorphologyOnly(row)) return false
  if (template.includes('+') || template.includes('...') || template.includes('/') || template.includes('?')) return true
  const englishWordCount = (template.match(/[A-Za-z]+/g) || []).length
  const nameWordCount = (name.match(/[A-Za-z]+/g) || []).length
  return englishWordCount >= 2 || nameWordCount >= 2
}

function inferConstructionType(row: ConstructionRow) {
  const text = `${row.template} ${row.name}`.toLowerCase()
  if (/^(what|the reason why|it is|there is|there are|compared with|the more|not only|whether|if only|as long as)/.test(text)) return 'sentence_pattern'
  if (/^(to begin with|at first|from this|in other words|on the one hand|as a result|for example|above all)/.test(text)) return 'discourse_pattern'
  if (/(i see your point|let me|i understand|would you mind|could you|how about|what about)/.test(text)) return 'communicative_expression'
  if (/^(make|take|give|have|build|solve|face|achieve|express|play|pay|draw|reach|keep|show|gain)\b/.test(text)) return 'collocation'
  if (/(be |get |in |on |at |for |with |to )/.test(text)) return 'phrase'
  return 'phrase'
}

function exclusionReason(row: ConstructionRow) {
  if (isSingleWordEntry(row)) return 'single_word'
  if (isMorphologyOnly(row)) return 'morphology_only'
  return null
}

async function main() {
  const rows = await prisma.construction.findMany({ orderBy: { code: 'asc' } })
  const affected = rows.filter((row) => exclusionReason(row) || hasUsefulExpressionShape(row))

  const backupDir = path.join(process.cwd(), 'scripts', 'backups')
  await mkdir(backupDir, { recursive: true })
  const backupPath = path.join(backupDir, `active-construction-refinement-${new Date().toISOString().replace(/[:.]/g, '-')}.json`)
  await writeFile(backupPath, JSON.stringify({
    version: VERSION,
    createdAt: new Date().toISOString(),
    affectedCount: affected.length,
    rows: affected,
  }, null, 2), 'utf8')

  let excluded = 0
  let promoted = 0
  let preserved = 0

  for (const row of rows) {
    const metadata = metadataObject(row.metadata)
    const reason = exclusionReason(row)

    if (reason) {
      await prisma.construction.update({
        where: { id: row.id },
        data: {
          rotationWeight: 0,
          metadataVersion: VERSION,
          metadata: {
            ...metadata,
            construction_type: reason === 'single_word' ? 'vocabulary_only' : 'morphology_only',
            teaching_value: 'low',
            student_growth_value: 'low',
            use_in_generation: false,
            active_for_learning: false,
            vocabulary_only: reason === 'single_word',
            excluded_reason: reason,
            cleanup_version: VERSION,
            cleanup_reviewed_at: new Date().toISOString(),
          },
        },
      })
      excluded += 1
      continue
    }

    if (!hasUsefulExpressionShape(row)) {
      preserved += 1
      continue
    }

    await prisma.construction.update({
      where: { id: row.id },
      data: {
        rotationWeight: row.rotationWeight > 0 ? Math.max(row.rotationWeight, 1) : row.rotationWeight,
        metadataVersion: VERSION,
        metadata: {
          ...metadata,
          construction_type: metadata.construction_type || inferConstructionType(row),
          teaching_value: 'high',
          student_growth_value: 'high',
          use_in_generation: row.rotationWeight > 0,
          active_for_learning: row.rotationWeight > 0,
          vocabulary_only: false,
          cleanup_version: VERSION,
          cleanup_reviewed_at: new Date().toISOString(),
          quality_principle: 'meaningful_construction_not_isolated_vocabulary',
        },
      },
    })
    promoted += 1
  }

  const [total, active, activeHigh, inactive] = await Promise.all([
    prisma.construction.count(),
    prisma.construction.count({
      where: {
        rotationWeight: { gt: 0 },
        NOT: { metadata: { path: ['use_in_generation'], equals: false } as any },
      },
    }),
    prisma.construction.count({
      where: {
        rotationWeight: { gt: 0 },
        metadata: { path: ['teaching_value'], equals: 'high' } as any,
        NOT: { metadata: { path: ['use_in_generation'], equals: false } as any },
      },
    }),
    prisma.construction.count({
      where: {
        OR: [
          { rotationWeight: { lte: 0 } },
          { metadata: { path: ['use_in_generation'], equals: false } as any },
          { metadata: { path: ['active_for_learning'], equals: false } as any },
        ],
      },
    }),
  ])

  console.log(JSON.stringify({ backupPath, total, active, activeHigh, inactive, excluded, promoted, preserved }, null, 2))
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
