import os
import logging
from typing import Optional, Tuple, Any
import torch

from zyra.product_encoder.config.settings import get_product_settings

logger = logging.getLogger("zyra.product_encoder.text_encoder.model_manager")


class ProductTextModelManager:
    """
    Manages pretrained transformer language model weights, local caching, and device placement.
    Supports CUDA, Apple Silicon MPS, and CPU execution with graceful offline fallbacks.
    """

    def __init__(
        self,
        models_dir: Optional[str] = None,
        device: Optional[str] = None,
        text_model_name: str = "openai/clip-vit-base-patch32",
    ) -> None:
        settings = get_product_settings()
        self.models_dir = models_dir or os.path.join(settings.MODELS_DIR, "cache")
        os.makedirs(self.models_dir, exist_ok=True)

        self.text_model_name = text_model_name
        self._device_str = device or self._detect_device()
        self.device = torch.device(self._device_str)

        self._text_model: Optional[Any] = None
        self._tokenizer: Optional[Any] = None
        self._is_loaded = False

        logger.info(
            "ProductTextModelManager initialized: device=%s, cache_dir=%s, model=%s",
            self.device,
            self.models_dir,
            self.text_model_name,
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

    def get_text_model(self) -> Tuple[Optional[Any], Optional[Any]]:
        """
        Lazy-loads and returns (model, tokenizer) tuple for the text transformer.
        Returns (None, None) if transformers/weights are unavailable or ENABLE_ML_ENCODING is False.
        """
        if self._is_loaded:
            return self._text_model, self._tokenizer

        settings = get_product_settings()
        if not getattr(settings, "ENABLE_ML_ENCODING", False):
            self._is_loaded = True
            return None, None

        try:
            from transformers import CLIPTextModelWithProjection, CLIPTokenizer

            logger.info("Loading text transformer '%s' into %s...", self.text_model_name, self.device)
            tokenizer = CLIPTokenizer.from_pretrained(
                self.text_model_name,
                cache_dir=self.models_dir,
                local_files_only=False,
            )
            model = CLIPTextModelWithProjection.from_pretrained(
                self.text_model_name,
                cache_dir=self.models_dir,
                local_files_only=False,
            )
            model.to(self.device)
            model.eval()

            self._text_model = model
            self._tokenizer = tokenizer
            self._is_loaded = True
            logger.info("Successfully loaded text transformer '%s' on %s", self.text_model_name, self.device)
            return self._text_model, self._tokenizer

        except Exception as exc:
            logger.warning(
                "Could not load online text transformer '%s' (%s). Offline/heuristic mode active.",
                self.text_model_name,
                str(exc),
            )
            self._is_loaded = True
            return None, None
