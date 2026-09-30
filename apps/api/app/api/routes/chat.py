from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/chat", tags=["chat"])


class ChatMessage(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    conversation_id: str | None = None


@router.post("/message")
def chat_message(_: ChatMessage):
    return {"status": "not_configured", "reply": None, "message": "Chat assistant is not configured in this MVP. Use the structured planner form."}
