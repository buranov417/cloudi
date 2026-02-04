from fastapi import FastAPI, HTTPException, Request, Form
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List
from optimizer.pipeline_step import PipelineStep
from optimizer.optimizer_dag import MillenniumOptimizerDAG
import secrets

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

# =========================
# Админ-ключ
# =========================
ADMIN_CODE = "673ziyada"

# =========================
# Токены компаний
# =========================
company_tokens = {}  # token: company_name

# =========================
# Pydantic-модель для JSON
# =========================
class StepJSON(BaseModel):
    id: int
    exec_time: float
    cost: float
    error_rate: float
    stability: float
    complexity: float
    dependencies: List[int] = []

# =========================
# Админская панель
# =========================
@app.get("/admin", response_class=HTMLResponse)
def admin_panel(code: str):
    if code != ADMIN_CODE:
        raise HTTPException(status_code=403, detail="Invalid admin code")
    
    token_list_html = "".join([f"<li>{t}: {company_tokens[t]}</li>" for t in company_tokens])
    html = f"""
    <h1>Admin Panel</h1>
    <p>Сгенерированные токены компаний:</p>
    <ul>{token_list_html}</ul>
    <form action="/generate_token" method="post">
        Company Name: <input type="text" name="company_name"/>
        <input type="hidden" name="admin_code" value="{ADMIN_CODE}"/>
        <button type="submit">Generate Token</button>
    </form>
    """
    return html

@app.post("/generate_token")
def generate_token(company_name: str = Form(...), admin_code: str = Form(...)):
    if admin_code != ADMIN_CODE:
        raise HTTPException(status_code=403, detail="Invalid admin code")
    token = secrets.token_hex(16)
    company_tokens[token] = company_name
    return {"token": token}

# =========================
# API для компаний
# =========================
@app.post("/optimize/")
def optimize_pipeline(steps: List[StepJSON], token: str = Form(...)):
    if token not in company_tokens:
        raise HTTPException(status_code=403, detail="Invalid token")
    
    pipeline = [PipelineStep(**s.dict()) for s in steps]
    optimizer = MillenniumOptimizerDAG()
    optimized = optimizer.optimize(pipeline)
    return [{"id": s.id, "action": s.action_taken} for s in optimized]