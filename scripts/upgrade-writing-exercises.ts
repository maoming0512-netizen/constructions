import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

const constructionGroups = {
  explainCulture: ['EXP-B-346', 'EXP-C-095', 'C6-131', 'EXP-E-296'],
  politeInvite: ['EXP-C-710', 'C6-126', 'v244', 'C6-200'],
  emotionTurn: ['v216', 'EXP-A-082', 'AC-4.2-47', 'C5-092'],
  actionScene: ['v241', 'v235', 'C5-104', 'EXP-A-247'],
  misunderstanding: ['SUP-411', 'MC-327', 'C6-034', 'C5-092'],
  compareRespectfully: ['IC-274', 'C6-054', 'AC-4.1-09', 'II-056'],
}

const topics = [
  {
    key: 'tea',
    title: 'Explaining Chinese tea culture to a foreign friend',
    topic: 'tea culture',
    scene: 'Li Hua invites Maya, an exchange student from Canada, to a quiet tea house after school. Maya is surprised that the cups are tiny and asks why people drink tea so slowly.',
    role: 'a Chinese student host',
    audience: 'Canadian exchange student',
    goal: 'explain that tea is about patience, attention, and sharing time with others',
    group: 'explainCulture',
  },
  {
    key: 'festival-meal',
    title: 'Why Chinese families eat together during festivals',
    topic: 'festival family dinner',
    scene: 'During the Spring Festival dinner, Leo from Australia notices that Grandma keeps putting food into everyone\'s bowls. He quietly asks whether this is a rule or just a habit.',
    role: 'a family member at dinner',
    audience: 'Australian guest',
    goal: 'explain family care through a concrete dinner scene',
    group: 'politeInvite',
  },
  {
    key: 'school-tour',
    title: 'Showing a foreign student around a Chinese school',
    topic: 'school life',
    scene: 'A new student from Kenya joins Chen Yu\'s class for one week. At lunchtime, she looks uncertain in the busy canteen, holding her tray while students move quickly around her.',
    role: 'a student guide',
    audience: 'new international classmate',
    goal: 'offer help and make the visitor feel included',
    group: 'actionScene',
  },
  {
    key: 'paper-cutting',
    title: 'Describing the meaning of paper-cutting',
    topic: 'paper-cutting art',
    scene: 'At a community workshop, Sofia from Spain tries to cut a red paper fish but tears the tail by accident. The old artist smiles and places another sheet beside her.',
    role: 'a workshop helper',
    audience: 'Spanish visitor',
    goal: 'turn a small mistake into a warm cultural explanation',
    group: 'emotionTurn',
  },
  {
    key: 'calligraphy',
    title: 'Calligraphy as patience and beauty',
    topic: 'Chinese calligraphy',
    scene: 'In the art room, Mr. Lin asks Oliver to write the character he. Oliver presses too hard, and the black stroke spreads like a small cloud on the rice paper.',
    role: 'a student assistant',
    audience: 'British visitor',
    goal: 'explain patience through the movement of the brush',
    group: 'explainCulture',
  },
  {
    key: 'landscape-painting',
    title: 'Introducing Chinese landscape painting',
    topic: 'landscape painting',
    scene: 'At the museum, Amina stands before a long ink painting of mountains and rivers. She wonders why the tiny people in the painting are almost hidden by the landscape.',
    role: 'a museum volunteer',
    audience: 'Moroccan visitor',
    goal: 'explain harmony between people and nature in simple English',
    group: 'compareRespectfully',
  },
  {
    key: 'table-manners',
    title: 'Helping a visitor understand table manners in China',
    topic: 'table manners',
    scene: 'At a class dinner, Ethan reaches for the last piece of fish, then stops when everyone laughs gently. He looks embarrassed, afraid that he has been rude.',
    role: 'a classmate',
    audience: 'American visitor',
    goal: 'solve a small table-manner misunderstanding politely',
    group: 'misunderstanding',
  },
  {
    key: 'greetings',
    title: 'Comparing greeting habits politely',
    topic: 'greeting habits',
    scene: 'When the video meeting begins, Nora waves cheerfully, but several Chinese students first ask whether she has eaten. Nora smiles but does not understand the question.',
    role: 'a meeting partner',
    audience: 'Norwegian student',
    goal: 'explain a greeting habit without judging either culture',
    group: 'compareRespectfully',
  },
  {
    key: 'local-food',
    title: 'Inviting a foreign friend to try local Chinese food',
    topic: 'local food',
    scene: 'In a night market, Priya hesitates before a bowl of spicy rice noodles. The smell is wonderful, but she worries that she may not be able to handle the heat.',
    role: 'a local friend',
    audience: 'Indian friend',
    goal: 'invite someone warmly while respecting their comfort',
    group: 'politeInvite',
  },
  {
    key: 'respect-elders',
    title: 'Explaining respect for elders through daily life',
    topic: 'respect for elders',
    scene: 'On the bus, Ming gives his seat to an elderly woman. His German friend Lukas asks later why Ming did it so naturally without waiting to be asked.',
    role: 'a Chinese teenager',
    audience: 'German friend',
    goal: 'explain respect through a daily action, not a slogan',
    group: 'actionScene',
  },
  {
    key: 'tradition-modern',
    title: 'Balancing tradition and modern life',
    topic: 'tradition and modern life',
    scene: 'Before the school culture fair, Zoe notices that the Chinese students use a tablet to design traditional lantern patterns. She asks whether technology changes the meaning of the festival.',
    role: 'a culture fair organizer',
    audience: 'New Zealand student',
    goal: 'show how young people keep tradition alive in modern ways',
    group: 'compareRespectfully',
  },
  {
    key: 'garden-river',
    title: 'Introducing a Chinese garden and river town',
    topic: 'Chinese landscape',
    scene: 'In a Suzhou garden, Daniel stops beside a winding stone bridge. The pond reflects white walls, dark roofs, and a few falling leaves. He asks why the path never goes straight.',
    role: 'a young guide',
    audience: 'South African visitor',
    goal: 'explain beauty, balance, and quiet discovery in a real place',
    group: 'explainCulture',
  },
] as const

const modeInfo = {
  D1: {
    mode: 'student_continuation',
    wordCount: '40-60 words',
    task: 'Continue the scene in 40-60 words. Focus on one small action or emotional turn, and use the target constructions naturally.',
  },
  D2: {
    mode: 'student_continuation',
    wordCount: '100-150 words',
    task: 'Continue the scene in 100-150 words. Keep it coherent and natural; do not turn it into a full essay.',
  },
  GAP: {
    mode: 'gap_continuation',
    wordCount: '1-2 guided blanks',
    task: 'Fill in the blank creatively. The missing sentence should develop emotion, action, explanation, or transition.',
  },
  CG: {
    mode: 'construction_guided_continuation',
    wordCount: '80-120 words',
    task: 'Continue the scene with guidance from the target constructions. Use them naturally, not mechanically.',
  },
} as const

function reference(type: keyof typeof modeInfo, title: string) {
  if (type === 'D1') return ''
  if (type === 'D2') {
    return 'Li Hua smiled and slowed down his explanation. Instead of giving a long speech, he showed his friend one small detail and explained why it mattered. The visitor tried again, this time more carefully, and the moment became easier for both of them. Although their habits were different, the conversation made them curious rather than uncomfortable. By the end, the friend said that the tradition felt less distant because it was connected with ordinary kindness. Li Hua felt grateful for the question, because it helped him see his own culture with fresh eyes.'
  }
  if (type === 'GAP') {
    return 'Blank 1: Li Hua explained the meaning gently so that his friend could connect the custom with real family care, not just rules.'
  }
  return 'Li Hua first showed his friend a small detail, then explained its meaning in simple English. His friend found it easier to understand the tradition when it was connected with a real person and a real action. The conversation was not only about culture, but also about respect. By the end, both of them felt more comfortable asking questions.'
}

async function main() {
  const backupDir = path.resolve(__dirname, 'backups')
  fs.mkdirSync(backupDir, { recursive: true })
  const current = await prisma.$queryRawUnsafe<any[]>('SELECT * FROM "Exercise" ORDER BY "exerciseId" ASC')
  fs.writeFileSync(
    path.join(backupDir, `exercise-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`),
    JSON.stringify(current, null, 2),
    'utf-8'
  )

  await prisma.$executeRawUnsafe('ALTER TABLE "Exercise" ADD COLUMN IF NOT EXISTS "metadata" JSONB')
  await prisma.$executeRawUnsafe('ALTER TABLE "AIGeneratedExercise" ADD COLUMN IF NOT EXISTS "metadata" JSONB')

  const allCodes = Array.from(new Set(Object.values(constructionGroups).flat()))
  const constructions = await prisma.construction.findMany({ where: { code: { in: allCodes } } })
  const byCode = new Map(constructions.map((c) => [c.code, c]))

  let count = 0
  for (const topic of topics) {
    const codes = constructionGroups[topic.group].filter((code) => byCode.has(code)).slice(0, 4)
    const targetConstructions = codes.map((code) => {
      const c = byCode.get(code)!
      return {
        code: c.code,
        construction: c.name,
        meaning_zh: c.function,
        function: c.function,
        example: c.example,
      }
    })

    for (const type of ['D2', 'D1', 'GAP', 'CG'] as const) {
      const info = modeInfo[type]
      const exerciseId = `CULT-${type}-${topic.key.toUpperCase()}`
      const context = type === 'GAP'
        ? `${topic.scene} [Blank 1] After that, the conversation became warmer, and both students were willing to ask more questions.`
        : topic.scene

      await prisma.exercise.upsert({
        where: { exerciseId },
        update: {
          level: 'senior',
          type,
          theme: topic.title,
          context,
          task: `${info.task} Writing goal: ${topic.goal}.`,
          wordCount: info.wordCount,
          targetConstructions: codes.join(', '),
          referenceAnswer: reference(type, topic.title),
          metadata: {
            mode: info.mode,
            topic: topic.topic,
            intercultural_theme: topic.title,
            communicative_situation: topic.scene,
            student_role: topic.role,
            audience: topic.audience,
            teaching_objective: topic.goal,
            target_constructions: targetConstructions,
            blanks: type === 'GAP' ? [{
              blank_id: 1,
              guidance: `Write one sentence that helps ${topic.audience} understand the cultural meaning through the scene.`,
              suggested_constructions: codes.slice(0, 2),
            }] : [],
            tags: ['intercultural communication', topic.topic, 'Chinese culture', type],
          },
          isPublished: true,
        },
        create: {
          exerciseId,
          level: 'senior',
          type,
          theme: topic.title,
          context,
          task: `${info.task} Writing goal: ${topic.goal}.`,
          wordCount: info.wordCount,
          targetConstructions: codes.join(', '),
          referenceAnswer: reference(type, topic.title),
          metadata: {
            mode: info.mode,
            topic: topic.topic,
            intercultural_theme: topic.title,
            communicative_situation: topic.scene,
            student_role: topic.role,
            audience: topic.audience,
            teaching_objective: topic.goal,
            target_constructions: targetConstructions,
            blanks: type === 'GAP' ? [{
              blank_id: 1,
              guidance: `Write one sentence that helps ${topic.audience} understand the cultural meaning through the scene.`,
              suggested_constructions: codes.slice(0, 2),
            }] : [],
            tags: ['intercultural communication', topic.topic, 'Chinese culture', type],
          },
          isPublished: true,
        },
      })
      count += 1
    }
  }

  await prisma.exercise.updateMany({
    where: { type: 'D1', exerciseId: { startsWith: 'DSR-D1-' } },
    data: { wordCount: '40-60 words' },
  })
  await prisma.exercise.updateMany({
    where: { type: 'D2' },
    data: { wordCount: '100-150 words' },
  })

  console.log(`Upserted ${count} culture-focused writing exercises and backed up ${current.length} existing rows.`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
