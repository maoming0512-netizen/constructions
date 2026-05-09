# 部署指南 — 腾讯云轻量应用服务器

## 方式一：直接部署（推荐，最简单）

服务器上需要 Node.js 22+ 和 PM2。

### 1. 登录服务器

```bash
ssh root@你的服务器IP
```

### 2. 安装 Node.js 22（如未安装）

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs git
node -v   # 确认 >= 22
```

### 3. 安装 PM2（进程守护）

```bash
npm install -g pm2
```

### 4. 克隆项目 & 安装依赖

```bash
cd /opt
git clone https://github.com/maoming0512-netizen/constructions.git
cd constructions
npm install
```

### 5. 配置环境变量

```bash
cp .env.example .env
nano .env
```

填写以下内容：

```env
# 数据库（必须 — 指向你的 PostgreSQL）
DATABASE_URL="postgresql://postgres:你的密码@localhost:5432/constructscape"

# NextAuth
NEXTAUTH_URL="http://你的服务器IP:3000"       # 如果绑定了域名就写 https://你的域名
NEXTAUTH_SECRET="随便一长串乱码，用 openssl rand -base64 32 生成"

# AI（可选，用户可以在页面 Settings 里自己填）
# AI_API_KEY="sk-xxx"
# AI_BASE_URL="https://api.deepseek.com"
# AI_MODEL="deepseek-v4-pro"
```

### 6. 初始化数据库

```bash
npx prisma migrate deploy
npx prisma generate
```

### 7. 构建 & 启动

```bash
npm run build
pm2 start ecosystem.config.js
pm2 save
pm2 startup   # 设置开机自启，按提示执行输出的命令
```

### 8. 开放端口

腾讯云轻量服务器控制台 → 防火墙 → 添加规则：
- 协议：TCP
- 端口：3000
- 策略：允许

### 9. 更新代码（后续每次更新）

```bash
cd /opt/constructions
git pull origin master
npm install            # 如有新依赖
npx prisma generate    # 如有 schema 变更
npm run build
pm2 restart constructions
```

---

## 方式二：Docker 部署

### 1. 安装 Docker

```bash
curl -fsSL https://get.docker.com | bash
```

### 2. 克隆项目

```bash
cd /opt
git clone https://github.com/maoming0512-netizen/constructions.git
cd constructions
```

### 3. 创建 .env

```bash
cp .env.example .env
nano .env   # 同上方式一填写环境变量
```

### 4. 构建镜像 & 运行

```bash
docker build -t constructions .
docker run -d --name constructions \
  --restart always \
  -p 3000:3000 \
  --env-file .env \
  constructions
```

### 5. 更新

```bash
cd /opt/constructions
git pull origin master
docker build -t constructions .
docker stop constructions && docker rm constructions
docker run -d --name constructions --restart always -p 3000:3000 --env-file .env constructions
```

---

## PostgreSQL 数据库

如果你服务器上还没有 PostgreSQL：

```bash
apt-get install -y postgresql postgresql-contrib
sudo -u postgres psql -c "ALTER USER postgres PASSWORD '你的密码';"
sudo -u postgres createdb constructscape
```

然后编辑 `pg_hba.conf` 允许密码登录：

```bash
nano /etc/postgresql/版本/main/pg_hba.conf
# 找到 local all all peer 改为 local all all md5
systemctl restart postgresql
```

---

## 绑定域名（可选）

如果你有域名，到腾讯云 DNS 解析添加 A 记录指向服务器 IP。
然后安装 Nginx 反向代理：

```bash
apt-get install -y nginx
```

创建 `/etc/nginx/sites-available/constructions`：

```nginx
server {
    listen 80;
    server_name 你的域名.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

启用并重启：

```bash
ln -s /etc/nginx/sites-available/constructions /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx
```

然后修改 `.env` 中的 `NEXTAUTH_URL` 为 `https://你的域名`，重新 `pm2 restart constructions`。
