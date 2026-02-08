from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pathlib import Path

app = FastAPI()

# Абсолютный путь к корню проекта
BASE_DIR = Path(__file__).resolve().parent.parent

# Путь к fronted
FRONTEND_DIR = BASE_DIR / "fronted"

if not FRONTEND_DIR.exists():
    raise RuntimeError(f"Frontend directory not found: {FRONTEND_DIR}")

# Подключаем фронтед
app.mount("/", StaticFiles(directory=FRONTED_DIR, html=True), name="fronted")

# API health check
@app.get("/api/health")
def health():
    return {"status": "ok"}