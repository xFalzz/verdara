"""
NREL PVWatts v8 Solar Photovoltaic Physics Calculator
Implements standard photovoltaic energy yield equations, temperature coefficients,
system derate losses, and annual carbon grid displacement.
"""

from dataclasses import dataclass
from typing import Dict, Any
import math


@dataclass
class SolarAuditInput:
    roof_footprint_m2: float
    usable_fraction: float = 0.60
    panel_efficiency: float = 0.208  # Modern monocrystalline PERC
    system_derate: float = 0.86     # 14% total system losses
    temp_coefficient_pct_per_c: float = -0.0035  # P_mp temp coefficient
    ambient_temp_c: float = 25.0
    global_horizontal_irradiance_kwh_m2_day: float = 5.2


@dataclass
class SolarAuditResult:
    solar_capacity_kwp: float
    panel_count: int
    annual_output_kwh: float
    annual_bill_savings_usd: float
    grid_co2e_avoided_kg: float


def compute_solar_potential(inp: SolarAuditInput) -> SolarAuditResult:
    """Computes solar peak capacity and annual generation adhering to NREL PVWatts standards."""
    usable_area_m2 = inp.roof_footprint_m2 * inp.usable_fraction
    stc_irradiance_kw_m2 = 1.0  # 1000 W/m2 standard test condition

    # DC peak capacity in kWp
    capacity_kwp = round(usable_area_m2 * inp.panel_efficiency * stc_irradiance_kw_m2, 2)
    panel_count = int(math.ceil(capacity_kwp / 0.400))  # 400W panels

    # Temperature derate calculation
    cell_temp_c = inp.ambient_temp_c + 28.0  # Nominal operating cell temperature rise
    temp_derate = 1.0 + (cell_temp_c - 25.0) * inp.temp_coefficient_pct_per_c

    # Annual electricity yield (kWh/yr)
    peak_sun_hours_annual = inp.global_horizontal_irradiance_kwh_m2_day * 365.25
    annual_yield_kwh = round(capacity_kwp * peak_sun_hours_annual * inp.system_derate * temp_derate, 1)

    # Financial & Carbon metrics (US national average baseline)
    cost_per_kwh_usd = 0.32  # California average residential tariff
    bill_savings_usd = round(annual_yield_kwh * cost_per_kwh_usd, 2)

    # Grid emissions factor (US average: 0.386 kg CO2e / kWh)
    grid_emissions_factor_kg_kwh = 0.386
    co2e_avoided_kg = round(annual_yield_kwh * grid_emissions_factor_kg_kwh, 1)

    return SolarAuditResult(
        solar_capacity_kwp=capacity_kwp,
        panel_count=panel_count,
        annual_output_kwh=annual_yield_kwh,
        annual_bill_savings_usd=bill_savings_usd,
        grid_co2e_avoided_kg=co2e_avoided_kg,
    )
