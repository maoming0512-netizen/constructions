import { PrismaClient } from '@prisma/client'
import { buildContentSignature, PROMPT_VERSION, GENERATION_VERSION } from '../src/lib/exercises/exerciseBank'

const prisma = new PrismaClient()

const TARGET_PER_TOPIC = Number(process.env.TOPIC_EXERCISE_TARGET || 50)
const BANK_VERSION = 'topic-bank-2026-05-expression-first'
const NEUTRAL_FOCUS = {
  scene: 'a real intercultural conversation between students',
  zh: '在一次真实的跨文化学生交流中',
  audience: 'an international peer',
}

type ExerciseKind =
  | 'construction_imitation'
  | 'micro_continuation'
  | 'short_continuation_50'
  | 'long_continuation'

type ConstructionSeed = {
  template: string
  meaning: string
  usage: string
  type: string
  functions: string[]
  scene: string
  tone?: string
}

const constructionSeeds: ConstructionSeed[] = [
  { template: 'be curious about...', meaning: '对……感到好奇', usage: 'Use it to show sincere interest in another person, habit, or idea.', type: 'phrase', functions: ['curiosity', 'asking_respectfully'], scene: 'peer conversation', tone: 'open and friendly' },
  { template: 'be proud of...', meaning: '为……感到自豪', usage: 'Use it to express positive identity or appreciation without sounding boastful.', type: 'phrase', functions: ['emotional_expression', 'identity'], scene: 'sharing personal experience', tone: 'warm' },
  { template: 'be willing to...', meaning: '愿意……', usage: 'Use it to show readiness to help, try, or understand.', type: 'phrase', functions: ['offer', 'cooperation'], scene: 'teamwork or friendship', tone: 'cooperative' },
  { template: 'get used to...', meaning: '逐渐习惯……', usage: 'Use it to describe adaptation to a new environment or cultural habit.', type: 'phrase', functions: ['adaptation', 'reflection'], scene: 'intercultural adjustment' },
  { template: 'take part in...', meaning: '参加……', usage: 'Use it for school, community, and cultural activities.', type: 'collocation', functions: ['participation'], scene: 'campus activity' },
  { template: 'play an important role in...', meaning: '在……中发挥重要作用', usage: 'Use it to explain why something matters in a system or relationship.', type: 'sentence_pattern', functions: ['explanation'], scene: 'discussion or reflection' },
  { template: 'express an opinion', meaning: '表达观点', usage: 'Use it when joining a discussion politely and clearly.', type: 'collocation', functions: ['opinion'], scene: 'class discussion' },
  { template: 'make a decision', meaning: '做决定', usage: 'Use it when describing choices, pressure, or future planning.', type: 'collocation', functions: ['choice', 'future_planning'], scene: 'personal decision' },
  { template: 'face pressure', meaning: '面对压力', usage: 'Use it to talk about study, family, or teamwork pressure naturally.', type: 'collocation', functions: ['emotional_expression'], scene: 'student life' },
  { template: 'achieve a goal', meaning: '实现目标', usage: 'Use it to discuss effort and progress without sounding like a slogan.', type: 'collocation', functions: ['reflection'], scene: 'learning or career' },
  { template: 'solve a misunderstanding', meaning: '化解误会', usage: 'Use it when people repair communication after confusion.', type: 'collocation', functions: ['repair'], scene: 'intercultural misunderstanding' },
  { template: 'build a friendship', meaning: '建立友谊', usage: 'Use it to describe relationship growth through real interaction.', type: 'collocation', functions: ['relationship'], scene: 'peer communication' },
  { template: 'What impressed me most was...', meaning: '最让我印象深刻的是……', usage: 'Use it to highlight the most meaningful detail in an experience.', type: 'sentence_pattern', functions: ['reflection', 'emphasis'], scene: 'narrative reflection' },
  { template: 'The reason why... is that...', meaning: '……的原因是……', usage: 'Use it to explain causes clearly and logically.', type: 'sentence_pattern', functions: ['explanation'], scene: 'reason giving' },
  { template: 'It is a good way to...', meaning: '这是……的好方法', usage: 'Use it to explain the value of an action or habit.', type: 'sentence_pattern', functions: ['suggestion', 'explanation'], scene: 'advice' },
  { template: 'I began to realize that...', meaning: '我开始意识到……', usage: 'Use it to show a change in understanding.', type: 'sentence_pattern', functions: ['realization'], scene: 'reflection', tone: 'thoughtful' },
  { template: 'Compared with..., ...', meaning: '与……相比，……', usage: 'Use it to compare cultural habits, learning styles, or personal choices.', type: 'sentence_pattern', functions: ['comparison'], scene: 'cross-cultural comparison' },
  { template: 'What matters most is...', meaning: '最重要的是……', usage: 'Use it to focus on the deepest value or lesson.', type: 'sentence_pattern', functions: ['reflection', 'value'], scene: 'ending or reflection' },
  { template: 'To begin with, ...', meaning: '首先，……', usage: 'Use it to organize an explanation smoothly.', type: 'discourse_pattern', functions: ['organization'], scene: 'explanation' },
  { template: 'At first, ... but later ...', meaning: '起初……但后来……', usage: 'Use it to show change in feeling, action, or understanding.', type: 'discourse_pattern', functions: ['contrast_or_turn'], scene: 'narrative development' },
  { template: 'From this experience, I learned that...', meaning: '从这次经历中，我明白了……', usage: 'Use it for a natural reflective ending.', type: 'discourse_pattern', functions: ['reflection'], scene: 'ending' },
  { template: 'This does not simply mean..., it also shows...', meaning: '这不只是意味着……，也说明……', usage: 'Use it to deepen cultural explanation beyond surface facts.', type: 'discourse_pattern', functions: ['cultural_explanation'], scene: 'intercultural explanation' },
  { template: 'I see your point, but...', meaning: '我明白你的意思，不过……', usage: 'Use it to disagree softly while respecting the listener.', type: 'communicative_expression', functions: ['disagreement_softening'], scene: 'discussion', tone: 'polite' },
  { template: 'Let me explain it another way.', meaning: '我换一种方式解释。', usage: 'Use it when the listener looks confused or misunderstands you.', type: 'communicative_expression', functions: ['clarification'], scene: 'repairing meaning', tone: 'patient' },
  { template: 'I understand why you feel that way.', meaning: '我理解你为什么会那样感受。', usage: 'Use it to show empathy before explaining your view.', type: 'communicative_expression', functions: ['empathy'], scene: 'relationship repair', tone: 'gentle' },
  { template: 'Maybe we can look at it differently.', meaning: '也许我们可以换个角度看。', usage: 'Use it to invite a new perspective without sounding forceful.', type: 'communicative_expression', functions: ['perspective_shift'], scene: 'soft discussion', tone: 'calm' },
  { template: 'nothing short of...', meaning: '简直就是；无异于；非常……', usage: 'Use it to strongly emphasize how impressive or extreme something is.', type: 'idiom_teachable', functions: ['emphasis'], scene: 'strong reaction' },
  { template: 'a win-win situation', meaning: '双赢局面', usage: 'Use it when two sides both benefit from cooperation.', type: 'idiom_teachable', functions: ['cooperation'], scene: 'teamwork' },
  { template: 'on the same page', meaning: '想法一致；达成共识', usage: 'Use it when a group finally shares the same understanding.', type: 'idiom_teachable', functions: ['teamwork', 'clarification'], scene: 'group project' },
  { template: 'think outside the box', meaning: '跳出固定思维', usage: 'Use it for creative problem-solving in school or work.', type: 'idiom_teachable', functions: ['creativity'], scene: 'problem solving' },
]

function topicFocus(topic: { label: string; category: string; description: string }) {
  const text = `${topic.label} ${topic.category} ${topic.description}`.toLowerCase()
  if (/\bai\b|artificial intelligence|learning tools/.test(text)) return { scene: 'a class discussion about using AI learning tools responsibly', zh: '在一次关于 AI 学习工具的课堂讨论中', audience: 'an international classmate' }
  if (text.includes('intern') || text.includes('university')) return { scene: 'a conversation about majors, internships, and future plans', zh: '在一次关于专业、实习和未来规划的交流中', audience: 'an international roommate' }
  if (text.includes('animation') || text.includes('games') || text.includes('media')) return { scene: 'a club chat about animation, games, and youth culture', zh: '在一次关于动画、游戏和青年文化的社团聊天中', audience: 'a foreign friend' }
  if (text.includes('milk') || text.includes('food') || text.includes('coffee')) return { scene: 'an after-class conversation about milk tea, coffee, and food delivery', zh: '在一次课后关于奶茶、咖啡和外卖的聊天中', audience: 'an exchange student' }
  if (text.includes('teamwork') || text.includes('feedback')) return { scene: 'a group project where direct feedback causes a misunderstanding', zh: '在一次小组项目中，直接反馈引起了误会', audience: 'an international teammate' }
  if (text.includes('online')) return { scene: 'an online friendship where tone in messages is misunderstood', zh: '在一段线上友谊中，消息语气被误解了', audience: 'an online friend' }
  if (text.includes('family') || text.includes('dream')) return { scene: 'a quiet talk about family expectations and personal dreams', zh: '在一次关于家庭期待和个人梦想的谈话中', audience: 'an international roommate' }
  if (text.includes('study')) return { scene: 'a peer conversation about study pressure and learning habits', zh: '在一次关于学习压力和学习方法的同伴交流中', audience: 'a classmate from another country' }
  if (text.includes('city') || text.includes('commuting') || text.includes('travel')) return { scene: 'a city walk where a local student explains daily transport and city habits', zh: '在一次城市漫步中，本地学生解释日常交通和城市生活习惯', audience: 'a visiting student' }
  if (text.includes('friendship') || text.includes('empathy')) return { scene: 'a friendship moment where one student tries to comfort another', zh: '在一次朋友之间互相安慰的时刻', audience: 'a friend' }
  if (text.includes('global')) return { scene: 'a youth culture discussion about music, hobbies, and social media habits', zh: '在一次关于音乐、爱好和社交媒体习惯的青年文化讨论中', audience: 'an international peer' }
  if (text.includes('tradition')) return { scene: 'a discussion about how tradition appears in modern student life', zh: '在一次关于传统如何进入现代学生生活的讨论中', audience: 'a foreign friend' }
  if (text.includes('festival')) return { scene: 'a family festival meal where a student explains the meaning behind a custom', zh: '在一次节日家庭聚餐中，学生解释习俗背后的意义', audience: 'an exchange student' }
  if (text.includes('hospitality')) return { scene: 'a meal where a student helps a guest understand hospitality and table manners', zh: '在一次用餐中，学生帮助客人理解待客方式和餐桌礼仪', audience: 'a guest' }
  if (text.includes('art') || text.includes('heritage')) return { scene: 'a museum visit where students discuss the meaning behind a cultural object', zh: '在一次博物馆参观中，学生讨论一件文化展品背后的意义', audience: 'a visiting student' }
  return { scene: `a real conversation about ${topic.label}`, zh: `在一次关于${topic.label}的真实交流中`, audience: 'an international peer' }
}

function exactPhrase(template: string) {
  return template.replace(/\.\.\./g, '').replace(/\s+/g, ' ').trim()
}

function sentenceWith(seed: ConstructionSeed, focus: ReturnType<typeof topicFocus>) {
  const phrase = exactPhrase(seed.template)
  const t = seed.template
  if (t.startsWith('be curious')) return `My exchange partner was curious about why this small habit mattered so much in our daily life.`
  if (t.startsWith('be proud')) return `I was proud of the way our group explained the idea without making anyone feel left out.`
  if (t.startsWith('be willing')) return `She was willing to listen first, even though the situation felt a little awkward.`
  if (t.startsWith('get used')) return `It took him a few weeks to get used to the rhythm of student life here.`
  if (t.startsWith('take part')) return `I invited her to take part in the activity so she could understand it from the inside.`
  if (t.startsWith('play an important')) return `Small choices can play an important role in how people understand a new culture.`
  if (t === 'express an opinion') return `I learned how to express an opinion without sounding too direct.`
  if (t === 'make a decision') return `Before we could move on, we had to make a decision that everyone could accept.`
  if (t === 'face pressure') return `Many students face pressure, but they do not always talk about it openly.`
  if (t === 'achieve a goal') return `Working with someone from another culture helped me achieve a goal I could not reach alone.`
  if (t === 'solve a misunderstanding') return `A patient explanation helped us solve a misunderstanding before it became a real conflict.`
  if (t === 'build a friendship') return `That small conversation helped us build a friendship across languages and habits.`
  if (t.startsWith('What impressed')) return `What impressed me most was how calmly she asked about the meaning behind the habit.`
  if (t.startsWith('The reason')) return `The reason why I explained it slowly is that I did not want my friend to feel judged.`
  if (t.startsWith('It is a good way')) return `It is a good way to learn about another culture through ordinary student life.`
  if (t.startsWith('I began')) return `I began to realize that good communication often starts with patient listening.`
  if (t.startsWith('Compared')) return `Compared with simply translating the words, explaining the situation made the meaning clearer.`
  if (t.startsWith('What matters')) return `What matters most is not winning the argument, but keeping the conversation open.`
  if (t.startsWith('To begin')) return `To begin with, I described the scene instead of giving a dry definition.`
  if (t.startsWith('At first')) return `At first, the silence felt uncomfortable, but later we both laughed and relaxed.`
  if (t.startsWith('From this')) return `From this experience, I learned that cultural understanding grows through small moments.`
  if (t.startsWith('This does')) return `This does not simply mean following a rule, it also shows respect for the people around us.`
  if (t.startsWith('I see')) return `I see your point, but the same action may carry a different meaning in my culture.`
  if (t.startsWith('Let me')) return `Let me explain it another way.`
  if (t.startsWith('I understand')) return `I understand why you feel that way.`
  if (t.startsWith('Maybe')) return `Maybe we can look at it differently.`
  if (t.startsWith('nothing short')) return `The experience was nothing short of unforgettable.`
  if (t.startsWith('a win-win')) return `In the end, the plan became a win-win situation for both teams.`
  if (t.startsWith('on the same')) return `After the discussion, we were finally on the same page.`
  if (t.startsWith('think outside')) return `The project pushed us to think outside the box.`
  return `${focus.scene} helped me use "${phrase}" naturally.`
}

function zhTry(seed: ConstructionSeed, focus: ReturnType<typeof topicFocus>, index: number) {
  const examples = [
    `${focus.zh}，我想自然地解释这个习惯为什么重要。`,
    `我希望让${focus.audience}理解，这件小事不只是规则，也体现了尊重。`,
    `一开始我们有点尴尬，但后来通过耐心解释达成了理解。`,
    `这次经历让我意识到，真正的交流需要倾听和换位思考。`,
    `我想表达自己的观点，同时不让对方觉得被否定。`,
  ]
  return examples[index % examples.length]
}

function referenceFor(seed: ConstructionSeed, focus: ReturnType<typeof topicFocus>, index: number) {
  const sentence = sentenceWith(seed, focus)
  if (seed.template.startsWith('I see')) return `I see your point, but this small habit may carry a different meaning in my culture.`
  if (seed.template.startsWith('Let me')) return `Let me explain it another way. It is not only about the rule, but also about making guests feel respected.`
  if (seed.template.startsWith('Maybe')) return `Maybe we can look at it differently and ask why people developed this habit in the first place.`
  if (seed.template.startsWith('I understand')) return `I understand why you feel that way, and I hope I can explain the situation more clearly.`
  return sentence
}

function exercisePlan(index: number): ExerciseKind {
  if (index < 26) return 'construction_imitation'
  if (index < 36) return 'micro_continuation'
  if (index < 44) return 'short_continuation_50'
  return 'long_continuation'
}

function legacyType(kind: ExerciseKind) {
  if (kind === 'construction_imitation') return 'IM'
  if (kind === 'long_continuation') return 'D2'
  return 'D1'
}

function wordCount(kind: ExerciseKind) {
  if (kind === 'construction_imitation') return '1 natural English sentence'
  if (kind === 'micro_continuation') return '1-2 sentences'
  if (kind === 'short_continuation_50') return '45-60 words'
  return '100-150 words'
}

function buildExercise(input: {
  index: number
  topic: any
  goal: any
  focus: ReturnType<typeof topicFocus>
  constructions: any[]
  kind: ExerciseKind
}) {
  const primary = input.constructions[input.index % input.constructions.length]
  const secondary = input.constructions[(input.index + 7) % input.constructions.length]
  const third = input.constructions[(input.index + 13) % input.constructions.length]
  const seed = constructionSeeds[input.index % constructionSeeds.length]
  const modelSentence = sentenceWith(seed, input.focus)
  const tryZh = zhTry(seed, input.focus, input.index)
  const reference = referenceFor(seed, input.focus, input.index)

  if (input.kind === 'construction_imitation') {
    return {
      context: [
        `Construction card`,
        `Target construction: ${seed.template}`,
        `Meaning: ${seed.meaning}`,
        `Usage: ${seed.usage}`,
        seed.tone ? `Tone: ${seed.tone}` : `Tone: natural and communicative`,
        `Common scene: ${seed.scene}`,
        ``,
        `Model sentence: ${modelSentence}`,
        `Chinese meaning: ${modelSentence.includes('nothing short of') ? '这段经历简直令人难忘。' : '这个句子展示了构式在真实交流中的自然用法。'}`,
        ``,
        `Now try: ${tryZh}`,
      ].join('\n'),
      task: `Use the same construction naturally. Do not translate word by word; use "${seed.template}" to express the meaning in a real communicative sentence.`,
      referenceAnswer: reference,
      target: [primary],
    }
  }

  if (input.kind === 'micro_continuation') {
    return {
      context: `${input.focus.scene}. The other student looked confused for a moment, and the conversation almost stopped. You wanted to keep the atmosphere friendly while explaining your meaning.`,
      task: `Continue in 1-2 natural English sentences. Use at least one target construction to clarify meaning or show emotion.`,
      referenceAnswer: `${reference} Then I added one concrete example from my daily life, and the conversation became much easier.`,
      target: [primary, secondary],
    }
  }

  if (input.kind === 'short_continuation_50') {
    return {
      context: `${input.focus.scene}. At first, both sides thought they understood each other, but a small difference in habit created confusion. You noticed that a direct translation would not be enough.`,
      task: `Continue in about 50 words. Explain the meaning behind the action, soften the tone, and help both sides continue the conversation naturally.`,
      referenceAnswer: `${reference} I tried to give a real example instead of a dry rule. As I spoke, I began to realize that the problem was not the habit itself, but the different meanings we connected with it. Soon, we were on the same page.`,
      target: [primary, secondary, third],
    }
  }

  return {
    context: `${input.focus.scene}. The room was quiet at first. One student had asked a sincere question, but the words sounded a little too direct. You could feel that the answer needed more than a simple translation. It needed a clear explanation, a respectful tone, and a small personal example. Everyone waited to see whether the conversation would become awkward or turn into a real moment of understanding.`,
    task: `Continue the scene in 100-150 words. Use the target constructions to explain the cultural or interpersonal meaning, show an emotional turn, and end with a believable moment of communication.`,
    referenceAnswer: `${reference} I gave a small example from my own student life and watched my friend's expression soften. At first, I had worried that the difference would make us distant, but later I saw that it could become a reason to talk more honestly. This does not simply mean explaining a custom, it also shows respect for another person's questions. From this experience, I learned that intercultural communication is built through patient, ordinary moments.`,
    target: [primary, secondary, third],
  }
}

async function upsertConstructionsForTopic(topic: any, goals: any[]) {
  const focus = topicFocus(topic)
  const rows = []
  for (let i = 0; i < constructionSeeds.length; i += 1) {
    const seed = constructionSeeds[i]
    const code = `HQC-${String(i + 1).padStart(3, '0')}`
    const row = await prisma.construction.upsert({
      where: { code },
      update: {
        name: seed.template,
        template: seed.template,
        coreWords: exactPhrase(seed.template),
        function: seed.meaning,
        usageNote: seed.usage,
        example: sentenceWith(seed, NEUTRAL_FOCUS),
        difficulty: topic.minLevel === 'senior' ? '高中' : '初高中',
        level: topic.minLevel === 'senior' ? 'senior' : 'junior',
        category: `curated_${seed.type}`,
        metadata: {
          school_level: topic.minLevel === 'senior' ? 'Senior High' : 'Junior/Senior High',
          fine_level: topic.minLevel === 'senior' ? 'L4' : 'L3',
          construction_type: seed.type,
          teaching_value: 'high',
          student_growth_value: 'high',
          use_in_generation: true,
          active_for_learning: true,
          vocabulary_only: false,
          communicative_function: seed.functions,
          emotional_function: seed.functions.filter((fn) => ['empathy', 'curiosity', 'realization'].includes(fn)),
          narrative_function: seed.functions.filter((fn) => ['reflection', 'contrast_or_turn', 'organization'].includes(fn)),
          interaction_type: ['peer_to_peer', 'local_to_foreigner'],
          scene_type: [seed.scene, NEUTRAL_FOCUS.scene],
          intercultural_value: ['explaining_meaning', 'avoiding_misunderstanding', 'showing_respect'],
          discourse_scope: seed.type === 'discourse_pattern' ? 'paragraph' : 'sentence',
          production_difficulty: topic.minLevel === 'senior' ? 'medium' : 'low',
          common_error_risk: ['unnatural_translation', 'tone'],
          teaching_priority: 'high',
          usage_frequency: 'high',
          rotation_weight: 1.15,
          recommended_exercise_types: ['construction_imitation', 'single_sentence_translation', 'micro_continuation', 'short_continuation_50', 'long_continuation'],
          source: BANK_VERSION,
        },
        metadataVersion: BANK_VERSION,
        rotationWeight: 1.15,
      },
      create: {
        code,
        name: seed.template,
        template: seed.template,
        coreWords: exactPhrase(seed.template),
        function: seed.meaning,
        usageNote: seed.usage,
        example: sentenceWith(seed, NEUTRAL_FOCUS),
        difficulty: topic.minLevel === 'senior' ? '高中' : '初高中',
        level: topic.minLevel === 'senior' ? 'senior' : 'junior',
        category: `curated_${seed.type}`,
        metadataVersion: BANK_VERSION,
        rotationWeight: 1.15,
        metadata: {
          school_level: topic.minLevel === 'senior' ? 'Senior High' : 'Junior/Senior High',
          fine_level: topic.minLevel === 'senior' ? 'L4' : 'L3',
          construction_type: seed.type,
          teaching_value: 'high',
          student_growth_value: 'high',
          use_in_generation: true,
          active_for_learning: true,
          vocabulary_only: false,
          communicative_function: seed.functions,
          emotional_function: seed.functions.filter((fn) => ['empathy', 'curiosity', 'realization'].includes(fn)),
          narrative_function: seed.functions.filter((fn) => ['reflection', 'contrast_or_turn', 'organization'].includes(fn)),
          interaction_type: ['peer_to_peer', 'local_to_foreigner'],
          scene_type: [seed.scene, NEUTRAL_FOCUS.scene],
          intercultural_value: ['explaining_meaning', 'avoiding_misunderstanding', 'showing_respect'],
          discourse_scope: seed.type === 'discourse_pattern' ? 'paragraph' : 'sentence',
          production_difficulty: topic.minLevel === 'senior' ? 'medium' : 'low',
          common_error_risk: ['unnatural_translation', 'tone'],
          teaching_priority: 'high',
          usage_frequency: 'high',
          rotation_weight: 1.15,
          recommended_exercise_types: ['construction_imitation', 'single_sentence_translation', 'micro_continuation', 'short_continuation_50', 'long_continuation'],
          source: BANK_VERSION,
        },
      },
    })
    rows.push(row)

    await prisma.constructionTopic.upsert({
      where: { constructionId_topicId: { constructionId: row.id, topicId: topic.id } },
      update: { relevanceScore: 0.98, reason: `Curated construction for ${topic.label}.` },
      create: { constructionId: row.id, topicId: topic.id, relevanceScore: 0.98, reason: `Curated construction for ${topic.label}.` },
    })

    for (const goal of goals) {
      await prisma.constructionGoal.upsert({
        where: { constructionId_goalId: { constructionId: row.id, goalId: goal.id } },
        update: { relevanceScore: 0.82, reason: `Curated construction supports ${goal.label}.` },
        create: { constructionId: row.id, goalId: goal.id, relevanceScore: 0.82, reason: `Curated construction supports ${goal.label}.` },
      })
    }

    for (const exerciseType of ['construction_imitation', 'single_sentence_translation', 'micro_continuation', 'short_continuation_50', 'long_continuation']) {
      await prisma.constructionExerciseType.upsert({
        where: { constructionId_exerciseType: { constructionId: row.id, exerciseType } },
        update: { relevanceScore: 0.9, reason: 'Curated topic bank construction.' },
        create: { constructionId: row.id, exerciseType, relevanceScore: 0.9, reason: 'Curated topic bank construction.' },
      })
    }
  }
  return rows
}

async function seedExercisesForTopic(topic: any, goals: any[], constructions: any[]) {
  const focus = topicFocus(topic)
  const existing = await prisma.exercise.count({
    where: {
      source: 'official',
      topicId: topic.id,
      qualityStatus: 'approved',
      publishStatus: { in: ['approved', 'published'] },
    },
  })
  let created = 0
  for (let i = 0; i < TARGET_PER_TOPIC; i += 1) {
    const kind = exercisePlan(i)
    const goal = goals[i % goals.length]
    const exercise = buildExercise({ index: i, topic, goal, focus, constructions, kind })
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
    const exerciseId = `OFF-${topic.slug}-${String(i + 1).padStart(3, '0')}`.replace(/[^A-Za-z0-9_-]/g, '-')

    const already = await prisma.exercise.findUnique({ where: { exerciseId }, select: { id: true } })
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
        metadata: {
          source: 'official',
          topic_id: topic.id,
          goal_id: goal.id,
          adaptive_exercise_type: kind,
          exercise_type_label: kind.replace(/_/g, ' '),
          target_constructions: exercise.target.map((c: any) => ({
            id: c.id,
            code: c.code,
            construction: c.template || c.name,
            template: c.template,
            meaning_zh: c.function,
            communicative_function: (c.metadata as any)?.communicative_function || [],
            emotional_function: (c.metadata as any)?.emotional_function || [],
            usage_scene: (c.metadata as any)?.scene_type?.[0] || topic.label,
            example: c.example,
            why_useful: c.usageNote,
          })),
          highlighted_construction: exercise.target[0]?.template,
          prompt_version: PROMPT_VERSION,
          generation_version: GENERATION_VERSION,
          bank_version: BANK_VERSION,
        },
        topicId: topic.id,
        goalId: goal.id,
        exerciseType: kind,
        constructionIds: exercise.target.map((c: any) => c.id),
        qualityStatus: 'approved',
        publishStatus: 'published',
        isPublic: true,
        isPublished: true,
        pedagogicalFitScore: 8.6,
        fitReason: `Curated official ${kind} for ${topic.label}, using meaningful constructions for intercultural communication.`,
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
        pedagogicalFitScore: 8.6,
        fitReason: `Curated official ${kind} for ${topic.label}, using meaningful constructions for intercultural communication.`,
        generationVersion: GENERATION_VERSION,
        promptVersion: PROMPT_VERSION,
        skillsVersion: PROMPT_VERSION,
        constructionMetadataVersion: BANK_VERSION,
        topicVersion: topic.version,
        contentSignature: signature,
        metadata: {
          source: 'official',
          topic_id: topic.id,
          goal_id: goal.id,
          adaptive_exercise_type: kind,
          exercise_type_label: kind.replace(/_/g, ' '),
          target_constructions: exercise.target.map((c: any) => ({
            id: c.id,
            code: c.code,
            construction: c.template || c.name,
            template: c.template,
            meaning_zh: c.function,
            communicative_function: (c.metadata as any)?.communicative_function || [],
            emotional_function: (c.metadata as any)?.emotional_function || [],
            usage_scene: (c.metadata as any)?.scene_type?.[0] || topic.label,
            example: c.example,
            why_useful: c.usageNote,
          })),
          highlighted_construction: exercise.target[0]?.template,
          prompt_version: PROMPT_VERSION,
          generation_version: GENERATION_VERSION,
          bank_version: BANK_VERSION,
        },
      },
    })
    if (!already) created += 1
  }
  return { created, existing }
}

async function main() {
  const [topics, goals] = await Promise.all([
    prisma.topic.findMany({ where: { active: true }, orderBy: { displayOrder: 'asc' } }),
    prisma.writingGoal.findMany({ where: { active: true }, orderBy: { displayOrder: 'asc' } }),
  ])

  let totalCreated = 0
  for (const topic of topics) {
    const constructions = await upsertConstructionsForTopic(topic, goals)
    const result = await seedExercisesForTopic(topic, goals, constructions)
    totalCreated += result.created
    console.log(`${topic.label}: existing=${result.existing}, created=${result.created}`)
  }
  console.log(`Topic exercise bank complete. created=${totalCreated}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
