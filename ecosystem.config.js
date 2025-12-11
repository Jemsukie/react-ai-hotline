// PM2 Ecosystem configuration
// Use with: pm2 start ecosystem.config.js
// After first start: pm2 save && pm2 startup

module.exports = {
  apps: [
    {
      name: 'ai-hotline-backend',
      script: 'backend-server-example.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      // Auto restart on crash
      autorestart: true,
      // Watch for file changes (disable in production)
      watch: false,
      // Max memory before restart
      max_memory_restart: '500M',
      // Logging
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // Merge logs
      merge_logs: true,
    },
  ],
};
