"""
Unit test suite for Verdara Spatial Core, Climate Physics, and Material Ontology.
Executes hermetic validation of Voronoi meshes, ERA5 solar calculations,
biophilic cooling dynamics, and circular material valuations.
"""

import unittest
import math
from services.spatial_core.voronoi_mesh import SpatialVoronoiMesh, Point2D
from services.spatial_core.climate_era5_ingest import ClimateERA5IngestionEngine
from services.climate_eval.biophilic_cooling_model import BiophilicCoolingModel
from eval.material_ontology import MaterialOntologyEngine


class TestSpatialAndClimateSuite(unittest.TestCase):

    def test_voronoi_shoelace_area(self):
        mesh = SpatialVoronoiMesh(width=100.0, height=100.0)
        # Unit square: 10 x 10 = 100 area
        square = [Point2D(0, 0), Point2D(10, 0), Point2D(10, 10), Point2D(0, 10)]
        area = mesh.compute_polygon_area(square)
        self.assertEqual(area, 100.0)

    def test_voronoi_setback_clipping(self):
        mesh = SpatialVoronoiMesh(width=200.0, height=200.0)
        square = [Point2D(0, 0), Point2D(20, 0), Point2D(20, 20), Point2D(0, 20)]
        setback = mesh.compute_setback_polygon(square, setback_distance=2.0)
        self.assertEqual(len(setback), 4)
        inner_area = mesh.compute_polygon_area(setback)
        self.assertLess(inner_area, 400.0)
        self.assertGreater(inner_area, 0.0)

    def test_era5_solar_position_and_dewpoint(self):
        engine = ClimateERA5IngestionEngine(latitude_deg=37.48, longitude_deg=-122.15)
        # Summer solstice noon
        sol = engine.calculate_solar_position(day_of_year=172, hour_utc=20.0)
        self.assertGreater(sol.elevation_deg, 60.0)
        self.assertGreater(sol.air_mass, 0.9)

        # Dewpoint Magnus formula test
        dp = engine.compute_dew_point(temp_c=25.0, rh_pct=50.0)
        self.assertAlmostEqual(dp, 13.9, delta=0.5)

        # Observation synthesis
        obs = engine.synthesize_hourly_observation(
            timestamp_utc="2026-06-21T20:00:00Z",
            day_of_year=172,
            hour_utc=20.0,
            temp_c=26.0,
            rh_pct=45.0,
            wind_speed_ms=3.2,
        )
        self.assertGreater(obs.global_horizontal_irradiance_wm2, 500.0)
        self.assertGreater(obs.direct_normal_irradiance_wm2, 600.0)

    def test_biophilic_fao56_cooling(self):
        model = BiophilicCoolingModel(elevation_m=20.0)
        result = model.evaluate_roof_retrofit(
            roof_area_m2=250.0,
            vegetative_fraction=0.6,
            temp_ambient_c=31.0,
            rh_pct=45.0,
            net_radiation_mj_m2_day=18.0,
        )
        self.assertGreater(result.fao56_et0_mm_day, 2.0)
        self.assertGreater(result.daily_latent_cooling_kwh, 100.0)
        self.assertGreater(result.microclimate_delta_temp_c, 1.0)
        self.assertGreater(result.annual_cooling_energy_avoided_kwh, 500.0)

    def test_material_ontology_profiles(self):
        pet = MaterialOntologyEngine.get_profile("PET")
        self.assertIsNotNone(pet)
        self.assertEqual(pet.resin_identification_code, 1)
        self.assertTrue(pet.carbon_abatement_ratio > 1.0)

        alu_yield = MaterialOntologyEngine.calculate_audit_yield("ALUMINUM", mass_grams=500.0)
        self.assertTrue(alu_yield["valid"])
        self.assertEqual(alu_yield["mass_kg"], 0.5)
        self.assertAlmostEqual(alu_yield["usd_value"], 0.725, delta=0.01)
        self.assertAlmostEqual(alu_yield["idr_value"], 11000.0, delta=100.0)


if __name__ == "__main__":
    unittest.main()
