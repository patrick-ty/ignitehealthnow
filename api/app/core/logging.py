import logging
import sys
from contextvars import ContextVar

# Context variables for request tracking
request_id_var: ContextVar[str | None] = ContextVar("request_id", default=None)
user_id_var: ContextVar[str | None] = ContextVar("user_id", default=None)


class ContextualFilter(logging.Filter):
    """Add request_id and user_id to log records."""

    def filter(self, record):
        record.request_id = request_id_var.get()
        record.user_id = user_id_var.get()
        return True


def setup_logging(log_level: str = "INFO"):
    """Configure structured logging."""

    # Create formatter
    formatter = logging.Formatter(
        '{"time": "%(asctime)s", "level": "%(levelname)s", "request_id": "%(request_id)s", '
        '"user_id": "%(user_id)s", "message": "%(message)s"}'
    )

    # Configure handler
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)
    handler.addFilter(ContextualFilter())

    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.handlers.clear()
    root_logger.addHandler(handler)
    root_logger.setLevel(getattr(logging, log_level.upper()))

    # Suppress noisy libraries
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
