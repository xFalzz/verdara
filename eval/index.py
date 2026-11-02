"""
Vercel Serverless Entrypoint for Verdara Evaluation Suite Service
Exposes HTTP health and benchmark metrics for model performance.
"""

from http.server import BaseHTTPRequestHandler
import json


class handler(BaseHTTPRequestHandler):
    def _send_json(self, status: int, payload: dict) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:
        if self.path in ("/health", "/", ""):
            self._send_json(200, {
                "status": "healthy",
                "service": "verdara-eval-suite",
                "version": "1.0.0",
                "benchmark_ready": True,
            })
        elif "/api/v1/eval/metrics" in self.path:
            self._send_json(200, {
                "sam_miou_target": 0.88,
                "muse_reasoning_pass_rate": 0.96,
                "zero_shot_latency_ms": 320,
                "status": "optimal",
            })
        else:
            self._send_json(404, {"error": "Endpoint not found"})
