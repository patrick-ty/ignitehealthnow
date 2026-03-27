import logging

from fastapi import APIRouter, Depends

from app.core import get_settings
from app.middleware import get_current_user_id
from app.models import HealthResponse, UserIdentity

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/health", response_model=HealthResponse, tags=["health"])
async def health_check():
    """
    Public health check endpoint.
    Story 00.3 from UC 00.2
    """
    settings = get_settings()
    return HealthResponse(status="ok", environment=settings.environment)


@router.get("/me", response_model=UserIdentity, tags=["identity"])
async def get_current_user(user_id: str = Depends(get_current_user_id)):
    """
    Protected identity endpoint.
    Returns authenticated user's identity.
    Story 00.4 from UC 00.2
    """
    logger.info(f"Identity request for user: {user_id}")

    # Note: email could be extracted from JWT claims if needed
    # For now, returning minimal identity
    return UserIdentity(
        user_id=user_id,
        email=None,  # Could extract from token claims if required
    )
