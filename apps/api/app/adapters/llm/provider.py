from typing import Any, Protocol


class StructuredOutputProvider(Protocol):
    def generate(self, prompt: str, schema: dict[str, Any]) -> dict[str, Any]: ...


class NotConfiguredLLMProvider:
    """Explicit placeholder so the MVP has no runtime dependency on an LLM key."""

    def generate(self, prompt: str, schema: dict[str, Any]) -> dict[str, Any]:
        raise RuntimeError("LLM provider is not configured; submit the structured planner form instead.")
