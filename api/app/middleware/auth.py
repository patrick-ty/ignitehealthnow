import logging
import uuid

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core import request_id_var, user_id_var
from app.services.auth import get_auth_service

logger = logging.getLogger(__name__)

# Security scheme for protected endpoints
security = HTTPBearer()


async def request_context_middleware(request: Request, call_next):
    """
    Middleware to set request_id in context for logging.
    """
    # Generate request ID
    req_id = str(uuid.uuid4())
    request_id_var.set(req_id)

    # Add to request state for potential use in handlers
    request.state.request_id = req_id

    response = await call_next(request)

    # Add request ID to response headers
    response.headers["X-Request-ID"] = req_id

    return response


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> str:
    """
    Dependency to extract and verify user_id from JWT token.
    Use this for protected endpoints that require authentication.

    Args:
        credentials: HTTP Bearer token from Authorization header

    Returns:
        str: Authenticated user_id (UUID)

    Raises:
        HTTPException: 401 if token is missing or invalid
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header required",
        )

    # Verify token and extract user_id
    user_id = get_auth_service().get_user_id(credentials.credentials)

    # Set in context for logging
    user_id_var.set(user_id)

    logger.info(f"Authenticated user: {user_id}")

    return user_id
