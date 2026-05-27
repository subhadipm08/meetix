<div align="center">
  <img src="https://raw.githubusercontent.com/subhadipm08/meetix/main/server/public/logo.png" alt="Meetix Logo" width="180" />
  
  # Meetix 📹💬

  **Real-Time P2P Video Chat & Messaging Platform**

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
- **Backend:** Hosted on an **AWS EC2** instance running Dockerized MongoDB, Redis, and the Node.js API behind an NGINX reverse proxy with auto-renewing Let's Encrypt SSL certificates.
- **CI/CD:** Automated via **GitHub Actions** for seamless continuous integration.

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

## 🤝 Contributing
This project is currently in a maintenance-only state. Contributions are not actively accepted at this time.

## 📄 License
This project is open-sourced software licensed under the [MIT License](LICENSE).