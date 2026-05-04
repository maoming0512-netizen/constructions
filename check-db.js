const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDB() {
  console.log('🔍 检查数据库连接...\n');
  
  try {
    // 检查用户数量
    const userCount = await prisma.user.count();
    console.log(`👤 用户数量: ${userCount}`);
    
    // 列出所有用户
    const users = await prisma.user.findMany({
      select: { email: true, name: true, role: true }
    });
    console.log('\n📋 用户列表:');
    users.forEach(u => {
      console.log(`   - ${u.email} (${u.role})`);
    });
    
    // 检查构式数量
    const constructionCount = await prisma.construction.count();
    console.log(`\n📚 构式数量: ${constructionCount}`);
    
    // 列出所有构式
    const constructions = await prisma.construction.findMany({
      select: { name: true, slug: true, category: true }
    });
    console.log('\n📋 构式列表:');
    constructions.forEach(c => {
      console.log(`   - ${c.name} (${c.category})`);
    });
    
    console.log('\n✅ 数据库连接正常！');
    
  } catch (error) {
    console.error('\n❌ 数据库错误:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDB();
