import logging
import time

from fastapi import APIRouter, Depends, HTTPException, status

from app.middleware import get_current_user_id
from app.models import ChatRequest, ChatResponse
from app.services import get_chat_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    user_id: str = Depends(get_current_user_id),
    chat_service=Depends(get_chat_service),
):
    started = time.monotonic()
    try:
        result = chat_service.answer(request.messages)
    except Exception as e:
        # Log the error *type* only — never the exception content, which could
        # carry message/PHI text (metadata-only logging constraint).
        logger.error("chat failed for user %s: %s", user_id, type(e).__name__)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="The assistant is unavailable right now. Please try again.",
        )
    logger.info(
        '{"entrypoint":"chat","user_id":"%s","sources":%d,"ms":%d}',
        user_id, len(result["sources"]), int((time.monotonic() - started) * 1000),
    )
    return result
