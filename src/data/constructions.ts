export interface SemanticRole {
  role: string;
  description: string;
  example: string;
}

export interface PrototypeExample {
  sentence: string;
  verb: string;
  naturalnessScore: number;
  explanation: string;
}

export interface ExtendedExample {
  sentence: string;
  verb: string;
  naturalnessScore: number;
  explanation: string;
  acceptability: "acceptable" | "marginal";
}

export interface ContrastPair {
  thisExample: string;
  thisNote: string;
  otherConstructionName: string;
  otherExample: string;
  otherNote: string;
}

export interface UsageContext {
  title: string;
  description: string;
}

export interface FormMeaningSlot {
  formSlot: string;
  semanticRole: string;
  meaningSlot: string;
}

export interface ConstructionDetail {
  id: string;
  name: string;
  slug: string;
  category: string;
  difficulty: 1 | 2 | 3;
  formPattern: string;
  semanticFormula: string;
  coreMeaning: string;
  discourseFunction: string;
  explanationZh: string;
  explanationEn: string;
  meaningDescription: string;
  semanticAnchors: string[];
  semanticRoles: SemanticRole[];
  formMeaningMap: FormMeaningSlot[];
  usageContexts: UsageContext[];
  prototypeExamples: PrototypeExample[];
  extendedExamples: ExtendedExample[];
  contrastPairs: ContrastPair[];
  restrictions: string[];
  relatedSlugs: string[];
  tags: string[];
}

export const constructions: ConstructionDetail[] = [
  {
    id: "ditransitive",
    name: "Ditransitive",
    slug: "ditransitive",
    category: "Argument Structure",
    difficulty: 1,
    formPattern: "Subj V Obj\u2081(Recipient) Obj\u2082(Theme)",
    semanticFormula: "Agent causes Recipient to receive Theme",
    coreMeaning: "Agent causes Recipient to receive Theme",
    discourseFunction: "Focuses on the resulting state of possession",
    explanationZh:
      "双及物构式是英语中最常见的论元结构构式之一。其形式为'主语+动词+间接宾语+直接宾语'，核心语义是'施事致使接受者收到客体'。最典型的语义锚点是give，然后可以扩展到send、teach、bake等动词。",
    explanationEn:
      "The Ditransitive Construction expresses caused possession. The construction itself contributes the meaning that the agent causes the recipient to receive the theme, independent of the verb.",
    meaningDescription:
      "The ditransitive construction expresses the meaning 'Agent causes Recipient to receive Theme.' This is more than just 'a verb with two objects' \u2014 it's a specific pairing of form (Subject\u2013Verb\u2013Object\u2013Object) with a transfer-of-possession meaning.\n\nThe construction is highly productive: many verbs can appear in it, but they must be semantically compatible with the caused-reception meaning. Prototypical verbs include *give*, *send*, *show*, and *teach*. More creative extensions include *bake*, *sing*, and even *smile* (as in 'She smiled herself an upgrade').",
    semanticAnchors: ["give", "send", "teach", "show", "tell", "bake", "cook", "make", "buy", "offer"],
    semanticRoles: [
      { role: "Agent", description: "The entity that causes the transfer", example: "She" },
      { role: "Verb", description: "Transfer action", example: "gave" },
      { role: "Recipient", description: "The entity that receives", example: "him" },
      { role: "Theme", description: "The entity transferred", example: "a book" },
    ],
    formMeaningMap: [
      { formSlot: "Subj", semanticRole: "Agent", meaningSlot: "Agent" },
      { formSlot: "V", semanticRole: "Predicate", meaningSlot: "causes receive" },
      { formSlot: "Obj\u2081", semanticRole: "Recipient", meaningSlot: "Recipient" },
      { formSlot: "Obj\u2082", semanticRole: "Theme", meaningSlot: "Theme" },
    ],
    usageContexts: [
      {
        title: "Physical Transfer",
        description:
          "Giving physical objects: 'She gave him a book.' 'He handed her the keys.' These are the most prototypical uses.",
      },
      {
        title: "Communication Transfer",
        description:
          "Transferring information: 'He told her a story.' 'She taught me French.' The 'theme' is abstract.",
      },
      {
        title: "Future Transfer",
        description:
          "Promised or intended transfer: 'He promised her a ring.' 'She owes me an explanation.'",
      },
      {
        title: "Creative Extension",
        description:
          "Less typical but acceptable uses: 'She baked him a cake.' 'He whistled her a tune.' 'She smiled herself an upgrade.' These extend the construction beyond literal transfer.",
      },
    ],
    prototypeExamples: [
      {
        sentence: "She **gave** him **a book**.",
        verb: "give",
        naturalnessScore: 95,
        explanation: "The most prototypical ditransitive verb \u2014 direct physical transfer.",
      },
      {
        sentence: "He **sent** her **a letter**.",
        verb: "send",
        naturalnessScore: 92,
        explanation: "Caused transfer over distance \u2014 a natural extension of give.",
      },
      {
        sentence: "She **taught** me **a lesson**.",
        verb: "teach",
        naturalnessScore: 88,
        explanation: "Abstract transfer of knowledge \u2014 a well-entrenched use.",
      },
      {
        sentence: "He **showed** her **the photo**.",
        verb: "show",
        naturalnessScore: 85,
        explanation: "Visual/attentional transfer \u2014 sharing experience.",
      },
    ],
    extendedExamples: [
      {
        sentence: "She **baked** him **a cake**.",
        verb: "bake",
        naturalnessScore: 72,
        explanation: "Creative use \u2014 the cake is created for the recipient.",
        acceptability: "acceptable",
      },
      {
        sentence: "He **whistled** her **a tune**.",
        verb: "whistle",
        naturalnessScore: 65,
        explanation: "Auditory transfer \u2014 communication via performance.",
        acceptability: "acceptable",
      },
      {
        sentence: "She **smiled** herself **an upgrade**.",
        verb: "smile",
        naturalnessScore: 55,
        explanation: "Non-verbal communication leading to reception \u2014 a stretch but understood.",
        acceptability: "marginal",
      },
      {
        sentence: "He **sneezed** her **a tissue**.",
        verb: "sneeze",
        naturalnessScore: 45,
        explanation: "Pushing the boundary \u2014 humorous/creative but interpretable.",
        acceptability: "marginal",
      },
    ],
    contrastPairs: [
      {
        thisExample: "She **gave** him **a book**.",
        thisNote: "Direct transfer \u2014 the ditransitive emphasizes successful reception.",
        otherConstructionName: "Prepositional Dative",
        otherExample: "She **gave** a book **to him**.",
        otherNote:
          "The prepositional dative emphasizes the path of transfer. Both are natural, but native speakers prefer the ditransitive with personal pronoun recipients.",
      },
      {
        thisExample: "She **threw** him **the ball**.",
        thisNote: "Intended reception \u2014 the ball is meant for him to catch.",
        otherConstructionName: "Caused-Motion",
        otherExample: "She **threw** the ball **to him**.",
        otherNote:
          "Caused motion along a path \u2014 the ball moves toward him. The meaning difference is subtle: ditransitive implies intended reception, caused-motion just implies direction.",
      },
    ],
    restrictions: [
      "Recipient must be construable as capable of receiving/possessing (animate or organization)",
      "*She sent storage a book. (storage cannot possess)",
      "*Liza donated the library a book. (blocked by prepositional alternative \u2014 statistical preemption)",
    ],
    relatedSlugs: ["caused-motion", "resultative", "transitive"],
    tags: ["argument-structure", "transfer", "caused-possession", "beginner"],
  },
  {
    id: "caused-motion",
    name: "Caused-Motion",
    slug: "caused-motion",
    category: "Motion",
    difficulty: 1,
    formPattern: "Subj V Obj Path",
    semanticFormula: "Causer causes Theme to move along Path",
    coreMeaning: "Causer causes Theme to move along Path",
    discourseFunction: "Focuses on movement trajectory",
    explanationZh:
      "致使移动构式表达'致使者使客体沿路径移动'的语义。其形式为'主语+动词+宾语+路径'，路径可以是介词短语（如into the room）或副词（如away）。",
    explanationEn:
      "The Caused-Motion Construction expresses that a causer causes a theme to move along a path. Even verbs that don't inherently involve motion can be used creatively in this construction.",
    meaningDescription:
      "The Caused-Motion construction expresses the meaning 'Causer causes Theme to move along Path.' This construction is remarkable because it can coerce motion meaning onto verbs that don't inherently involve movement.\n\nFor example, *sneeze* is normally an intransitive verb describing an involuntary action. But in 'He sneezed the napkin off the table,' the Caused-Motion construction provides the 'cause to move' meaning frame, and *sneeze* contributes the manner of causation.\n\nThis demonstrates a key principle of Construction Grammar: constructions themselves carry meaning, independent of the verbs that appear in them.",
    semanticAnchors: ["put", "throw", "push", "pull", "drop", "kick", "blow", "sneeze", "laugh", "wave"],
    semanticRoles: [
      { role: "Causer", description: "The entity causing movement", example: "He" },
      { role: "Verb", description: "Action causing movement", example: "sneezed" },
      { role: "Theme", description: "The entity that moves", example: "the napkin" },
      { role: "Path", description: "The trajectory of movement", example: "off the table" },
    ],
    formMeaningMap: [
      { formSlot: "Subj", semanticRole: "Causer", meaningSlot: "Causer" },
      { formSlot: "V", semanticRole: "Predicate", meaningSlot: "causes move" },
      { formSlot: "Obj", semanticRole: "Theme", meaningSlot: "Theme" },
      { formSlot: "Path", semanticRole: "Path", meaningSlot: "Path" },
    ],
    usageContexts: [
      {
        title: "Direct Physical Movement",
        description:
          "Causing an object to change location: 'He threw the ball over the fence.' 'She put the cup on the table.'",
      },
      {
        title: "Manner of Motion",
        description:
          "Verbs that describe how the causing happened: 'He kicked the door open.' 'She waved him goodbye.'",
      },
      {
        title: "Creative Coercion",
        description:
          "Verbs without inherent motion: 'He sneezed the napkin off the table.' 'She laughed the conversation to an end.' The construction supplies the motion meaning.",
      },
      {
        title: "Metaphorical Path",
        description:
          "Abstract paths: 'He talked himself into a corner.' 'She slept her way to the top.' The path is metaphorical.",
      },
    ],
    prototypeExamples: [
      {
        sentence: "He **threw** the ball **over the fence**.",
        verb: "throw",
        naturalnessScore: 95,
        explanation: "Prototypical caused motion \u2014 direct physical action with clear trajectory.",
      },
      {
        sentence: "She **put** the cup **on the table**.",
        verb: "put",
        naturalnessScore: 93,
        explanation: "The most central caused-motion verb \u2014 deliberate placement.",
      },
      {
        sentence: "He **pushed** the cart **across the room**.",
        verb: "push",
        naturalnessScore: 90,
        explanation: "Sustained force causing movement.",
      },
      {
        sentence: "She **dropped** the letter **into the box**.",
        verb: "drop",
        naturalnessScore: 88,
        explanation: "Gravity-assisted caused motion.",
      },
    ],
    extendedExamples: [
      {
        sentence: "He **sneezed** the napkin **off the table**.",
        verb: "sneeze",
        naturalnessScore: 68,
        explanation: "No inherent motion verb \u2014 the construction supplies the caused-motion meaning.",
        acceptability: "acceptable",
      },
      {
        sentence: "She **laughed** the conversation **to an end**.",
        verb: "laugh",
        naturalnessScore: 62,
        explanation: "Abstract caused motion through laughter.",
        acceptability: "acceptable",
      },
      {
        sentence: "He **whistled** the dogs **into the yard**.",
        verb: "whistle",
        naturalnessScore: 70,
        explanation: "Sound-mediated caused motion.",
        acceptability: "acceptable",
      },
      {
        sentence: "She **cried** herself **to sleep**.",
        verb: "cry",
        naturalnessScore: 78,
        explanation: "Reflexive caused motion \u2014 a conventionalized expression.",
        acceptability: "acceptable",
      },
    ],
    contrastPairs: [
      {
        thisExample: "She **threw** the ball **into the basket**.",
        thisNote: "Focus on the trajectory and endpoint of movement.",
        otherConstructionName: "Transitive",
        otherExample: "She **threw** the ball.",
        otherNote: "Focus only on the action \u2014 no path is specified.",
      },
      {
        thisExample: "He **sneezed** the napkin **off the table**.",
        thisNote: "The construction provides the caused-motion meaning that sneeze lacks.",
        otherConstructionName: "Intransitive",
        otherExample: "He **sneezed**.",
        otherNote: "The verb in its basic intransitive use \u2014 no caused-motion meaning.",
      },
    ],
    restrictions: [
      "The verb must be construable as contributing manner or means of causation",
      "The path must be a plausible trajectory",
      "*He slept the napkin off the table. (semantically incompatible)",
    ],
    relatedSlugs: ["ditransitive", "way-construction", "resultative"],
    tags: ["motion", "causation", "creative-coercion", "beginner"],
  },
  {
    id: "resultative",
    name: "Resultative",
    slug: "resultative",
    category: "Resultative",
    difficulty: 2,
    formPattern: "Subj V Obj Result-AP",
    semanticFormula: "Agent causes Patient to become Result State",
    coreMeaning: "Agent causes Patient to become Result State",
    discourseFunction: "Focuses on the end-state of the affected entity",
    explanationZh:
      "结果构式表达'施事致使受事变为某种结果状态'。形式为'主语+动词+宾语+结果形容词/短语'。如hammer the metal flat（把金属锤平）中，flat表达了动作导致的结果状态。",
    explanationEn:
      "The Resultative Construction expresses that an agent causes a patient to enter a result state. The result phrase (adjective or prepositional phrase) describes the state of the patient after the action.",
    meaningDescription:
      "The Resultative construction pairs an action with the end-state it produces: 'Agent causes Patient to become Result State.' This construction allows speakers to package an action and its result into a single clause.\n\nThe result phrase can be an adjective (*flat*, *open*, *dry*) or a prepositional phrase (*to death*, *into pieces*). What's crucial is that the result state describes the patient \u2014 the entity directly affected by the action.\n\nEven verbs that don't inherently produce a change of state can appear in this construction because the construction itself contributes the 'become Result State' meaning. For example, *cry* normally doesn't change the state of anything, but in 'He cried himself to sleep,' the resultative construction licenses the result phrase *to sleep*.",
    semanticAnchors: ["hammer", "wipe", "wash", "paint", "kick", "shoot", "run", "cry", "talk", "eat"],
    semanticRoles: [
      { role: "Agent", description: "The entity performing the action", example: "She" },
      { role: "Verb", description: "The action performed", example: "hammered" },
      { role: "Patient", description: "The entity affected and changed", example: "the metal" },
      { role: "Result", description: "The end-state of the patient", example: "flat" },
    ],
    formMeaningMap: [
      { formSlot: "Subj", semanticRole: "Agent", meaningSlot: "Agent" },
      { formSlot: "V", semanticRole: "Predicate", meaningSlot: "causes become" },
      { formSlot: "Obj", semanticRole: "Patient", meaningSlot: "Patient" },
      { formSlot: "Result-AP", semanticRole: "Result State", meaningSlot: "Result State" },
    ],
    usageContexts: [
      {
        title: "Physical Change of State",
        description:
          "Concrete, visible changes: 'She hammered the metal flat.' 'He wiped the table clean.'",
      },
      {
        title: "Change of Position",
        description:
          "Movement resulting in a new position: 'She kicked the door open.' 'He pushed the window shut.'",
      },
      {
        title: "Metaphorical Result",
        description:
          "Abstract results: 'He talked himself hoarse.' 'She ran herself ragged.' The result is not physical.",
      },
      {
        title: "Reflexive Resultative",
        description:
          "Subject affects themselves: 'He cried himself to sleep.' 'She ate herself sick.' The reflexive pronoun serves as the patient.",
      },
    ],
    prototypeExamples: [
      {
        sentence: "She **hammered** the metal **flat**.",
        verb: "hammer",
        naturalnessScore: 94,
        explanation: "The canonical resultative \u2014 physical action produces visible change of shape.",
      },
      {
        sentence: "He **wiped** the table **clean**.",
        verb: "wipe",
        naturalnessScore: 92,
        explanation: "Change of state through repeated action \u2014 very natural.",
      },
      {
        sentence: "She **kicked** the door **open**.",
        verb: "kick",
        naturalnessScore: 90,
        explanation: "Instantaneous change of state through force.",
      },
      {
        sentence: "He **painted** the fence **white**.",
        verb: "paint",
        naturalnessScore: 91,
        explanation: "Change of color/appearance \u2014 a common resultative type.",
      },
    ],
    extendedExamples: [
      {
        sentence: "He **cried** himself **to sleep**.",
        verb: "cry",
        naturalnessScore: 82,
        explanation: "Reflexive resultative \u2014 conventional but non-literal.",
        acceptability: "acceptable",
      },
      {
        sentence: "She **talked** him **into submission**.",
        verb: "talk",
        naturalnessScore: 75,
        explanation: "Abstract resultative \u2014 the result is metaphorical.",
        acceptability: "acceptable",
      },
      {
        sentence: "He **ran** his shoes **threadbare**.",
        verb: "run",
        naturalnessScore: 65,
        explanation: "Gradual wear as a result state.",
        acceptability: "acceptable",
      },
      {
        sentence: "She **danced** the night **away**.",
        verb: "dance",
        naturalnessScore: 78,
        explanation: "Idiomatic resultative \u2014 the night is 'used up' by dancing.",
        acceptability: "acceptable",
      },
    ],
    contrastPairs: [
      {
        thisExample: "She **hammered** the metal **flat**.",
        thisNote: "The metal became flat as a result of hammering.",
        otherConstructionName: "Transitive",
        otherExample: "She **hammered** the metal.",
        otherNote: "No result state specified \u2014 we only know the action occurred.",
      },
      {
        thisExample: "He **wiped** the table **clean**.",
        thisNote: "Result state (clean) is predicated of the patient (the table).",
        otherConstructionName: "Adverbial Modification",
        otherExample: "He **wiped** the table **carefully**.",
        otherNote: "The adverb modifies the action, not a result state of the patient.",
      },
    ],
    restrictions: [
      "The result phrase must be predicated of the patient (the object)",
      "*She hammered the metal tired. (tired can't describe the metal)",
      "The verb must be construable as causing the change of state",
    ],
    relatedSlugs: ["caused-motion", "ditransitive", "transitive"],
    tags: ["result", "change-of-state", "intermediate"],
  },
  {
    id: "way-construction",
    name: "Way Construction",
    slug: "way-construction",
    category: "Motion",
    difficulty: 2,
    formPattern: "Subj V Poss-way Path",
    semanticFormula: "Subject moves along path by means of verb action",
    coreMeaning: "Subject moves along path by means of verb action",
    discourseFunction: "Emphasizes the effortful or determined nature of movement",
    explanationZh:
      "道路构式表达'主语通过某种动作沿着路径移动'的语义，且常含有'克服障碍'的隐含意义。形式为'主语+动词+物主代词+way+路径'。",
    explanationEn:
      "The Way Construction expresses that the subject moves along a path by means of the action denoted by the verb. It often implies effort or determination in overcoming obstacles.",
    meaningDescription:
      "The Way construction expresses that the subject moves along a path by means of the verb action: 'Subject moves along path by means of verb action.' This construction is special because it requires the reflexive possessive pronoun (*his*, *her*, *its*) followed by the noun *way*.\n\nA key feature of this construction is that it typically implies effortful or obstacle-overcoming movement. 'He pushed his way through the crowd' suggests that the crowd presented resistance and the subject had to exert effort.\n\nMany verbs that don't normally describe directed motion can appear in this construction because the construction provides the 'move along a path' meaning frame.",
    semanticAnchors: ["push", "fight", "wiggle", "wind", "elbow", "claw", "feel", "sing", "dance", "talk"],
    semanticRoles: [
      { role: "Subject", description: "The entity that moves", example: "He" },
      { role: "Verb", description: "The means of movement", example: "pushed" },
      { role: "Poss-way", description: "Reflexive way NP", example: "his way" },
      { role: "Path", description: "The trajectory followed", example: "through the crowd" },
    ],
    formMeaningMap: [
      { formSlot: "Subj", semanticRole: "Mover", meaningSlot: "Subject" },
      { formSlot: "V", semanticRole: "Means", meaningSlot: "move by means of" },
      { formSlot: "Poss-way", semanticRole: "Path NP", meaningSlot: "Path" },
      { formSlot: "Path", semanticRole: "Direction", meaningSlot: "Direction" },
    ],
    usageContexts: [
      {
        title: "Effortful Movement",
        description:
          "Overcoming resistance: 'He pushed his way through the crowd.' 'She fought her way to the front.'",
      },
      {
        title: "Determined Progress",
        description:
          "Persistent movement toward a goal: 'He worked his way up the ladder.' 'She talked her way into the meeting.'",
      },
      {
        title: "Indirect Path",
        description:
          "Non-direct movement: 'The river wound its way through the valley.' 'He wiggled his way out of the situation.'",
      },
      {
        title: "Metaphorical Path",
        description:
          "Abstract progress: 'She danced her way into his heart.' 'He lied his way out of trouble.' The path is metaphorical.",
      },
    ],
    prototypeExamples: [
      {
        sentence: "He **pushed** his **way** **through the crowd**.",
        verb: "push",
        naturalnessScore: 94,
        explanation: "The canonical way construction \u2014 effortful physical movement.",
      },
      {
        sentence: "She **fought** her **way** **to the top**.",
        verb: "fight",
        naturalnessScore: 90,
        explanation: "Determined progress against resistance.",
      },
      {
        sentence: "He **worked** his **way** **through college**.",
        verb: "work",
        naturalnessScore: 88,
        explanation: "Gradual, effortful progress through a metaphorical path.",
      },
      {
        sentence: "The snake **wound** its **way** **across the path**.",
        verb: "wind",
        naturalnessScore: 86,
        explanation: "Indirect, sinuous movement along a path.",
      },
    ],
    extendedExamples: [
      {
        sentence: "She **talked** her **way** **out of trouble**.",
        verb: "talk",
        naturalnessScore: 78,
        explanation: "Metaphorical movement \u2014 escaping a situation through speech.",
        acceptability: "acceptable",
      },
      {
        sentence: "He **elbowed** his **way** **to the bar**.",
        verb: "elbow",
        naturalnessScore: 82,
        explanation: "Body-part verb used for forceful movement.",
        acceptability: "acceptable",
      },
      {
        sentence: "She **sang** her **way** **into everyone's heart**.",
        verb: "sing",
        naturalnessScore: 72,
        explanation: "Highly metaphorical \u2014 winning affection through song.",
        acceptability: "acceptable",
      },
      {
        sentence: "He **danced** his **way** **to fame**.",
        verb: "dance",
        naturalnessScore: 75,
        explanation: "Metaphorical path to success.",
        acceptability: "acceptable",
      },
    ],
    contrastPairs: [
      {
        thisExample: "He **pushed** his **way** **through the crowd**.",
        thisNote: "Implies effortful movement with obstacle-overcoming.",
        otherConstructionName: "Caused-Motion",
        otherExample: "He **pushed** through the crowd.",
        otherNote: "Simple caused motion without the 'way' NP \u2014 less emphasis on effort and duration.",
      },
      {
        thisExample: "She **talked** her **way** **out of trouble**.",
        thisNote: "The construction enables a non-motion verb to express metaphorical movement.",
        otherConstructionName: "Transitive",
        otherExample: "She **talked** her way out.",
        otherNote: "Without the full path phrase, the resultative/motion meaning is incomplete.",
      },
    ],
    restrictions: [
      "Must include reflexive possessive + 'way' (his way, her way, its way)",
      "The verb must be construable as a means of movement",
      "*He slept his way through the meeting. (only in limited contexts)",
    ],
    relatedSlugs: ["caused-motion", "ditransitive", "resultative"],
    tags: ["motion", "path", "effort", "intermediate"],
  },
  {
    id: "whats-doing",
    name: "What's X Doing Y?",
    slug: "whats-doing",
    category: "Question",
    difficulty: 3,
    formPattern: "What is X doing Y?",
    semanticFormula: "Presence or action of X in Y is unexpected",
    coreMeaning: "Presence or action of X in Y is unexpected",
    discourseFunction: "Expresses surprise at incongruous situation",
    explanationZh:
      "'What's X Doing Y?'构式用于表达'X出现在Y中是出乎意料的'。表面上是问句，实际表达的是说话人对不协调情境的惊讶。",
    explanationEn:
      "The 'What's X Doing Y?' construction expresses that the presence or action of X in location/situation Y is unexpected or incongruous. Despite its interrogative form, it's primarily an expression of surprise.",
    meaningDescription:
      "Despite looking like a question about intentional action, the 'What's X Doing Y?' construction is used to express surprise that something is in a place or situation where it doesn't belong.\n\nWhen someone asks 'What is this fly doing in my soup?' they're not genuinely inquiring about the fly's intentions or activities. They're expressing that the fly's presence in the soup is unexpected and unwelcome.\n\nThis is a classic example of a construction with non-compositional meaning: you can't derive the surprise meaning from the individual words and the grammar of questions. The construction itself carries the 'incongruity' meaning.",
    semanticAnchors: ["do", "be"],
    semanticRoles: [
      { role: "X", description: "The unexpected entity", example: "this fly" },
      { role: "Y", description: "The unexpected location/situation", example: "in my soup" },
    ],
    formMeaningMap: [
      { formSlot: "What is", semanticRole: "Question frame", meaningSlot: "expresses surprise" },
      { formSlot: "X", semanticRole: "Unexpected entity", meaningSlot: "X" },
      { formSlot: "doing", semanticRole: "Incongruity marker", meaningSlot: "presence in" },
      { formSlot: "Y", semanticRole: "Unexpected context", meaningSlot: "Y" },
    ],
    usageContexts: [
      {
        title: "Physical Incongruity",
        description:
          "Something is where it shouldn't be: 'What is this fly doing in my soup?' 'What's your shoe doing on the table?'",
      },
      {
        title: "Behavioral Surprise",
        description:
          "Someone is acting unexpectedly: 'What's he doing sleeping at his desk?' 'What's she doing wearing that?'",
      },
      {
        title: "Metaphorical Incongruity",
        description:
          "Abstract mismatches: 'What's humility doing in a speech about self-promotion?'",
      },
      {
        title: "Humorous/Sarcastic Use",
        description:
          "Playful surprise: 'What's a nice person like you doing in a place like this?'",
      },
    ],
    prototypeExamples: [
      {
        sentence: "What is this **fly doing** in my **soup**?",
        verb: "doing",
        naturalnessScore: 95,
        explanation: "The canonical example \u2014 something is where it shouldn't be.",
      },
      {
        sentence: "What's your **shoe doing** on the **table**?",
        verb: "doing",
        naturalnessScore: 90,
        explanation: "Object in an inappropriate location.",
      },
      {
        sentence: "What is he **doing sleeping** at his **desk**?",
        verb: "doing",
        naturalnessScore: 85,
        explanation: "Unexpected behavior in a context.",
      },
      {
        sentence: "What's a nice person like you **doing** in a place like **this**?",
        verb: "doing",
        naturalnessScore: 88,
        explanation: "Conventionalized humorous/social use.",
      },
    ],
    extendedExamples: [
      {
        sentence: "What's **logic doing** in an argument like **this**?",
        verb: "doing",
        naturalnessScore: 68,
        explanation: "Metaphorical incongruity \u2014 abstract surprise.",
        acceptability: "acceptable",
      },
      {
        sentence: "What's **happiness doing** in a world full of **sorrow**?",
        verb: "doing",
        naturalnessScore: 62,
        explanation: "Poetic/philosophical extension.",
        acceptability: "acceptable",
      },
      {
        sentence: "What are **ethics doing** in a corporate **boardroom**?",
        verb: "doing",
        naturalnessScore: 65,
        explanation: "Sarcastic commentary on unexpected context.",
        acceptability: "acceptable",
      },
      {
        sentence: "What's **common sense doing** in modern **politics**?",
        verb: "doing",
        naturalnessScore: 60,
        explanation: "Satirical use \u2014 commentary on incongruity.",
        acceptability: "marginal",
      },
    ],
    contrastPairs: [
      {
        thisExample: "What is this **fly doing** in my soup?",
        thisNote: "Expresses surprise at incongruity \u2014 the fly shouldn't be there.",
        otherConstructionName: "Information-Seeking Question",
        otherExample: "What **is** this fly **doing**?",
        otherNote: "A genuine question about the fly's activities \u2014 the in-situ stress pattern makes it information-seeking.",
      },
      {
        thisExample: "What's your shoe **doing** on the table?",
        thisNote: "The construction signals that the situation is unexpected.",
        otherConstructionName: "WH-Cleft",
        otherExample: "**What your shoe is doing** on the table is making a mess.",
        otherNote: "A different construction entirely \u2014 here 'what your shoe is doing' is a nominalized clause subject.",
      },
    ],
    restrictions: [
      "Cannot be used as a genuine information-seeking question about intention",
      "X must be construable as incongruous in context Y",
      "*What is the president doing in the Oval Office? (not incongruous)",
    ],
    relatedSlugs: ["subject-auxiliary-inversion"],
    tags: ["question", "incongruity", "surprise", "advanced"],
  },
  {
    id: "subject-auxiliary-inversion",
    name: "Subject-Auxiliary Inversion",
    slug: "subject-auxiliary-inversion",
    category: "Information Structure",
    difficulty: 3,
    formPattern: "Aux Subject Verb ...",
    semanticFormula: "Non-prototypical assertion: question, conditional, exclamative",
    coreMeaning: "Non-prototypical assertion: question, conditional, exclamative",
    discourseFunction: "Signals non-assertive or marked information structure",
    explanationZh:
      "主语-助动词倒装构式（SAI）通过将助动词置于主语之前，标记句子为非典型陈述。用于疑问句、条件句、感叹句等。",
    explanationEn:
      "Subject-Auxiliary Inversion places the auxiliary verb before the subject to signal that the utterance is not a prototypical assertion. It appears in questions, conditionals, exclamatives, and other marked contexts.",
    meaningDescription:
      "Subject-Auxiliary Inversion (SAI) is a family of related constructions in which the auxiliary verb appears before the subject rather than after it. This formal pattern consistently signals that the utterance is not a prototypical assertion.\n\nThe SAI family includes:\n\n1. **Polar questions**: 'Had I known?' (= 'Did I know?')\n2. **Conditionals without if**: 'Had I known, I would have stayed.' (= 'If I had known...')\n3. **Negative inversion**: 'Never have I seen such beauty.'\n4. **Exclamatives**: 'Wasn't that a great concert!'\n\nWhat unifies all these uses is that they depart from the default Subject-Auxiliary-Verb order of declarative English. This formal marking signals to the listener that something special is going on \u2014 a question, a hypothetical, an exclamation, or some other non-assertive function.",
    semanticAnchors: ["be", "have", "do", "will", "would", "can", "could", "shall", "should", "may", "might"],
    semanticRoles: [
      { role: "Auxiliary", description: "The inverted auxiliary verb", example: "Had" },
      { role: "Subject", description: "The subject following the auxiliary", example: "I" },
      { role: "Verb", description: "The main verb/remainder of the predicate", example: "known" },
    ],
    formMeaningMap: [
      { formSlot: "Aux", semanticRole: "Inversion marker", meaningSlot: "non-assertive" },
      { formSlot: "Subject", semanticRole: "Topic", meaningSlot: "Subject" },
      { formSlot: "Verb...", semanticRole: "Predicate", meaningSlot: "Predicate" },
    ],
    usageContexts: [
      {
        title: "Polar Questions",
        description:
          "Yes/no questions: 'Had I known?' 'Are you coming?' 'Did she finish?'",
      },
      {
        title: "Conditional without if",
        description:
          "Formal conditional inversion: 'Had I known, I would have stayed.' 'Were I you, I would decline.' (= 'If I were you...')",
      },
      {
        title: "Negative Inversion",
        description:
          "Emphatic negation fronting: 'Never have I seen such beauty.' 'Rarely does he complain.'",
      },
      {
        title: "Exclamative",
        description:
          "Exclamatory statements: 'Wasn't that a great concert!' 'Boy, is it hot!'",
      },
    ],
    prototypeExamples: [
      {
        sentence: "**Had** **I** known, I would have stayed.",
        verb: "have",
        naturalnessScore: 92,
        explanation: "Classic conditional inversion \u2014 formal, elegant alternative to 'if'.",
      },
      {
        sentence: "**Are** **you** coming to the party?",
        verb: "be",
        naturalnessScore: 95,
        explanation: "The most prototypical SAI use \u2014 polar question with be.",
      },
      {
        sentence: "**Did** **she** finish the assignment?",
        verb: "do",
        naturalnessScore: 94,
        explanation: "Prototypical polar question with do-support.",
      },
      {
        sentence: "**Were** **I** you, I would decline the offer.",
        verb: "be",
        naturalnessScore: 88,
        explanation: "Subjunctive conditional inversion \u2014 formal register.",
      },
    ],
    extendedExamples: [
      {
        sentence: "**Never have** **I** seen such beauty.",
        verb: "have",
        naturalnessScore: 82,
        explanation: "Negative fronting with inversion \u2014 emphatic and literary.",
        acceptability: "acceptable",
      },
      {
        sentence: "**Rarely does** **he** complain about anything.",
        verb: "do",
        naturalnessScore: 80,
        explanation: "Negative adverb fronting triggers inversion.",
        acceptability: "acceptable",
      },
      {
        sentence: "**Boy, is** **it** hot today!",
        verb: "be",
        naturalnessScore: 75,
        explanation: "Exclamative inversion with an expletive.",
        acceptability: "acceptable",
      },
      {
        sentence: "**Had** **he** but tried, he might have succeeded.",
        verb: "have",
        naturalnessScore: 68,
        explanation: "Archaic conditional with 'but' \u2014 literary/poetic.",
        acceptability: "marginal",
      },
    ],
    contrastPairs: [
      {
        thisExample: "**Had** **I** known, I would have stayed.",
        thisNote: "Conditional inversion \u2014 formal register, no 'if' needed.",
        otherConstructionName: "Declarative Conditional",
        otherExample: "**If I had** known, I would have stayed.",
        otherNote: "Standard conditional with 'if' \u2014 no inversion, more common in speech.",
      },
      {
        thisExample: "**Never have** **I** seen such beauty.",
        thisNote: "Negative fronting with SAI \u2014 emphatic, formal.",
        otherConstructionName: "Standard Declarative",
        otherExample: "**I have** never seen such beauty.",
        otherNote: "Standard word order \u2014 neutral emphasis.",
      },
    ],
    restrictions: [
      "Only auxiliaries (be, have, do, modals) can invert, not main verbs",
      "*Came he? (incorrect \u2014 must use 'Did he come?')",
      "Declining use in modern English except in formal/literary registers",
    ],
    relatedSlugs: ["whats-doing"],
    tags: ["information-structure", "inversion", "advanced", "question"],
  },
];

/* Helper: return all unique categories */
export const getCategories = (): string[] => {
  const cats = new Set(constructions.map((c) => c.category));
  return ["All", ...Array.from(cats).sort()];
};

/* Helper: lookup by slug */
export const getConstructionBySlug = (slug: string): ConstructionDetail | undefined => {
  return constructions.find((c) => c.slug === slug);
};

/* Helper: get related constructions */
export const getRelatedConstructions = (slug: string): ConstructionDetail[] => {
  const c = getConstructionBySlug(slug);
  if (!c) return [];
  return c.relatedSlugs
    .map((s) => getConstructionBySlug(s))
    .filter(Boolean) as ConstructionDetail[];
};
