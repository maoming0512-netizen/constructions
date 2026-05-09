module.exports = {
  apps: [
    {
      name: 'constructions',
      script: './.next/standalone/server.js',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
        DATABASE_URL: 'postgresql://postgres:159951@localhost:5432/constructscape',
        NEXTAUTH_URL: 'http://211.159.157.93:3000',
        NEXTAUTH_SECRET: 'BX79gh4d+pW8n/7Y4i6ynxNHJTKFtrURvC2jCt6VN0Q=',
      },
    },
  ],
}
