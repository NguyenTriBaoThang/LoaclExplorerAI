class EventService:
    """Reserved extension point for provider changes and itinerary invalidation events."""

    def record_provider_update(self, *_args, **_kwargs) -> None:
        raise NotImplementedError("Provider event processing is planned for a later phase.")
