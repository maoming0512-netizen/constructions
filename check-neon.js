const { execSync } = require('child_process');

console.log('🔍 测试 Neon 数据库连接...\n');
console.log('连接地址: ep-steep-hill-aohnircb.c-2.ap-southeast-1.aws.neon.tech');
console.log('数据库: neondb\n');

const neonUrl = "postgresql://neondb_owner:npg_tzJkXR2mf9Wa@ep-steep-hill-aohnircb.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

// 方法1: 使用 npx prisma db pull 测试连接
console.log('方法1: 使用 Prisma 测试连接...');
try {
  // 设置临时环境变量并执行
  const result = execSync(
    `set "DATABASE_URL=${neonUrl}" && npx prisma db pull --print`,
    { encoding: 'utf-8', timeout: 30000 }
  );
  console.log('✅ Prisma 连接成功！');
  console.log(result);
} catch (error) {
  console.error('❌ Prisma 连接失败:', error.message);
  
  if (error.message.includes('timeout') || error.stderr?.includes('timeout')) {
    console.log('\n💡 诊断: Neon 数据库处于休眠状态！');
    console.log('   你的截图显示 Compute 状态为 "Idle"，说明数据库已休眠。');
    console.log('\n📋 解决方法:');
    console.log('   1. 访问 https://console.neon.tech');
    console.log('   2. 找到你的项目');
    console.log('   3. 点击 "Start" 或 "Resume" 按钮唤醒数据库');
    console.log('   4. 等待 10-20 秒后再次尝试连接');
  }
}
