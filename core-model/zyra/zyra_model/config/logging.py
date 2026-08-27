import logging
import sys
from zyra.zyra_model.config.settings import get_zyra_model_settings


def configure_logging() -> logging.Logger:
    """Configure structured logging for ZYRA-MODEL service."""
    settings = get_zyra_model_settings()
    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)

    logging.basicConfig(
        level=log_level,
        format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        handlers=[logging.StreamHandler(sys.stdout)],
        force=True,
    )
    logger = logging.getLogger("zyra.zyra_model")
    logger.setLevel(log_level)
    return logger
