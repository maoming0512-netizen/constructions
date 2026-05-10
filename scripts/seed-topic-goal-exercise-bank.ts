import { PrismaClient } from '@prisma/client'
import { buildContentSignature, GENERATION_VERSION, PROMPT_VERSION } from '../src/lib/exercises/exerciseBank'

const prisma = new PrismaClient()

const TARGET_PER_COMBO = Number(process.env.TOPIC_GOAL_EXERCISE_TARGET || 50)
const BANK_VERSION = 'topic-goal-bank-2026-05-v1'

type ExerciseKind =
  | 'construction_imitation'
  | 'micro_continuation'
  | 'short_continuation_50'
  | 'long_continuation'

type Focus = {
  scene: string
  chineseSituation: string
  role: string
  tension: string
  modernDetail: string
}

function focusFor(topic: { slug?: string; label: string; category: string; description: string }): Focus {
  const text = `${topic.slug ?? ''} ${topic.label} ${topic.category} ${topic.description}`.toLowerCase()
  if (text.includes('ai')) return {
    scene: 'a class discussion about using AI learning tools responsibly',
    chineseSituation: '你想向一位外国同学解释：AI 可以帮助学习，但不能代替自己的思考。',
    role: 'a student explaining study choices to an international classmate',
    tension: 'one classmate worries that using AI is simply cheating',
    modernDetail: 'drafting a study plan with an AI tool after school',
  }
  if (text.includes('internship') || text.includes('university')) return {
    scene: 'a conversation about majors, internships, and future plans',
    chineseSituation: '你想说明：选择专业不仅是为了稳定，也和兴趣、能力、长期成长有关。',
    role: 'a senior student talking with an international roommate',
    tension: 'family expectations and personal interests do not fully match',
    modernDetail: 'checking internship posts on a phone before dinner',
  }
  if (text.includes('animation') || text.includes('games') || text.includes('media')) return {
    scene: 'a club chat about animation, games, and youth culture',
    chineseSituation: '你想解释：喜欢动画或游戏并不只是娱乐，也可能包含审美、团队合作和文化理解。',
    role: 'a club member recommending a meaningful work to a foreign friend',
    tension: 'the other person thinks the hobby is childish at first',
    modernDetail: 'sharing a short video clip during a club break',
  }
  if (text.includes('milk') || text.includes('coffee') || text.includes('food delivery')) return {
    scene: 'an after-class conversation about milk tea, coffee, and food delivery',
    chineseSituation: '你想说明：一杯奶茶有时不是浪费，而是学生忙碌生活里的小小放松。',
    role: 'a local student helping an exchange student understand daily routines',
    tension: 'the visitor is surprised by how often students order drinks online',
    modernDetail: 'ordering drinks through a delivery app after a long class',
  }
  if (text.includes('teamwork') || text.includes('feedback')) return {
    scene: 'a group project where different feedback styles create a misunderstanding',
    chineseSituation: '你想缓和语气，解释直接反馈并不一定是不尊重，而是希望项目变得更好。',
    role: 'a teammate repairing a misunderstanding in a mixed-culture group',
    tension: 'one student feels hurt by direct comments on the project',
    modernDetail: 'editing a shared slide deck before the presentation',
  }
  if (text.includes('online')) return {
    scene: 'an online friendship where tone in messages is misunderstood',
    chineseSituation: '你想解释：线上聊天里语气容易被误解，所以需要更清楚、更温和地表达。',
    role: 'a student keeping a friendship across distance',
    tension: 'a short message sounds colder than the writer intended',
    modernDetail: 'replying to a voice message late at night',
  }
  if (text.includes('family') || text.includes('dream')) return {
    scene: 'a quiet talk about family expectations and personal dreams',
    chineseSituation: '你想说明：尊重家人的期待，并不意味着放弃自己的选择。',
    role: 'a student explaining personal dreams with respect',
    tension: 'parents hope for one path while the student imagines another',
    modernDetail: 'looking at application pages after a family dinner',
  }
  if (text.includes('study')) return {
    scene: 'a peer conversation about study pressure and learning habits',
    chineseSituation: '你想告诉外国同学：中国学生面对压力时，也在寻找更健康的学习方法。',
    role: 'a student sharing learning pressure honestly',
    tension: 'a friend thinks exam pressure is easy to solve from the outside',
    modernDetail: 'planning revision time between homework and club activities',
  }
  if (text.includes('city') || text.includes('commuting') || text.includes('travel')) return {
    scene: 'a city walk where a local student explains transport and daily habits',
    chineseSituation: '你想帮助来访学生理解地铁、共享单车和城市生活节奏。',
    role: 'a local guide helping a visiting student move through the city',
    tension: 'the visitor is confused by the speed and small rules of commuting',
    modernDetail: 'using a map app near a busy subway station',
  }
  if (text.includes('friendship') || text.includes('empathy')) return {
    scene: 'a friendship moment where one student tries to comfort another',
    chineseSituation: '你想安慰朋友，同时让对方感到被理解，而不是被说教。',
    role: 'a friend responding with warmth and patience',
    tension: 'a friend feels embarrassed after making a cultural mistake',
    modernDetail: 'sitting beside a friend after a school activity',
  }
  if (text.includes('global')) return {
    scene: 'a youth culture discussion about music, hobbies, and social media habits',
    chineseSituation: '你想比较不同国家年轻人的兴趣，同时说明大家也有相似的情感需求。',
    role: 'a student comparing youth culture with an international peer',
    tension: 'two students notice that the same trend means different things in different places',
    modernDetail: 'scrolling through playlists and short videos together',
  }
  if (text.includes('tradition')) return {
    scene: 'a discussion about tradition in modern student life',
    chineseSituation: '你想解释：传统并不只存在于节日里，也会出现在年轻人的日常选择中。',
    role: 'a student explaining how tradition changes in modern life',
    tension: 'a friend assumes tradition is distant from young people',
    modernDetail: 'wearing a modern outfit with a small traditional design',
  }
  if (text.includes('festival')) return {
    scene: 'a family festival meal with an exchange student',
    chineseSituation: '你想解释节日聚餐背后的亲情、礼貌和共同记忆。',
    role: 'a host student helping a guest understand a family custom',
    tension: 'the guest sees only the food but not the emotional meaning',
    modernDetail: 'taking a family photo before dinner starts',
  }
  if (text.includes('hospitality') || text.includes('food')) return {
    scene: 'a meal where a student helps a guest understand hospitality',
    chineseSituation: '你想解释：不断劝客人多吃一点，有时表达的是关心，而不是压力。',
    role: 'a host explaining table manners gently',
    tension: 'the guest feels unsure whether refusing food is impolite',
    modernDetail: 'choosing dishes together through a QR-code menu',
  }
  if (text.includes('art') || text.includes('heritage')) return {
    scene: 'a museum visit where students discuss a cultural object',
    chineseSituation: '你想把一件展品的文化意义讲清楚，而不是只介绍它的年代。',
    role: 'a student making heritage feel alive for a visiting peer',
    tension: 'the visitor likes the object but does not understand why it matters',
    modernDetail: 'using the museum audio guide and taking notes on a phone',
  }
  return {
    scene: `a real conversation about ${topic.label}`,
    chineseSituation: `你想围绕 ${topic.label} 自然表达自己的看法，并帮助外国同学理解背后的意义。`,
    role: 'a student speaking with an international peer',
    tension: 'a small difference in experience creates a real need to explain',
    modernDetail: 'talking after class with phones and notebooks on the desk',
  }
}

function kindFor(index: number): ExerciseKind {
  if (index < 28) return 'construction_imitation'
  if (index < 37) return 'micro_continuation'
  if (index < 44) return 'short_continuation_50'
  return 'long_continuation'
}

function legacyType(kind: ExerciseKind) {
  if (kind === 'construction_imitation') return 'IM'
  if (kind === 'long_continuation') return 'D2'
  return 'D1'
}

function wordCount(kind: ExerciseKind) {
  if (kind === 'construction_imitation') return 'one natural English sentence'
  if (kind === 'micro_continuation') return '1-2 sentences'
  if (kind === 'short_continuation_50') return '45-60 words'
  return '100-150 words'
}

function cleanTemplate(construction: any) {
  return bestConstructionText(construction)
}

function displayMeaning(construction: any) {
  return String(construction.function || construction.usageNote || '表达一个清楚、自然、可用于真实交流的意义。')
}

function modelSentence(construction: any, focus: Focus) {
  const example = String(construction.example || '').split('/')[0].trim()
  if (example && example.length < 180) return example
  const template = cleanTemplate(construction).replace(/\s*\+.*$/, '').replace(/\.\.\./g, '')
  return `In ${focus.scene}, I tried to use "${template}" to make my meaning clearer and more respectful.`
}

function referenceSentence(construction: any, focus: Focus, goal: any, index: number) {
  const template = cleanTemplate(construction).replace(/\.\.\./g, '').replace(/\s*\+.*$/, '').trim()
  const options = [
    modelSentence(construction, focus),
    `This small moment helped me explain my idea more clearly and stay respectful at the same time.`,
    `I realized that good communication is not only about correct words, but also about timing, tone, and care.`,
    `Instead of judging the difference too quickly, we used it as a chance to understand each other better.`,
    `The conversation became easier when I connected the example with real student life.`,
  ]
  if (/^(what|the reason|it is|compared|from this|at first|to begin|this does|i see|let me|maybe|i understand)/i.test(template)) {
    return modelSentence(construction, focus)
  }
  return options[index % options.length]
}

function buildExercise(input: {
  index: number
  topic: any
  goal: any
  focus: Focus
  targets: any[]
  kind: ExerciseKind
}) {
  const [primary, secondary, third] = input.targets
  const primaryText = cleanTemplate(primary)
  const primaryMeaning = displayMeaning(primary)
  const model = modelSentence(primary, input.focus)
  const reference = referenceSentence(primary, input.focus, input.goal, input.index)

  if (input.kind === 'construction_imitation') {
    const primaryMetadata = primary.metadata || {}
    const tryPrompt = primaryMetadata.imitation_prompt_zh || input.focus.chineseSituation
    const commonError = primaryMetadata.common_error ? `Common pitfall: ${primaryMetadata.common_error}` : ''
    return {
      context: [
        'Construction card',
        `Target construction: ${primaryText}`,
        `Chinese meaning: ${primaryMeaning}`,
        `Communicative usage: ${primary.usageNote || input.goal.communicativePurpose}`,
        commonError,
        `Common scene: ${input.focus.scene}`,
        '',
        `Model sentence: ${model}`,
        primaryMetadata.example_zh ? `Model sentence Chinese: ${primaryMetadata.example_zh}` : '',
        '',
        `Now try: ${tryPrompt}`,
      ].filter(Boolean).join('\n'),
      task: `Use the same construction naturally. This is not word-by-word translation; use "${primaryText}" to express the meaning in a believable communicative sentence.`,
      referenceAnswer: model,
      target: [primary],
    }
  }

  if (input.kind === 'micro_continuation') {
    return {
      context: `${input.focus.scene}. You are ${input.focus.role}. ${input.focus.tension}. The moment is small, but the tone matters.`,
      task: `Continue in 1-2 natural English sentences. Use at least one target construction to support the goal: ${input.goal.label}.`,
      referenceAnswer: `${reference} I added one concrete example, and the other student began to understand why the moment mattered.`,
      target: [primary, secondary],
    }
  }

  if (input.kind === 'short_continuation_50') {
    return {
      context: `${input.focus.scene}. ${input.focus.modernDetail}. At first, both sides thought the answer would be simple, but ${input.focus.tension}. A direct translation would not be enough.`,
      task: `Continue in about 50 words. Make the explanation concrete, keep the tone natural, and use 1-2 target constructions.`,
      referenceAnswer: `${reference} I gave a real example from school life and avoided making the difference sound strange. Slowly, the conversation became warmer. What mattered most was not proving who was right, but helping both sides feel understood.`,
      target: [primary, secondary, third],
    }
  }

  return {
    context: `${input.focus.scene}. ${input.focus.modernDetail}. The conversation paused because ${input.focus.tension}. You wanted to answer carefully. If you only translated the words, the other person might still miss the emotion, the relationship, or the cultural reason behind the action. You decided to explain the situation through a small example from student life, then guide the conversation toward understanding.`,
    task: `Continue the scene in 100-150 words. Use the target constructions naturally to meet the goal: ${input.goal.label}. Show a clear emotional or interpersonal turn, and avoid a slogan-like ending.`,
    referenceAnswer: `${reference} I spoke slowly and connected the idea with something we had both experienced at school. At first, my classmate looked unsure, but later the example made the meaning easier to feel. I also admitted that people in my own culture may understand the habit in different ways. This made the conversation less like a debate and more like a shared discovery. By the end, we were not simply comparing customs; we were learning how to listen with more patience.`,
    target: [primary, secondary, third],
  }
}

async function getConstructionPool() {
  const rows = await prisma.construction.findMany({
    where: {
      rotationWeight: { gt: 0 },
      metadata: { path: ['teaching_value'], equals: 'high' } as any,
      NOT: [
        { metadata: { path: ['use_in_generation'], equals: false } as any },
        { metadata: { path: ['vocabulary_only'], equals: true } as any },
        { metadata: { path: ['construction_type'], equals: 'morphology_only' } as any },
      ],
    },
    orderBy: [{ usageCount: 'asc' }, { code: 'asc' }],
  })
  const preferred = rows.filter(isDirectlyTeachableConstruction)
  const curated = preferred.filter((row) => String(row.category || '').startsWith('curated_'))
  const sortedCurated = curated.sort((a: any, b: any) => {
    const aCore = a.metadata?.curated_priority === 'core_high_value' ? 0 : 1
    const bCore = b.metadata?.curated_priority === 'core_high_value' ? 0 : 1
    if (aCore !== bCore) return aCore - bCore
    return String(a.code).localeCompare(String(b.code))
  })
  if (sortedCurated.length >= 30) return sortedCurated
  if (preferred.length < 80) throw new Error(`Need at least 80 directly teachable constructions, found ${preferred.length}`)
  return preferred.slice(0, 120)
}

function englishWordCount(text: string) {
  return (text.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g) || []).length
}

function hasCjk(text: string) {
  return /[\u3400-\u9fff]/.test(text)
}

function bestConstructionText(construction: any) {
  const name = String(construction.name || '').replace(/\s+/g, ' ').trim()
  const template = String(construction.template || '').replace(/\s+/g, ' ').trim()
  if (name && !hasCjk(name) && englishWordCount(name) >= 2) return name
  if (template && !hasCjk(template) && englishWordCount(template) >= 2) return template
  return name || template
}

function isDirectlyTeachableConstruction(construction: any) {
  const category = String(construction.category || '')
  if (category.includes('S8') || category.includes('词法形态')) return false
  if (!/^(curated_|Exp|S1|S2|S3|S5|S7|S9)/.test(category)) return false
  const text = bestConstructionText(construction)
  if (!text || hasCjk(text)) return false
  if (/^(prefix|suffix|root)\b/i.test(text)) return false
  if (/[{}[\]]/.test(text)) return false
  if (/^[A-Za-z]+$/.test(text)) return false
  return englishWordCount(text) >= 2
}

async function archiveOldTopicBank() {
  return prisma.exercise.updateMany({
    where: {
      source: 'official',
      exerciseId: { startsWith: 'OFF-' },
      NOT: { exerciseId: { startsWith: 'OFFC-' } },
    },
    data: {
      publishStatus: 'archived',
      isPublic: false,
      isPublished: false,
      archivedAt: new Date(),
      reviewNotes: {
        archived_by: BANK_VERSION,
        reason: 'Replaced by topic-goal bank with 50 exercises per topic-goal combination.',
      },
    },
  })
}

async function seedCombo(topic: any, goal: any, pool: any[]) {
  const focus = focusFor(topic)
  let created = 0

  for (let i = 0; i < TARGET_PER_COMBO; i += 1) {
    const kind = kindFor(i)
    const primaryPool = kind === 'construction_imitation'
      ? pool.filter((construction: any) => construction.metadata?.curated_priority === 'core_high_value')
      : pool
    const usablePool = primaryPool.length ? primaryPool : pool
    const baseIndex = Math.abs((topic.slug.length * 17 + goal.slug.length * 11 + i * 7) % usablePool.length)
    const targets = [
      usablePool[baseIndex],
      pool[(baseIndex + 19) % pool.length],
      pool[(baseIndex + 43) % pool.length],
    ]
    const exercise = buildExercise({ index: i, topic, goal, focus, targets, kind })
    const constructionCodes = exercise.target.map((c: any) => c.code)
    const signature = buildContentSignature({
      topicId: topic.id,
      goalId: goal.id,
      level: topic.minLevel === 'senior' ? 'senior' : 'junior',
      exerciseType: kind,
      constructionCodes,
      context: exercise.context,
      task: exercise.task,
    })
    const exerciseId = `OFFC-${topic.slug}-${goal.slug}-${String(i + 1).padStart(3, '0')}`.replace(/[^A-Za-z0-9_-]/g, '-')
    const already = await prisma.exercise.findUnique({ where: { exerciseId }, select: { id: true } })
    const metadata = {
      source: 'official',
      topic_id: topic.id,
      goal_id: goal.id,
      adaptive_exercise_type: kind,
      exercise_type_label: kind.replace(/_/g, ' '),
      bank_version: BANK_VERSION,
      quality_principle: 'construction-guided intercultural expression practice',
      target_constructions: exercise.target.map((c: any) => ({
        id: c.id,
        code: c.code,
        construction: bestConstructionText(c),
        template: bestConstructionText(c),
        meaning_zh: c.function,
        communicative_function: c.metadata?.communicative_function || [],
        emotional_function: c.metadata?.emotional_function || [],
        usage_scene: focus.scene,
        example: c.example,
        example_zh: c.metadata?.example_zh || '',
        why_useful: c.usageNote,
        common_error: c.metadata?.common_error || '',
        common_error_risk: c.metadata?.common_error_risk || [],
      })),
      highlighted_constructions: exercise.target.map((c: any) => bestConstructionText(c)),
      prompt_version: PROMPT_VERSION,
      generation_version: GENERATION_VERSION,
    }

    await prisma.exercise.upsert({
      where: { exerciseId },
      update: {
        level: topic.minLevel === 'senior' ? 'senior' : 'junior',
        type: legacyType(kind),
        theme: topic.label,
        context: exercise.context,
        task: exercise.task,
        wordCount: wordCount(kind),
        targetConstructions: constructionCodes.join(', '),
        referenceAnswer: exercise.referenceAnswer,
        metadata,
        topicId: topic.id,
        goalId: goal.id,
        exerciseType: kind,
        constructionIds: exercise.target.map((c: any) => c.id),
        qualityStatus: 'approved',
        publishStatus: 'published',
        isPublic: true,
        isPublished: true,
        reviewedAt: new Date(),
        approvedAt: new Date(),
        pedagogicalFitScore: 9.1,
        fitReason: `Curated ${kind} for ${topic.label} + ${goal.label}, with construction-first intercultural expression practice.`,
        generationVersion: GENERATION_VERSION,
        promptVersion: PROMPT_VERSION,
        skillsVersion: PROMPT_VERSION,
        constructionMetadataVersion: BANK_VERSION,
        topicVersion: topic.version,
        contentSignature: signature,
      },
      create: {
        exerciseId,
        level: topic.minLevel === 'senior' ? 'senior' : 'junior',
        type: legacyType(kind),
        theme: topic.label,
        context: exercise.context,
        task: exercise.task,
        wordCount: wordCount(kind),
        targetConstructions: constructionCodes.join(', '),
        referenceAnswer: exercise.referenceAnswer,
        source: 'official',
        isPublic: true,
        isPublished: true,
        topicId: topic.id,
        goalId: goal.id,
        exerciseType: kind,
        constructionIds: exercise.target.map((c: any) => c.id),
        qualityStatus: 'approved',
        publishStatus: 'published',
        reviewedAt: new Date(),
        approvedAt: new Date(),
        pedagogicalFitScore: 9.1,
        fitReason: `Curated ${kind} for ${topic.label} + ${goal.label}, with construction-first intercultural expression practice.`,
        generationVersion: GENERATION_VERSION,
        promptVersion: PROMPT_VERSION,
        skillsVersion: PROMPT_VERSION,
        constructionMetadataVersion: BANK_VERSION,
        topicVersion: topic.version,
        contentSignature: signature,
        metadata,
      },
    })
    if (!already) created += 1
  }

  return created
}

async function main() {
  const [topics, goals, pool] = await Promise.all([
    prisma.topic.findMany({ where: { active: true }, orderBy: { displayOrder: 'asc' } }),
    prisma.writingGoal.findMany({ where: { active: true }, orderBy: { displayOrder: 'asc' } }),
    getConstructionPool(),
  ])

  const archived = await archiveOldTopicBank()
  let totalCreated = 0
  for (const topic of topics) {
    for (const goal of goals) {
      const created = await seedCombo(topic, goal, pool)
      totalCreated += created
      console.log(`${topic.slug} + ${goal.slug}: created=${created}, target=${TARGET_PER_COMBO}`)
    }
  }

  const comboCounts: number[] = []
  for (const topic of topics) {
    for (const goal of goals) {
      comboCounts.push(await prisma.exercise.count({
        where: {
          exerciseId: { startsWith: `OFFC-${topic.slug}-${goal.slug}-` },
          source: 'official',
          qualityStatus: 'approved',
          publishStatus: 'published',
        },
      }))
    }
  }

  console.log(JSON.stringify({
    bankVersion: BANK_VERSION,
    archivedOldTopicBank: archived.count,
    created: totalCreated,
    combos: comboCounts.length,
    minCombo: Math.min(...comboCounts),
    maxCombo: Math.max(...comboCounts),
    expectedPerCombo: TARGET_PER_COMBO,
  }, null, 2))
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
