import os
import sys

# Dynamic sys.path resolution so main.py can be run from any directory
_current_dir = os.path.dirname(os.path.abspath(__file__))
_repo_root = os.path.abspath(os.path.join(_current_dir, "../.."))
_parent_dir = os.path.abspath(os.path.join(_current_dir, ".."))
for _p in (_repo_root, _parent_dir):
    if _p not in sys.path:
        sys.path.insert(0, _p)

import asyncio
import logging
from contextlib import asynccontextmanager
from typing import AsyncIterator, Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from zyra.user_encoder.config.settings import get_settings
from zyra.user_encoder.api.deps import get_springboot_client
from zyra.user_encoder.api.routes import router as user_router
from zyra.product_encoder.api.routes import router as product_router
from zyra.user_encoder.pipeline.orchestration import UserEncoderPipeline
from zyra.user_encoder.ingestion.rabbitmq_consumer import UserProfileEventConsumer

# Configure Structured Logging
settings = get_settings()
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger("zyra.main")

consumer_instance: Optional[UserProfileEventConsumer] = None


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Application lifecycle management for startup and graceful shutdown."""
    global consumer_instance
    logger.info("🚀 Starting %s [%s environment] on port %d...", settings.SERVICE_NAME, settings.ENVIRONMENT, settings.PORT)

    # Initialize Spring Boot Client
    springboot_client = get_springboot_client()
    pipeline = UserEncoderPipeline(springboot_client=springboot_client)

    # Conditionally start RabbitMQ consumer if enabled
    if settings.ENABLE_RABBITMQ_CONSUMER:
        try:
            consumer_instance = UserProfileEventConsumer(
                settings=settings,
                pipeline_dispatch_fn=pipeline.process_event,
            )
            asyncio.create_task(consumer_instance.start())
            logger.info("🐇 RabbitMQ consumer background task launched.")
        except Exception as exc:
            logger.warning("RabbitMQ consumer failed to start on boot: %s", exc)

    yield

    # Clean shutdown
    logger.info("🛑 Shutting down %s...", settings.SERVICE_NAME)
    if consumer_instance:
        await consumer_instance.stop()
    await springboot_client.close()
    logger.info("✨ Clean shutdown complete.")


app = FastAPI(
    title="Zyra Fashion Intelligence Service",
    description="Multimodal intelligence platform for User Fashion Affinities and Product Understanding.",
    version="0.2.0-p0",
    lifespan=lifespan,
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://(localhost(:\d+)?|.*\.vercel\.app|.*\.onrender\.com|.*\.weavly\.store|.*\.luxzera\.store)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Attach API routes
app.include_router(user_router)
app.include_router(product_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host=settings.HOST,
        port=settings.PORT,
    )
