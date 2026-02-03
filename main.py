from fastapi import FastAPI, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timedelta
import secrets

app = FastAPI()

# CORS для фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# --- Структуры ---
class Node(BaseModel):
    node_id: str
    token: str
    status: str
    trial_until: str
    optimization: float = 0.0
    steps_reduced: float = 0.0
    company: str = None

nodes = {}

ADMIN_KEY = "673ziyada"

# --- Генерация узла ---
@app.post("/generate_node")
def generate_node(admin_key: str = Form(...), company: str = Form(...)):
    if admin_key != ADMIN_KEY:
        raise HTTPException(status_code=403, detail="Неверный ключ")
    node_id = f"node_{len(nodes)+1:04d}"
    token = secrets.token_urlsafe(8)
    trial_until = (datetime.utcnow() + timedelta(days=7)).isoformat()
    node = Node(node_id=node_id, token=token, status="active", trial_until=trial_until, company=company)
    nodes[node_id] = node
    return node

# --- Подключение узла ---
@app.post("/connect_node")
def connect_node(token: str = Form(...)):
    for node in nodes.values():
        if node.token == token:
            if datetime.fromisoformat(node.trial_until) < datetime.utcnow():
                node.status = "expired"
                raise HTTPException(status_code=403, detail="Trial expired")
            return {"status": "connected", "node_id": node.node_id}
    raise HTTPException(status_code=404, detail="Token not found")

# --- Оптимизация ---
@app.post("/optimize")
def optimize_node(token: str = Form(...)):
    for node in nodes.values():
        if node.token == token:
            if node.status != "active":
                raise HTTPException(status_code=403, detail="Node not active")
            # Симуляция оптимизации
            import random
            node.optimization = round(random.uniform(20,30),2)
            node.steps_reduced = round(random.uniform(40,51),2)
            return {
                "node_id": node.node_id,
                "optimization": f"{node.optimization}%",
                "steps_reduced": f"{node.steps_reduced}%"
            }
    raise HTTPException(status_code=404, detail="Token not found")

# --- Список всех узлов ---
@app.get("/nodes")
def list_nodes(admin_key: str):
    if admin_key != ADMIN_KEY:
        raise HTTPException(status_code=403, detail="Неверный ключ")
    return list(nodes.values())