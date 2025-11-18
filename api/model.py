# Minimal ML model: IsolationForest on synthetic features
import os
import joblib
import numpy as np
from sklearn.ensemble import IsolationForest

MODEL_PATH = "inspect_model.pkl"

def train_default_model():
    # Generate synthetic "normal" data for demo/training
    rng = np.random.RandomState(42)
    normal = np.column_stack([
        rng.poisson(lam=5, size=1000),    # rps
        rng.poisson(lam=1, size=1000),    # unique_ips_1h
        rng.binomial(n=1, p=0.02, size=1000), # device_change
        rng.normal(loc=2000, scale=400, size=1000), # payload_size
        rng.poisson(lam=30, size=1000)    # requests_per_min
    ])
    iso = IsolationForest(n_estimators=100, contamination=0.01, random_state=42)
    iso.fit(normal)
    joblib.dump(iso, MODEL_PATH)
    return iso

def load_model():
    if os.path.exists(MODEL_PATH):
        return joblib.load(MODEL_PATH)
    else:
        return train_default_model()

def score_event(model, features: dict):
    x = np.array([[
        features.get("rps", 0),
        features.get("unique_ips_1h", 0),
        features.get("device_change", 0),
        features.get("payload_size", 0),
        features.get("requests_per_min", 0)
    ]])
    # IsolationForest: decision_function -> higher => more normal. We invert and scale to 0..1 risk
    df = model.decision_function(x)[0]
    # Map df to 0..1 risk: lower df => higher risk
    # Normalize with a logistic-like mapping
    score = 1.0 - (1 / (1 + np.exp(- (df * 5))))
    # Clip
    return float(max(0.0, min(1.0, score)))