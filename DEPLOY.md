# 部署到 Cloudflare Pages (Webify) 指南

## 前置条件

1. Cloudflare 账号
2. Neon 数据库账号和连接字符串
3. GitHub/GitLab 仓库（用于 CI/CD）

## 步骤

### 1. 安装依赖

```bash
npm install @neondatabase/serverless @prisma/adapter-neon
```

### 2. 更新 Prisma Client

```bash
npx prisma generate
```

### 3. 创建 Cloudflare Pages 项目

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **Pages** 页面
3. 点击 **Create a project**
4. 连接你的 Git 仓库
5. 设置构建配置：

**Build Settings:**
- Build command: `npm run build`
- Build output directory: `.next`

### 4. 配置环境变量

在 Cloudflare Pages 项目设置的 **Environment variables** 中添加：

```
DATABASE_URL=postgresql://username:password@hostname.neon.tech/database?sslmode=require
NEXTAUTH_URL=https://your-project.pages.dev
NEXTAUTH_SECRET=your-secret-key-here
NODE_ENV=production
```

### 5. 创建 wrangler.toml (可选)

如果需要更高级的配置，在项目根目录创建 `wrangler.toml`：

```toml
name = "your-project-name"
compatibility_date = "2024-01-01"

[env.production]
name = "your-project-name"
```

### 6. 部署

Cloudflare Pages 会自动在每次推送到 main 分支时重新部署。

## 注意事项

1. **NextAuth**: 确保设置了 `NEXTAUTH_SECRET` 和 `NEXTAUTH_URL`
2. **数据库**: Neon 数据库连接字符串需要包含 `sslmode=require`
3. **图片**: 已配置 `unoptimized: true` 以支持静态导出

## 故障排除

### 数据库连接失败
- 检查 DATABASE_URL 是否正确
- 确保 Neon 数据库允许所有 IP 访问（或使用无 IP 限制）

### 构建失败
- 检查 `npx prisma generate` 是否在构建前运行
- 确保所有依赖已安装

### 环境变量问题
- Cloudflare Pages 的环境变量在构建时和运行时都可用
- 重新部署后环境变量才会生效
