<div align="center">
  <img src="https://raw.githubusercontent.com/subhadipm08/meetix/main/server/public/logo.png" alt="Meetix Logo" width="180" />
  
  # Meetix 📹💬

  **Real-Time P2P Video Chat & Messaging Platform**

  [![EC2 Init](https://github.com/subhadipm08/meetix/actions/workflows/deploy-dataservices.yml/badge.svg)](https://github.com/subhadipm08/meetix/actions)
  [![Backend CI/CD](https://github.com/subhadipm08/meetix/actions/workflows/deploy-server.yml/badge.svg)](https://github.com/subhadipm08/meetix/actions)
  [![Frontend Deployment](https://img.shields.io/badge/Vercel-Deployed-000000?logo=vercel)](https://meetixchat.vercel.app/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

  [**View Live Website**](https://meetixchat.vercel.app/) • [**Report Bug**](https://github.com/subhadipm08/meetix/issues) • [**Request Feature**](https://github.com/subhadipm08/meetix/issues)
</div>

---

Meetix is a modern, WebRTC-powered platform designed for real-time video calls and instant messaging with users worldwide. Leveraging direct peer-to-peer (P2P) connections, Meetix provides a seamless, low-latency communication experience directly within your web browser.

> [!WARNING]
> **Security & Privacy Note:** This application uses public **STUN servers** to facilitate WebRTC connection negotiation. STUN servers share your public IP address with the matching peer to establish a direct peer-to-peer media stream. For production environments, hosting and using **TURN servers** is highly recommended to relay traffic and fully mask client IP addresses.

---

## ✨ Features

- **🎥 Live P2P Video Calls:** Ultra-low latency video and audio communication powered by the WebRTC API.
- **💬 Real-Time Chatting:** Integrated text messaging interface to chat alongside your video session.
- **🔄 Random Matchmaking:** Intelligent signaling flow that pairs active users automatically.
- **🔒 Secure Connections:** End-to-end media encryption and JWT-based REST authentication.
- **🛡️ Email Verification:** Secure OTP email verification system for new user registrations.
- **🎨 Modern Premium UI:** Beautiful dark mode UI built with TailwindCSS, featuring glassmorphism, smooth hover states, and micro-animations.

---

## 🏗️ Architecture & Deployment

Meetix is designed with a scalable, decoupled architecture and features fully automated CI/CD pipelines.

<div align="center">

```mermaid
graph TD
    subgraph Frontend [Frontend: Vercel]
        C1[React + Vite App]
        C2[WebRTC PeerConnection]
    end
    subgraph Backend [Backend: AWS EC2]
        Nginx[NGINX Reverse Proxy]
        S1[Node.js / Express API]
        S2[Socket.io Signaling]
        DB[(MongoDB Container)]
        RD[(Redis Container)]
    end
    subgraph Infra [Global Infra]
        STUN((STUN Servers))
    end

    User((User)) -->|HTTPS| C1
    C1 -->|HTTPS REST| Nginx
    C1 -->|WSS Sockets| Nginx
    Nginx -->|Proxy| S1
    Nginx -->|Proxy| S2
    C2 <-->|ICE Negotiation| STUN
    C2 <==>|Direct P2P Audio & Video| Remote[Remote Peer]
    S1 <--> DB
    S2 <--> RD
```
</div>

- **Frontend:** Hosted globally on **Vercel** with automatic deployments on Git push.
- **Backend:** Hosted on an **AWS EC2** instance running Dockerized MongoDB, Redis, two Node.js API instances, NGINX, and Certbot.
- **SSL:** Let's Encrypt certificates are initialized during infrastructure setup and renewed automatically by the Certbot container.
- **CI/CD:** Automated via two **GitHub Actions** workflows: one for EC2 infrastructure initialization and one for backend server deployments.

---

## 🛠️ Tech Stack

### Client (Frontend)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Socket.io Client](https://img.shields.io/badge/Socket.io%20Client-black?style=for-the-badge&logo=socket.io&badgeColor=010101)

### Server (Backend)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **MongoDB** (Local or Atlas)
- **Redis** (Local or Cloud)

### 1. Clone & Install
```bash
git clone https://github.com/subhadipm08/meetix.git
cd meetix
```

### 2. Configure Backend
```bash
cd server
npm install
cp .env.sample .env
# Edit .env with your MongoDB, Redis, and Email credentials
npm run dev
```

### 3. Configure Frontend
```bash
cd ../client
npm install
cp .env.sample .env
# Ensure VITE_API_BASE_URL and VITE_SOCKET_URL point to your local server
npm run dev
```

---

## ⚙️ Environment Variables

### Server (`server/.env`)
| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | The port the Express/Socket.io server listens on | `8000` |
| `MONGODB_URI` | Connection URI for the MongoDB database | `mongodb://localhost:27017/meetixdb` |
| `REDIS_URI` | Connection URI for the Redis server | `redis://localhost:6379` |
| `CORS_ORIGIN` | Allowed origin for CORS | `http://localhost:5173` |
| `ACCESS_TOKEN_SECRET` | Secret key for signing Access JWTs | *Secure string* |
| `EMAIL_USER` / `EMAIL_PASS`| Credentials for OTP emails | - |

### Client (`client/.env`)
| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Base API endpoint | `http://localhost:8000/api/v1` |
| `VITE_SOCKET_URL` | Signaling server WebSocket endpoint | `http://localhost:8000` |

---

## Production Deployment

The production backend runs on EC2 with Docker Compose. Deployment is split into two workflows so first-time infrastructure setup and normal backend releases stay separate.

### EC2 Security Group

Only expose the reverse proxy and SSH:

```text
HTTP   80    0.0.0.0/0
HTTPS  443   0.0.0.0/0
SSH    22    your-ip/32
```

Do not expose Node, MongoDB, or Redis directly:

```text
8000   Node.js backend
27017  MongoDB
6379   Redis
```

### Production Environment

Production uses one generated env file on EC2:

```text
/home/ubuntu/meetix/.env.prod
```

Both workflows create/update this file from GitHub Actions secrets. The expected shape is documented in `.env.prod.example`.

Required GitHub Actions secrets:

| Secret | Purpose |
| :--- | :--- |
| `EC2_HOST` | EC2 public IP or backend domain |
| `EC2_USER` | SSH user, usually `ubuntu` |
| `EC2_SSH_KEY` | Private key used by GitHub Actions to SSH into EC2 |
| `SERVER_PORT` | Backend port, normally `8000` |
| `MONGO_DB_NAME` | MongoDB database name |
| `MONGO_DB_USERNAME` | MongoDB root/user name |
| `MONGO_DB_PASSWORD` | MongoDB password |
| `MONGODB_URI` | Mongo URI, for Docker use `mongodb://user:pass@meetix-mongo:27017/db?authSource=admin` |
| `REDIS_URI` | Redis URI, for Docker use `redis://meetix-redis:6379` |
| `CORS_ORIGIN` | Allowed frontend origin, for example `https://meetixchat.vercel.app` |
| `ACCESS_TOKEN_SECRET` | JWT access token secret |
| `ACCESS_TOKEN_EXPIRY` | Access token lifetime |
| `REFRESH_TOKEN_SECRET` | JWT refresh token secret |
| `REFRESH_TOKEN_EXPIRY` | Refresh token lifetime |
| `EMAIL_USER` | Email account used for OTP email |
| `EMAIL_PASS` | Email app password |
| `EMAIL_FROM` | Sender label, for example `Meetix <vchat.app.dev@gmail.com>` |
| `LETSENCRYPT_EMAIL` | Optional SSL registration email. Falls back to `EMAIL_USER` when omitted |

### Workflow 1: Initialize EC2 Infrastructure

Run **Initialize EC2 Infrastructure** when setting up a fresh EC2 instance or changing infrastructure-level files such as `docker-compose.prod.yml`, `nginx/**`, or `scripts/init-ssl.sh`.

This workflow:

- syncs deployment files to `/home/ubuntu/meetix`
- creates `/home/ubuntu/meetix/.env.prod`
- starts MongoDB and Redis
- obtains or reuses the Let's Encrypt certificate
- starts NGINX and Certbot renewal

After it succeeds, EC2 should show these infrastructure containers:

```text
meetix-mongo
meetix-redis
meetix-nginx
meetix-certbot
```

### Workflow 2: Deploy Server to EC2

Run **Deploy Server to EC2** for normal backend releases. It also runs automatically on `main` pushes that touch `server/**`, `nginx/**`, or `docker-compose.prod.yml`.

This workflow:

- syncs backend deployment files
- refreshes `/home/ubuntu/meetix/.env.prod`
- rebuilds and restarts `meetix-server-1` and `meetix-server-2`
- reloads NGINX when it is already running

After both workflows have run successfully, EC2 should have:

```text
meetix-nginx
meetix-certbot
meetix-server-1
meetix-server-2
meetix-mongo
meetix-redis
```

Verify the deployment:

```bash
curl http://localhost/health
curl https://meetixchat.online/health
curl https://meetixchat.online/api/v1/stats
```

### Frontend Production URLs

In Vercel, point the frontend to the EC2 backend domain:

```env
VITE_API_BASE_URL=https://meetixchat.online/api/v1
VITE_SOCKET_URL=https://meetixchat.online
```

---

## 🤝 Contributing
This project is currently in a maintenance-only state. Contributions are not actively accepted at this time.

## 📄 License
This project is open-sourced software licensed under the [MIT License](LICENSE).
