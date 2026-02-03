# main.py
from fastapi import FastAPI, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional
import secrets
import uvicorn

app = FastAPI(title="MinSky Optimization Hub")

# --- Админский ключ ---
ADMIN_KEY = "673ziyada"

# --- Хранилище клиентов ---
clients = {}  # client_id: {"ip":..., "key":...}

# --- Модели ---
class ClientRequest(BaseModel):
    steps: int
    energy: float

class ClientResponse(BaseModel):
    steps_after: int
    energy_after: float
    status: str

# --- Зависимость для авторизации ---
def check_admin(x_api_key: str = Header(...)):
    if x_api_key != ADMIN_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True

# --- Генерация IP и ключа ---
@app.post("/admin/generate_client")
def generate_client(admin: bool = Depends(check_admin)):
    client_id = secrets.token_hex(4)
    client_ip = f"192.168.{secrets.randbelow(255)}.{secrets.randbelow(255)}"
    client_key = secrets.token_hex(16)
    clients[client_id] = {"ip": client_ip, "key": client_key}
    return {"client_id": client_id, "ip": client_ip, "key": client_key}

# --- Получение списка клиентов (только админ) ---
@app.get("/admin/clients")
def list_clients(admin: bool = Depends(check_admin)):
    return clients

# --- API для клиентов ---
@app.post("/api/optimize", response_model=ClientResponse)
def optimize(data: ClientRequest, x_api_key: str = Header(...)):
    # Проверка клиента
    client = None
    for c in clients.values():
        if c["key"] == x_api_key:
            client = c
            break
    if not client:
        raise HTTPException(status_code=401, detail="Unauthorized client key")

    # --- Симуляция оптимизации ---
    steps_after = int(data.steps * 0.49)   # пример 51% сокращение шагов
    energy_after = round(data.energy * 0.7, 2)  # пример 30% экономии

    return ClientResponse(
        steps_after=steps_after,
        energy_after=energy_after,
        status="optimized"
    )

# --- Для локального теста ---
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)