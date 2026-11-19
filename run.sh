#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "=== Starting Rahul Raj AI Voice Avatar ==="

# Check virtual environment
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    uv venv .venv
    uv pip install --python .venv/bin/python -r backend/requirements.txt
fi

# Build frontend if static files missing
if [ ! -f "backend/app/static/index.html" ]; then
    echo "Building React frontend..."
    cd frontend
    npm install
    npm run build
    cd "$DIR"
fi

echo "Starting FastAPI server on http://localhost:8000..."
export PYTHONPATH="$DIR/backend"
"$DIR/.venv/bin/uvicorn" app.main:app --host 0.0.0.0 --port 8000 --reload

