# Meetix — Complete Deployment Guide 🚀

A step-by-step guide to deploy Meetix from scratch. Follow every section in order.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Part A — Vercel Setup (Frontend)](#2-part-a--vercel-setup-frontend)
3. [Part B — AWS EC2 Setup (Backend)](#3-part-b--aws-ec2-setup-backend)
4. [Part C — GitHub Secrets Configuration](#4-part-c--github-secrets-configuration)
5. [Part D — DNS Configuration](#5-part-d--dns-configuration)
6. [Part E — First Deployment](#6-part-e--first-deployment)
7. [Part F — Verify Everything Works](#7-part-f--verify-everything-works)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Prerequisites

Before you begin, make sure you have:

- [x] A **GitHub** account with the Meetix repo pushed
- [x] A **credit/debit card** for AWS (free tier eligible — you won't be charged if you stay within limits)
- [x] A **domain name** (`meetixchat.online`) purchased from any registrar (Namecheap, GoDaddy, Cloudflare, etc.)
- [x] An **email address** for Let's Encrypt SSL certificate notifications

---

## 2. Part A — Vercel Setup (Frontend)

### Step 1: Create a Vercel Account

1. Go to [https://vercel.com/signup](https://vercel.com/signup)
2. Click **"Continue with GitHub"** (recommended — links your repos automatically)
3. Authorize Vercel to access your GitHub account
4. You're now on the **Hobby (Free)** plan — no credit card required

### Step 2: Get Your `VERCEL_TOKEN`

1. Go to [https://vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Click **"Create"**
3. Fill in:
   - **Token Name:** `meetix-github-actions`
   - **Scope:** `Full Account`
   - **Expiration:** `No Expiration` (or set a long duration)
4. Click **"Create Token"**
5. **⚠️ COPY THE TOKEN NOW** — you won't see it again!
6. Save it somewhere safe temporarily. This is your `VERCEL_TOKEN`.

### Step 3: Link Your Project & Get `VERCEL_ORG_ID` + `VERCEL_PROJECT_ID`

You need to run a one-time command locally to link the project to Vercel:

```bash
# Install Vercel CLI globally
npm install -g vercel

# Navigate to the client directory
cd client

# Login to Vercel (opens browser)
vercel login

# Link the project (creates .vercel directory)
vercel link
```

During `vercel link`, you'll be asked:
```
? Set up "~/meetix/client"? [Y/n]  →  Y
? Which scope should contain your project?  →  Select your username
? Link to existing project?  →  N
? What's your project's name?  →  meetix-client
? In which directory is your code located?  →  ./
```

After linking, a `.vercel/project.json` file is created:

```bash
cat .vercel/project.json
```

Output:
```json
{
  "orgId": "team_xxxxxxxxxxxxxxxxxxxx",
  "projectId": "prj_xxxxxxxxxxxxxxxxxxxx"
}
```

- **`orgId`** → This is your `VERCEL_ORG_ID`
- **`projectId`** → This is your `VERCEL_PROJECT_ID`

> **📝 Note:** Add `.vercel` to your `.gitignore` — it should not be committed.

### Step 4: Configure Vercel Project Settings (Optional)

1. Go to your Vercel Dashboard → Select the `meetix-client` project
2. Go to **Settings → General**:
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Go to **Settings → Git**:
   - **Disable** automatic Vercel deployments (since GitHub Actions handles it):
   - Under "Connected Git Repository", turn OFF "Auto Deploy"

---

## 3. Part B — AWS EC2 Setup (Backend)

### Step 1: Launch an EC2 Instance

1. Log in to [AWS Console](https://console.aws.amazon.com/)
2. Go to **EC2 → Launch Instance**
3. Configure:

   | Setting | Value |
   | :--- | :--- |
   | **Name** | `meetix-server` |
   | **AMI** | Ubuntu Server 24.04 LTS (Free Tier eligible) |
   | **Instance Type** | `t2.small` (2 GB RAM) or `t3.small` — ⚠️ `t2.micro` (1 GB) is too small for all containers |
   | **Key Pair** | Create new → Name: `meetix-key` → Download `.pem` file |
   | **Network** | Default VPC |
   | **Storage** | 20 GB gp3 (minimum — Docker images need space) |

4. Click **Launch Instance**

### Step 2: Configure Security Group (Firewall)

Go to **EC2 → Security Groups** → Select the security group attached to your instance → **Edit Inbound Rules**:

| Type | Port | Source | Purpose |
| :--- | :--- | :--- | :--- |
| SSH | 22 | Your IP (or `0.0.0.0/0` for GH Actions) | SSH access |
| HTTP | 80 | `0.0.0.0/0` | Certbot ACME challenge + redirect |
| HTTPS | 443 | `0.0.0.0/0` | Main API traffic |

> **⚠️ Important:** Port 22 must be accessible from GitHub Actions runners. If you want to restrict it, use GitHub's published IP ranges, but `0.0.0.0/0` is simpler for now.

### Step 3: SSH into EC2 & Install Docker

```bash
# Connect to your EC2 instance
ssh -i meetix-key.pem ubuntu@<YOUR_EC2_PUBLIC_IP>
```

Once connected, run these commands:

```bash
# ============================
# Update system
# ============================
sudo apt-get update && sudo apt-get upgrade -y

# ============================
# Install Docker Engine
# ============================
sudo apt-get install -y ca-certificates curl gnupg

sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo $VERSION_CODENAME) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# ============================
# Allow Docker without sudo
# ============================
sudo usermod -aG docker ubuntu
# IMPORTANT: Log out and back in for this to take effect
exit
```

```bash
# Reconnect
ssh -i meetix-key.pem ubuntu@<YOUR_EC2_PUBLIC_IP>

# Verify Docker works without sudo
docker --version
docker compose version
```

### Step 4: Prepare the Deployment Directory

```bash
mkdir -p /home/ubuntu/meetix
```

That's it for now. GitHub Actions will sync files to this directory automatically.

### Step 5: Get Your SSH Private Key Ready

The `.pem` file you downloaded when creating the EC2 instance is your SSH private key. You'll need its **full contents** for the GitHub Secret `EC2_SSH_KEY`.

```bash
# On your LOCAL machine, display the key contents
cat meetix-key.pem
```

Copy **everything** from `-----BEGIN RSA PRIVATE KEY-----` to `-----END RSA PRIVATE KEY-----` (inclusive).

---

## 4. Part C — GitHub Secrets Configuration

### How to Add GitHub Secrets

1. Go to your GitHub repo: `https://github.com/<your-username>/meetix`
2. Click **Settings** (tab at the top)
3. In the left sidebar: **Secrets and variables → Actions**
4. Click **"New repository secret"**
5. Enter the **Name** and **Value**, then click **"Add secret"**
6. Repeat for each secret below

### Secret #1 — Client (Vercel) Secrets

Add these 6 secrets:

| Secret Name | Where to Get It | Example Value |
| :--- | :--- | :--- |
| `VERCEL_TOKEN` | [Part A, Step 2](#step-2-get-your-vercel_token) | `vrcl_xxxxxxxxxxxx` |
| `VERCEL_ORG_ID` | [Part A, Step 3](#step-3-link-your-project--get-vercel_org_id--vercel_project_id) — `.vercel/project.json` → `orgId` | `team_xxxxxxxxxxxx` |
| `VERCEL_PROJECT_ID` | [Part A, Step 3](#step-3-link-your-project--get-vercel_org_id--vercel_project_id) — `.vercel/project.json` → `projectId` | `prj_xxxxxxxxxxxx` |
| `VITE_API_BASE_URL` | Your backend API URL | `https://meetixchat.online/api/v1` |
| `VITE_SOCKET_URL` | Your backend Socket.io URL | `https://meetixchat.online` |
| `VITE_GITHUB_PROFILE` | Your GitHub profile URL | `https://github.com/subhadipm08` |

### Secret #2 — EC2 Connection Secrets (Shared by Server & DataServices)

Add these 3 secrets:

| Secret Name | Where to Get It | Example Value |
| :--- | :--- | :--- |
| `EC2_HOST` | AWS EC2 Console → Instance → Public IPv4 | `52.66.123.45` |
| `EC2_USER` | Default for Ubuntu AMI | `ubuntu` |
| `EC2_SSH_KEY` | [Part B, Step 5](#step-5-get-your-ssh-private-key-ready) — full `.pem` file contents | `-----BEGIN RSA PRIVATE KEY-----` ... `-----END RSA PRIVATE KEY-----` |

### Secret #3 — Server Application Secrets

Add these 12 secrets:

| Secret Name | Value | Notes |
| :--- | :--- | :--- |
| `SERVER_PORT` | `8000` | Port inside the container |
| `MONGODB_URI` | `mongodb://youruser:yourpass@meetix-mongo:27017/meetixdb?authSource=admin` | ⚠️ Use `meetix-mongo` as host (Docker container name), NOT `localhost` |
| `REDIS_URI` | `redis://meetix-redis:6379` | ⚠️ Use `meetix-redis` as host, NOT `localhost` |
| `CORS_ORIGIN` | `https://meetix-client.vercel.app` | Your Vercel frontend URL (update after first deploy) |
| `ACCESS_TOKEN_SECRET` | A random 64-char hex string | Generate: `openssl rand -hex 32` |
| `ACCESS_TOKEN_EXPIRY` | `1d` | |
| `REFRESH_TOKEN_SECRET` | A different random 64-char hex string | Generate: `openssl rand -hex 32` |
| `REFRESH_TOKEN_EXPIRY` | `10d` | |
| `EMAIL_USER` | `vchat.app.dev@gmail.com` | Your Gmail address |
| `EMAIL_PASS` | Your Gmail App Password | [How to generate Gmail App Password](https://support.google.com/accounts/answer/185833) |
| `EMAIL_FROM` | `Meetix <vchat.app.dev@gmail.com>` | |

> **💡 Tip:** Generate secure random secrets with:
> ```bash
> openssl rand -hex 32
> ```

### Secret #4 — DataServices (MongoDB) Secrets

Add these 3 secrets:

| Secret Name | Value | Notes |
| :--- | :--- | :--- |
| `MONGO_DB_NAME` | `meetixdb` | Database name |
| `MONGO_DB_USERNAME` | Your chosen username | Used by MongoDB's `MONGO_INITDB_ROOT_USERNAME` |
| `MONGO_DB_PASSWORD` | Your chosen strong password | Used by MongoDB's `MONGO_INITDB_ROOT_PASSWORD` |

> **⚠️ Important:** The username and password here must match what's in your `MONGODB_URI` secret. For example, if `MONGO_DB_USERNAME` is `subha` and `MONGO_DB_PASSWORD` is `secretpass123`, then `MONGODB_URI` should be:
> ```
> mongodb://subha:secretpass123@meetix-mongo:27017/meetixdb?authSource=admin
> ```

### Summary: All 24 GitHub Secrets

After adding everything, your GitHub Secrets page should show these 24 secrets:

```
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
VITE_API_BASE_URL
VITE_SOCKET_URL
VITE_GITHUB_PROFILE
EC2_HOST
EC2_USER
EC2_SSH_KEY
SERVER_PORT
MONGODB_URI
REDIS_URI
CORS_ORIGIN
ACCESS_TOKEN_SECRET
ACCESS_TOKEN_EXPIRY
REFRESH_TOKEN_SECRET
REFRESH_TOKEN_EXPIRY
EMAIL_USER
EMAIL_PASS
EMAIL_FROM
MONGO_DB_NAME
MONGO_DB_USERNAME
MONGO_DB_PASSWORD
```

---

## 5. Part D — DNS Configuration

You need to point your domain `meetixchat.online` to your EC2 instance's public IP.

### Option 1: Using Namecheap (or similar registrar)

1. Log in to your domain registrar
2. Go to **DNS Management** for `meetixchat.online`
3. Add/Edit these **A Records**:

   | Type | Host | Value | TTL |
   | :--- | :--- | :--- | :--- |
   | A | `@` | `<YOUR_EC2_PUBLIC_IP>` | Automatic |
   | A | `www` | `<YOUR_EC2_PUBLIC_IP>` | Automatic |

4. **Wait 5–30 minutes** for DNS propagation

### Verify DNS is Working

```bash
# On your local machine
nslookup meetixchat.online
# Should return your EC2 public IP

ping meetixchat.online
# Should respond from your EC2 IP
```

---

## 6. Part E — First Deployment

### Step 1: Get SSL Certificate (One-Time on EC2)

Before GitHub Actions can deploy, you need the initial SSL certificate. SSH into your EC2:

```bash
ssh -i meetix-key.pem ubuntu@<YOUR_EC2_PUBLIC_IP>
cd /home/ubuntu/meetix
```

First, manually sync the needed files. From your **local machine**:

```bash
# From your local meetix project root
scp -i meetix-key.pem -r \
  nginx/ scripts/ docker-compose.prod.yml server/Dockerfile server/.dockerignore \
  ubuntu@<YOUR_EC2_PUBLIC_IP>:/home/ubuntu/meetix/
```

Back on **EC2**, create the server `.env.prod` manually (one-time):

```bash
cat > /home/ubuntu/meetix/server/.env.prod << 'EOF'
PORT=8000
NODE_ENV=production
MONGODB_URI=mongodb://youruser:yourpass@meetix-mongo:27017/meetixdb?authSource=admin
REDIS_URI=redis://meetix-redis:6379
CORS_ORIGIN=https://meetix-client.vercel.app
ACCESS_TOKEN_SECRET=<your-generated-secret>
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=<your-generated-secret>
REFRESH_TOKEN_EXPIRY=10d
EMAIL_USER=vchat.app.dev@gmail.com
EMAIL_PASS=<your-app-password>
EMAIL_FROM=Meetix <vchat.app.dev@gmail.com>
EOF
```

Also export the MongoDB init variables:

```bash
export MONGO_DB_NAME=meetixdb
export MONGO_DB_USERNAME=youruser
export MONGO_DB_PASSWORD=yourpass
```

Now run the SSL initialization:

```bash
chmod +x scripts/init-ssl.sh
./scripts/init-ssl.sh your-email@example.com
```

This will:
1. Start a temporary Nginx container
2. Request an SSL certificate from Let's Encrypt
3. Save it to `/etc/letsencrypt/live/meetixchat.online/`

### Step 2: Start the Full Stack (First Time)

```bash
cd /home/ubuntu/meetix

# Start all containers
docker compose -f docker-compose.prod.yml up -d

# Watch the logs to make sure everything starts
docker compose -f docker-compose.prod.yml logs -f
# Press Ctrl+C to exit logs (containers keep running)
```

### Step 3: Verify Containers Are Running

```bash
docker compose -f docker-compose.prod.yml ps
```

Expected output:
```
NAME                STATUS              PORTS
meetix-certbot      Up                  
meetix-mongo        Up (healthy)        27017/tcp
meetix-nginx        Up                  0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
meetix-redis        Up (healthy)        6379/tcp
meetix-server-1     Up (healthy)        8000/tcp
meetix-server-2     Up (healthy)        8000/tcp
```

### Step 4: Deploy Frontend to Vercel (First Push)

Now merge your `dev` branch to `main`:

```bash
# On your local machine
git checkout main
git merge dev
git push origin main
```

Since you changed `client/**`, the `deploy-client.yml` workflow will trigger and deploy to Vercel.

### Step 5: Update CORS_ORIGIN

After the first Vercel deploy, you'll get a production URL like `https://meetix-client.vercel.app`. 

1. Update the `CORS_ORIGIN` GitHub Secret to this URL
2. Push any small change to `server/` to trigger a redeploy (or manually trigger the workflow)

---

## 7. Part F — Verify Everything Works

### Test the Backend API

```bash
# Health check (from anywhere)
curl https://meetixchat.online/health
# Expected: OK

# API endpoint
curl https://meetixchat.online/api/v1/stats
# Expected: JSON response
```

### Test WebSocket Connection

Open your browser console on the Vercel frontend and check:
- The Socket.io connection should establish via `wss://meetixchat.online/socket.io/`
- Video calls should work end-to-end

### Test Workflow Isolation

1. **Change only a client file** → Push to `main` → Only `Deploy Client to Vercel` should run
2. **Change only a server file** → Push to `main` → Only `Deploy Server to EC2` should run
3. **Change only a DataServices file** → Push to `main` → Only `Deploy DataServices to EC2` should run

Check workflow runs at: `https://github.com/<your-username>/meetix/actions`

### Test SSL Auto-Renewal

```bash
# On EC2, check certbot container logs
docker logs meetix-certbot
# Should show: "Next renewal check in 12 hours."

# Check certificate expiry
sudo openssl x509 -enddate -noout -in /etc/letsencrypt/live/meetixchat.online/fullchain.pem
# Should show a date ~90 days from issuance
```

---

## 8. Troubleshooting

### Container won't start

```bash
# Check logs for a specific container
docker compose -f docker-compose.prod.yml logs meetix-server-1

# Common issues:
# - "ECONNREFUSED" to MongoDB → MongoDB container isn't healthy yet, wait or check its logs
# - "MONGODB_URI" error → Check your .env.prod file, make sure host is "meetix-mongo" not "localhost"
```

### SSL certificate fails

```bash
# Make sure DNS is pointing to your EC2 IP
nslookup meetixchat.online

# Make sure port 80 is open in EC2 Security Group
curl http://meetixchat.online/.well-known/acme-challenge/test
# Should return 404 from Nginx, NOT a connection timeout

# If certbot fails, check its logs
docker logs meetix-certbot
```

### GitHub Actions workflow fails

1. Go to the **Actions** tab on your GitHub repo
2. Click the failed workflow run
3. Click the failed job to see detailed logs
4. Common issues:
   - **SSH connection timeout** → EC2 Security Group doesn't allow port 22 from GitHub runners
   - **Permission denied** → `EC2_SSH_KEY` secret is incorrect or missing newlines
   - **Docker build fails** → Check `server/Dockerfile` syntax, or EC2 is out of disk space

### WebSocket not connecting through Nginx

```bash
# Check if Nginx is properly proxying WebSocket
docker logs meetix-nginx

# Test WebSocket upgrade manually
curl -i -N \
  -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Version: 13" \
  -H "Sec-WebSocket-Key: test" \
  https://meetixchat.online/socket.io/?EIO=4&transport=websocket
```

### Out of disk space on EC2

```bash
# Check disk usage
df -h

# Clean up Docker (removes unused images, containers, volumes)
docker system prune -a --volumes
# ⚠️ WARNING: --volumes will delete data volumes too! Remove that flag to keep data.

# Safer: just remove dangling images
docker image prune -f
```

### Checking real-time container resource usage

```bash
docker stats --no-stream
```

---

## Quick Reference — Common Commands on EC2

```bash
# Start all services
docker compose -f docker-compose.prod.yml up -d

# Stop all services
docker compose -f docker-compose.prod.yml down

# Restart just the server containers
docker compose -f docker-compose.prod.yml restart meetix-server-1 meetix-server-2

# View logs (all containers, last 100 lines, follow)
docker compose -f docker-compose.prod.yml logs --tail=100 -f

# View logs for one container
docker compose -f docker-compose.prod.yml logs -f meetix-server-1

# Check container health
docker compose -f docker-compose.prod.yml ps

# Rebuild server after manual code changes
docker compose -f docker-compose.prod.yml build --no-cache meetix-server-1 meetix-server-2
docker compose -f docker-compose.prod.yml up -d --no-deps --force-recreate meetix-server-1 meetix-server-2
```
