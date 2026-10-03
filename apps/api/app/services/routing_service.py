from datetime import datetime, timezone
from functools import lru_cache

from app.adapters.routing.goong import GoongDirectionsProvider, GoongGeocodingProvider
from app.adapters.routing.provider import MockRoutingProvider, RouteEstimate, RoutingConfigurationError, RoutingProvider
from app.core.config import settings


@lru_cache(maxsize=1)
def make_routing_provider() -> RoutingProvider:
    if settings.routing_provider == "mock":
        return MockRoutingProvider()
    if settings.routing_provider == "goong":
        return GoongDirectionsProvider(
            settings.goong_api_key,
            base_url=settings.goong_api_base_url,
            eta_ttl_seconds=settings.goong_eta_ttl_seconds,
            timeout_seconds=settings.goong_timeout_seconds,
        )
    raise RoutingConfigurationError(f"Unsupported ROUTING_PROVIDER '{settings.routing_provider}'.")


@lru_cache(maxsize=1)
def make_geocoding_provider() -> GoongGeocodingProvider:
    if settings.geocoding_provider != "goong":
        raise RoutingConfigurationError(f"Unsupported GEOCODING_PROVIDER '{settings.geocoding_provider}'.")
    return GoongGeocodingProvider(
        settings.goong_api_key,
        base_url=settings.goong_api_base_url,
        cache_ttl_seconds=settings.geocode_cache_ttl_seconds,
        timeout_seconds=settings.goong_timeout_seconds,
    )


class RoutingService:
    def __init__(self, provider: RoutingProvider | None = None):
        self.provider = provider or make_routing_provider()

    def get_route(self, origin: tuple[float, float], destination: tuple[float, float], mode: str) -> RouteEstimate:
        return self.provider.get_route(origin, destination, mode)

    @staticmethod
    def eta_metadata(estimate: RouteEstimate, now: datetime | None = None) -> dict:
        now = now or datetime.now(timezone.utc)
        calculated_at = estimate.calculated_at or now
        if calculated_at.tzinfo is None:
            calculated_at = calculated_at.replace(tzinfo=timezone.utc)
        valid_until = estimate.valid_until
        if valid_until and valid_until.tzinfo is None:
            valid_until = valid_until.replace(tzinfo=timezone.utc)
        return {
            "provider": estimate.provider,
            "is_realtime": estimate.is_realtime,
            "eta_source": estimate.eta_source,
            "eta_source_uri": estimate.source_uri,
            "eta_calculated_at": calculated_at,
            "eta_age_seconds": max(0, int((now - calculated_at).total_seconds())),
            "eta_valid_until": valid_until,
            "geometry": estimate.geometry,
        }
