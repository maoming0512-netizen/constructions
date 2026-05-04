import { PrismaClient } from '@prisma/client'
import { exercisesV3 } from '../src/data/exercises-v3'

const prisma = new PrismaClient()

function mapDifficulty(difficulty: string): number {
  switch (difficulty) {
    case 'beginner': return 1
    case 'intermediate': return 2
    case 'advanced': return 3
    default: return 1
  }
}

async function importExercises() {
  console.log(`开始导入 ${exercisesV3.length} 道练习题...`)
  
  let successCount = 0
  let errorCount = 0
  
  for (const exercise of exercisesV3) {
    try {
      // 构建问题数据
      const questionData = {
        id: exercise.id,
        prompt: exercise.prompt,
        sentence: exercise.sentence,
        options: exercise.options,
        context: exercise.context,
        thinkingSteps: exercise.thinkingSteps,
      }
      
      // 构建答案数据
      const answerData = {
        correctAnswer: exercise.correctAnswer,
        explanationZh: exercise.explanationZh,
        explanationEn: exercise.explanationEn,
        whyWrongOptions: exercise.whyWrongOptions,
        ifWrongThen: exercise.ifWrongThen,
        semanticRoleExplanation: exercise.semanticRoleExplanation,
        contrastExample: exercise.contrastExample,
        conventionalityNote: exercise.conventionalityNote,
        feedbackLevels: exercise.feedbackLevels,
      }
      
      // 构建学习元数据
      const metadata = {
        constructionId: exercise.constructionId,
        exerciseType: exercise.exerciseType,
        learningObjective: exercise.learningObjective,
        goldbergConcept: exercise.goldbergConcept,
        targetSkill: exercise.targetSkill,
        expectedMisconception: exercise.expectedMisconception,
        errorTypes: exercise.errorTypes,
        tags: exercise.tags,
        learningPath: exercise.learningPath,
        prerequisiteIds: exercise.prerequisiteIds,
        nextRecommendedIds: exercise.nextRecommendedIds,
        masteryCheck: exercise.masteryCheck,
      }
      
      await prisma.exercise.create({
        data: {
          title: exercise.prompt.slice(0, 100), // 使用 prompt 作为 title
          description: exercise.learningObjective,
          difficulty: mapDifficulty(exercise.difficulty),
          category: exercise.constructionId, // 使用 constructionId 作为分类
          questions: JSON.stringify(questionData),
          answers: JSON.stringify({ ...answerData, metadata }),
          isPublished: true,
        },
      })
      
      successCount++
      console.log(`✓ 已导入: ${exercise.id} - ${exercise.prompt.slice(0, 50)}...`)
    } catch (error) {
      errorCount++
      console.error(`✗ 导入失败: ${exercise.id}`, error)
    }
  }
  
  console.log(`\n导入完成!`)
  console.log(`成功: ${successCount}`)
  console.log(`失败: ${errorCount}`)
}

importExercises()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
