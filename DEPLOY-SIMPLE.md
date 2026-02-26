# Simple Deployment Guide - hotline.jemwealth.co

Quick deployment steps for setting up Nginx and SSL.

## Prerequisites

- ✅ Nginx already installed
- ✅ Server with domain `hotline.jemwealth.co` DNS pointing to your server IP
- ✅ Application files deployed to `/var/www/ai-hotline`
- ✅ Backend running on port 4000 (via PM2)
- ✅ React app built in `/var/www/ai-hotline/build`

---

## Step 0: Install Node.js and Yarn (if not installed)

### Install Node.js 20 LTS (Latest)

```bash
# Install Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should be v20.x or higher
npm --version
```

**Note:** Node.js 20 is the current LTS (Long Term Support) version. If you need Node.js 22 (latest), use `setup_22.x` instead.

### Install Yarn

**Method 1: Via npm (Recommended)**
```bash
# Install Yarn globally via npm
sudo npm install -g yarn

# Verify installation
yarn --version
```

**Method 2: Using Corepack (Node.js 16.10+) - Recommended**
```bash
# Prepare and activate Yarn directly (bypasses broken symlink issues)
sudo corepack prepare yarn@stable --activate

# Verify installation
yarn --version
```

**Note:** If you get a broken symlink error with `corepack enable`, you can skip it and use `corepack prepare` directly (as shown above).

**Method 3: Using Yarn's official repository**
```bash
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt update
sudo apt install yarn -y
```

**Troubleshooting Yarn Installation:**

If you get `No such file or directory: 'install'` error:

```bash
# Check if yarn is installed
which yarn
yarn --version

# If yarn is not found, try:
# 1. Check if npm is working
npm --version

# 2. Install yarn via npm (if npm works)
sudo npm install -g yarn

# 3. Or use corepack method (skip enable if you get symlink errors)
sudo corepack prepare yarn@stable --activate

# 4. Verify PATH includes npm/yarn location
echo $PATH
# Should include something like: /usr/local/bin or /usr/bin

# 5. If still not working, try full path
/usr/local/bin/yarn --version
# or
/usr/bin/yarn --version
```

### Install PM2 (Process Manager)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Verify installation
pm2 --version
```

---

## Step 1: Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

---

## Step 2: Create Nginx Configuration

Copy the example config to sites-available:

```bash
sudo cp /var/www/ai-hotline/nginx.conf.example /etc/nginx/sites-available/hotline.jemwealth.co
```

---

## Step 3: Enable the Site

```bash
# Create symbolic link to enable the site
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

## Step 4: Get SSL Certificate with Certbot

```bash
sudo certbot --nginx -d hotline.jemwealth.co
```

Follow the prompts:
- Enter your email address
- Agree to terms of service
- Choose to redirect HTTP to HTTPS (recommended: **Yes**)

Certbot will automatically:
- Obtain the SSL certificate
- Add SSL configuration to your Nginx file
- Set up auto-renewal

---

## Step 5: Verify Everything Works

```bash
# Check Nginx status
sudo systemctl status nginx

# Test SSL certificate
sudo certbot certificates

# Test auto-renewal (optional)
sudo certbot renew --dry-run
```

---

## Test Your Site

1. Open `https://hotline.jemwealth.co` in your browser
2. Check browser console for any errors
3. Test the call functionality

---

## Troubleshooting

### Nginx 502 Bad Gateway
- Check if backend is running: `pm2 status`
- Check backend logs: `pm2 logs ai-hotline-backend`
- Verify backend is listening: `curl http://localhost:4000/health`

### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Test renewal
sudo certbot renew --dry-run
```

### Nginx Configuration Errors
```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log
```

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `sudo nginx -t` | Test Nginx configuration |
| `sudo systemctl reload nginx` | Reload Nginx without downtime |
| `sudo systemctl restart nginx` | Restart Nginx |
| `sudo certbot certificates` | List SSL certificates |
| `sudo certbot renew` | Manually renew certificates |

---

**Done! 🎉** Your site should now be live at `https://hotline.jemwealth.co`

