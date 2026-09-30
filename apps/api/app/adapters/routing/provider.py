from dataclasses import dataclass
from math import asin, cos, radians, sin, sqrt
from typing import Protocol


@dataclass(frozen=True)
class RouteEstimate:
    distance_m: int
    duration_min: int
    provider: str = "mock"
    is_realtime: bool = False


class RoutingProvider(Protocol):
    def get_route(self, origin: tuple[float, float], destination: tuple[float, float], mode: str) -> RouteEstimate: ...


class MockRoutingProvider:
    """Straight-line distance with an assumed speed; this is not a real route or traffic feed."""

    speeds_kmh = {"walking": 4.5, "bicycling": 14.0, "driving": 20.0, "transit": 16.0}

    def get_route(self, origin: tuple[float, float], destination: tuple[float, float], mode: str) -> RouteEstimate:
        lat1, lon1 = map(radians, origin)
        lat2, lon2 = map(radians, destination)
        dlat, dlon = lat2 - lat1, lon2 - lon1
        hav = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
        distance_m = int(6_371_000 * 2 * asin(sqrt(hav)) * 1.3)  # road factor is illustrative
        speed = self.speeds_kmh.get(mode, self.speeds_kmh["driving"])
        duration_min = max(5, round(distance_m / 1000 / speed * 60))
        return RouteEstimate(distance_m, duration_min)
