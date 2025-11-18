# Simple Flask API for inspect.ai demo
# IMPORTANT: this demo processes only synthetic / technical signals (no user content).
from flask import Flask, request, jsonify
from model import load_model, score_event
import os

app = Flask(__name__)

# Load or create model
model = load_model()

# Simple API key check (in production use stronger auth)
VALID_API_KEYS = set(os.environ.get("INSPECT_API_KEYS", "DEMO-KEY-123").split(","))

@app.route("/", methods=["GET"])
def home():
    return jsonify({"service": "inspect.ai", "status": "running"})

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"ok": True})

@app.route("/check", methods=["POST"])
def check():
    key = request.headers.get("X-API-Key", "")
    if key not in VALID_API_KEYS:
        return jsonify({"error": "ACCESS_DENIED"}), 403

    # Expect only technical signals in JSON body, no text/content
    payload = request.json or {}
    # Defensive: keep only numeric fields we accept
    features = {
        "rps": float(payload.get("rps", 0)),
        "unique_ips_1h": float(payload.get("unique_ips_1h", 0)),
        "device_change": float(payload.get("device_change", 0)),
        "payload_size": float(payload.get("payload_size", 0)),
        "requests_per_min": float(payload.get("requests_per_min", 0))
    }

    score = score_event(model, features)
    # score: 0.0..1.0 — higher = more suspicious
    action = "ALLOW" if score < 0.6 else "REVIEW"
    if score > 0.85:
        action = "BLOCK"

    return jsonify({
        "risk_score": round(float(score), 4),
        "action": action,
        "explanation": "Model-based anomaly score (zero-knowledge inputs)"
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))