module.exports = {
  apps: [{
    name: 'bullmq-app',
    script: './app.js',
    instances: 'max', // Use all CPU cores
    exec_mode: 'cluster',
    // Enable sticky sessions for Socket.IO in cluster mode
    instance_var: 'INSTANCE_ID',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3003,  // Match the port in app.js
      FRONTEND_URL: '#' // Set your actual frontend URL
    },
    // Auto-restart configuration
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '500M',
    
    // Logging
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    
    // Graceful shutdown
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 3000
  }]
};