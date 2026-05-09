// =============================================================================
// V2: 3-Level Learning Path System
// =============================================================================
// Theory grounding: Goldberg (1995, 2006, 2019) — Construction Grammar
// Each construction follows a 6-step pedagogical cycle:
//   Notice → Map → Judge → Contrast → Produce → Reflect
// =============================================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LearningStepId =
  | 'notice'
  | 'map'
  | 'judge'
  | 'contrast'
  | 'produce'
  | 'reflect'

export type LearningLevelId = 'level-1' | 'level-2' | 'level-3'

export interface LearningStep {
  id: LearningStepId
  name: string
  nameZh: string
  description: string
  descriptionZh: string
  goldbergPrinciple: string // Which Goldberg concept underpins this step
  activityType: string
  estimatedMinutes: number
}

export interface ConstructionLearningNode {
  constructionId: string
  constructionName: string
  constructionNameZh: string
  goldbergReference: string
  steps: LearningStep[]
}

export interface LearningLevel {
  id: LearningLevelId
  name: string
  nameZh: string
  description: string
  descriptionZh: string
  prerequisiteLevelId?: LearningLevelId
  constructions: ConstructionLearningNode[]
}

export interface LearningPath {
  id: string
  name: string
  nameZh: string
  levels: LearningLevel[]
  theoryBase: string
}

// ---------------------------------------------------------------------------
// Step Templates (shared 6-step cycle)
// ---------------------------------------------------------------------------

const STEP_NOTICE: LearningStep = {
  id: 'notice',
  name: 'Notice',
  nameZh: '注意',
  description:
    'Expose learners to authentic instances of the construction in context. Develop awareness of the form-meaning pairing.',
  descriptionZh: '在真实语境中接触构式的实例，培养对形式-意义配对的觉察力。',
  goldbergPrinciple:
    'Frequency and salience in input drive construction learning (Goldberg 1995, 2006)',
  activityType: 'construction-identification',
  estimatedMinutes: 10,
}

const STEP_MAP: LearningStep = {
  id: 'map',
  name: 'Map',
  nameZh: '映射',
  description:
    'Map semantic roles (Agent, Patient, Theme, Goal, etc.) onto the construction\'s syntactic slots.',
  descriptionZh:
    '将语义角色（施事、受事、客体、目标等）映射到构式的句法槽位上。',
  goldbergPrinciple:
    'Constructions map form to meaning; semantic roles are constructionally assigned (Goldberg 1995: Ch. 1-2)',
  activityType: 'role-mapping',
  estimatedMinutes: 15,
}

const STEP_JUDGE: LearningStep = {
  id: 'judge',
  name: 'Judge',
  nameZh: '判断',
  description:
    'Evaluate the naturalness and conventionality of construction instances. Rate on a conventionality cline.',
  descriptionZh:
    '评估构式实例的自然度和约定俗成程度，在约定性梯度上进行评级。',
  goldbergPrinciple:
    'Conventions emerge from statistical preemption in usage (Goldberg 2006: Ch. 4)',
  activityType: 'naturalness-judgment',
  estimatedMinutes: 12,
}

const STEP_CONTRAST: LearningStep = {
  id: 'contrast',
  name: 'Contrast',
  nameZh: '对比',
  description:
    'Compare the target construction with alternative constructions that express similar meanings. Identify semantic and pragmatic differences.',
  descriptionZh:
    '将目标构式与表达相似意义的替代构式进行对比，识别语义和语用差异。',
  goldbergPrinciple:
    'Constructions form a network of partially overlapping forms and meanings (Goldberg 1995: constructional network)',
  activityType: 'contrastive-analysis',
  estimatedMinutes: 15,
}

const STEP_PRODUCE: LearningStep = {
  id: 'produce',
  name: 'Produce',
  nameZh: '产出',
  description:
    'Produce novel sentences using the target construction in contextually appropriate situations.',
  descriptionZh: '在语境适当的场景中运用目标构式产出新句子。',
  goldbergPrinciple:
    'Constructions are productive schemas: speakers create novel instances by filling constructional templates (Goldberg 2006: Ch. 5)',
  activityType: 'construction-production',
  estimatedMinutes: 20,
}

const STEP_REFLECT: LearningStep = {
  id: 'reflect',
  name: 'Reflect',
  nameZh: '反思',
  description:
    'Reflect on metalinguistic awareness: What did you learn about this construction? How does it extend from a prototype?',
  descriptionZh:
    '反思元语言意识：关于这个构式你学到了什么？它是如何从原型扩展而来的？',
  goldbergPrinciple:
    'Metalinguistic awareness consolidates constructional knowledge; reflection promotes explicit-to-implicit transfer (Goldberg 2019: Explain Me This)',
  activityType: 'metalinguistic-reflection',
  estimatedMinutes: 8,
}

const DEFAULT_STEPS: LearningStep[] = [
  STEP_NOTICE,
  STEP_MAP,
  STEP_JUDGE,
  STEP_CONTRAST,
  STEP_PRODUCE,
  STEP_REFLECT,
]

// ---------------------------------------------------------------------------
// Level 1: Core Argument Structure
// ---------------------------------------------------------------------------

const LEVEL_1: LearningLevel = {
  id: 'level-1',
  name: 'Core Argument Structure',
  nameZh: '核心论元结构',
  description:
    'Master the foundational argument-structure constructions of English: Ditransitive, Caused-Motion, Resultative, and Transitive. These constructions form the semantic backbone of English clause structure.',
  descriptionZh:
    '掌握英语的基础论元结构构式：双及物构式、使移构式、结果构式和及物构式。这些构式构成英语小句结构的语义骨架。',
  constructions: [
    {
      constructionId: 'ditransitive-construction',
      constructionName: 'Ditransitive Construction',
      constructionNameZh: '双及物构式',
      goldbergReference: 'Goldberg (1995: Ch. 2) — central case study',
      steps: DEFAULT_STEPS.map((s) => ({
        ...s,
        description:
          s.id === 'notice'
            ? 'Identify ditransitive instances ([Subj V Obj1 Obj2]) in authentic corpora. Notice that the verb "give" is the most frequent and prototypical ditransitive verb.'
            : s.id === 'map'
              ? 'Map the roles: Agent (giver) → Subj; Recipient → Obj1; Theme → Obj2. Trace how the construction itself contributes the "successful transfer" meaning beyond the verb.'
              : s.id === 'judge'
                ? 'Rate sentences on a conventionality cline: "She gave him a book" (prototypical) vs. "She smiled him a greeting" (creative extension).'
                : s.id === 'contrast'
                  ? 'Contrast the ditransitive with the prepositional dative: "She gave him a book" vs. "She gave a book to him." Identify the semantic-pragmatic difference (successful transfer entailment).'
                  : s.id === 'produce'
                    ? 'Write 5 original sentences using the ditransitive construction with verbs beyond "give" (e.g., teach, offer, promise, deny). Include one creative/metaphorical extension.'
                    : 'Reflect: How does the ditransitive construction extend metaphorically to abstract transfer (e.g., "give someone an idea")? What is the underlying conceptual metaphor?',
        descriptionZh:
          s.id === 'notice'
            ? '在真实语料中识别双及物构式实例（[Subj V Obj1 Obj2]）。注意动词"give"是最频繁且原型的双及物动词。'
            : s.id === 'map'
              ? '映射角色：施事（给予者）→主语；接受者→间接宾语；客体→直接宾语。追踪构式本身如何超出动词贡献"成功转移"的意义。'
              : s.id === 'judge'
                ? '在约定性梯度上评级句子："She gave him a book"（原型性）vs. "She smiled him a greeting"（创意扩展）。'
                : s.id === 'contrast'
                  ? '对比双及物构式与介词与格构式："She gave him a book" vs. "She gave a book to him"。识别语义-语用差异（成功转移的蕴涵）。'
                  : s.id === 'produce'
                    ? '使用"give"以外的动词（如teach, offer, promise, deny）写出5个原创双及物句子。包含一个创意/隐喻扩展。'
                    : '反思：双及物构式如何隐喻性地扩展到抽象转移（如"give someone an idea"）？其底层概念隐喻是什么？',
      })),
    },
    {
      constructionId: 'caused-motion-construction',
      constructionName: 'Caused-Motion Construction',
      constructionNameZh: '使移构式',
      goldbergReference: 'Goldberg (1995: Ch. 3) — argument-structure pattern',
      steps: DEFAULT_STEPS.map((s) => ({
        ...s,
        description:
          s.id === 'notice'
            ? 'Identify caused-motion instances ([Subj V Obj Path/Locative]) in academic and news texts. Notice the variety of verbs: throw, push, pull, drive, force, move.'
            : s.id === 'map'
              ? 'Map the roles: Agent (causer) → Subj; Theme (moved entity) → Obj; Path/Goal → Oblique PP. Analyze how the construction encodes causation + motion as a macro-event.'
              : s.id === 'judge'
                ? 'Rate: "She threw the ball into the basket" (conventional) vs. "She smiled him into submission" (metaphorical extension) vs. "She thought him into depression" (creative).'
                : s.id === 'contrast'
                  ? 'Contrast caused-motion with intransitive motion: "She pushed the box across the room" (caused) vs. "The box slid across the room" (self-propelled). Identify the Agent presence/absence.'
                  : s.id === 'produce'
                    ? 'Write 5 original caused-motion sentences. Use at least one metaphorical extension (e.g., emotion, cognition, or social domain as abstract space).'
                    : 'Reflect: How does the caused-motion construction extend to abstract domains? What conceptual metaphors enable this extension (e.g., STATES ARE LOCATIONS, CHANGE IS MOTION)?',
        descriptionZh:
          s.id === 'notice'
            ? '在学术和新闻文本中识别使移构式实例（[Subj V Obj Path/Locative]）。注意动词的多样性：throw, push, pull, drive, force, move。'
            : s.id === 'map'
              ? '映射角色：施事（致使者）→主语；客体（被移动实体）→宾语；路径/目标→斜格介词短语。分析构式如何将致使+位移编码为宏观事件。'
              : s.id === 'judge'
                ? '评级："She threw the ball into the basket"（约定俗成）vs. "She smiled him into submission"（隐喻扩展）vs. "She thought him into depression"（创意用法）。'
                : s.id === 'contrast'
                  ? '对比使移构式与不及物位移构式："She pushed the box across the room"（致使）vs. "The box slid across the room"（自动）。识别施事的有/无。'
                  : s.id === 'produce'
                    ? '写出5个原创使移构式句子。至少使用一个隐喻扩展（如情感、认知或社会域作为抽象空间）。'
                    : '反思：使移构式如何扩展到抽象域？什么概念隐喻使此扩展成为可能（如STATES ARE LOCATIONS, CHANGE IS MOTION）？',
      })),
    },
    {
      constructionId: 'resultative-construction',
      constructionName: 'Resultative Construction',
      constructionNameZh: '结果构式',
      goldbergReference: 'Goldberg (1995: Ch. 3) — independent argument-structure construction',
      steps: DEFAULT_STEPS.map((s) => ({
        ...s,
        description:
          s.id === 'notice'
            ? 'Identify resultative instances ([Subj V Obj ResultPhrase]) in authentic texts. Notice the verb-result pairings: hammer flat, wipe clean, paint red, shout hoarse.'
            : s.id === 'map'
              ? 'Map the roles: Agent → Subj; Patient → Obj; Result State → secondary predicate (AP/PP). Explain how the construction supplies the result-state meaning not encoded by the verb alone.'
              : s.id === 'judge'
                ? 'Rate verb-result pairings on conventionality: "hammer flat" (highly conventional) vs. "talk oneself hoarse" (conventional wayward) vs. "theorize confused" (creative/non-conventional).'
                : s.id === 'contrast'
                  ? 'Contrast resultative with non-resultative causatives: "She wiped the table" (activity only) vs. "She wiped the table clean" (activity + result state). Analyze what the result phrase adds.'
                  : s.id === 'produce'
                    ? 'Write 5 original resultative sentences. Use at least one unconventional/creative verb-result pairing and justify its acceptability using Goldberg\'s (2006) construction-based creativity framework.'
                    : 'Reflect: What is the difference between conventional and creative resultatives? How does the construction coerce unconventional verb-result pairings?',
        descriptionZh:
          s.id === 'notice'
            ? '在真实文本中识别结果构式实例（[Subj V Obj ResultPhrase]）。注意动词-结果搭配：hammer flat, wipe clean, paint red, shout hoarse。'
            : s.id === 'map'
              ? '映射角色：施事→主语；受事→宾语；结果状态→次级谓语（形容词短语/介词短语）。解释构式如何提供动词本身未编码的结果状态意义。'
              : s.id === 'judge'
                ? '在约定性梯度上评级动词-结果搭配："hammer flat"（高度约定）vs. "talk oneself hoarse"（约定俗成的非施事主语结果构式）vs. "theorize confused"（创意/非约定）。'
                : s.id === 'contrast'
                  ? '对比结果构式与非结果致使构式："She wiped the table"（仅活动）vs. "She wiped the table clean"（活动+结果状态）。分析结果短语增加了什么。'
                  : s.id === 'produce'
                    ? '写出5个原创结果构式句子。至少使用一个非常规/创意动词-结果搭配，并用Goldberg(2006)的基于构式的创新框架论证其可接受性。'
                    : '反思：约定俗成的结果构式与创意结果构式有何区别？构式如何压制非常规动词-结果搭配？',
      })),
    },
    {
      constructionId: 'transitive-construction',
      constructionName: 'Transitive Construction',
      constructionNameZh: '及物构式',
      goldbergReference: 'Goldberg (1995: Ch. 2) — prototype of causal event structure',
      steps: DEFAULT_STEPS.map((s) => ({
        ...s,
        description:
          s.id === 'notice'
            ? 'Identify transitive instances ([Subj V Obj]) across registers. Notice the verb classes: physical action (hit, kick), perception (see, hear), cognition (know, believe), communication (say, tell).'
            : s.id === 'map'
              ? 'Map the prototypical roles: Agent → Subj; Patient → Obj. Analyze how the transitive construction encodes a causal asymmetry between the subject and object participants.'
              : s.id === 'judge'
                ? 'Rate transitivity instances: "John kicked the ball" (prototypical: high transitivity) vs. "John saw the accident" (non-prototypical: low agentivity) vs. "The book weighs a kilo" (non-canonical: no agent).'
                : s.id === 'contrast'
                  ? 'Contrast transitive with ergative/intransitive alternations: "John opened the door" (transitive, causative) vs. "The door opened" (intransitive, anticausative). Identify the subject role shift.'
                  : s.id === 'produce'
                    ? 'Write 5 original transitive sentences. Include examples from different semantic verb classes (action, perception, cognition, communication). Discuss transitivity gradient.'
                    : 'Reflect: What makes a transitive sentence more or less "transitive"? How does Hopper & Thompson\'s (1980) transitivity framework align with Goldberg\'s constructional analysis?',
        descriptionZh:
          s.id === 'notice'
            ? '跨语域识别及物构式实例（[Subj V Obj]）。注意动词类别：物理动作（hit, kick）、感知（see, hear）、认知（know, believe）、交际（say, tell）。'
            : s.id === 'map'
              ? '映射原型角色：施事→主语；受事→宾语。分析及物构式如何编码主语和宾语参与者之间的因果不对称性。'
              : s.id === 'judge'
                ? '评级及物性实例："John kicked the ball"（原型：高及物性）vs. "John saw the accident"（非原型：低施事性）vs. "The book weighs a kilo"（非标准：无施事）。'
                : s.id === 'contrast'
                  ? '对比及物构式与作格/不及物交替："John opened the door"（及物，致使）vs. "The door opened"（不及物，反致使）。识别主语角色转换。'
                  : s.id === 'produce'
                    ? '写出5个原创及物构式句子。包含不同语义动词类别的例子（动作、感知、认知、交际）。讨论及物性梯度。'
                    : '反思：什么使及物句的及物性程度更高或更低？Hopper & Thompson(1980)的及物性框架如何与Goldberg的构式分析相协调？',
      })),
    },
  ],
}

// ---------------------------------------------------------------------------
// Level 2: Extension and Coercion
// ---------------------------------------------------------------------------

const LEVEL_2: LearningLevel = {
  id: 'level-2',
  name: 'Extension and Coercion',
  nameZh: '扩展与压制',
  description:
    'Explore how constructions extend metaphorically and coercively to accommodate novel verbs and meanings. Master the Way Construction, Intransitive Motion, and Cognate Object constructions.',
  descriptionZh:
    '探索构式如何隐喻性和压制性地扩展以适应新动词和新意义。掌握Way构式、不及物位移构式和同源宾语构式。',
  prerequisiteLevelId: 'level-1',
  constructions: [
    {
      constructionId: 'way-construction',
      constructionName: 'Way Construction',
      constructionNameZh: 'Way构式',
      goldbergReference: 'Goldberg (1995: Ch. 8) — creative extension case study',
      steps: DEFAULT_STEPS.map((s) => ({
        ...s,
        description:
          s.id === 'notice'
            ? 'Collect way-construction instances ([Subj V one\'s way Path]) from novels and news. Notice the verb variety: make, work, fight, talk, dance, lie, buy, think. What do these verbs have in common?'
            : s.id === 'map'
              ? 'Map the roles: Agent (self-propelled mover) → Subj; Manner verb → V; Path → one\'s way + directional PP. Analyze how the verb contributes manner while the construction contributes motion + path.'
              : s.id === 'judge'
                ? 'Rate: "She made her way through the crowd" (conventional) vs. "She smiled her way into the meeting" (metaphorical) vs. "She theorized her way to a Nobel Prize" (creative).'
                : s.id === 'contrast'
                  ? 'Contrast the way construction with intransitive motion: "She danced across the stage" (intransitive) vs. "She danced her way across the stage" (way construction). What does "her way" add?'
                  : s.id === 'produce'
                    ? 'Write 5 original way-construction sentences with creative/unconventional verbs. Explain how the construction coerces each verb into a motion-compatible interpretation.'
                    : 'Reflect: What does the way construction teach us about verb-construction interaction? How does it support Goldberg\'s claim that BOTH verbs and constructions contribute independent semantic content?',
        descriptionZh:
          s.id === 'notice'
            ? '从小说和新闻中收集Way构式实例（[Subj V one\'s way Path]）。注意动词多样性：make, work, fight, talk, dance, lie, buy, think。这些动词有什么共同点？'
            : s.id === 'map'
              ? '映射角色：施事（自我促动移动者）→主语；方式动词→谓语动词；路径→one\'s way + 方向介词短语。分析动词如何贡献方式义，构式如何贡献位移义+路径义。'
              : s.id === 'judge'
                ? '评级："She made her way through the crowd"（约定俗成）vs. "She smiled her way into the meeting"（隐喻性）vs. "She theorized her way to a Nobel Prize"（创意用法）。'
                : s.id === 'contrast'
                  ? '对比Way构式与不及物位移构式："She danced across the stage"（不及物）vs. "She danced her way across the stage"（Way构式）。"her way"增加了什么？'
                  : s.id === 'produce'
                    ? '使用创意/非常规动词写出5个原创Way构式句子。解释构式如何将每个动词压制为兼容位移的解读。'
                    : '反思：Way构式对理解动词-构式互动有何启示？它如何支持Goldberg的主张——动词和构式均独立贡献语义内容？',
      })),
    },
    {
      constructionId: 'intransitive-motion-construction',
      constructionName: 'Intransitive Motion Construction',
      constructionNameZh: '不及物位移构式',
      goldbergReference: 'Goldberg (1995: Ch. 3); Talmy (2000) — satellite-framed motion',
      steps: DEFAULT_STEPS.map((s) => ({
        ...s,
        description:
          s.id === 'notice'
            ? 'Collect intransitive motion instances ([Theme V Path]) across registers. Classify motion verbs by manner (run, walk, swim, fly, crawl, slide, roll) and path (enter, exit, ascend, descend).'
            : s.id === 'map'
              ? 'Map the roles: Theme (self-propelled mover) → Subj; Motion verb → V; Path → directional PP/particle. Connect to Talmy\'s (2000) typology: English is satellite-framed (manner in verb, path in satellite).'
              : s.id === 'judge'
                ? 'Rate intransitive motion descriptions: "The ball rolled down the hill" (highly conventional) vs. "Tears streamed down her cheeks" (conventional, literary) vs. "Ideas floated through his mind" (metaphorical extension).'
                : s.id === 'contrast'
                  ? 'Contrast English (satellite-framed) with Spanish (verb-framed): English "She ran into the room" (manner verb + path satellite) vs. Spanish "Entró corriendo en la habitación" (path verb + manner gerund). Analyze the typological difference.'
                  : s.id === 'produce'
                    ? 'Write 5 intransitive motion sentences describing the same scene with different manner verbs. Vary the path satellites (into, out of, across, through, over, under).'
                    : 'Reflect: How does the intransitive motion construction interact with Talmy\'s lexicalization typology? What does the way construction add beyond basic intransitive motion?',
        descriptionZh:
          s.id === 'notice'
            ? '跨语域收集不及物位移构式实例（[Theme V Path]）。按方式（run, walk, swim, fly, crawl, slide, roll）和路径（enter, exit, ascend, descend）分类位移动词。'
            : s.id === 'map'
              ? '映射角色：客体（自我促动移动者）→主语；位移动词→谓语；路径→方向介词短语/小品词。关联到Talmy(2000)类型学：英语是卫星框架语言（方式在动词，路径在卫星成分）。'
              : s.id === 'judge'
                ? '评级不及物位移描述："The ball rolled down the hill"（高度约定）vs. "Tears streamed down her cheeks"（约定俗成，文学性）vs. "Ideas floated through his mind"（隐喻扩展）。'
                : s.id === 'contrast'
                  ? '对比英语（卫星框架）与西班牙语（动词框架）：英语"She ran into the room"（方式动词+路径卫星）vs. 西班牙语"Entró corriendo en la habitación"（路径动词+方式副动词）。分析类型学差异。'
                  : s.id === 'produce'
                    ? '用不同方式动词写5个描述同一场景的不及物位移句子。变换路径卫星成分（into, out of, across, through, over, under）。'
                    : '反思：不及物位移构式如何与Talmy的词汇化类型学互动？Way构式在基本不及物位移基础上增加了什么？',
      })),
    },
    {
      constructionId: 'cognate-object-construction',
      constructionName: 'Cognate Object Construction',
      constructionNameZh: '同源宾语构式',
      goldbergReference: 'Goldberg (1995: Ch. 2) — construction provides new possibilities for verbs',
      steps: DEFAULT_STEPS.map((s) => ({
        ...s,
        description:
          s.id === 'notice'
            ? 'Collect cognate object instances ([V + (Det) + N_cognate]) from literary and academic texts. Notice: sleep a sleep, live a life, die a death, laugh a laugh, smile a smile, dream a dream.'
            : s.id === 'map'
              ? 'Map the roles: Experiencer → Subj; Cognate verb → V; Cognate noun → Obj (typically modified by an adjective). Analyze how the construction provides an object slot for an intransitive verb.'
              : s.id === 'judge'
                ? 'Rate cognate object instances: "She lived a good life" (conventional) vs. "He died a hero\'s death" (conventional) vs. "She slept a restless sleep" (less common but acceptable) vs. "He walked a long walk" (marked).'
                : s.id === 'contrast'
                  ? 'Contrast cognate object with intransitive: "She lived happily" (intransitive + adverb) vs. "She lived a happy life" (cognate object). What does the cognate object construction enable that the adverbial variant does not?'
                  : s.id === 'produce'
                    ? 'Write 5 cognate object sentences with creative modifiers. Use verbs that do NOT typically take objects (sleep, live, die, laugh, dream, sigh). Discuss what the construction adds expressively.'
                    : 'Reflect: How does the cognate object construction exemplify Goldberg\'s claim that "constructions provide new possibilities for verbs"? Why do learners tend to avoid cognate objects as redundant?',
        descriptionZh:
          s.id === 'notice'
            ? '从文学和学术文本中收集同源宾语构式实例（[V + (Det) + N_cognate]）。注意：sleep a sleep, live a life, die a death, laugh a laugh, smile a smile, dream a dream。'
            : s.id === 'map'
              ? '映射角色：经历者→主语；同源动词→谓语；同源名词→宾语（通常被形容词修饰）。分析构式如何为不及物动词提供宾语槽位。'
              : s.id === 'judge'
                ? '评级同源宾语实例："She lived a good life"（约定俗成）vs. "He died a hero\'s death"（约定俗成）vs. "She slept a restless sleep"（较少见但可接受）vs. "He walked a long walk"（标记性较强）。'
                : s.id === 'contrast'
                  ? '对比同源宾语与不及物形式："She lived happily"（不及物+副词）vs. "She lived a happy life"（同源宾语）。同源宾语构式实现了什么副词变体无法实现的功能？'
                  : s.id === 'produce'
                    ? '使用创意修饰语写5个同源宾语句子。使用通常不带宾语的动词（sleep, live, die, laugh, dream, sigh）。讨论构式在表达上增加了什么。'
                    : '反思：同源宾语构式如何体现Goldberg"构式为动词提供新可能性"的主张？为什么学习者倾向于将同源宾语视为冗余而避免使用？',
      })),
    },
  ],
}

// ---------------------------------------------------------------------------
// Level 3: Discourse and Pragmatics
// ---------------------------------------------------------------------------

const LEVEL_3: LearningLevel = {
  id: 'level-3',
  name: 'Discourse and Pragmatics',
  nameZh: '语篇与语用',
  description:
    'Master discourse-level constructions and pragmatic strategies: What\'s X doing Y?, SAI Family, and Information Structure constructions. These operate above the clause level to manage interpersonal and textual meaning.',
  descriptionZh:
    '掌握语篇层面构式和语用策略：What\'s X doing Y?构式、SAI家族构式和信息结构构式。这些在小句之上运作，管理人际意义和语篇意义。',
  prerequisiteLevelId: 'level-2',
  constructions: [
    {
      constructionId: 'whats-x-doing-y-construction',
      constructionName: "What's X doing Y? Construction",
      constructionNameZh: "What's X doing Y? 构式",
      goldbergReference: 'Goldberg (1995: Ch. 8); Kay & Fillmore (1999) — pragmatic idiom',
      steps: DEFAULT_STEPS.map((s) => ({
        ...s,
        description:
          s.id === 'notice'
            ? 'Collect "What\'s X doing Y?" instances from TV shows, films, and casual conversations. Notice: the construction NEVER asks about literal actions — it always expresses surprise or disapproval.'
            : s.id === 'map'
              ? 'Map the construction: Wh-element [What] + Subject [X] + Progressive [doing] + Locative [Y]. Analyze the pragmatic role: the construction encodes [speaker evaluates X as inappropriately located in Y].'
              : s.id === 'judge'
                ? 'Rate: "What\'s a nice girl like you doing in a place like this?" (conventional, often humorous) vs. "What\'s a concept like that doing in a scientific paper?" (conventional, disapproving).'
                : s.id === 'contrast'
                  ? 'Contrast with literal question: "What is she doing in the lab?" (information-seeking) vs. "What\'s she doing in the lab?" (pragmatic — disapproval/surprise). The intonation and context disambiguate.'
                  : s.id === 'produce'
                    ? 'Write 5 original "What\'s X doing Y?" sentences for different contexts (campus conversation, workplace, social media). Each must convey disapproval or surprise, not literal inquiry.'
                    : 'Reflect: Why is this construction considered "non-compositional"? How does it challenge traditional views of grammar that assume compositionality? How is it acquired if not compositionally?',
        descriptionZh:
          s.id === 'notice'
            ? '从电视剧、电影和 casual 对话中收集"What\'s X doing Y?"实例。注意：该构式从不询问字面动作——总是表达惊讶或不赞成。'
            : s.id === 'map'
              ? '映射构式：Wh成分[What] + 主语[X] + 进行体[doing] + 处所[Y]。分析语用角色：构式编码[说话者评价X出现在Y中是不恰当的]。'
              : s.id === 'judge'
                ? '评级："What\'s a nice girl like you doing in a place like this?"（约定俗成，常带幽默）vs. "What\'s a concept like that doing in a scientific paper?"（约定俗成，表不赞成）。'
                : s.id === 'contrast'
                  ? '对比字面问句："What is she doing in the lab?"（信息寻求）vs. "What\'s she doing in the lab?"（语用——不赞成/惊讶）。语调和语境消除歧义。'
                  : s.id === 'produce'
                    ? '为不同语境（校园对话、工作场所、社交媒体）写5个原创"What\'s X doing Y?"句子。每个必须传达不赞成或惊讶，而非字面询问。'
                    : '反思：为什么该构式被认为是"非组合性"的？它如何挑战假设组合性的传统语法观？如果不通过组合方式，它是如何被习得的？',
      })),
    },
    {
      constructionId: 'sai-family-constructions',
      constructionName: 'SAI Family Constructions',
      constructionNameZh: 'SAI家族构式',
      goldbergReference: 'Goldberg (1995: Ch. 6) — subject-auxiliary inversion as construction family',
      steps: DEFAULT_STEPS.map((s) => ({
        ...s,
        description:
          s.id === 'notice'
            ? 'Collect SAI instances across registers: questions ("Are you coming?"), conditionals ("Had I known..."), negative fronting ("Never have I seen..."), locative fronting ("Here comes the bus").'
            : s.id === 'map'
              ? 'Map the SAI family: [Aux + Subj + VP]. Identify the shared form and distinct meanings: interrogative, counterfactual, emphatic negative, presentative. How does Goldberg analyze this as a "construction family"?'
              : s.id === 'judge'
                ? 'Rate SAI instances: "Had I known, I would have acted differently" (formal conditional, conventional in academic writing) vs. "Into the room walked a stranger" (literary/locative inversion, conventional in fiction).'
                : s.id === 'contrast'
                  ? 'Contrast SAI conditionals with standard if-conditionals: "Had the evidence been stronger..." (SAI, formal) vs. "If the evidence had been stronger..." (standard, neutral register). Identify the register difference.'
                  : s.id === 'produce'
                    ? 'Write 5 SAI sentences across the construction family: 1 question, 1 conditional, 1 negative fronting, 1 locative fronting, 1 emphatic polar. Discuss the shared form and distinct pragmatic functions.'
                    : 'Reflect: What unifies the SAI "family" of constructions? How does Goldberg\'s construction-family analysis differ from a purely syntactic account of inversion?',
        descriptionZh:
          s.id === 'notice'
            ? '跨语域收集SAI实例：疑问句（"Are you coming?"）、条件句（"Had I known..."）、否定前置（"Never have I seen..."）、处所前置（"Here comes the bus"）。'
            : s.id === 'map'
              ? '映射SAI家族：[Aux + Subj + VP]。识别共享形式和不同意义：疑问、反事实、强调否定、呈现构式。Goldberg如何将其分析为"构式家族"？'
              : s.id === 'judge'
                ? '评级SAI实例："Had I known, I would have acted differently"（正式条件句，学术写作中约定俗成）vs. "Into the room walked a stranger"（文学/处所倒装，小说中约定俗成）。'
                : s.id === 'contrast'
                  ? '对比SAI条件句与标准if条件句："Had the evidence been stronger..."（SAI，正式语域）vs. "If the evidence had been stronger..."（标准，中性语域）。识别语域差异。'
                  : s.id === 'produce'
                    ? '在构式家族中写5个SAI句子：1个疑问句、1个条件句、1个否定前置、1个处所前置、1个强调极性句。讨论共享形式和不同语用功能。'
                    : '反思：什么统一了SAI"家族"构式？Goldberg的构式家族分析与纯粹的句法倒装解释有何不同？',
      })),
    },
    {
      constructionId: 'information-structure-constructions',
      constructionName: 'Information Structure Constructions',
      constructionNameZh: '信息结构构式',
      goldbergReference: 'Goldberg (1995: Ch. 5); Birner & Ward (1998) — information structure and syntax',
      steps: DEFAULT_STEPS.map((s) => ({
        ...s,
        description:
          s.id === 'notice'
            ? 'Collect information-structure constructions: it-clefts ("It was John who left"), pseudoclefts ("What he wanted was money"), preposing ("That book, I really enjoyed"), postposing ("A man came in who looked angry").'
            : s.id === 'map'
              ? 'Map information-structure roles: Topic (given information) vs. Focus (new information) vs. Presupposition (taken-for-granted). Analyze how each construction manipulates the information-status of constituents.'
              : s.id === 'judge'
                ? 'Rate information-structure choices: "John kissed Mary in the garden" (canonical) vs. "It was Mary that John kissed in the garden" (it-cleft: focus on patient) vs. "In the garden, John kissed Mary" (preposing: focus on location).'
                : s.id === 'contrast'
                  ? 'Contrast it-cleft with pseudocleft: "It was the funding issue that they ignored" (it-cleft: presupposes they ignored something) vs. "What they ignored was the funding issue" (pseudocleft: same presupposition, different weight distribution).'
                  : s.id === 'produce'
                    ? 'Write the same underlying proposition using 5 different information-structure constructions (canonical, it-cleft, pseudocleft, preposing, existential there). Discuss the communicative effect of each choice.'
                    : 'Reflect: How do information-structure constructions connect to Goldberg\'s theory? Are they "argument-structure" constructions or a different type? How does Birner & Ward\'s (1998) analysis complement Goldberg\'s?',
        descriptionZh:
          s.id === 'notice'
            ? '收集信息结构构式：it分裂句（"It was John who left"）、伪分裂句（"What he wanted was money"）、前置（"That book, I really enjoyed"）、后置（"A man came in who looked angry"）。'
            : s.id === 'map'
              ? '映射信息结构角色：话题（已知信息）vs.焦点（新信息）vs.预设（被视为理所当然的信息）。分析每个构式如何操控成分的信息状态。'
              : s.id === 'judge'
                ? '评级信息结构选择："John kissed Mary in the garden"（标准语序）vs. "It was Mary that John kissed in the garden"（it分裂句：焦点在受事）vs. "In the garden, John kissed Mary"（前置：焦点在地点）。'
                : s.id === 'contrast'
                  ? '对比it分裂句与伪分裂句："It was the funding issue that they ignored"（it分裂句：预设他们忽略了某事）vs. "What they ignored was the funding issue"（伪分裂句：相同预设，不同权重分配）。'
                  : s.id === 'produce'
                    ? '使用5种不同信息结构构式写同一个底层命题（标准语序、it分裂句、伪分裂句、前置、存在there构式）。讨论每种选择的交际效果。'
                    : '反思：信息结构构式如何与Goldberg的理论连接？它们是"论元结构"构式还是不同类型？Birner & Ward(1998)的分析如何补充Goldberg的框架？',
      })),
    },
  ],
}

// ---------------------------------------------------------------------------
// Export: Learning Path Data
// ---------------------------------------------------------------------------

export const learningPath: LearningPath = {
  id: 'construction-grammar-main-path',
  name: 'Construction Grammar Learning Path',
  nameZh: '构式语法学习路径',
  theoryBase: 'Goldberg (1995, 2006, 2019); Talmy (2000); Kay & Fillmore (1999)',
  levels: [LEVEL_1, LEVEL_2, LEVEL_3],
}

export const allLearningLevels: LearningLevel[] = learningPath.levels

export const allConstructionNodes: ConstructionLearningNode[] =
  learningPath.levels.flatMap((level) => level.constructions)

export const allLearningSteps: LearningStep[] = DEFAULT_STEPS

export const stepOrder: LearningStepId[] = [
  'notice',
  'map',
  'judge',
  'contrast',
  'produce',
  'reflect',
]

// ---------------------------------------------------------------------------
// Utility: Get level by ID
// ---------------------------------------------------------------------------

export function getLevelById(levelId: LearningLevelId): LearningLevel | undefined {
  return learningPath.levels.find((l) => l.id === levelId)
}

export function getConstructionNodeById(
  constructionId: string
): ConstructionLearningNode | undefined {
  return allConstructionNodes.find((c) => c.constructionId === constructionId)
}

export function getStepsForConstruction(
  constructionId: string
): LearningStep[] | undefined {
  return getConstructionNodeById(constructionId)?.steps
}

export function getTotalEstimatedMinutes(): number {
  return allConstructionNodes.reduce(
    (total, node) =>
      total + node.steps.reduce((sum, step) => sum + step.estimatedMinutes, 0),
    0
  )
}

export function getProgressPercent(
  completedSteps: { constructionId: string; stepId: LearningStepId }[]
): number {
  const totalSteps = allConstructionNodes.reduce(
    (sum, node) => sum + node.steps.length,
    0
  )
  const completedCount = completedSteps.length
  return totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0
}
