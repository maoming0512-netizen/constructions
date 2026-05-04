import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { constructions } from '../src/data/constructions';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. 创建管理员用户
  const adminEmail = '279364248@qq.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('1029384756qaZ@', 10);
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: '超级管理员',
        role: 'admin',
      }
    });
    console.log('✅ Admin user created:', admin.email);
  } else {
    console.log('ℹ️ Admin user already exists');
  }

  // 2. 清空现有的构式数据
  await prisma.construction.deleteMany({});
  console.log('🗑️ Cleared existing constructions');

  // 3. 插入构式数据（SQLite 需要将数组转为 JSON 字符串）
  for (const c of constructions) {
    await prisma.construction.create({
      data: {
        name: c.name,
        slug: c.slug,
        category: c.category,
        difficulty: c.difficulty,
        formPattern: c.formPattern,
        coreMeaning: c.coreMeaning,
        discourseFunction: c.discourseFunction,
        explanationZh: c.explanationZh,
        explanationEn: c.explanationEn,
        semanticAnchors: c.semanticAnchors.join(','),
        commonVerbs: c.semanticAnchors.slice(0, 10).join(','),
        tags: c.tags.join(','),
        isPublished: true,
      }
    });
    console.log(`✅ Created construction: ${c.name}`);
  }

  console.log('\n🎉 Database seeding complete!');
  console.log(`📊 Total constructions: ${constructions.length}`);
  console.log(`🔑 Admin login: ${adminEmail}`);
  console.log(`🔐 Admin password: 1029384756qaZ@`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
