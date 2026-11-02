"""
Verdara Climate Physics - Biophilic Evapotranspiration & Urban Heat Island Model
Calculates FAO-56 Penman-Monteith reference evapotranspiration (ET0),
vegetative latent heat flux, and urban heat island (UHI) cooling offsets.
"""

from dataclasses import dataclass
from typing import Dict, Any
import math


@dataclass
class BiophilicCoolingResult:
    fao56_et0_mm_day: float
    daily_latent_cooling_kwh: float
    microclimate_delta_temp_c: float
    annual_cooling_energy_avoided_kwh: float
    avoided_hvac_carbon_kg_co2e: float
    vegetative_area_m2: float


class BiophilicCoolingModel:
    """
    Simulates thermodynamics of vegetated green roofs, sedum groundcovers,
    and urban canopy plantings to assess biophilic cooling dividends.
    """

    LATENT_HEAT_VAPORIZATION_MJ_KG = 2.45
    PSYCHROMETRIC_CONSTANT_KPA_C = 0.067
    SPECIFIC_HEAT_AIR_MJ_KG_C = 0.001013
    HVAC_COP_ESTIMATE = 3.2
    GRID_EMISSION_FACTOR_KG_KWH = 0.385

    def __init__(self, elevation_m: float = 18.0):
        self.elevation = elevation_m
        # Atmospheric pressure estimation based on elevation
        self.atm_pressure_kpa = 101.3 * (((293.0 - 0.0065 * self.elevation) / 293.0) ** 5.26)

    def calculate_saturation_vapor_pressure(self, temp_c: float) -> float:
        """Computes saturation vapor pressure (es) in kPa using Tetens formula."""
        return 0.6108 * math.exp((17.27 * temp_c) / (temp_c + 237.3))

    def calculate_vapor_pressure_slope(self, temp_c: float) -> float:
        """Slope of saturation vapor pressure curve (Delta) in kPa / deg C."""
        es = self.calculate_saturation_vapor_pressure(temp_c)
        return (4098.0 * es) / ((temp_c + 237.3) ** 2)

    def compute_fao56_et0(
        self,
        temp_c: float,
        rh_pct: float,
        net_radiation_mj_m2_day: float,
        wind_speed_ms: float = 2.0,
    ) -> float:
        """
        FAO-56 Penman-Monteith equation for standard grass reference evapotranspiration (ET0).
        """
        delta = self.calculate_vapor_pressure_slope(temp_c)
        gamma = self.PSYCHROMETRIC_CONSTANT_KPA_C * (self.atm_pressure_kpa / 101.3)
        es = self.calculate_saturation_vapor_pressure(temp_c)
        ea = es * (max(5.0, min(100.0, rh_pct)) / 100.0)
        vapor_deficit = max(0.0, es - ea)

        rn = max(0.0, net_radiation_mj_m2_day)
        g_flux = 0.0  # Daily soil heat flux approximation is negligible

        numerator = (0.408 * delta * (rn - g_flux)) + (gamma * (900.0 / (temp_c + 273.0)) * wind_speed_ms * vapor_deficit)
        denominator = delta + (gamma * (1.0 + 0.34 * wind_speed_ms))

        et0 = numerator / denominator
        return max(0.1, et0)

    def evaluate_roof_retrofit(
        self,
        roof_area_m2: float,
        vegetative_fraction: float,
        temp_ambient_c: float = 29.5,
        rh_pct: float = 48.0,
        net_radiation_mj_m2_day: float = 16.5,
        leaf_area_index: float = 2.4,
    ) -> BiophilicCoolingResult:
        """
        Calculates thermal cooling attenuation, latent heat energy transfer,
        and avoided HVAC chiller electricity requirements.
        """
        clamped_fraction = max(0.0, min(1.0, vegetative_fraction))
        veg_area = roof_area_m2 * clamped_fraction

        if veg_area <= 0.0:
            return BiophilicCoolingResult(
                fao56_et0_mm_day=0.0,
                daily_latent_cooling_kwh=0.0,
                microclimate_delta_temp_c=0.0,
                annual_cooling_energy_avoided_kwh=0.0,
                avoided_hvac_carbon_kg_co2e=0.0,
                vegetative_area_m2=0.0,
            )

        et0_mm = self.compute_fao56_et0(temp_ambient_c, rh_pct, net_radiation_mj_m2_day)
        # Crop coefficient for urban extensive sedum/biophilic canopy
        kc = min(1.2, 0.45 + (leaf_area_index * 0.22))
        actual_et_mm = et0_mm * kc

        # Volume of water transpired in liters (1 mm on 1 m2 = 1 liter = 1 kg water)
        daily_water_kg = veg_area * actual_et_mm

        # Latent heat absorption (1 MJ = 0.277778 kWh)
        latent_heat_mj = daily_water_kg * self.LATENT_HEAT_VAPORIZATION_MJ_KG
        daily_latent_kwh = latent_heat_mj * 0.277778

        # Microclimate temperature attenuation (empirical UHI reduction formula)
        delta_temp_c = min(3.8, 1.25 * math.log10(veg_area + 10.0) * (clamped_fraction ** 0.5))

        # Annual avoided HVAC electrical consumption (assuming 140 cooling degree days equivalent)
        annual_cooling_avoided_kwh = (daily_latent_kwh * 0.32 * 140.0) / self.HVAC_COP_ESTIMATE
        avoided_carbon = annual_cooling_avoided_kwh * self.GRID_EMISSION_FACTOR_KG_KWH

        return BiophilicCoolingResult(
            fao56_et0_mm_day=round(actual_et_mm, 2),
            daily_latent_cooling_kwh=round(daily_latent_kwh, 1),
            microclimate_delta_temp_c=round(delta_temp_c, 2),
            annual_cooling_energy_avoided_kwh=round(annual_cooling_avoided_kwh, 1),
            avoided_hvac_carbon_kg_co2e=round(avoided_carbon, 1),
            vegetative_area_m2=round(veg_area, 1),
        )
