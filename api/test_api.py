# Simple test script to run in CI or locally
import requests
import os
import time

URL = os.environ.get("INSPECT_URL", "http://localhost:5000/check")
KEY = os.environ.get("INSPECT_KEY", "DEMO-KEY-123")

payloads = [
    {"rps": 5, "unique_ips_1h": 1, "device_change": 0, "payload_size": 1800, "requests_per_min": 20},
    {"rps": 500, "unique_ips_1h": 50, "device_change": 1, "payload_size": 4000, "requests_per_min": 600},
]

for p in payloads:
    try:
        r = requests.post(URL, json=p, headers={"X-API-Key": KEY}, timeout=10)
        print("Payload:", p, "=>", r.status_code, r.text)
    except Exception as e:
        print("Payload:", p, "=> Error:", e)
    time.sleep(1)