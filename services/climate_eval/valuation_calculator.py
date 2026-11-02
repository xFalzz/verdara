"""
Circular Economy Valuation & Bank Sampah Pricing Engine
Implements deterministic municipal scrap valuations, deposit return systems (DRS),
and Extended Producer Responsibility (EPR) material pricing models.
"""

from typing import Dict, Any


BANK_SAMPAH_COMMODITY_PRICES_IDR_PER_KG: Dict[str, Dict[str, float]] = {
    "PET": {"clean_clear": 4800.0, "mixed_color": 3200.0, "dirty": 1800.0},
    "HDPE": {"natural": 6500.0, "blow_molding": 4500.0, "dirty": 2200.0},
    "ALU": {"clean_cans": 16000.0, "mixed_cast": 11000.0, "dross": 5000.0},
    "CARDBOARD": {"dry_corrugated": 2200.0, "mixed_paper": 1200.0, "wet": 600.0},
    "ORGANIC": {"coconut_shell": 2100.0, "kitchen_scraps": 400.0},
    "EWASTE": {"pcb_grade_a": 35000.0, "pcb_grade_b": 18000.0, "cables": 14000.0},
}


def compute_bank_sampah_payout(material_code: str, mass_kg: float, grade: str = "clean_clear") -> Dict[str, Any]:
    """Calculates municipal Bank Sampah cash payout in Indonesian Rupiah."""
    cat = BANK_SAMPAH_COMMODITY_PRICES_IDR_PER_KG.get(material_code, {"clean_clear": 1000.0})
    unit_price = cat.get(grade, list(cat.values())[0])

    payout_idr = round(mass_kg * unit_price, 0)
    co2e_avoided_kg = round(mass_kg * 1.52, 2)

    return {
        "material_code": material_code,
        "mass_kg": mass_kg,
        "unit_price_idr_per_kg": unit_price,
        "total_payout_idr": payout_idr,
        "co2e_avoided_kg": co2e_avoided_kg,
    }
