import { PrismaClient } from '@prisma/client'
import { profileConstruction } from '../src/lib/exercises/adaptiveExercise'

const prisma = new PrismaClient()

async function main() {
  await prisma.$executeRawUnsafe('ALTER TABLE "Construction" ADD COLUMN IF NOT EXISTS "metadata" JSONB')

  const constructions = await prisma.construction.findMany({
    select: {
      id: true,
      name: true,
      template: true,
      function: true,
      usageNote: true,
      example: true,
      category: true,
      level: true,
    },
  })

  for (let i = 0; i < constructions.length; i += 200) {
    const batch = constructions.slice(i, i + 200)
    await prisma.$transaction(
      batch.map((c) => prisma.construction.update({
        where: { id: c.id },
        data: { metadata: profileConstruction(c) as any },
      }))
    )
  }

  console.log(`Enriched ${constructions.length} constructions with adaptive teaching metadata.`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
