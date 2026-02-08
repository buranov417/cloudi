from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pathlib import Path

app = FastAPI()

# Абсолютный путь к корню проекта
BASE_DIR = Path(__file__).resolve().parent.parent

# Путь к frontend
FRONTEND_DIR = BASE_DIR / "frontend"

if not FRONTEND_DIR.exists():
    raise RuntimeError(f"Frontend directory not found: {FRONTEND_DIR}")

# Подключаем фронтенд
app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")

# API health check
@app.get("/api/health")
def health():
    return {"status": "ok"}