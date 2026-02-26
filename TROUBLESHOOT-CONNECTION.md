# Troubleshooting Connection Issues

## ERR_CONNECTION_REFUSED - Common Causes

### 1. Check if Backend is Running

```bash
# Check PM2 status
pm2 status

# If backend is not running, start it
cd /app
pm2 start ecosystem.config.js
pm2 save
```

### 2. Check if Nginx is Listening on Port 80

```bash
# Check if Nginx is listening on port 80
sudo netstat -tlnp | grep :80
# or
sudo ss -tlnp | grep :80

# Should show nginx listening on port 80
```

### 3. Check Firewall (UFW)

```bash
# Check firewall status
sudo ufw status

# If firewall is active, make sure port 80 and 443 are allowed
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# If you're using DigitalOcean, also check the cloud firewall in their dashboard
```

### 4. Check if Build Folder Exists

```bash
# Verify React app is built
ls -la /app/build

# If build folder doesn't exist or is empty, build it
cd /app
yarn build
```

### 5. Test Nginx Locally on Server

```bash
# Test from the server itself
curl http://localhost
# or
curl http://localhost:80

# Test the backend
curl http://localhost:4000/health
```

### 6. Check DNS Resolution

```bash
# On your local machine, check if DNS resolves correctly
nslookup hotline.jemwealth.co
# or
dig hotline.jemwealth.co

# Should show your server's IP address
```

### 7. Check Nginx Error Logs

```bash
# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Check Nginx access logs
sudo tail -f /var/log/nginx/access.log
```

### 8. Verify Nginx Configuration

```bash
# Test configuration
sudo nginx -t

# Check which sites are enabled
ls -la /etc/nginx/sites-enabled/

# Make sure your site is enabled
ls -la /etc/nginx/sites-enabled/hotline.jemwealth.co
```

### 9. Check if Port 80 is Accessible from Outside

```bash
# From your local machine, test if port 80 is open
telnet your-server-ip 80
# or
nc -zv your-server-ip 80

# If connection refused, firewall is blocking it
```

### 10. DigitalOcean Specific: Check Cloud Firewall

If using DigitalOcean:
1. Go to your Droplet in DigitalOcean dashboard
2. Click on "Networking" tab
3. Check "Firewalls" section
4. Make sure port 80 and 443 are allowed in inbound rules

---

## Quick Diagnostic Commands

Run these on your server to diagnose:

```bash
# 1. Check if services are running
pm2 status
sudo systemctl status nginx

# 2. Check if ports are listening
sudo netstat -tlnp | grep -E ':(80|443|4000)'

# 3. Check firewall
sudo ufw status verbose

# 4. Test locally
curl http://localhost
curl http://localhost:4000/health

# 5. Check Nginx config
sudo nginx -t
sudo nginx -T | grep -A 5 "server_name hotline"

# 6. Check if build exists
ls -la /app/build/index.html
```

---

## Common Solutions

### Solution 1: Firewall Blocking Port 80

```bash
# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload
```

### Solution 2: Backend Not Running

```bash
cd /app
pm2 start ecosystem.config.js
pm2 save
```

### Solution 3: Build Folder Missing

```bash
cd /app
yarn build
sudo systemctl reload nginx
```

### Solution 4: Nginx Not Serving Correct Site

```bash
# Make sure your site is enabled
sudo ln -s /etc/nginx/sites-available/hotline.jemwealth.co /etc/nginx/sites-enabled/

# Remove default site if it's interfering
sudo rm /etc/nginx/sites-enabled/default

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

---

## Testing from Browser

1. **First, try HTTP (not HTTPS):**
   - Go to: `http://hotline.jemwealth.co` (note: http, not https)
   - HTTPS won't work until Certbot is run

2. **If HTTP works, then run Certbot:**
   ```bash
   sudo certbot --nginx -d hotline.jemwealth.co
   ```

3. **Then try HTTPS:**
   - Go to: `https://hotline.jemwealth.co`

---

## Still Not Working?

Check these in order:

1. ✅ Backend running? (`pm2 status`)
2. ✅ Nginx running? (`sudo systemctl status nginx`)
3. ✅ Firewall allows port 80? (`sudo ufw status`)
4. ✅ Build folder exists? (`ls /app/build`)
5. ✅ DNS points to server IP? (`nslookup hotline.jemwealth.co`)
6. ✅ Can access from server itself? (`curl http://localhost`)
7. ✅ Nginx config is correct? (`sudo nginx -t`)

