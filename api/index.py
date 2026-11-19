import sys
from pathlib import Path

# Add backend directory to Python path so `app` package resolves cleanly on Vercel
backend_dir = str(Path(__file__).resolve().parent.parent / "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app

