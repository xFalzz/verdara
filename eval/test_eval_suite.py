"""
Unit Tests for Verdara Evaluation Suite
Verifies accuracy calculations, polygon geometry approximations, and report serialization.
"""

from eval.synthetic_dataset_generator import (
    BoundingBox,
    generate_benchmark_dataset,
    create_circular_polygon,
)
from eval.benchmark_sam_metrics import (
    calculate_bbox_iou,
    polygon_area,
    calculate_boundary_f1,
    run_sam_evaluation,
)
from eval.benchmark_muse_reasoning import evaluate_task, BENCHMARK_TASKS


def test_bounding_box_iou():
    box1 = BoundingBox(0.0, 0.0, 1.0, 1.0)
    box2 = BoundingBox(0.0, 0.0, 1.0, 1.0)
    assert calculate_bbox_iou(box1, box2) == 1.0

    box3 = BoundingBox(2.0, 2.0, 3.0, 3.0)
    assert calculate_bbox_iou(box1, box3) == 0.0


def test_polygon_area_shoelace():
    square = [(0.0, 0.0), (2.0, 0.0), (2.0, 2.0), (0.0, 2.0)]
    assert polygon_area(square) == 4.0


def test_dataset_generator_diversity():
    samples = generate_benchmark_dataset()
    assert len(samples) >= 8

    domains = set(s.domain for s in samples)
    assert "waste" in domains
    assert "plant" in domains
    assert "retrofit" in domains


def test_muse_reasoning_task_execution():
    task = BENCHMARK_TASKS[0]
    result = evaluate_task(task)
    assert result["status"] == "PASSED"
    assert result["error_percentage"] < task["tolerance_pct"]


def test_sam_benchmark_runs():
    summary = run_sam_evaluation()
    assert summary["mean_mask_iou"] > 0.80
    assert summary["mean_boundary_f1"] > 0.80
    assert summary["sample_count"] >= 8
