import { useState, useCallback, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import {
  ChevronLeft,
  ChevronRight,
  Trophy,
  BookOpen,
  CheckCircle2,
  BarChart3,
  RotateCcw,
  ArrowLeft,
  FileText,
  Scale,
  LayoutGrid,
  GitBranch,
  Wrench,
  Sparkles,
  Target,
  BrainCircuit,
  ChevronDown,
  ChevronUp,
  MapPin,
} from 'lucide-react'
import { cn } from '@/lib/utils'

import MeaningFromForm from '@/components/exercises/MeaningFromForm'
import NaturalnessJudgment from '@/components/exercises/NaturalnessJudgment'
import ConstructionSorting from '@/components/exercises/ConstructionSorting'
import RepairSentence from '@/components/exercises/RepairSentence'
import ConstructionPrediction from '@/components/exercises/ConstructionPrediction'

import { exercisesV3 } from '@/data/exercises-v3'
import type { Exercise as AdvancedExercise } from '@/data/exercises-v3'

// ---------------------------------------------------------------------------
// Helpers：根据 exercise 动态生成学习辅助内容
// ---------------------------------------------------------------------------

function generateThinkingSteps(ex: AdvancedExercise): string[] {
  const type = ex.exerciseType
  const baseSteps: Record<string, string[]> = {
    'meaning-from-form': [
      '先通读句子，识别构式的形式特征（如双宾语、致使-移动等）',
      '回忆该构式的核心语义（Goldberg 提出的中心意义）',
      '对比选项，找出最贴合构式核心语义的描述',
      '验证：该动词是否属于该构式的典型成员？',
    ],
    'naturalness-judgment': [
      '先凭语感判断句子是否地道',
      '如果感觉别扭，思考是否有更自然的替代表达',
      '回忆 Goldberg 的 preemption 原则：为何某些动词排斥该构式',
      '结合动词类别和构式语义，给出最终评级',
    ],
    'construction-sorting': [
      '逐一分析每个句子的构式类型',
      '注意形式特征（如动词类型、论元结构）',
      '将相同构式的句子归为一类',
      '检查是否有边缘成员（extension）混入',
    ],
    'repair-sentence': [
      '找出句子中不自然或不合语法的部分',
      '判断问题出在动词选择、论元结构还是语序上',
      '应用构式语法知识进行修正',
      '检查修正后的句子是否符合目标构式的语义',
    ],
    'prototype-to-extension': [
      '识别原型构式的形式-意义配对',
      '分析延伸用法与原型之间的语义联系',
      '判断是否通过隐喻/转喻机制扩展',
      '验证延伸用法在构式中的可接受度',
    ],
    'generate-by-construction': [
      '理解目标构式的论元结构',
      '选择适合该构式的动词类别',
      '按照构式要求排列论元',
      '检查生成的句子是否自然且语义完整',
    ],
    'semantic-role-mapping': [
      '识别句子中的每个论元成分',
      '回忆构式的语义角色框架',
      '将论元映射到对应的语义角色',
      '检查映射是否覆盖构式的所有必要角色',
    ],
  }
  return baseSteps[type] ?? ['仔细读题', '联系构式语法知识', '分析选项', '做出判断']
}

function generateMasteryChecks(ex: AdvancedExercise): string[] {
  return [
    `你能用自己的话解释「${ex.learningObjective || '本题的核心知识点'}」吗？`,
    '如果现在再做一次类似的题，你有信心答对吗？',
    `你能区分「${ex.constructionId}」构式与相关构式的差别吗？`,
  ]
}

function generateFeedbackLevels(ex: AdvancedExercise) {
  const zh = ex.explanationZh
  // 如果解析很短，三层都返回相同内容
  if (zh.length < 60) {
    return { short: zh, detailed: zh, deep: zh }
  }
  // 简短：取前两句或前 80 字
  const short = zh.slice(0, zh.indexOf('。', 60) + 1 || 80)
  // 详细：完整解析
  const detailed = zh
  // 深层：从 Goldberg 理论角度再总结
  const deep =
    `从构式语法理论角度，${ex.goldbergConcept || '本题'}体现了构式与动词的互动关系。` +
    `构式本身具有独立于动词的语义（${ex.targetSkill || '语义功能'}），` +
    `而动词通过与构式的融合贡献其特定的语义成分。` +
    `这种"构式意义 + 动词意义"的叠加效应（compositionality-plus）` +
    `正是 Goldberg (1995, 2006) 所强调的构式语法核心观点。`
  return { short, detailed, deep }
}

function findNextRecommended(currentEx: AdvancedExercise, all: AdvancedExercise[]): { id: string; title: string; reason: string }[] {
  const recs: { id: string; title: string; reason: string }[] = []

  // 1. 同构式、同难度的下一题
  const sameConstr = all.filter(
    (e) => e.constructionId === currentEx.constructionId && e.id !== currentEx.id
  )
  const sameDiff = sameConstr.find((e) => e.difficulty === currentEx.difficulty)
  if (sameDiff) {
    recs.push({
      id: sameDiff.id,
      title: `同构式同难度 · ${sameDiff.prompt.slice(0, 30)}...`,
      reason: '巩固同一构式的核心语义',
    })
  }

  // 2. 同构式、难度提升的下一题
  const diffOrder = { beginner: 1, intermediate: 2, advanced: 3 }
  const harder = sameConstr.find((e) => diffOrder[e.difficulty] > diffOrder[currentEx.difficulty])
  if (harder) {
    recs.push({
      id: harder.id,
      title: `难度提升 · ${harder.prompt.slice(0, 30)}...`,
      reason: '挑战更高难度，加深理解',
    })
  }

  // 3. 不同构式但同难度的题（拓展）
  const crossConstr = all.find(
    (e) => e.constructionId !== currentEx.constructionId && e.difficulty === currentEx.difficulty
  )
  if (crossConstr) {
    recs.push({
      id: crossConstr.id,
      title: `跨构式拓展 · ${crossConstr.prompt.slice(0, 30)}...`,
      reason: '将构式知识迁移到新的构式类型',
    })
  }

  return recs.slice(0, 3)
}

// ---------------------------------------------------------------------------
// Exercise renderer
// ---------------------------------------------------------------------------

function ExerciseRenderer({
  exercise,
  onComplete,
  onNextRecommended,
}: {
  exercise: AdvancedExercise
  onComplete: (isCorrect: boolean, userAnswer: string | string[] | number) => void
  onNextRecommended?: (id: string) => void
}) {
  const commonProps = {
    prompt: exercise.prompt,
    context: exercise.context,
    explanationZh: exercise.explanationZh,
    explanationEn: exercise.explanationEn,
    conventionalityNote: exercise.conventionalityNote,
    semanticRoleExplanation: exercise.semanticRoleExplanation,
    contrastExample: exercise.contrastExample,
    /* v3 增强 */
    learningObjective: exercise.learningObjective,
    thinkingSteps: generateThinkingSteps(exercise),
    masteryChecks: generateMasteryChecks(exercise),
    nextRecommended: findNextRecommended(exercise, exercisesV3),
    feedbackLevels: generateFeedbackLevels(exercise),
    onNextRecommended,
  }

  switch (exercise.exerciseType) {
    case 'meaning-from-form':
      return (
        <MeaningFromForm
          {...commonProps}
          options={exercise.options || []}
          correctAnswer={exercise.correctAnswer}
          onComplete={(isCorrect, userAnswer) => onComplete(isCorrect, userAnswer)}
        />
      )

    case 'naturalness-judgment': {
      const ratingMap: Record<string, number> = { A: 1, B: 2, C: 3, D: 4 }
      const correctRating =
        ratingMap[exercise.correctAnswer as string] || 2
      return (
        <NaturalnessJudgment
          {...commonProps}
          sentence={exercise.options?.[0] || ''}
          correctRating={correctRating}
          onComplete={(isCorrect, userRating) =>
            onComplete(isCorrect, userRating)
          }
        />
      )
    }

    case 'construction-sorting': {
      const items =
        exercise.options?.map((opt, i) => ({
          id: `opt-${i}`,
          label: opt,
          correctOrder: (exercise.correctAnswer as string[]).includes(opt)
            ? (exercise.correctAnswer as string[]).indexOf(opt) + 1
            : i + 1,
        })) || []
      return (
        <ConstructionSorting
          {...commonProps}
          items={items}
          onComplete={(isCorrect, userOrder) =>
            onComplete(isCorrect, userOrder)
          }
        />
      )
    }

    case 'repair-sentence':
      return (
        <RepairSentence
          {...commonProps}
          originalSentence={exercise.prompt}
          options={exercise.options || []}
          correctAnswer={exercise.correctAnswer as string}
          onComplete={(isCorrect, userAnswer) =>
            onComplete(isCorrect, userAnswer)
          }
        />
      )

    case 'prototype-to-extension':
    case 'generate-by-construction':
      return (
        <ConstructionPrediction
          {...commonProps}
          constructionName={exercise.constructionId}
          constructionForm={exercise.constructionId}
          options={exercise.options || []}
          correctAnswer={exercise.correctAnswer as string}
          onComplete={(isCorrect, userAnswer) =>
            onComplete(isCorrect, userAnswer)
          }
        />
      )

    default:
      return (
        <MeaningFromForm
          {...commonProps}
          options={exercise.options || []}
          correctAnswer={exercise.correctAnswer}
          onComplete={(isCorrect, userAnswer) => onComplete(isCorrect, userAnswer)}
        />
      )
  }
}

// ---------------------------------------------------------------------------
// ThinkingStepsBanner — 思考步骤可展开横幅
// ---------------------------------------------------------------------------
function ThinkingStepsBanner({ steps }: { steps: string[] }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl border border-teal-200 dark:border-teal-900 bg-teal-50 dark:bg-teal-950/20 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-teal-100/50 dark:hover:bg-teal-900/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-teal-600" />
          <span className="text-sm font-semibold text-teal-700 dark:text-teal-400">建议思考步骤</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-teal-600" /> : <ChevronDown className="w-4 h-4 text-teal-600" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <ol className="px-4 pb-4 space-y-2">
              {steps.map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-teal-800 dark:text-teal-300">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-teal-200 dark:bg-teal-800 text-teal-800 dark:text-teal-200 text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function PracticePage() {
  const params = useParams();
  const exerciseId = params?.exerciseId as string | undefined
  const router = useRouter()

  const exercises = exercisesV3
  const [currentIndex, setCurrentIndex] = useState(() => {
    if (exerciseId) {
      const idx = exercises.findIndex((e) => e.id === exerciseId)
      return idx >= 0 ? idx : 0
    }
    return 0
  })

  const [results, setResults] = useState<
    { exerciseId: string; isCorrect: boolean; userAnswer: string | string[] | number }[]
  >([])

  useEffect(() => {
    const saved = localStorage.getItem('practiceResults')
    if (saved) setResults(JSON.parse(saved))
  }, [])

  const currentExercise = exercises[currentIndex]
  const completedCount = results.length
  const correctCount = results.filter((r) => r.isCorrect).length
  const accuracy = completedCount > 0 ? Math.round((correctCount / completedCount) * 100) : 0

  const handleComplete = useCallback(
    (isCorrect: boolean, userAnswer: string | string[] | number) => {
      const newResult = {
        exerciseId: currentExercise.id,
        isCorrect,
        userAnswer,
      }
      setResults((prev) => {
        const filtered = prev.filter((r) => r.exerciseId !== currentExercise.id)
        const next = [...filtered, newResult]
        localStorage.setItem('practiceResults', JSON.stringify(next))
        return next
      })
    },
    [currentExercise]
  )

  const handleNext = () => {
    if (currentIndex < filteredExercises.length - 1) {
      setCurrentIndex((i) => i + 1)
      router.push(`/practice/${filteredExercises[currentIndex + 1].id}`)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1)
      router.push(`/practice/${filteredExercises[currentIndex - 1].id}`)
    }
  }

  const handleReset = () => {
    setResults([])
    localStorage.removeItem('practiceResults')
    setCurrentIndex(0)
    router.push('/practice')
  }

  const handleSelectFromList = (index: number) => {
    setCurrentIndex(index)
    router.push(`/practice/${exercises[index].id}`)
  }

  const handleNextRecommended = useCallback(
    (id: string) => {
      const idx = exercises.findIndex((e) => e.id === id)
      if (idx >= 0) {
        setCurrentIndex(idx)
        router.push(`/practice/${id}`)
      }
    },
    [exercises, router]
  )

  const exerciseTypeNames: Record<string, string> = {
    'meaning-from-form': '形式推意义',
    'naturalness-judgment': '自然度判断',
    'construction-sorting': '构式分类',
    'fill-blank': '填空',
    'repair-sentence': '句子修复',
    'semantic-role-mapping': '语义角色映射',
    'construction-prediction': '构式预测',
  }

  const exerciseTypeIcons: Record<string, React.ReactNode> = {
    'meaning-from-form': <FileText className="w-4 h-4" />,
    'naturalness-judgment': <Scale className="w-4 h-4" />,
    'construction-sorting': <LayoutGrid className="w-4 h-4" />,
    'fill-blank': <GitBranch className="w-4 h-4" />,
    'repair-sentence': <Wrench className="w-4 h-4" />,
    'semantic-role-mapping': <BookOpen className="w-4 h-4" />,
    'construction-prediction': <Sparkles className="w-4 h-4" />,
  }


  /* ---------- filter state ---------- */
  const [filterType, setFilterType] = useState<string>('')
  const [filterConstruction, setFilterConstruction] = useState<string>('')
  const [filterDifficulty, setFilterDifficulty] = useState<string>('')

  const constructionNames: Record<string, string> = {
    ditransitive: '双及物构式',
    'caused-motion': '致使-移动构式',
    resultative: '结果构式',
    way: '路径构式',
    'whats-x-doing': "What's X doing Y?",
    sai: '主助倒装家族',
  }

  const difficultyNames: Record<string, string> = {
    beginner: '初级',
    intermediate: '中级',
    advanced: '高级',
  }

  const filteredExercises = exercises.filter((ex: AdvancedExercise) => {
    if (filterType && ex.exerciseType !== filterType) return false
    if (filterConstruction && ex.constructionId !== filterConstruction) return false
    if (filterDifficulty && ex.difficulty !== filterDifficulty) return false
    return true
  })

  // 当前在 filtered list 中的索引
  const filteredIndex = filteredExercises.findIndex((e) => e.id === currentExercise?.id)
  const displayIndex = filteredIndex >= 0 ? filteredIndex + 1 : currentIndex + 1
  const displayTotal = filteredExercises.length

  // 学习路径进度条数据
  const pathProgress = useMemo(() => {
    if (!currentExercise) return { label: '', percent: 0 }
    const constr = currentExercise.constructionId
    const sameConstr = exercises.filter((e) => e.constructionId === constr)
    const doneSameConstr = sameConstr.filter((e) => results.find((r) => r.exerciseId === e.id && r.isCorrect)).length
    const totalSameConstr = sameConstr.length
    return {
      label: `${constructionNames[constr] || constr} 掌握进度`,
      percent: totalSameConstr > 0 ? Math.round((doneSameConstr / totalSameConstr) * 100) : 0,
    }
  }, [currentExercise, exercises, results])

  function ExerciseList({
    results,
    onSelect,
  }: {
    results: { exerciseId: string; isCorrect: boolean }[]
    onSelect: (index: number) => void
  }) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">练习中心</h1>
          <p className="text-sm text-muted-foreground mt-1">选择一道练习开始构式学习</p>
        </div>

        {/* 筛选栏 */}
        <div className="flex flex-wrap gap-3 p-4 rounded-xl border bg-card/50">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 rounded-lg border bg-background text-sm"
          >
            <option value="">所有练习类型</option>
            {Object.entries(exerciseTypeNames).map(([key, name]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
          <select
            value={filterConstruction}
            onChange={(e) => setFilterConstruction(e.target.value)}
            className="px-3 py-2 rounded-lg border bg-background text-sm"
          >
            <option value="">所有构式</option>
            {Object.entries(constructionNames).map(([key, name]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="px-3 py-2 rounded-lg border bg-background text-sm"
          >
            <option value="">所有难度</option>
            {Object.entries(difficultyNames).map(([key, name]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
          {(filterType || filterConstruction || filterDifficulty) && (
            <button
              onClick={() => { setFilterType(''); setFilterConstruction(''); setFilterDifficulty('') }}
              className="px-3 py-2 rounded-lg border hover:bg-accent text-sm text-muted-foreground"
            >
              清除筛选
            </button>
          )}
          <span className="ml-auto text-sm text-muted-foreground self-center">
            共 {filteredExercises.length} 题
          </span>
        </div>
        <div className="grid gap-3">
          {filteredExercises.map((ex, i) => {
            const result = results.find((r) => r.exerciseId === ex.id)
            return (
              <motion.button
                key={ex.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => onSelect(i)}
                className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-accent transition-colors text-left"
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                    result?.isCorrect
                      ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                      : result
                      ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {result?.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : result ? (
                    <div className="w-5 h-5 rounded-full bg-red-500" />
                  ) : (
                    exerciseTypeIcons[ex.exerciseType] || <FileText className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      {exerciseTypeNames[ex.exerciseType] || ex.exerciseType}
                    </span>
                    {result && (
                      <span
                        className={cn(
                          'text-xs font-medium px-2 py-0.5 rounded-full',
                          result.isCorrect
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                            : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                        )}
                      >
                        {result.isCorrect ? '正确' : '错误'}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium truncate mt-0.5">{ex.prompt}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </motion.button>
            )
          })}
        </div>
      </div>
    )
  }

  // When no exerciseId is provided, show the list view
  if (!exerciseId) {
    return (
      <div className="w-full max-w-3xl mx-auto py-8">
        <ExerciseList results={results} onSelect={handleSelectFromList} />
      </div>
    )
  }

  if (!currentExercise) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">暂无练习</h1>
          <p className="text-muted-foreground">练习库为空，请稍后再试。</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 py-8">
      {/* Top stats bar */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              已完成 <strong className="text-foreground">{completedCount}</strong> / {displayTotal}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-muted-foreground">
              正确 <strong className="text-green-600">{correctCount}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-blue-500" />
            <span className="text-muted-foreground">
              正确率 <strong className="text-blue-600">{accuracy}%</strong>
            </span>
          </div>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          重置
        </button>
      </div>

      {/* ═══════════════════════════════════════
          Exercise header（增强版位置指示）
         ═══════════════════════════════════════ */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/practice')}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full font-medium',
                  currentExercise.difficulty === 'advanced'
                    ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    : currentExercise.difficulty === 'intermediate'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                    : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                )}
              >
                {currentExercise.difficulty === 'advanced'
                  ? '高级'
                  : currentExercise.difficulty === 'intermediate'
                  ? '中级'
                  : '初级'}
              </span>
              <span className="text-xs text-muted-foreground">
                {exerciseTypeNames[currentExercise.exerciseType] || currentExercise.exerciseType}
              </span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">
                {constructionNames[currentExercise.constructionId] || currentExercise.constructionId}
              </span>
            </div>
            <h1 className="text-lg font-bold mt-1">
              第{displayIndex}题 / 共{displayTotal}题
            </h1>
          </div>
        </div>

        {results.find((r) => r.exerciseId === currentExercise.id) && (
          <div className="flex items-center gap-1">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-muted-foreground">已完成</span>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════
          学习路径进度条（当前构式掌握度）
         ═══════════════════════════════════════ */}
      <div className="p-4 rounded-xl border bg-card space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span className="font-medium">{pathProgress.label}</span>
          </div>
          <span className="text-muted-foreground">{pathProgress.percent}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
            initial={{ width: 0 }}
            animate={{ width: `${pathProgress.percent}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
      </div>

      {/* ═══════════════════════════════════════
          分段进度指示器
         ═══════════════════════════════════════ */}
      <div className="flex items-center gap-2">
        {filteredExercises.map((_, i) => {
          const result = results.find((r) => r.exerciseId === filteredExercises[i].id)
          return (
            <div
              key={i}
              className={cn(
                'h-2 flex-1 rounded-full transition-all',
                result
                  ? result.isCorrect
                    ? 'bg-green-500'
                    : 'bg-red-400'
                  : i === filteredIndex
                  ? 'bg-blue-500'
                  : 'bg-slate-200 dark:bg-slate-700'
              )}
            />
          )
        })}
      </div>

      {/* ═══════════════════════════════════════
          学习目标横幅
         ═══════════════════════════════════════ */}
      <div className="rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-950/20 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-5 h-5 text-indigo-500" />
          <h2 className="text-sm font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wide">
            本题学习目标
          </h2>
        </div>
        <p className="text-sm text-indigo-800 dark:text-indigo-300 leading-relaxed">
          {currentExercise.learningObjective || '掌握该构式的核心语义与典型用法'}
        </p>
      </div>

      {/* ═══════════════════════════════════════
          思考步骤提示（可展开）
         ═══════════════════════════════════════ */}
      <ThinkingStepsBanner steps={generateThinkingSteps(currentExercise)} />

      {/* Exercise content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentExercise.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <ExerciseRenderer
            exercise={currentExercise}
            onComplete={handleComplete}
            onNextRecommended={handleNextRecommended}
          />
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={cn(
            'flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            currentIndex === 0
              ? 'text-muted-foreground/40 cursor-not-allowed'
              : 'text-foreground hover:bg-accent'
          )}
        >
          <ChevronLeft className="w-4 h-4" />
          上一题
        </button>

        <button
          onClick={handleNext}
          disabled={currentIndex === filteredExercises.length - 1}
          className={cn(
            'flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            currentIndex === filteredExercises.length - 1
              ? 'text-muted-foreground/40 cursor-not-allowed'
              : 'text-foreground hover:bg-accent'
          )}
        >
          下一题
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
