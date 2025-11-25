# Railway Deployment Guide

## Prerequisites
- Railway account (linked via CLI)
- GitHub repository: `syedfahimdev/omni-stack`

## Quick Setup via Railway Dashboard

### Option 1: GitHub Integration (Recommended)
1. Go to [Railway Dashboard](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose `syedfahimdev/omni-stack`
5. Railway will auto-detect services from the repository structure

### Option 2: Manual Service Creation
1. Go to [Railway Dashboard](https://railway.app)
2. Select your project: `clever-wisdom` (or create new)
3. Click "New" → "Empty Service"
4. For Backend:
   - Name: `omni-backend`
   - Connect to GitHub repo: `syedfahimdev/omni-stack`
   - Root Directory: `/backend`
   - Dockerfile Path: `backend/Dockerfile`
   - Port: `8000` (Railway auto-detects)
5. For Frontend:
   - Name: `omni-frontend`
   - Connect to GitHub repo: `syedfahimdev/omni-stack`
   - Root Directory: `/frontend`
   - Dockerfile Path: `frontend/Dockerfile`
   - Port: `3000` (Railway auto-detects)

### 3. Set Environment Variables
Set these in Railway dashboard for each service:

**Backend Environment Variables:**
- `OPENAI_API_KEY`
- `DEEPGRAM_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `LIVEKIT_URL`
- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`
- `NEO4J_URI`
- `NEO4J_USER`
- `NEO4J_PASSWORD`
- `PORT` (Railway sets this automatically)

**Frontend Environment Variables:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_LIVEKIT_URL`
- `NODE_ENV=production`
- `PORT` (Railway sets this automatically)

### 4. Deploy
Once connected, Railway will auto-deploy on every push to `main` branch.

## Manual Deployment via CLI
```bash
# Deploy backend
cd backend
railway up

# Deploy frontend
cd frontend
railway up
```

## Generate Railway Token for CI/CD
1. Go to Railway Dashboard → Settings → Tokens
2. Create a new token
3. Add to GitHub Secrets as `RAILWAY_TOKEN`

