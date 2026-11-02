"""
Verdara Circular Economy Material Physics & Ontology Benchmark
Encapsulates physical density, embodied carbon, thermal degradation,
and market value matrices across municipal recyclable commodities.
"""

from dataclasses import dataclass
from typing import Dict, Any, List, Optional


@dataclass
class MaterialPhysicsProfile:
    code: str
    name: str
    resin_identification_code: Optional[int]
    density_g_cm3: float
    melting_point_c: float
    virgin_embodied_carbon_kg_co2e_per_kg: float
    recycled_embodied_carbon_kg_co2e_per_kg: float
    circular_recovery_yield_pct: float
    market_rate_usd_per_kg: float
    market_rate_idr_per_kg: float
    is_food_grade_recyclable: bool

    @property
    def carbon_abatement_ratio(self) -> float:
        """Ratio of carbon saved per kg recycled compared to virgin production."""
        diff = self.virgin_embodied_carbon_kg_co2e_per_kg - self.recycled_embodied_carbon_kg_co2e_per_kg
        return max(0.0, diff)


CIRCULAR_MATERIAL_REGISTRY: Dict[str, MaterialPhysicsProfile] = {
    "PET": MaterialPhysicsProfile(
        code="PET",
        name="Polyethylene Terephthalate",
        resin_identification_code=1,
        density_g_cm3=1.38,
        melting_point_c=255.0,
        virgin_embodied_carbon_kg_co2e_per_kg=2.15,
        recycled_embodied_carbon_kg_co2e_per_kg=0.45,
        circular_recovery_yield_pct=88.5,
        market_rate_usd_per_kg=0.42,
        market_rate_idr_per_kg=6500.0,
        is_food_grade_recyclable=True,
    ),
    "HDPE": MaterialPhysicsProfile(
        code="HDPE",
        name="High-Density Polyethylene",
        resin_identification_code=2,
        density_g_cm3=0.95,
        melting_point_c=130.0,
        virgin_embodied_carbon_kg_co2e_per_kg=1.85,
        recycled_embodied_carbon_kg_co2e_per_kg=0.38,
        circular_recovery_yield_pct=91.0,
        market_rate_usd_per_kg=0.38,
        market_rate_idr_per_kg=5800.0,
        is_food_grade_recyclable=True,
    ),
    "ALUMINUM": MaterialPhysicsProfile(
        code="ALUMINUM",
        name="Aluminum UBC Can",
        resin_identification_code=None,
        density_g_cm3=2.70,
        melting_point_c=660.0,
        virgin_embodied_carbon_kg_co2e_per_kg=11.50,
        recycled_embodied_carbon_kg_co2e_per_kg=0.60,
        circular_recovery_yield_pct=96.0,
        market_rate_usd_per_kg=1.45,
        market_rate_idr_per_kg=22000.0,
        is_food_grade_recyclable=True,
    ),
    "CARDBOARD": MaterialPhysicsProfile(
        code="CARDBOARD",
        name="Corrugated Cardboard OCC",
        resin_identification_code=None,
        density_g_cm3=0.68,
        melting_point_c=230.0,
        virgin_embodied_carbon_kg_co2e_per_kg=0.95,
        recycled_embodied_carbon_kg_co2e_per_kg=0.22,
        circular_recovery_yield_pct=82.0,
        market_rate_usd_per_kg=0.15,
        market_rate_idr_per_kg=2300.0,
        is_food_grade_recyclable=False,
    ),
    "GLASS": MaterialPhysicsProfile(
        code="GLASS",
        name="Container Glass Cullet",
        resin_identification_code=None,
        density_g_cm3=2.50,
        melting_point_c=1400.0,
        virgin_embodied_carbon_kg_co2e_per_kg=0.85,
        recycled_embodied_carbon_kg_co2e_per_kg=0.55,
        circular_recovery_yield_pct=98.0,
        market_rate_usd_per_kg=0.08,
        market_rate_idr_per_kg=1200.0,
        is_food_grade_recyclable=True,
    ),
    "ORGANIC": MaterialPhysicsProfile(
        code="ORGANIC",
        name="Organic Compostable Fraction",
        resin_identification_code=None,
        density_g_cm3=0.55,
        melting_point_c=80.0,
        virgin_embodied_carbon_kg_co2e_per_kg=0.45,
        recycled_embodied_carbon_kg_co2e_per_kg=0.05,
        circular_recovery_yield_pct=75.0,
        market_rate_usd_per_kg=0.05,
        market_rate_idr_per_kg=800.0,
        is_food_grade_recyclable=False,
    ),
    "BATTERY": MaterialPhysicsProfile(
        code="BATTERY",
        name="Lithium-Ion / LiFePO4 E-Waste",
        resin_identification_code=None,
        density_g_cm3=2.90,
        melting_point_c=180.0,
        virgin_embodied_carbon_kg_co2e_per_kg=14.20,
        recycled_embodied_carbon_kg_co2e_per_kg=3.10,
        circular_recovery_yield_pct=85.0,
        market_rate_usd_per_kg=3.50,
        market_rate_idr_per_kg=52000.0,
        is_food_grade_recyclable=False,
    ),
}


class MaterialOntologyEngine:
    """
    Evaluates physical realism, carbon displacement accuracy, and recovery yields
    for detected circular assets in the Verdara pipeline.
    """

    @classmethod
    def get_profile(cls, material_code: str) -> Optional[MaterialPhysicsProfile]:
        norm_key = material_code.strip().upper()
        return CIRCULAR_MATERIAL_REGISTRY.get(norm_key)

    @classmethod
    def calculate_audit_yield(cls, material_code: str, mass_grams: float) -> Dict[str, Any]:
        """Computes net financial and carbon yields from detected physical mass."""
        profile = cls.get_profile(material_code)
        if not profile:
            return {
                "error": f"Unknown material {material_code}",
                "valid": False,
            }

        mass_kg = max(0.0, mass_grams / 1000.0)
        net_recovered_kg = mass_kg * (profile.circular_recovery_yield_pct / 100.0)
        co2_avoided_kg = mass_kg * profile.carbon_abatement_ratio
        usd_value = mass_kg * profile.market_rate_usd_per_kg
        idr_value = mass_kg * profile.market_rate_idr_per_kg

        return {
            "valid": True,
            "material": profile.name,
            "code": profile.code,
            "mass_kg": round(mass_kg, 4),
            "net_recovered_kg": round(net_recovered_kg, 4),
            "co2_avoided_kg": round(co2_avoided_kg, 4),
            "usd_value": round(usd_value, 4),
            "idr_value": round(idr_value, 2),
            "food_grade_safe": profile.is_food_grade_recyclable,
        }
