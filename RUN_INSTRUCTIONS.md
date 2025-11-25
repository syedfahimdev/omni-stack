# Omni-Stack 5.0 - Phase 1: Run Instructions

## Backend Setup & Run

### 1. Install Python Dependencies

```bash
cd /Users/farhan/Documents/omni-stack/backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure API Key

Edit `/Users/farhan/Documents/omni-stack/backend/.env` and add your OpenAI API key:

```bash
OPENAI_API_KEY=sk-your-api-key-here
```

### 3. Run Backend Server

```bash
# Make sure you're in the backend directory and venv is activated
cd /Users/farhan/Documents/omni-stack/backend
source venv/bin/activate

# Run the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be running at: **http://localhost:8000**

---

## Frontend Setup & Run

### 1. Install Dependencies (if not already done)

```bash
cd /Users/farhan/Documents/omni-stack/frontend
npm install
```

### 2. Run Frontend Dev Server

```bash
cd /Users/farhan/Documents/omni-stack/frontend
npm run dev
```

The frontend will be running at: **http://localhost:3000**

---

## Access the Application

### Via Caddy (Recommended for full setup)

1. Make sure Docker is running with all services:
   ```bash
   cd /Users/farhan/Documents/omni-stack
   docker-compose up -d
   ```

2. Access URLs:
   - **System Dashboard:** http://app.localhost
   - **Chat Interface:** http://app.localhost/chat
   - **Backend API:** http://api.localhost/health

### Direct Access (for development)

- **Frontend:** http://localhost:3000
- **Chat Page:** http://localhost:3000/chat
- **Backend Health:** http://localhost:8000/health

---

## Quick Start (All-in-One)

### Terminal 1 - Backend
```bash
cd /Users/farhan/Documents/omni-stack/backend
source venv/bin/activate  # Or create venv first if not exists
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Terminal 2 - Frontend
```bash
cd /Users/farhan/Documents/omni-stack/frontend
npm run dev
```

### Terminal 3 (Optional) - Docker Services
```bash
cd /Users/farhan/Documents/omni-stack
docker-compose up -d
```

---

## Verify Setup

### 1. Check Backend Health
```bash
curl http://localhost:8000/health
# Should return: {"status":"ok"}
```

### 2. Test Chat Endpoint
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hello!"}],
    "model": "gpt-4o"
  }'
```

### 3. Open Chat Interface
Navigate to: **http://app.localhost/chat** or **http://localhost:3000/chat**

---

## Troubleshooting

### Backend Issues

**Import Error: No module named 'litellm'**
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

**API Key Error**
- Make sure `OPENAI_API_KEY` is set in `/backend/.env`
- Verify the key is valid and has credits

**CORS Error**
- Check that FastAPI CORS middleware includes your frontend URL
- Verify Caddy is routing correctly

### Frontend Issues

**Cannot connect to backend**
- Make sure backend is running on port 8000
- Check that Caddy is routing `api.localhost` to `backend:8000`
- Try using `http://localhost:8000/api/chat` directly for testing

**Module not found**
```bash
cd frontend
npm install
```

### Docker/Caddy Issues

**Services not accessible**
```bash
docker-compose ps  # Check if services are running
docker-compose logs caddy  # Check Caddy logs
```

---

## Stop Services

### Stop Backend
Press `Ctrl+C` in the terminal running uvicorn

### Stop Frontend
Press `Ctrl+C` in the terminal running npm dev

### Stop Docker Services
```bash
cd /Users/farhan/Documents/omni-stack
docker-compose down
```

---

## Environment Variables

### Backend (.env in /backend)
- `OPENAI_API_KEY` - Your OpenAI API key (required)

### Root (.env in /omni-stack)
- `OPENAI_API_KEY` - Not used by backend, placeholder
- `BACKEND_URL` - URL of backend API (http://api.localhost)

---

## Next Steps

1. Add your OpenAI API key to `/backend/.env`
2. Start backend and frontend servers
3. Navigate to http://app.localhost/chat
4. Start chatting!

For production deployment, see deployment documentation.
