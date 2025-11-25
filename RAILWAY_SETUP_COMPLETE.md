# Railway Deployment Setup

## ✅ Completed

1. **Railway Project Created**: `omni-stack`
   - Project ID: `e4187ed2-af3c-420c-a59e-58f21d33b26b`
   - URL: https://railway.com/project/e4187ed2-af3c-420c-a59e-58f21d33b26b
   - Domain: https://omni-stack-production.up.railway.app

2. **Initial Deployment Triggered**: Backend service deployment started

## 🔧 Next Steps: Create Separate Services

Railway needs separate services for backend and frontend in a monorepo. Here's how to set them up:

### Option 1: Via Railway Dashboard (Recommended)

1. Go to https://railway.com/project/e4187ed2-af3c-420c-a59e-58f21d33b26b
2. Click **"New"** → **"GitHub Repo"**
3. Select `syedfahimdev/omni-stack`
4. Railway will detect the repository structure

5. **For Backend Service:**
   - Name: `omni-backend`
   - Root Directory: `/backend`
   - Railway will auto-detect `backend/railway.toml` and `backend/Dockerfile`
   - Port: `8000` (auto-detected)

6. **For Frontend Service:**
   - Name: `omni-frontend`  
   - Root Directory: `/frontend`
   - Railway will auto-detect `frontend/railway.toml` and `frontend/Dockerfile`
   - Port: `3000` (auto-detected)

### Option 2: Via Railway CLI

```bash
# Create backend service
cd backend
railway service create --name omni-backend
railway up

# Create frontend service  
cd ../frontend
railway service create --name omni-frontend
railway up
```

## 📝 Environment Variables to Set

Set these in Railway dashboard for each service:

### Backend Service Variables:
- `OPENAI_API_KEY` - Your OpenAI API key
- `DEEPGRAM_API_KEY` - Your Deepgram API key
- `SUPABASE_URL` - Your Supabase URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `LIVEKIT_URL` - Your LiveKit WebSocket URL
- `LIVEKIT_API_KEY` - Your LiveKit API key
- `LIVEKIT_API_SECRET` - Your LiveKit API secret
- `NEO4J_URI` - Your Neo4j connection URI
- `NEO4J_USER` - Your Neo4j username
- `NEO4J_PASSWORD` - Your Neo4j password
- `PORT` - Railway sets this automatically

### Frontend Service Variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `NEXT_PUBLIC_LIVEKIT_URL` - Your LiveKit WebSocket URL
- `NODE_ENV=production`
- `PORT` - Railway sets this automatically

## 🚀 Current Status

- ✅ Railway project created and linked
- ✅ Domain generated: https://omni-stack-production.up.railway.app
- ⏳ Services need to be created via dashboard (monorepo structure)
- ⏳ Environment variables need to be configured

## 📚 Railway Configuration Files

- `backend/railway.toml` - Backend service configuration
- `frontend/railway.toml` - Frontend service configuration
- `railway.json` - Root project configuration

All configuration files are in place and ready for deployment!

