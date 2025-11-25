# Railway Deployment Guide

## Prerequisites
- Railway account (linked via CLI)
- GitHub repository connected

## Setup Steps

### 1. Connect GitHub Repository to Railway
1. Go to [Railway Dashboard](https://railway.app)
2. Select your project: `clever-wisdom`
3. Click "New" → "GitHub Repo"
4. Select `syedfahimdev/omni-stack`
5. Railway will auto-detect services from `railway.toml` files

### 2. Create Services Manually (if auto-detection doesn't work)
1. In Railway dashboard, click "New" → "Empty Service"
2. For Backend:
   - Name: `omni-backend`
   - Root Directory: `/backend`
   - Dockerfile: `backend/Dockerfile`
   - Port: `8000`
3. For Frontend:
   - Name: `omni-frontend`
   - Root Directory: `/frontend`
   - Dockerfile: `frontend/Dockerfile`
   - Port: `3000`

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

