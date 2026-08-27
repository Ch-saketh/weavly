import os
import logging
from typing import Optional, Tuple, Any
import torch

from zyra.product_encoder.config.settings import get_product_settings

logger = logging.getLogger("zyra.product_encoder.image_encoder.model_manager")


class ProductVisionModelManager:
    """
    Manages pretrained vision model weights, local caching, and device placement.
    Supports CUDA, Apple Silicon MPS, and CPU execution with graceful offline fallbacks.
    """

    def __init__(
        self,
        models_dir: Optional[str] = None,
        device: Optional[str] = None,
        vision_model_name: str = "openai/clip-vit-base-patch32",
    ) -> None:
        settings = get_product_settings()
        self.models_dir = models_dir or os.path.join(settings.MODELS_DIR, "cache")
        os.makedirs(self.models_dir, exist_ok=True)

        self.vision_model_name = vision_model_name
        self._device_str = device or self._detect_device()
        self.device = torch.device(self._device_str)

        self._vision_model: Optional[Any] = None
        self._vision_processor: Optional[Any] = None
        self._is_loaded = False

        logger.info(
            "ProductVisionModelManager initialized: device=%s, cache_dir=%s, model=%s",
            self.device,
            self.models_dir,
            self.vision_model_name,
        )

    def _detect_device(self) -> str:
        """Detect best available hardware accelerator."""
        if torch.cuda.is_available():
            return "cuda"
        elif torch.backends.mps.is_available():
            return "mps"
        return "cpu"

    def get_device(self) -> torch.device:
        """Get active PyTorch device."""
        return self.device

    def get_vision_model(self) -> Tuple[Optional[Any], Optional[Any]]:
        """
        Lazy-loads and returns (model, processor) tuple for the vision backbone.
        Returns (None, None) if transformers/weights are unavailable.
        """
        if self._is_loaded:
            return self._vision_model, self._vision_processor

        settings = get_product_settings()
        if not getattr(settings, "ENABLE_ML_ENCODING", False):
            self._is_loaded = True
            return None, None

        try:
            from transformers import CLIPModel, CLIPProcessor

            logger.info("Loading vision model '%s' into %s...", self.vision_model_name, self.device)
            processor = CLIPProcessor.from_pretrained(
                self.vision_model_name,
                cache_dir=self.models_dir,
                local_files_only=False,
            )

            model = CLIPModel.from_pretrained(
                self.vision_model_name,
                cache_dir=self.models_dir,
                local_files_only=False,
            )
            model.to(self.device)
            model.eval()

            self._vision_model = model
            self._vision_processor = processor
            self._is_loaded = True
            logger.info("Successfully loaded vision model '%s' on %s", self.vision_model_name, self.device)
            return self._vision_model, self._vision_processor

        except Exception as exc:
            logger.warning(
                "Could not load online vision model '%s' (%s). Offline/heuristic mode active.",
                self.vision_model_name,
                str(exc),
            )
            self._is_loaded = True
            return None, None
