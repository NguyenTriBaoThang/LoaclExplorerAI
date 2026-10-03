from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class RankQuery(BaseModel):
    model_config = ConfigDict(extra="forbid")

    user_intent_text: str = Field(min_length=1, max_length=4000)
    user_intent_tags: str | list[str] = Field(default_factory=list)
    lost_experience_text: str = Field(default="", max_length=2000)
    remaining_time_min: float = Field(gt=0)
    group_size: int = Field(ge=1, le=50)
    budget_remaining_vnd: float = Field(ge=0)
    rain_mm: float | None = Field(default=None, ge=0)
    temperature_c: float | None = None
    pm2_5: float | None = Field(default=None, ge=0)
    european_aqi: float | None = Field(default=None, ge=0)


class RankCandidate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    candidate_experience_id: str = Field(min_length=1, max_length=100)
    candidate_name: str = Field(min_length=1, max_length=180)
    candidate_tags: str | list[str] = Field(default_factory=list)
    duration_min: float = Field(gt=0)
    price_vnd_per_person: float = Field(ge=0)
    is_hands_on: bool
    is_indoor: bool
    eta_min: float = Field(ge=0)
    hard_feasible: bool = True


class RankExperiencesRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    query: RankQuery
    candidates: list[RankCandidate] = Field(min_length=1, max_length=100)


class FloodRiskSample(BaseModel):
    model_config = ConfigDict(extra="forbid")

    edge_id: str = Field(min_length=1, max_length=100)
    decision_time: datetime
    horizon_min: int = Field(ge=1, le=1440)
    region: str = Field(default="unknown", max_length=100)
    road_class: str = Field(default="unknown", max_length=100)
    rain_15m_mm: float | None = Field(default=None, ge=0)
    rain_30m_mm: float | None = Field(default=None, ge=0)
    rain_60m_mm: float | None = Field(default=None, ge=0)
    rain_180m_mm: float | None = Field(default=None, ge=0)
    rain_forecast_15m_mm: float | None = Field(default=None, ge=0)
    rain_forecast_30m_mm: float | None = Field(default=None, ge=0)
    rain_forecast_60m_mm: float | None = Field(default=None, ge=0)
    elevation_m: float | None = None
    slope_pct: float | None = None
    depression_index: float | None = Field(default=None, ge=0, le=1)
    distance_to_canal_m: float | None = Field(default=None, ge=0)
    tide_level_m: float | None = None
    tide_change_30m_m: float | None = None
    drainage_density_km2: float | None = Field(default=None, ge=0)
    road_width_m: float | None = Field(default=None, ge=0)
    nearby_flood_reports_30m: float | None = Field(default=None, ge=0)
    latest_depth_cm: float | None = Field(default=None, ge=0)
    observation_age_min: float | None = Field(default=None, ge=0)
    coverage_ratio: float | None = Field(default=None, ge=0, le=1)

    @field_validator("decision_time")
    @classmethod
    def require_timezone(cls, value: datetime) -> datetime:
        if value.tzinfo is None or value.utcoffset() is None:
            raise ValueError("decision_time must contain a timezone offset")
        return value


class FloodRiskRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    samples: list[FloodRiskSample] = Field(min_length=1, max_length=500)
