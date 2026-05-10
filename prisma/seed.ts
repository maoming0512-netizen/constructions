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

  // ── 4. Teaching catalog (Topics + WritingGoals) ──
  const topicCount = await prisma.topic.count()
  const goalCount = await prisma.writingGoal.count()

  if (topicCount === 0) {
    const topics = [
      { slug: 'daily-communication', label: 'Daily Communication', category: 'Communication', description: 'Everyday conversations with friends, family, and classmates.', communicativeFunctions: ['explain', 'invite', 'apologize', 'share'], displayOrder: 1 },
      { slug: 'cultural-exchange', label: 'Cultural Exchange', category: 'Culture', description: 'Explaining Chinese culture to foreign friends.', communicativeFunctions: ['explain', 'compare', 'describe', 'narrate'], displayOrder: 2 },
      { slug: 'problem-solving', label: 'Problem Solving', category: 'Problem', description: 'Discussing problems and proposing solutions.', communicativeFunctions: ['suggest', 'persuade', 'reason', 'resolve'], displayOrder: 3 },
      { slug: 'personal-narrative', label: 'Personal Narrative', category: 'Narrative', description: 'Telling personal stories and experiences.', communicativeFunctions: ['narrate', 'describe', 'reflect', 'express'], displayOrder: 4 },
      { slug: 'academic-discussion', label: 'Academic Discussion', category: 'Academic', description: 'Expressing opinions and arguments on academic topics.', communicativeFunctions: ['argue', 'analyze', 'compare', 'evaluate'], displayOrder: 5 },
      { slug: 'social-media', label: 'Social Media & Tech', category: 'Technology', description: 'Discussing technology, social media, and digital life.', communicativeFunctions: ['describe', 'evaluate', 'persuade', 'express'], displayOrder: 6 },
    ]
    await prisma.topic.createMany({ data: topics })
    console.log(`✅ ${topics.length} topics created`)
  } else {
    console.log(`ℹ️  ${topicCount} topics already exist`)
  }

  if (goalCount === 0) {
    const goals = [
      { slug: 'express-emotion', label: 'Express Emotion Naturally', description: 'Use constructions to express feelings in an authentic way.', communicativePurpose: 'Convey personal feelings and emotional reactions naturally in different social situations.', displayOrder: 1 },
      { slug: 'explain-clearly', label: 'Explain Ideas Clearly', description: 'Use constructions to explain concepts step by step.', communicativePurpose: 'Structure explanations so the listener can follow complex ideas.', displayOrder: 2 },
      { slug: 'make-polite-requests', label: 'Make Polite Requests', description: 'Use indirect constructions for polite communication.', communicativePurpose: 'Ask for help, permissions, or favors without sounding demanding.', displayOrder: 3 },
      { slug: 'describe-experiences', label: 'Describe Experiences', description: 'Use vivid constructions to share personal experiences.', communicativePurpose: 'Tell about past events with sensory detail and emotional weight.', displayOrder: 4 },
      { slug: 'argue-and-persuade', label: 'Argue & Persuade', description: 'Use logical constructions to build convincing arguments.', communicativePurpose: 'Present a point of view with reasons and evidence.', displayOrder: 5 },
      { slug: 'compare-and-contrast', label: 'Compare & Contrast', description: 'Use comparison constructions to highlight similarities and differences.', communicativePurpose: 'Analyze two or more options, ideas, or experiences.', displayOrder: 6 },
    ]
    await prisma.writingGoal.createMany({ data: goals })
    console.log(`✅ ${goals.length} writing goals created`)
  } else {
    console.log(`ℹ️  ${goalCount} goals already exist`)
  }

  // ── 5. Bridge tables: Construction ↔ Topic / Construction ↔ Goal ──
  const constructionTopicCount = await prisma.constructionTopic.count()
  const constructionGoalCount = await prisma.constructionGoal.count()

  if (constructionTopicCount === 0 || constructionGoalCount === 0) {
    const [allConstructions, allTopics, allGoals] = await Promise.all([
      prisma.construction.findMany({ select: { id: true, name: true, function: true, category: true }, take: 200 }),
      prisma.topic.findMany({ where: { active: true }, select: { id: true, label: true, slug: true } }),
      prisma.writingGoal.findMany({ where: { active: true }, select: { id: true, label: true, slug: true } }),
    ])

    if (constructionTopicCount === 0 && allTopics.length > 0) {
      let ctBatch: any[] = []
      for (const c of allConstructions) {
        for (const t of allTopics) {
          const relevance = Math.round((0.3 + Math.random() * 0.7) * 10) / 10
          ctBatch.push({ constructionId: c.id, topicId: t.id, relevanceScore: relevance })
        }
        if (ctBatch.length >= 500) {
          await prisma.constructionTopic.createMany({ data: ctBatch, skipDuplicates: true })
          ctBatch = []
        }
      }
      if (ctBatch.length > 0) {
        await prisma.constructionTopic.createMany({ data: ctBatch, skipDuplicates: true })
      }
      console.log(`✅ ${allConstructions.length * allTopics.length} construction→topic links created`)
    }

    if (constructionGoalCount === 0 && allGoals.length > 0) {
      let cgBatch: any[] = []
      for (const c of allConstructions) {
        for (const g of allGoals) {
          const relevance = Math.round((0.3 + Math.random() * 0.7) * 10) / 10
          cgBatch.push({ constructionId: c.id, goalId: g.id, relevanceScore: relevance })
        }
        if (cgBatch.length >= 500) {
          await prisma.constructionGoal.createMany({ data: cgBatch, skipDuplicates: true })
          cgBatch = []
        }
      }
      if (cgBatch.length > 0) {
        await prisma.constructionGoal.createMany({ data: cgBatch, skipDuplicates: true })
      }
      console.log(`✅ ${allConstructions.length * allGoals.length} construction→goal links created`)
    }
  } else {
    console.log(`ℹ️  ${constructionTopicCount} topic-links, ${constructionGoalCount} goal-links already exist`)
  }

  console.log('\n🎉 Seeding complete!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
