# Production Socket.IO Configuration Guide

## Common Production Issues & Solutions

### 1. Load Balancer/Reverse Proxy Configuration

If you're using **Nginx**, add this to your server configuration:

```nginx
upstream bullmq_backend {
    ip_hash; # Enable sticky sessions for Socket.IO
    server 127.0.0.1:4040;
    # Add more instances if you have multiple servers
    # server 127.0.0.1:4041;
    # server 127.0.0.1:4042;
}

server {
    listen 80;
    server_name yourdomain.com;

    location /socket.io/ {
        proxy_pass http://bullmq_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Socket.IO specific timeouts
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
    
    location / {
        proxy_pass http://bullmq_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2. Apache Configuration

If you're using **Apache**, enable these modules and add:

```apache
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so
LoadModule proxy_wstunnel_module modules/mod_proxy_wstunnel.so
LoadModule headers_module modules/mod_headers.so

<VirtualHost *:80>
    ServerName yourdomain.com
    
    # Enable sticky sessions
    Header add Set-Cookie "SERVERID=sticky; Path=/"
    
    # WebSocket proxy for Socket.IO
    ProxyPreserveHost On
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} =websocket [NC]
    RewriteRule /(.*) ws://localhost:4040/$1 [P,L]
    RewriteCond %{HTTP:Upgrade} !=websocket [NC]
    RewriteRule /(.*) http://localhost:4040/$1 [P,L]
    
    ProxyPass / http://localhost:4040/
    ProxyPassReverse / http://localhost:4040/
</VirtualHost>
```

### 3. Environment Variables for Production

Create a `.env` file or set these environment variables:

```bash
NODE_ENV=production
PORT=4040
REDIS_URL=redis://localhost:6379
FRONTEND_URL=https://yourdomain.com
```

### 4. PM2 Production Deployment

```bash
# Install dependencies
npm install

# Start with PM2 using production environment
pm2 start ecosystem.config.js --env production

# Monitor the application
pm2 monitor

# Check logs
pm2 logs bullmq-app
```

### 5. Firewall Configuration

Ensure these ports are open:
- **4040** (your Node.js app)
- **6379** (Redis, if external)
- **80/443** (HTTP/HTTPS)

### 6. SSL/HTTPS Configuration

If using HTTPS, update your client connection:

```javascript
const socket = io('https://yourdomain.com', {
  transports: ['websocket', 'polling']
});
```

### 7. Troubleshooting Commands

```bash
# Check if Redis is running
redis-cli ping

# Check if your app is listening
netstat -tlnp | grep :4040

# Check PM2 status
pm2 status

# View real-time logs
pm2 logs bullmq-app --lines 100
```

### 8. Common Error Solutions

**CORS Errors:**
- Update FRONTEND_URL in environment variables
- Ensure your domain matches the CORS origin

**Connection Timeout:**
- Check firewall settings
- Verify proxy configuration
- Ensure sticky sessions are enabled

**Redis Connection Issues:**
- Verify Redis is running: `redis-cli ping`
- Check Redis URL in environment variables
- Ensure Redis memory is sufficient