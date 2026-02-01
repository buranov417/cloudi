from fastapi import FastAPI, Form, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import hashlib
import secrets
import time

app = FastAPI()

# =========================
# STATIC & TEMPLATES
# =========================
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="static")

# =========================
# SECURITY
# =========================
MASTER_ADMIN_KEY = "673ziyada"
ADMIN_HASH = hashlib.sha256(MASTER_ADMIN_KEY.encode()).hexdigest()

clients = {}  # client_key -> {"created":..., "runs":..., "avg_saving":...}

# =========================
# UTILS
# =========================
def hash_key(x: str) -> str:
    return hashlib.sha256(x.encode()).hexdigest()

def generate_client_key():
    seed = secrets.token_hex(32)
    return hash_key(seed)

# =========================
# ROUTES
# =========================

@app.get("/", response_class=HTMLResponse)
def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/admin", response_class=HTMLResponse)
def admin_login(request: Request):
    return templates.TemplateResponse("admin.html", {"request": request})

# =========================
# LOGIN / AUTH
# =========================
@app.post("/login")
def login(key: str = Form(...)):
    h = hash_key(key)
    if h == ADMIN_HASH:
        return {"role": "admin", "message": "Admin access granted"}
    if key in clients:
        clients[key]["last_login"] = time.time()
        return {"role": "client", "message": "Client access granted"}
    raise HTTPException(status_code=403, detail="Invalid key")

# =========================
# ADMIN FUNCTIONS
# =========================
@app.post("/admin/create-client")
def create_client(admin_key: str = Form(...)):
    if hash_key(admin_key) != ADMIN_HASH:
        raise HTTPException(status_code=403)
    client_key = generate_client_key()
    clients[client_key] = {"created": time.time(), "runs": 0, "avg_saving": 0.0}
    return {"client_key": client_key}

@app.get("/admin/stats")
def admin_stats(admin_key: str = Form(...)):
    if hash_key(admin_key) != ADMIN_HASH:
        raise HTTPException(status_code=403)
    return clients

# =========================
# CLIENT OPTIMIZATION
# =========================
@app.post("/optimize")
def optimize(client_key: str = Form(...)):
    if client_key not in clients:
        raise HTTPException(status_code=403)
    # MOCK optimization
    time_saved = 0.3071
    steps_saved = 0.5125
    c = clients[client_key]
    c["runs"] += 1
    c["avg_saving"] = (c["avg_saving"] + time_saved) / 2
    return {"time_optimization": "30.71%", "step_reduction": "51.25%"}