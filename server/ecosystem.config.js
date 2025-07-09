module.exports = {
  apps: [
    {
      name: 'ddv5-server',
      script: 'server.js',
      cwd: __dirname,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 4000,
        JWT_SECRET: process.env.JWT_SECRET || 'supersecretkey',
        // Add other environment variables as needed
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: '500M',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
    },
  ],
}; 