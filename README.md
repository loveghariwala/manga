# MANGA.IO - Production-Grade Manga Platform

This is a modern manga reading platform built with Next.js, MongoDB, and Redis.

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+
- Docker (optional but recommended for local DB)

### 2. Setup Environment
Copy `.env.example` to `.env` and fill in the values.
```bash
cp .env.example .env
```

### 3. Start Infrastructure (Docker)
The easiest way to start MongoDB and Redis is using the provided Docker Compose file:
```bash
docker compose up -d
```

### 4. Install Dependencies
```bash
npm install
```

### 5. Run Development Server
```bash
npm run dev
```

## 🏗️ Tech Stack
- **Framework**: Next.js 15+ (App Router)
- **Database**: MongoDB (Mongoose)
- **Cache**: Redis (ioredis)
- **Auth**: NextAuth.js (JWT & Database Sessions)
- **Styling**: Tailwind CSS 4, shadcn/ui
- **Animations**: Framer Motion

## 🛠️ Project Structure
- `/src/app`: App Router pages and API routes (BFF Layer)
- `/src/lib`: Core utilities (MongoDB, MangaDex API, Auth)
- `/src/components`: Premium UI components and Reader logic
- `/src/models`: Mongoose schemas for persistence
