import { prisma } from '@/lib/db'

async function checkDB() {
  console.log('Checking database...')
  try {
    const users = await prisma.user.count()
    const constructions = await prisma.construction.count()
    const exercises = await prisma.exercise.count()
    console.log(`Users: ${users}`)
    console.log(`Constructions: ${constructions}`)
    console.log(`Exercises: ${exercises}`)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDB()
