import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core import get_settings, setup_logging
from app.middleware import request_context_middleware
from app.routers import health_router, profile_router

# Setup logging
settings = get_settings()
setup_logging(settings.log_level)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Ignite Health API",
    description="Unified REST API for Ignite Health platform",
    version="1.0.0",
    docs_url="/docs" if settings.environment == "dev" else None,  # Disable in prod
    redoc_url="/redoc" if settings.environment == "dev" else None,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request context middleware
app.middleware("http")(request_context_middleware)

# Include routers
app.include_router(health_router)
app.include_router(profile_router)

logger.info(f"Ignite Health API starting in {settings.environment} mode")


@app.on_event("startup")
async def startup_event():
    """Startup event handler."""
    logger.info("API startup complete")


@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown event handler."""
    logger.info("API shutting down")
