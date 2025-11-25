# Railway Deployment - Final Setup Guide

## ✅ What's Been Done

1. **Railway Project Created**: `omni-stack`
   - Project URL: https://railway.com/project/e4187ed2-af3c-420c-a59e-58f21d33b26b
   - Project ID: `e4187ed2-af3c-420c-a59e-58f21d33b26b`

2. **Configuration Files Ready**:
   - `backend/railway.toml` - Backend service config
   - `frontend/railway.toml` - Frontend service config
   - `backend/Dockerfile.backend` - Backend Dockerfile (root-level compatible)
   - `frontend/Dockerfile.frontend` - Frontend Dockerfile (root-level compatible)

## 🚀 Deploy Services via Railway Dashboard

Railway requires separate services for monorepos. Here's the recommended approach:

### Step 1: Connect GitHub Repository

1. Go to: https://railway.com/project/e4187ed2-af3c-420c-a59e-58f21d33b26b
2. Click **"New"** → **"GitHub Repo"**
3. Select `syedfahimdev/omni-stack`
4. Railway will prompt you to create services

### Step 2: Create Backend Service

1. When prompted, create a service named: `omni-backend`
2. Set **Root Directory**: `/backend`
3. Railway will auto-detect:
   - `backend/railway.toml`
   - `backend/Dockerfile.backend`
4. Port will auto-detect as `8000`

### Step 3: Create Frontend Service

1. Click **"New"** → **"GitHub Repo"** again (or "New Service")
2. Select the same repo: `syedfahimdev/omni-stack`
3. Name: `omni-frontend`
4. Set **Root Directory**: `/frontend`
5. Railway will auto-detect:
   - `frontend/railway.toml`
   - `frontend/Dockerfile.frontend`
6. Port will auto-detect as `3000`

### Step 4: Configure Environment Variables

For **Backend Service**:
```
OPENAI_API_KEY=your_key
DEEPGRAM_API_KEY=your_key
SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_key
LIVEKIT_URL=your_url
LIVEKIT_API_KEY=your_key
LIVEKIT_API_SECRET=your_secret
NEO4J_URI=your_uri
NEO4J_USER=your_user
NEO4J_PASSWORD=your_password
```

For **Frontend Service**:
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
NEXT_PUBLIC_LIVEKIT_URL=your_url
NODE_ENV=production
```

### Step 5: Generate Domains

After services are deployed:
1. Go to each service
2. Click **"Settings"** → **"Generate Domain"**
3. Railway will provide a public URL

## 📝 Alternative: Manual Service Creation

If GitHub integration doesn't work:

1. Go to project dashboard
2. Click **"New"** → **"Empty Service"**
3. For each service:
   - Name: `omni-backend` or `omni-frontend`
   - Connect to GitHub repo: `syedfahimdev/omni-stack`
   - Set Root Directory: `/backend` or `/frontend`
   - Railway will use the `railway.toml` and Dockerfile in that directory

## ✅ Current Status

- ✅ Railway project created and linked
- ✅ Configuration files in place
- ⏳ Services need to be created via dashboard (monorepo requirement)
- ⏳ Environment variables need to be configured
- ⏳ Domains need to be generated after deployment

## 🔗 Quick Links

- **Project Dashboard**: https://railway.com/project/e4187ed2-af3c-420c-a59e-58f21d33b26b
- **GitHub Repo**: https://github.com/syedfahimdev/omni-stack

All code is ready - just need to create the services via the Railway dashboard!

