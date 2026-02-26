# Deploy to hotline.jemwealth.co

Complete deployment guide for the AI Hotline application.

## Prerequisites

- A server (DigitalOcean droplet, AWS EC2, etc.) with Ubuntu 20.04+ or similar
- Domain `hotline.jemwealth.co` DNS pointing to your server IP
- SSH access to your server
- Node.js 18+ installed (or we'll install it)

---

## Step 1: Server Setup

### 1.1 Connect to Your Server

```bash
ssh root@your-server-ip
# or
ssh your-username@your-server-ip
```

### 1.2 Update System Packages

```bash
sudo apt update
sudo apt upgrade -y
```

### 1.3 Install Node.js 18+ (if not installed)

```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should be v18.x or higher
npm --version
```

### 1.4 Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

### 1.5 Install Nginx

```bash
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 1.6 Install Certbot (for SSL)

```bash
sudo apt install certbot python3-certbot-nginx -y
```

---

## Step 2: Deploy Application Files

### 2.1 Clone/Upload Your Project

**Option A: If using Git**
```bash
cd /var/www
sudo git clone your-repo-url ai-hotline
cd ai-hotline
```

**Option B: If uploading files**
```bash
# Create directory
sudo mkdir -p /var/www/ai-hotline
cd /var/www/ai-hotline
# Then upload your files via SCP, SFTP, or rsync
```

### 2.2 Set Permissions

```bash
sudo chown -R $USER:$USER /var/www/ai-hotline
cd /var/www/ai-hotline
```

### 2.3 Install Dependencies

```bash
# Install yarn if not installed
npm install -g yarn

# Install project dependencies
yarn install --production=false
```

---

## Step 3: Configure Environment Variables

### 3.1 Create Production .env File

```bash
nano /var/www/ai-hotline/.env
```

Add the following (update with your actual values):

```env
# Retell AI (for backend)
RETELL_API_KEY=your_retell_api_key_here
RETELL_AGENT_ID=your_retell_agent_id_here
PORT=4000

# Frontend config (update with your domain)
REACT_APP_API_BASE_URL=https://hotline.jemwealth.co/api
REACT_APP_RETELL_API_URL=https://api.retellai.com/v1

# Node environment
NODE_ENV=production
```

Save and exit (`Ctrl+X`, then `Y`, then `Enter`).

### 3.2 Secure the .env File

```bash
chmod 600 /var/www/ai-hotline/.env
```

---

## Step 4: Build the React Frontend

```bash
cd /var/www/ai-hotline
yarn build
```

This creates a `build` folder with the production-ready React app.

---

## Step 5: Configure PM2 for Backend

### 5.1 Create PM2 Ecosystem Config (if not exists)

```bash
nano /var/www/ai-hotline/ecosystem.config.js
```

Add this configuration:

```javascript
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
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
  ],
};
```

### 5.2 Create Logs Directory

```bash
mkdir -p /var/www/ai-hotline/logs
```

### 5.3 Start Backend with PM2

```bash
cd /var/www/ai-hotline
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

The last command will show you a command to run with `sudo` - copy and run it to enable PM2 on system startup.

---

## Step 6: Configure Nginx

### 6.1 Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/hotline.jemwealth.co
```

Add this configuration:

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name hotline.jemwealth.co;
    
    # For Let's Encrypt verification
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name hotline.jemwealth.co;

    # SSL Configuration (will be added by Certbot)
    # ssl_certificate /etc/letsencrypt/live/hotline.jemwealth.co/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/hotline.jemwealth.co/privkey.pem;
    # include /etc/letsencrypt/options-ssl-nginx.conf;
    # ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # Root directory for React app
    root /var/www/ai-hotline/build;
    index index.html;

    # Serve React app (SPA routing)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Proxy to Backend
    location /api/ {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts for long-running requests
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:4000/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 6.2 Enable the Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/hotline.jemwealth.co /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t
```

If the test passes, reload Nginx:

```bash
sudo systemctl reload nginx
```

---

## Step 7: Set Up SSL with Certbot

### 7.1 Obtain SSL Certificate

```bash
sudo certbot --nginx -d hotline.jemwealth.co
```

Follow the prompts:
- Enter your email address
- Agree to terms of service
- Choose whether to redirect HTTP to HTTPS (recommended: Yes)

### 7.2 Test Auto-Renewal

```bash
sudo certbot renew --dry-run
```

Certbot automatically renews certificates. You can verify the renewal process works.

---

## Step 8: Verify DNS Configuration

Make sure your DNS is configured correctly:

1. **A Record**: `hotline.jemwealth.co` → Your server IP address
2. **CNAME** (if using): `hotline` → `jemwealth.co` (if jemwealth.co has the A record)

You can verify DNS with:
```bash
dig hotline.jemwealth.co
# or
nslookup hotline.jemwealth.co
```

---

## Step 9: Firewall Configuration

### 9.1 Configure UFW (if using)

```bash
# Allow SSH (important - don't lock yourself out!)
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

## Step 10: Test Your Deployment

### 10.1 Check Backend

```bash
# Check PM2 status
pm2 status

# Check backend logs
pm2 logs ai-hotline-backend

# Test backend health endpoint
curl http://localhost:4000/health
```

### 10.2 Check Nginx

```bash
# Check Nginx status
sudo systemctl status nginx

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### 10.3 Test in Browser

1. Open `https://hotline.jemwealth.co` in your browser
2. Check browser console for any errors
3. Test the call functionality

---

## Step 11: Update Frontend Environment Variables

If you need to update the frontend API URL after deployment:

1. Update `.env` file:
   ```env
   REACT_APP_API_BASE_URL=https://hotline.jemwealth.co/api
   ```

2. Rebuild the frontend:
   ```bash
   cd /var/www/ai-hotline
   yarn build
   ```

3. Restart Nginx:
   ```bash
   sudo systemctl reload nginx
   ```

---

## Maintenance Commands

### View Backend Logs
```bash
pm2 logs ai-hotline-backend
# or
tail -f /var/www/ai-hotline/logs/out.log
```

### Restart Backend
```bash
pm2 restart ai-hotline-backend
```

### Restart Nginx
```bash
sudo systemctl restart nginx
```

### Check SSL Certificate Expiry
```bash
sudo certbot certificates
```

### Manually Renew SSL Certificate
```bash
sudo certbot renew
```

### Update Application
```bash
cd /var/www/ai-hotline
git pull  # if using git
yarn install
yarn build
pm2 restart ai-hotline-backend
sudo systemctl reload nginx
```

---

## Troubleshooting

### Backend Not Starting
```bash
# Check PM2 logs
pm2 logs ai-hotline-backend --lines 50

# Check if port 4000 is in use
sudo lsof -i :4000

# Restart PM2
pm2 restart all
```

### Nginx 502 Bad Gateway
- Check if backend is running: `pm2 status`
- Check backend logs: `pm2 logs ai-hotline-backend`
- Verify backend is listening on port 4000: `curl http://localhost:4000/health`

### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Test renewal
sudo certbot renew --dry-run

# Force renewal (if needed)
sudo certbot renew --force-renewal
```

### React App Not Loading
- Check if `build` folder exists: `ls -la /var/www/ai-hotline/build`
- Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`
- Verify file permissions: `ls -la /var/www/ai-hotline/build`

---

## Security Checklist

- [ ] `.env` file has correct permissions (600)
- [ ] Firewall is configured (only ports 22, 80, 443 open)
- [ ] SSL certificate is installed and auto-renewal works
- [ ] PM2 is set to auto-start on reboot
- [ ] Nginx is configured with security headers
- [ ] Backend is not exposed directly (only through Nginx)
- [ ] Regular backups are configured (optional but recommended)

---

## Next Steps

1. Set up monitoring (optional): Consider using PM2 Plus or a monitoring service
2. Set up backups: Configure regular backups of your application and database
3. Set up CI/CD: Automate deployments with GitHub Actions or similar
4. Add logging: Consider using a logging service for production logs

---

## Quick Reference

| Service | Port | URL |
|---------|------|-----|
| Frontend | 443 (HTTPS) | https://hotline.jemwealth.co |
| Backend API | 4000 (internal) | http://localhost:4000 |
| Backend Health | 4000 (internal) | http://localhost:4000/health |

---

**Deployment Complete! 🎉**

Your application should now be live at `https://hotline.jemwealth.co`

