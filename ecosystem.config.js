module.exports = {
  apps: [
    {
      name: 'constructions',
      script: './.next/standalone/server.js',
      args: '--port 3000',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
}
