from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


from pathlib import Path
_REPO_ROOT_ENV = Path(__file__).resolve().parents[3] / ".env"


class Settings(BaseSettings):
    app_env: str = "development"
    database_url: str = "sqlite:///./local_explorer.sqlite3"
    redis_url: str = "redis://localhost:6379/0"
    cors_origins: str = "http://localhost:5173"
    routing_provider: str = "goong"
    geocoding_provider: str = "goong"
    goong_api_key: str | None = None
    goong_api_base_url: str = "https://rsapi.goong.io"
    goong_timeout_seconds: float = 8.0
    goong_eta_ttl_seconds: int = 300
    geocode_cache_ttl_seconds: int = 86400
    openai_api_key: str | None = None
    openai_base_url: str = "https://api.openai.com/v1"
    openai_model: str = "gpt-4o-mini"
    openai_timeout_seconds: float = 30.0
    admin_api_key: str | None = None
    app_signing_secret: str | None = None
    auth_secret: str | None = None
    session_ttl_seconds: int = 7200
    google_client_id: str | None = None
    google_client_secret: str | None = None
    google_redirect_uri: str = "http://localhost:8000/api/auth/google/callback"
    web_app_url: str = "http://localhost:5173"
    demo_admin_email: str = "localexplorerai@admin.com"
    demo_admin_password: str | None = None
    demo_traveler_email: str = "baothang@gmail.com"
    demo_traveler_password: str | None = None
    e5_model_path: str | None = None
    ranker_model_dir: str | None = None
    flood_model_dir: str | None = None
    allow_unverified_ranker: bool = False

    model_config = SettingsConfigDict(env_file=(str(_REPO_ROOT_ENV), ".env"), extra="ignore")

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
