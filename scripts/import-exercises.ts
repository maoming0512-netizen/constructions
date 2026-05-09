import { PrismaClient } from '@prisma/client'
import { v11Exercises } from '../src/data/exercises-v4'

const prisma = new PrismaClient()

async function importExercises() {
  console.log(`Starting import of ${v11Exercises.length} V11 exercises...`)
  
  let successCount = 0
  let errorCount = 0
  
  // First delete existing exercises
  console.log('Clearing existing exercises...')
  await prisma.exercise.deleteMany()
  
  for (const exercise of v11Exercises) {
    try {
      await prisma.exercise.create({
        data: {
          exerciseId: exercise.id,
          level: exercise.level,
          type: exercise.type,
          theme: exercise.theme,
          context: exercise.context,
          task: exercise.task,
          wordCount: exercise.wordCount,
          targetConstructions: exercise.targetConstructions,
          referenceAnswer: exercise.referenceAnswer,
          isPublished: true,
        },
      })
      
      successCount++
      console.log(`✓ Imported: ${exercise.id} - ${exercise.theme}`)
    } catch (error) {
      errorCount++
      console.error(`✗ Failed: ${exercise.id}`, error)
    }
  }
  
  console.log(`\nImport complete!`)
  console.log(`Success: ${successCount}`)
  console.log(`Failed: ${errorCount}`)
}

importExercises()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
