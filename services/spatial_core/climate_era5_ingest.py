"""
Verdara Spatial Core - ECMWF ERA5 Reanalysis & Solar Radiance Decoder
Provides algorithmic solar geometry, atmospheric attenuation,
and microclimate thermodynamics for 3D urban radar models.
"""

from dataclasses import dataclass
from typing import Dict, Any, List
import math


@dataclass
class SolarPosition:
    zenith_deg: float
    elevation_deg: float
    azimuth_deg: float
    air_mass: float


@dataclass
class ClimateHourObservation:
    timestamp_utc: str
    ambient_temp_c: float
    relative_humidity_pct: float
    wind_speed_ms: float
    global_horizontal_irradiance_wm2: float
    direct_normal_irradiance_wm2: float
    diffuse_horizontal_irradiance_wm2: float
    dew_point_c: float
    wet_bulb_temp_c: float


class ClimateERA5IngestionEngine:
    """
    Ingests and synthesizes high-resolution ERA5 / NASA POWER surface meteorological
    data for driving Verdara 3D urban microclimate twins.
    """

    SOLAR_CONSTANT_WM2 = 1361.0

    def __init__(self, latitude_deg: float = 37.48, longitude_deg: float = -122.15):
        self.latitude = latitude_deg
        self.longitude = longitude_deg

    def calculate_solar_position(self, day_of_year: int, hour_utc: float) -> SolarPosition:
        """
        Computes solar declination, hour angle, solar elevation, and azimuth
        using the Spencer and Michalsky solar geometry equations.
        """
        # Fractional year in radians
        gamma = (2.0 * math.pi / 365.0) * (day_of_year - 1 + (hour_utc - 12.0) / 24.0)

        # Equation of time in minutes
        eqtime = 229.18 * (
            0.000075
            + 0.001868 * math.cos(gamma)
            - 0.032077 * math.sin(gamma)
            - 0.014615 * math.cos(2.0 * gamma)
            - 0.040849 * math.sin(2.0 * gamma)
        )

        # Solar declination angle in radians
        decl = (
            0.006918
            - 0.399912 * math.cos(gamma)
            + 0.070257 * math.sin(gamma)
            - 0.006758 * math.cos(2.0 * gamma)
            + 0.000907 * math.sin(2.0 * gamma)
            - 0.002697 * math.cos(3.0 * gamma)
            + 0.00148 * math.sin(3.0 * gamma)
        )

        # True solar time offset in minutes
        time_offset = eqtime + 4.0 * self.longitude
        true_solar_time = (hour_utc * 60.0 + time_offset) % 1440.0

        # Solar hour angle in degrees
        hour_angle_deg = (true_solar_time / 4.0) - 180.0
        if hour_angle_deg < -180.0:
            hour_angle_deg += 360.0
        hour_angle_rad = math.radians(hour_angle_deg)

        lat_rad = math.radians(self.latitude)

        # Zenith cosine
        cos_zenith = math.sin(lat_rad) * math.sin(decl) + math.cos(lat_rad) * math.cos(decl) * math.cos(hour_angle_rad)
        cos_zenith = max(-1.0, min(1.0, cos_zenith))
        zenith_rad = math.acos(cos_zenith)
        zenith_deg = math.degrees(zenith_rad)

        elevation_deg = 90.0 - zenith_deg

        # Azimuth calculation
        if elevation_deg > 0.0:
            cos_azimuth = (math.sin(decl) - math.sin(lat_rad) * math.cos(zenith_rad)) / (
                math.cos(lat_rad) * math.sin(zenith_rad) + 1e-6
            )
            cos_azimuth = max(-1.0, min(1.0, cos_azimuth))
            azimuth_rad = math.acos(cos_azimuth)
            azimuth_deg = math.degrees(azimuth_rad)
            if hour_angle_deg > 0.0:
                azimuth_deg = 360.0 - azimuth_deg
        else:
            azimuth_deg = 180.0

        # Kasten-Young air mass formulation
        if elevation_deg > 0.5:
            air_mass = 1.0 / (
                math.sin(math.radians(max(0.1, elevation_deg)))
                + 0.50572 * ((max(0.1, elevation_deg) + 6.07995) ** -1.6364)
            )
        else:
            air_mass = 38.0

        return SolarPosition(
            zenith_deg=round(zenith_deg, 3),
            elevation_deg=round(elevation_deg, 3),
            azimuth_deg=round(azimuth_deg, 3),
            air_mass=round(air_mass, 3),
        )

    def compute_dew_point(self, temp_c: float, rh_pct: float) -> float:
        """
        Magnus-Tetens approximation for dew point calculation.
        """
        a = 17.27
        b = 237.7
        rh_clamped = max(1.0, min(100.0, rh_pct))
        alpha = ((a * temp_c) / (b + temp_c)) + math.log(rh_clamped / 100.0)
        td = (b * alpha) / (a - alpha)
        return round(td, 2)

    def compute_stull_wet_bulb(self, temp_c: float, rh_pct: float) -> float:
        """
        Stull (2011) empirical wet-bulb equation valid for RH 5% to 99% and T -20C to 50C.
        """
        t = temp_c
        rh = max(5.0, min(99.0, rh_pct))
        tw = (
            t * math.atan(0.151977 * math.sqrt(rh + 8.313659))
            + math.atan(t + rh)
            - math.atan(rh - 1.676331)
            + 0.00391838 * (rh ** 1.5) * math.atan(0.023101 * rh)
            - 4.686035
        )
        return round(tw, 2)

    def synthesize_hourly_observation(
        self,
        timestamp_utc: str,
        day_of_year: int,
        hour_utc: float,
        temp_c: float,
        rh_pct: float,
        wind_speed_ms: float,
        cloud_cover_fraction: float = 0.2,
    ) -> ClimateHourObservation:
        """
        Derives DNI, GHI, and DHI using clear-sky Ineichen-Perez model adjusted for cloudiness.
        """
        sol_pos = self.calculate_solar_position(day_of_year, hour_utc)
        dew_point = self.compute_dew_point(temp_c, rh_pct)
        wet_bulb = self.compute_stull_wet_bulb(temp_c, rh_pct)

        if sol_pos.elevation_deg <= 0.0:
            return ClimateHourObservation(
                timestamp_utc=timestamp_utc,
                ambient_temp_c=temp_c,
                relative_humidity_pct=rh_pct,
                wind_speed_ms=wind_speed_ms,
                global_horizontal_irradiance_wm2=0.0,
                direct_normal_irradiance_wm2=0.0,
                diffuse_horizontal_irradiance_wm2=0.0,
                dew_point_c=dew_point,
                wet_bulb_temp_c=wet_bulb,
            )

        # Clear-sky attenuation
        sin_elev = math.sin(math.radians(sol_pos.elevation_deg))
        clearsky_dni = self.SOLAR_CONSTANT_WM2 * (0.7 ** (sol_pos.air_mass ** 0.678))
        effective_dni = clearsky_dni * (1.0 - (cloud_cover_fraction * 0.75))
        diffuse_fraction = 0.15 + (cloud_cover_fraction * 0.6)
        effective_dhi = self.SOLAR_CONSTANT_WM2 * sin_elev * diffuse_fraction * 0.35
        effective_ghi = effective_dni * sin_elev + effective_dhi

        return ClimateHourObservation(
            timestamp_utc=timestamp_utc,
            ambient_temp_c=temp_c,
            relative_humidity_pct=rh_pct,
            wind_speed_ms=wind_speed_ms,
            global_horizontal_irradiance_wm2=round(max(0.0, effective_ghi), 1),
            direct_normal_irradiance_wm2=round(max(0.0, effective_dni), 1),
            diffuse_horizontal_irradiance_wm2=round(max(0.0, effective_dhi), 1),
            dew_point_c=dew_point,
            wet_bulb_temp_c=wet_bulb,
        )
