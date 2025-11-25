# Railway Environment Variables & Build Issues

## 🔍 Build Issues Identified

### 1. Port Configuration Mismatch
**Issue**: The `railway.toml` uses `$PORT` but the Dockerfile CMD hardcodes port 8000.

**Fix Applied**: The `railway.toml` startCommand correctly uses `$PORT`, which Railway sets automatically. The Dockerfile CMD is overridden by Railway's startCommand, so this is fine.

### 2. Missing Environment Variables
The application will fail at runtime if these are not set, but the build should succeed without them.

## 📋 Required Environment Variables

### Backend Service Environment Variables

#### **Critical (Required for App to Run)**
```bash
# OpenAI API
OPENAI_API_KEY=sk-...                    # Required for LLM functionality

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Required for database access

# LiveKit (for voice features)
LIVEKIT_URL=wss://your-livekit-server.com
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret

# Neo4j (for graph database)
NEO4J_URI=bolt://your-neo4j-server:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password
```

#### **Optional (Have Defaults)**
```bash
# Deepgram (optional, for voice transcription)
DEEPGRAM_API_KEY=your_key                # Optional, only if using Deepgram

# Port (Railway sets automatically)
PORT=8000                                # Railway sets this automatically
```

### Frontend Service Environment Variables

#### **Critical (Required for Build & Runtime)**
```bash
# Supabase (Required at build time)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# LiveKit (Required at build time if using voice features)
NEXT_PUBLIC_LIVEKIT_URL=wss://your-livekit-server.com

# Backend URL (Optional, has default)
NEXT_PUBLIC_BACKEND_URL=https://your-backend.railway.app  # Optional, defaults to api.localhost
```

#### **Optional (Have Defaults)**
```bash
NODE_ENV=production                      # Railway sets this automatically
PORT=3000                                # Railway sets this automatically
```

## 🚨 Build-Time vs Runtime Variables

### Frontend Build-Time Variables
These MUST be set before building (Railway will use them during `npm run build`):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_LIVEKIT_URL`

**Note**: If these are missing, the build will succeed but the app won't work correctly.

### Backend Runtime Variables
These are only needed when the app runs (not during build):
- `OPENAI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `LIVEKIT_URL`
- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`
- `NEO4J_URI`
- `NEO4J_USER`
- `NEO4J_PASSWORD`

## 🔧 How to Set Variables in Railway

1. Go to your Railway project dashboard
2. Click on the service (backend or frontend)
3. Go to **"Variables"** tab
4. Click **"New Variable"**
5. Add each variable with its value
6. Click **"Deploy"** to apply changes

## ✅ Build Status Check

The build should succeed even without environment variables, but the app will fail at runtime if critical variables are missing.

### To Check Build Logs:
1. Go to Railway dashboard
2. Click on your service
3. Click on the latest deployment
4. Check the "Build Logs" tab

### Common Build Errors:
- ❌ `COPY requirements.txt` not found → Fixed (Dockerfile paths corrected)
- ❌ `npm run build` fails → Check if `NEXT_PUBLIC_*` vars are set
- ❌ `uvicorn` fails to start → Check if required env vars are set

## 📝 Quick Setup Checklist

### Backend Service:
- [ ] `OPENAI_API_KEY`
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `LIVEKIT_URL`
- [ ] `LIVEKIT_API_KEY`
- [ ] `LIVEKIT_API_SECRET`
- [ ] `NEO4J_URI`
- [ ] `NEO4J_USER`
- [ ] `NEO4J_PASSWORD`

### Frontend Service:
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `NEXT_PUBLIC_LIVEKIT_URL`
- [ ] `NEXT_PUBLIC_BACKEND_URL` (optional, points to backend service)

## 🔗 Railway Dashboard Links

- **Project**: https://railway.com/project/e4187ed2-af3c-420c-a59e-58f21d33b26b
- **Services**: Create separate services for backend and frontend with root directories `/backend` and `/frontend`

