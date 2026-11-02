"""
Verdara Climate Physics Microservice HTTP Server
Exposes standardized REST API endpoints for NREL PVWatts solar potential,
urban hydrology stormwater capture, and localized Bank Sampah valuations.
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import os
import sys

from services.climate_eval.solar_physics import compute_solar_potential, SolarAuditInput
from services.climate_eval.hydrology_engine import compute_hydrology_metrics, HydrologyInput
from services.climate_eval.valuation_calculator import compute_bank_sampah_payout


class ClimateAPIHandler(BaseHTTPRequestHandler):
    def _send_json(self, status: int, payload: dict) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:
        if self.path == "/health":
            self._send_json(200, {
                "status": "healthy",
                "service": "verdara-climate-eval",
                "version": "1.0.0",
                "engines": ["NREL PVWatts v8", "Rational Method Hydrology", "Bank Sampah Index"],
            })
        else:
            self._send_json(404, {"error": "Endpoint not found"})

    def do_POST(self) -> None:
        content_len = int(self.headers.get("Content-Length", 0))
        raw_body = self.rfile.read(content_len).decode("utf-8")
        try:
            data = json.loads(raw_body) if raw_body else {}
        except json.JSONDecodeError:
            self._send_json(400, {"error": "Invalid JSON format"})
            return

        if self.path == "/api/v1/solar/audit":
            roof_m2 = float(data.get("roof_footprint_m2", 200.0))
            inp = SolarAuditInput(roof_footprint_m2=roof_m2)
            res = compute_solar_potential(inp)
            self._send_json(200, {
                "solar_capacity_kwp": res.solar_capacity_kwp,
                "panel_count": res.panel_count,
                "annual_output_kwh": res.annual_output_kwh,
                "annual_bill_savings_usd": res.annual_bill_savings_usd,
                "grid_co2e_avoided_kg": res.grid_co2e_avoided_kg,
            })
        elif self.path == "/api/v1/hydrology/runoff":
            roof_m2 = float(data.get("roof_footprint_m2", 200.0))
            inp = HydrologyInput(roof_footprint_m2=roof_m2)
            res = compute_hydrology_metrics(inp)
            self._send_json(200, {
                "annual_rainwater_capture_liters": res.annual_rainwater_capture_liters,
                "recommended_cistern_capacity_liters": res.recommended_cistern_capacity_liters,
                "biopore_infiltration_shafts_count": res.biopore_infiltration_shafts_count,
                "stormwater_peak_attenuation_pct": res.stormwater_peak_attenuation_pct,
            })
        elif self.path == "/api/v1/valuation/payout":
            code = data.get("material_code", "PET")
            mass = float(data.get("mass_kg", 1.0))
            res = compute_bank_sampah_payout(code, mass)
            self._send_json(200, res)
        else:
            self._send_json(404, {"error": "Route not recognized"})


def run_server(port: int = 8000, host: str = "0.0.0.0") -> None:
    server_address = (host, port)
    httpd = HTTPServer(server_address, ClimateAPIHandler)
    print(f"[OK] Verdara Climate Microservice active at http://{host}:{port}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down microservice server.")
        httpd.server_close()


if __name__ == "__main__":
    port = int(os.environ.get("APP_PORT", 8000))
    host = os.environ.get("APP_HOST", "0.0.0.0")
    run_server(port=port, host=host)
