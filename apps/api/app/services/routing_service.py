from app.adapters.routing.provider import MockRoutingProvider, RouteEstimate, RoutingProvider


class RoutingService:
    def __init__(self, provider: RoutingProvider | None = None):
        self.provider = provider or MockRoutingProvider()

    def get_route(self, origin: tuple[float, float], destination: tuple[float, float], mode: str) -> RouteEstimate:
        return self.provider.get_route(origin, destination, mode)
