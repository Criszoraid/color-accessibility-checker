#!/bin/bash

# Kill background processes on exit
trap "trap - SIGTERM && kill -- -$$" SIGINT SIGTERM EXIT

echo "🚀 Starting Color Accessibility Checker..."

# Start Frontend (Vite)
echo "📦 Starting Frontend..."
npm run dev &
FRONTEND_PID=$!

# Start Backend (FastAPI)
echo "🐍 Starting Backend..."
cd server_python
# Create venv if not exists
if [ ! -d ".venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv .venv
fi
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!

wait
