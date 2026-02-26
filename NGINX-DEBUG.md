# Nginx Debugging Steps

## Step 1: Verify Nginx Config File Exists and is Correct

```bash
# Check if config file exists
sudo ls -la /etc/nginx/sites-available/hotline.jemwealth.co

# View the config to verify path is correct
sudo cat /etc/nginx/sites-available/hotline.jemwealth.co | grep "root"
# Should show: root /app/build;
```

## Step 2: Make Sure Site is Enabled

```bash
# Check if symlink exists
ls -la /etc/nginx/sites-enabled/hotline.jemwealth.co

# If it doesn't exist, create it
sudo ln -s /etc/nginx/sites-available/hotline.jemwealth.co /etc/nginx/sites-enabled/

# Remove default site if it's interfering
sudo rm -f /etc/nginx/sites-enabled/default
```

## Step 3: Test Nginx Configuration

```bash
# Test for syntax errors
sudo nginx -t

# If there are errors, fix them
# If it says "test is successful", continue
```

## Step 4: Check What Sites Nginx is Actually Serving

```bash
# See all enabled sites
ls -la /etc/nginx/sites-enabled/

# Check Nginx config to see what server_name it's using
sudo nginx -T | grep -A 10 "server_name"
```

## Step 5: Verify Build Folder Exists and Has Content

```bash
# Check if build folder exists
ls -la /app/build

# Check if index.html exists
ls -la /app/build/index.html

# If missing, rebuild
cd /app
yarn build
```

## Step 6: Check Nginx Error Logs

```bash
# Check recent errors
sudo tail -20 /var/log/nginx/error.log

# Watch errors in real-time
sudo tail -f /var/log/nginx/error.log
```

## Step 7: Check Nginx Access Logs

```bash
# Check if requests are reaching Nginx
sudo tail -20 /var/log/nginx/access.log
```

## Step 8: Test Locally on Server

```bash
# Test if Nginx responds locally
curl -I http://localhost

# Test with server_name header
curl -H "Host: hotline.jemwealth.co" http://localhost

# Test backend
curl http://localhost:4000/health
```

## Step 9: Check DigitalOcean Cloud Firewall

**This is the most common issue!**

1. Go to DigitalOcean dashboard
2. Click your Droplet
3. Click "Networking" tab
4. Scroll to "Firewalls" section
5. If there's a firewall attached:
   - Click on it
   - Go to "Inbound Rules"
   - Make sure HTTP (port 80) is allowed
   - If not, add rule: `HTTP` → `Allow` → `All IPv4, All IPv6`

## Step 10: Verify Nginx is Actually Running

```bash
# Check Nginx status
sudo systemctl status nginx

# Check if it's listening
sudo ss -tlnp | grep :80

# Restart Nginx if needed
sudo systemctl restart nginx
```

## Step 11: Check if Port 80 is Accessible from Outside

```bash
# From your local machine, test if port 80 is open
# Replace YOUR_SERVER_IP with your actual server IP
telnet YOUR_SERVER_IP 80
# or
nc -zv YOUR_SERVER_IP 80

# If connection refused, it's the firewall
```

## Quick Fix Commands (Run These)

```bash
# 1. Make sure config is correct
sudo nano /etc/nginx/sites-available/hotline.jemwealth.co
# Verify: root /app/build; (line 17)

# 2. Enable the site
sudo ln -sf /etc/nginx/sites-available/hotline.jemwealth.co /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# 3. Test config
sudo nginx -t

# 4. Restart Nginx
sudo systemctl restart nginx

# 5. Check status
sudo systemctl status nginx

# 6. Test locally
curl http://localhost
```

## Most Common Issues:

1. **DigitalOcean Cloud Firewall** - Check dashboard, allow port 80
2. **Build folder missing** - Run `cd /app && yarn build`
3. **Site not enabled** - Create symlink in sites-enabled
4. **Wrong path in config** - Should be `root /app/build;`
5. **Default site interfering** - Remove `/etc/nginx/sites-enabled/default`



