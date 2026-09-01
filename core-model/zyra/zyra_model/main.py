import os
import sys

# Dynamic sys.path resolution so main.py can be run from anywhere
_current_dir = os.path.dirname(os.path.abspath(__file__))
_repo_root = os.path.abspath(os.path.join(_current_dir, "../.."))
_parent_dir = os.path.abspath(os.path.join(_current_dir, ".."))
for _p in (_repo_root, _parent_dir):
    if _p not in sys.path:
        sys.path.insert(0, _p)

from contextlib import asynccontextmanager
from typing import AsyncIterator
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from zyra.zyra_model.config.settings import get_zyra_model_settings
from zyra.zyra_model.config.constants import ZYRA_MODEL_VERSION
from zyra.zyra_model.config.logging import configure_logging
from zyra.zyra_model.recommendation.exceptions import ZyraModelException
from zyra.zyra_model.api.routes import router as zyra_router

# Setup logger and settings
logger = configure_logging()
settings = get_zyra_model_settings()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Lifespan management for ZYRA-MODEL recommendation service."""
    logger.info(
        "🚀 Starting %s [%s environment] version %s on port %d...",
        settings.SERVICE_NAME,
        settings.ENVIRONMENT,
        ZYRA_MODEL_VERSION,
        settings.PORT,
    )
    yield
    logger.info("🛑 Shutting down %s...", settings.SERVICE_NAME)
    logger.info("✨ Clean shutdown complete.")


app = FastAPI(
    title="ZYRA-MODEL Recommendation Intelligence Service",
    description="Core recommendation model: Candidate Retrieval, Outfit Compatibility, Person-Garment Suitability, Occasion Matching, and Final Recommendation Ranking.",
    version=ZYRA_MODEL_VERSION,
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://(localhost(:\d+)?|.*\.vercel\.app|.*\.onrender\.com|.*\.weavly\.store|.*\.luxzera\.store)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(ZyraModelException)
async def zyra_model_exception_handler(request: Request, exc: ZyraModelException) -> JSONResponse:
    """Handle domain-specific ZYRA-MODEL exceptions."""
    logger.warning("ZyraModelException caught: %s (status=%d)", exc.message, exc.status_code)
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.__class__.__name__,
            "message": exc.message,
            "details": exc.details,
            "version": ZYRA_MODEL_VERSION,
        },
    )


@app.get("/health", tags=["System"])
async def root_health_check():
    """Root health check endpoint."""
    return {
        "status": "HEALTHY",
        "service": settings.SERVICE_NAME,
        "version": ZYRA_MODEL_VERSION,
    }


# Include Zyra recommendation router
app.include_router(zyra_router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host=settings.HOST,
        port=settings.PORT,
    )
