from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Query

from app.adapters.routing.provider import RoutingConfigurationError, RoutingProviderError
from app.core.config import settings
from app.schemas.geocoding import GeocodeResponse
from app.services.routing_service import make_geocoding_provider

router = APIRouter(prefix="/api", tags=["routing and geocoding"])


@router.get("/routing/capabilities")
def routing_capabilities():
    modes = {
        "mock": ["walking", "bicycling", "driving", "motorcycle", "car", "transit"],
        "goong": ["motorcycle", "walking", "car"],
    }.get(settings.routing_provider, [])
    return {
        "provider": settings.routing_provider,
        "configured": settings.routing_provider == "mock" or (settings.routing_provider == "goong" and bool(settings.goong_api_key)),
        "supported_modes": modes,
        "eta_is_realtime": False,
        "geocoding_provider": settings.geocoding_provider,
        "geocoding_configured": settings.geocoding_provider == "goong" and bool(settings.goong_api_key),
    }


@router.get("/geocoding/forward", response_model=GeocodeResponse)
def forward_geocode(address: str = Query(min_length=3, max_length=300)):
    try:
        result = make_geocoding_provider().forward(address)
    except RoutingConfigurationError as error:
        raise HTTPException(status_code=503, detail={"code": "GEOCODING_NOT_CONFIGURED", "message": str(error)}) from error
    except RoutingProviderError as error:
        raise HTTPException(status_code=502, detail={"code": "GEOCODING_PROVIDER_ERROR", "message": str(error)}) from error

    now = datetime.now(timezone.utc)
    resolved_at = result.resolved_at
    if resolved_at.tzinfo is None:
        resolved_at = resolved_at.replace(tzinfo=timezone.utc)
    return {
        "query": address,
        "provider": result.provider,
        "source_uri": result.source_uri,
        "resolved_at": resolved_at,
        "valid_until": result.valid_until,
        "age_seconds": max(0, int((now - resolved_at).total_seconds())),
        "results": [candidate.__dict__ for candidate in result.results],
    }
