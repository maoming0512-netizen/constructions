# Neon PostgreSQL 数据库初始化脚本
# 在配置好 DATABASE_URL 后运行此脚本

Write-Host "🚀 Syntax Lab - Neon PostgreSQL 数据库初始化" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# 检查是否在正确的目录
if (!(Test-Path "prisma\schema.prisma")) {
    Write-Host "❌ 错误: 请在项目根目录运行此脚本" -ForegroundColor Red
    exit 1
}

# 检查 .env.local 文件
if (!(Test-Path ".env.local")) {
    Write-Host "⚠️ 警告: 未找到 .env.local 文件" -ForegroundColor Yellow
    Write-Host "请先从 Neon 获取连接字符串并创建 .env.local 文件" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "示例 .env.local 内容:" -ForegroundColor Gray
    Write-Host 'DATABASE_URL="postgresql://用户名:密码@主机名/数据库名?sslmode=require"' -ForegroundColor Gray
    exit 1
}

Write-Host "✅ 找到 .env.local 文件" -ForegroundColor Green
Write-Host ""

# 安装依赖
Write-Host "📦 安装依赖..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 依赖安装失败" -ForegroundColor Red
    exit 1
}
Write-Host "✅ 依赖安装完成" -ForegroundColor Green
Write-Host ""

# 生成 Prisma 客户端
Write-Host "🔧 生成 Prisma 客户端..." -ForegroundColor Cyan
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Prisma 客户端生成失败" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Prisma 客户端生成完成" -ForegroundColor Green
Write-Host ""

# 推送数据库结构
Write-Host "📤 推送数据库结构到 Neon..." -ForegroundColor Cyan
Write-Host "这可能需要几秒钟..." -ForegroundColor Gray
npx prisma db push --accept-data-loss
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 数据库推送失败" -ForegroundColor Red
    Write-Host "请检查 DATABASE_URL 是否正确" -ForegroundColor Red
    exit 1
}
Write-Host "✅ 数据库结构创建完成" -ForegroundColor Green
Write-Host ""

# 运行 Seed
Write-Host "🌱 运行数据库 Seed（创建管理员用户和示例数据）..." -ForegroundColor Cyan
npx prisma db seed
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Seed 运行失败" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Seed 完成" -ForegroundColor Green
Write-Host ""

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "🎉 数据库配置完成！" -ForegroundColor Green
Write-Host ""
Write-Host "管理员账号:" -ForegroundColor Cyan
Write-Host "  邮箱: 279364248@qq.com" -ForegroundColor White
Write-Host "  密码: 1029384756qaZ@" -ForegroundColor White
Write-Host ""
Write-Host "启动开发服务器:" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "访问 http://localhost:3000 开始体验！" -ForegroundColor Cyan
