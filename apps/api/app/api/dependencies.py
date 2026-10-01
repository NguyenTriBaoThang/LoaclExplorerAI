import secrets

from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.adapters.llm.provider import NotConfiguredLLMProvider, OpenAICompatibleLLMProvider, StructuredOutputProvider
from app.core.config import settings
from app.db.session import get_db
from app.services.planner_service import PlannerService


def get_planner_service(db: Session = Depends(get_db)) -> PlannerService:
    return PlannerService(db)


def get_llm_provider() -> StructuredOutputProvider:
    if not settings.openai_api_key:
        return NotConfiguredLLMProvider()
    return OpenAICompatibleLLMProvider(
        api_key=settings.openai_api_key,
        model_name=settings.openai_model,
        base_url=settings.openai_base_url,
        timeout_seconds=settings.openai_timeout_seconds,
    )


def require_admin(x_admin_key: str | None = Header(default=None)) -> None:
    if not settings.admin_api_key:
        if settings.app_env.lower() in {"development", "test"}:
            return
        raise HTTPException(status_code=503, detail={"code": "ADMIN_AUTH_NOT_CONFIGURED", "message": "Set ADMIN_API_KEY before enabling AI write endpoints."})
    if not x_admin_key or not secrets.compare_digest(x_admin_key, settings.admin_api_key):
        raise HTTPException(status_code=401, detail={"code": "ADMIN_UNAUTHORIZED", "message": "A valid X-Admin-Key is required."})
