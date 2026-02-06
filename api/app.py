from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List

from optimizer.pipeline_step import PipelineStep
from optimizer.optimizer_dag import MillenniumOptimizerDAG

ADMIN_CODE = "673ziyada"

app = FastAPI(title="NodIdeas Optimization API")


# ======== MODELS ========

class LoginRequest(BaseModel):
    code: str


class StepIn(BaseModel):
    step_id: int
    exec_time: float
    cost: float
    dependencies: List[int] = []


class OptimizationRequest(BaseModel):
    access_token: str
    steps: List[StepIn]


# ======== STORAGE (in-memory, prod-ready для Railway) ========

ACCESS_TOKENS = set()


# ======== ROUTES ========

@app.get("/")
def root():
    return {"status": "NodIdeas API is running"}


@app.post("/admin/login")
def admin_login(data: LoginRequest):
    if data.code != ADMIN_CODE:
        raise HTTPException(status_code=403, detail="Invalid admin code")
    return {"status": "admin authenticated"}


@app.post("/admin/generate-token")
def generate_token(code: LoginRequest):
    if code.code != ADMIN_CODE:
        raise HTTPException(status_code=403, detail="Invalid admin code")

    token = f"TOKEN-{len(ACCESS_TOKENS)+1}"
    ACCESS_TOKENS.add(token)
    return {"access_token": token}


@app.post("/optimize")
def optimize_pipeline(data: OptimizationRequest):
    if data.access_token not in ACCESS_TOKENS:
        raise HTTPException(status_code=403, detail="Invalid access token")

    pipeline = [
        PipelineStep(
            step_id=s.step_id,
            exec_time=s.exec_time,
            cost=s.cost,
            dependencies=s.dependencies
        )
        for s in data.steps
    ]

    optimizer = MillenniumOptimizerDAG()
    optimized = optimizer.optimize(pipeline)

    before_steps = len(pipeline)
    after_steps = len(optimized)

    before_cost = sum(s.exec_time * s.cost for s in pipeline)
    after_cost = sum(s.exec_time * s.cost for s in optimized)

    return {
        "steps_before": before_steps,
        "steps_after": after_steps,
        "step_reduction_percent": round(
            (before_steps - after_steps) / before_steps * 100, 2
        ),
        "cost_before": round(before_cost, 2),
        "cost_after": round(after_cost, 2),
        "cost_saving_percent": round(
            (before_cost - after_cost) / before_cost * 100, 2
        ),
    }