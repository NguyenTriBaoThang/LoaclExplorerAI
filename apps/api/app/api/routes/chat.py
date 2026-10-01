from fastapi import APIRouter, Depends

from app.adapters.llm.provider import StructuredOutputProvider
from app.api.dependencies import get_llm_provider
from app.prompts.registry import catalog
from app.schemas.ai import ChatMessage, StructuredConstraints
from app.services.prompt_service import PromptRunner

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("/message")
def chat_message(payload: ChatMessage, provider: StructuredOutputProvider = Depends(get_llm_provider)):
    constraints = PromptRunner(provider).run(
        "CONVERSATION_PARSER",
        {"message": payload.message, "conversation_id": payload.conversation_id},
        StructuredConstraints,
    )
    return {
        "status": "parsed",
        "conversation_id": payload.conversation_id,
        "prompt_version": catalog.version,
        "reply": constraints.clarification_question_vi or "Mình đã ghi nhận các ràng buộc chuyến đi.",
        "structured_constraints": constraints.model_dump(),
    }
