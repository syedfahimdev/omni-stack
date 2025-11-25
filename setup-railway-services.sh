#!/bin/bash

echo "🚀 Setting up Railway services for omni-stack monorepo"
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Please install it first:"
    echo "   curl -fsSL https://railway.app/install.sh | sh"
    exit 1
fi

# Check if logged in
if ! railway whoami &> /dev/null; then
    echo "❌ Not logged in to Railway. Please run: railway login"
    exit 1
fi

echo "✅ Railway CLI is ready"
echo ""

# Link to project
echo "📦 Linking to Railway project..."
cd /Users/farhan/Documents/omni-stack
railway link --project e4187ed2-af3c-420c-a59e-58f21d33b26b

echo ""
echo "📝 Note: Railway requires services to be created via the dashboard for monorepos."
echo ""
echo "Please follow these steps:"
echo ""
echo "1. Go to: https://railway.com/project/e4187ed2-af3c-420c-a59e-58f21d33b26b"
echo "2. Click 'New' → 'GitHub Repo'"
echo "3. Select 'syedfahimdev/omni-stack'"
echo "4. For each service:"
echo "   - Backend: Root Directory = '/backend'"
echo "   - Frontend: Root Directory = '/frontend'"
echo ""
echo "Or use the Railway dashboard to create services manually with:"
echo "  - Backend: Root = /backend, Dockerfile = backend/Dockerfile"
echo "  - Frontend: Root = /frontend, Dockerfile = frontend/Dockerfile"
echo ""

