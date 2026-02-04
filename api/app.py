from fastapi import FastAPI, HTTPException, Form
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from typing import List
from optimizer.pipeline_step import PipelineStep
from optimizer.optimizer_dag import MillenniumOptimizerDAG
from mangum import Mangum
import secrets

app = FastAPI()

# =========================
# Админский код
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
# Корень сайта
# =========================
@app.get("/", response_class=HTMLResponse)
def root():
    return "<h2>Millennium Optimizer API</h2><p>Используйте /admin?code=... или /optimize/</p>"

# =========================
# Админская панель
# =========================
@app.get("/admin", response_class=HTMLResponse)
def admin_panel(code: str):
    if code != ADMIN_CODE:
        raise HTTPException(status_code=403, detail="Неверный админ-код")
    token_list_html = "".join([f"<li>{t}: {company_tokens[t]}</li>" for t in company_tokens])
    html = f"""
    <h1>Админская панель</h1>
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
        raise HTTPException(status_code=403, detail="Неверный админ-код")
    token = secrets.token_hex(16)
    company_tokens[token] = company_name
    return {"token": token}

# =========================
# API для компаний
# =========================
@app.post("/optimize/")
def optimize_pipeline(steps: List[StepJSON], token: str = Form(...)):
    if token not in company_tokens:
        raise HTTPException(status_code=403, detail="Неверный токен")
    pipeline = [PipelineStep(**s.dict()) for s in steps]
    optimizer = MillenniumOptimizerDAG()
    optimized = optimizer.optimize(pipeline)
    return [{"id": s.id, "action": s.action_taken} for s in optimized]

# =========================
# Vercel Serverless handler
# =========================
handler = Mangum(app)