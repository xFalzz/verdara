"""
Synthetic Ground-Truth Dataset Generator for Meta SAM 3.1 & Muse Evaluation
Generates standardized benchmark test cases across circular waste, botanical diagnostics,
and biophilic retrofit domains with deterministic polygon geometries and metadata.
"""

from dataclasses import dataclass, asdict
from typing import List, Dict, Tuple, Any
import json
import math
import os


@dataclass
class BoundingBox:
    x_min: float
    y_min: float
    x_max: float
    y_max: float

    @property
    def area(self) -> float:
        return max(0.0, self.x_max - self.x_min) * max(0.0, self.y_max - self.y_min)


@dataclass
class EvaluationSample:
    sample_id: str
    domain: str  # "waste", "plant", "retrofit"
    specimen_name: str
    material_code: str
    ground_truth_bbox: BoundingBox
    ground_truth_polygon: List[Tuple[float, float]]
    ground_truth_mass_g: float
    ground_truth_co2e_avoided_g: float
    ground_truth_pathology_severity: str = "none"


def create_circular_polygon(center_x: float, center_y: float, radius: float, num_points: int = 12) -> List[Tuple[float, float]]:
    """Generates a regular convex polygon approximating circular contours."""
    points = []
    for i in range(num_points):
        angle = (2.0 * math.pi * i) / num_points
        px = round(center_x + radius * math.cos(angle), 4)
        py = round(center_y + radius * math.sin(angle), 4)
        points.append((px, py))
    return points


def generate_benchmark_dataset() -> List[EvaluationSample]:
    """Generates 12 representative benchmark specimens across all Verdara domains."""
    samples: List[EvaluationSample] = [
        # Domain 1: Waste & Bank Sampah (Clear PET Bottle)
        EvaluationSample(
            sample_id="eval-waste-01-pet",
            domain="waste",
            specimen_name="Clear Polyethylene Terephthalate Beverage Bottle",
            material_code="PET",
            ground_truth_bbox=BoundingBox(0.24, 0.16, 0.52, 0.68),
            ground_truth_polygon=[
                (0.42, 0.16), (0.58, 0.16), (0.66, 0.28), (0.68, 0.76),
                (0.58, 0.84), (0.38, 0.84), (0.28, 0.76), (0.32, 0.28)
            ],
            ground_truth_mass_g=24.5,
            ground_truth_co2e_avoided_g=37.2,
        ),
        # Domain 1: Waste & Bank Sampah (Coconut Shell Biomass)
        EvaluationSample(
            sample_id="eval-waste-02-coconut",
            domain="waste",
            specimen_name="Dried Coconut Shell Lignocellulose Biomass",
            material_code="ORGANIC",
            ground_truth_bbox=BoundingBox(0.18, 0.18, 0.64, 0.62),
            ground_truth_polygon=[
                (0.32, 0.19), (0.55, 0.18), (0.78, 0.32), (0.82, 0.58),
                (0.68, 0.78), (0.42, 0.80), (0.22, 0.68), (0.18, 0.42)
            ],
            ground_truth_mass_g=145.0,
            ground_truth_co2e_avoided_g=266.8,
        ),
        # Domain 1: Waste & Bank Sampah (Corrugated Cardboard Box)
        EvaluationSample(
            sample_id="eval-waste-03-cardboard",
            domain="waste",
            specimen_name="Corrugated Kraft Cellulose Shipping Box",
            material_code="CARDBOARD",
            ground_truth_bbox=BoundingBox(0.15, 0.20, 0.70, 0.60),
            ground_truth_polygon=[
                (0.18, 0.22), (0.82, 0.20), (0.85, 0.78), (0.15, 0.80)
            ],
            ground_truth_mass_g=210.0,
            ground_truth_co2e_avoided_g=197.4,
        ),
        # Domain 1: Waste & Bank Sampah (Aluminum Beverage Can)
        EvaluationSample(
            sample_id="eval-waste-04-alu",
            domain="waste",
            specimen_name="Standard Aluminum Soda Can (Alloy 3004)",
            material_code="ALU",
            ground_truth_bbox=BoundingBox(0.30, 0.25, 0.50, 0.70),
            ground_truth_polygon=[
                (0.35, 0.25), (0.45, 0.25), (0.50, 0.35), (0.50, 0.65),
                (0.45, 0.70), (0.35, 0.70), (0.30, 0.65), (0.30, 0.35)
            ],
            ground_truth_mass_g=14.8,
            ground_truth_co2e_avoided_g=135.2,
        ),
        # Domain 1: Waste & Bank Sampah (Electronic Circuit Module)
        EvaluationSample(
            sample_id="eval-waste-05-ewaste",
            domain="waste",
            specimen_name="FR-4 Printed Circuit Board with Copper Traces",
            material_code="EWASTE",
            ground_truth_bbox=BoundingBox(0.20, 0.22, 0.60, 0.55),
            ground_truth_polygon=[
                (0.22, 0.24), (0.78, 0.22), (0.80, 0.74), (0.20, 0.76)
            ],
            ground_truth_mass_g=85.0,
            ground_truth_co2e_avoided_g=408.0,
        ),
        # Domain 2: Plant Doctor (Leaf with Necrotic Chlorosis)
        EvaluationSample(
            sample_id="eval-plant-01-chlorosis",
            domain="plant",
            specimen_name="Urban Garden Crop Leaf with Fungal Chlorosis Lesions",
            material_code="ORGANIC",
            ground_truth_bbox=BoundingBox(0.15, 0.15, 0.70, 0.70),
            ground_truth_polygon=[
                (0.48, 0.15), (0.78, 0.32), (0.85, 0.65), (0.55, 0.85),
                (0.25, 0.78), (0.15, 0.45), (0.28, 0.22)
            ],
            ground_truth_mass_g=8.2,
            ground_truth_co2e_avoided_g=12.5,
            ground_truth_pathology_severity="moderate",
        ),
        # Domain 2: Plant Doctor (Healthy Thriving Leaf)
        EvaluationSample(
            sample_id="eval-plant-02-healthy",
            domain="plant",
            specimen_name="Healthy Broadleaf Canopy with Optimal Chlorophyll",
            material_code="ORGANIC",
            ground_truth_bbox=BoundingBox(0.12, 0.14, 0.75, 0.72),
            ground_truth_polygon=[
                (0.50, 0.14), (0.82, 0.35), (0.86, 0.68), (0.52, 0.88),
                (0.22, 0.80), (0.12, 0.48), (0.25, 0.20)
            ],
            ground_truth_mass_g=9.5,
            ground_truth_co2e_avoided_g=14.8,
            ground_truth_pathology_severity="low",
        ),
        # Domain 3: Biophilic Retrofit (Concrete Roof Slab)
        EvaluationSample(
            sample_id="eval-retrofit-01-roof",
            domain="retrofit",
            specimen_name="Urban Flat Concrete Rooftop Slab for Solar & Canopy",
            material_code="CARDBOARD",
            ground_truth_bbox=BoundingBox(0.10, 0.10, 0.80, 0.80),
            ground_truth_polygon=[
                (0.12, 0.12), (0.88, 0.12), (0.88, 0.88), (0.12, 0.88)
            ],
            ground_truth_mass_g=12000.0,
            ground_truth_co2e_avoided_g=18400.0,
        ),
    ]
    return samples


def save_dataset_jsonl(output_path: str) -> None:
    """Exports dataset to standardized JSONL for machine learning benchmarks."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    samples = generate_benchmark_dataset()
    with open(output_path, "w", encoding="utf-8") as f:
        for s in samples:
            data = asdict(s)
            f.write(json.dumps(data) + "\n")
    print(f"[OK] Generated {len(samples)} benchmark evaluation samples at {output_path}")


if __name__ == "__main__":
    out = os.path.join(os.path.dirname(__file__), "datasets", "verdara_benchmark_v1.jsonl")
    save_dataset_jsonl(out)
