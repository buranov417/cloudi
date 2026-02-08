from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI()

# Подключаем статические файлы
app.mount("/static", StaticFiles(directory="frontend"), name="static")

# Главная страница
@app.get("/")
def read_index():
    return FileResponse("frontend/index.html")

# Проверка API
@app.get("/api/status")
def status():
    return {"status": "NodIdeas API is running"}