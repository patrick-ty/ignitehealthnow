from .health import router as health_router
from .profile import router as profile_router
from .chat import router as chat_router  # noqa: F401

__all__ = ["health_router", "profile_router", "chat_router"]
