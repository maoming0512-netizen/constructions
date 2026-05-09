import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...\n')

  // ── 1. Admin user ──
  const adminEmail = '279364248@qq.com'
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (!existing) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: await bcrypt.hash('1029384756qaZ@', 10),
        name: 'Admin',
        role: 'admin',
      },
    })
    console.log('✅ Admin user created')
  } else {
    console.log('ℹ️  Admin user exists')
  }

  // ── 2. Constructions from V11 ──
  const constructionsFile = path.resolve(__dirname, '..', 'src', 'data', 'v11-constructions.json')
  if (fs.existsSync(constructionsFile)) {
    const data = JSON.parse(fs.readFileSync(constructionsFile, 'utf-8'))
    console.log(`📚 Found ${data.length} constructions`)

    // Clear & re-import
    await prisma.construction.deleteMany({})
    let batch: any[] = []
    for (const c of data) {
      batch.push({
        code: c.code,
        name: c.name || '',
        template: c.template || '',
        coreWords: c.coreWords || '',
        function: c.function || '',
        usageNote: c.usageNote || '',
        example: c.example || '',
        variants: c.variants || null,
        difficulty: c.difficulty || '',
        level: c.level,
        category: c.category || '',
      })
      if (batch.length >= 500) {
        await prisma.construction.createMany({ data: batch, skipDuplicates: true })
        batch = []
      }
    }
    if (batch.length > 0) {
      await prisma.construction.createMany({ data: batch, skipDuplicates: true })
    }
    console.log(`✅ ${data.length} constructions imported`)
  } else {
    console.log('⚠️  constructions JSON not found, skipping')
  }

  // ── 3. Exercises from exercises-v4.ts ──
  // Dynamically import the exercises
  const exercisesModule = await import('../src/data/exercises-v4')
  const exercises = exercisesModule.v11Exercises || []
  if (exercises.length > 0) {
    const existingCount = await prisma.exercise.count()
    if (existingCount === 0) {
      let eBatch: any[] = []
      for (const ex of exercises) {
        eBatch.push({
          exerciseId: ex.id,
          level: ex.level,
          type: ex.type,
          theme: ex.theme,
          context: ex.context,
          task: ex.task,
          wordCount: ex.wordCount,
          targetConstructions: ex.targetConstructions,
          referenceAnswer: ex.referenceAnswer,
        })
        if (eBatch.length >= 200) {
          await prisma.exercise.createMany({ data: eBatch, skipDuplicates: true })
          eBatch = []
        }
      }
      if (eBatch.length > 0) {
        await prisma.exercise.createMany({ data: eBatch, skipDuplicates: true })
      }
      console.log(`✅ ${exercises.length} exercises imported`)
    } else {
      console.log(`ℹ️  ${existingCount} exercises already exist`)
    }
  }

  console.log('\n🎉 Seeding complete!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
