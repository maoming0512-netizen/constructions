import { prisma } from '@/lib/db'

async function checkDB() {
  console.log('🔍 检查数据库...')
  
  try {
    const users = await prisma.user.findMany()
    console.log(`\n✅ 用户数: ${users.length}`)
    users.forEach(u => {
      console.log(`  - ${u.email} (${u.role})`)
    })
    
    const constructions = await prisma.construction.count()
    console.log(`\n✅ 构式数: ${constructions}`)
    
  } catch (error) {
    console.error('❌ 错误:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDB()
