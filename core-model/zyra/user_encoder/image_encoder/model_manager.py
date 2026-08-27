import os
import logging
from typing import Optional, Dict, Any, Tuple
import torch

from zyra.user_encoder.image_encoder.constants import (
    MODELS_BASE_DIR,
    MEDIAPIPE_MODEL_DIR,
    FASHN_MODEL_DIR,
    FASHIONCLIP_MODEL_DIR,
    MEDIAPIPE_POSE_MODEL_NAME,
    FASHN_HUMAN_PARSER_MODEL_NAME,
    FASHION_CLIP_MODEL_NAME,
)

logger = logging.getLogger("zyra.image_encoder.model_manager")


class ModelManager:
    """Manages lifecycle, caching, execution device selection, and local loading of vision models.

    Models:
    1. MediaPipe Pose Landmarker (Pose & Landmark detection)
    2. FASHN Human Parser (Human/clothing segmentation masks)
    3. FashionCLIP (Fashion semantic embeddings and zero-shot style scoring)
    """

    _instance: Optional["ModelManager"] = None

    def __new__(cls) -> "ModelManager":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self) -> None:
        if getattr(self, "_initialized", False):
            return

        self.device = self._detect_device()
        self.models_dir = MODELS_BASE_DIR
        self.mediapipe_path = os.path.join(MEDIAPIPE_MODEL_DIR, MEDIAPIPE_POSE_MODEL_NAME)
        self.fashn_path = FASHN_MODEL_DIR
        self.fashionclip_path = FASHIONCLIP_MODEL_DIR

        # Cached Model Instances
        self._pose_landmarker = None
        self._fashn_parser = None
        self._fashn_processor = None
        self._fashion_clip_model = None
        self._fashion_clip_processor = None
        self._fashion_clip_text_embeddings = {}

        self._initialized = True
        logger.info("ModelManager initialized on device: %s (models_dir: %s)", self.device, self.models_dir)

    def _detect_device(self) -> torch.device:
        """Detect execution device (CUDA -> MPS -> CPU)."""
        force_device = os.getenv("ZYRA_VISION_DEVICE")
        if force_device:
            return torch.device(force_device)

        if torch.cuda.is_available():
            dev = torch.device("cuda")
        elif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
            dev = torch.device("mps")
        else:
            dev = torch.device("cpu")

        return dev

    def get_device(self) -> torch.device:
        return self.device

    def get_metadata(self) -> Dict[str, Any]:
        """Return diagnostic metadata about the current vision model environment."""
        return {
            "device": str(self.device),
            "torchVersion": torch.__version__,
            "modelsBaseDir": self.models_dir,
            "models": {
                "mediapipePose": {
                    "name": MEDIAPIPE_POSE_MODEL_NAME,
                    "localPath": self.mediapipe_path,
                    "isLoaded": self._pose_landmarker is not None,
                },
                "fashnHumanParser": {
                    "name": FASHN_HUMAN_PARSER_MODEL_NAME,
                    "localPath": self.fashn_path,
                    "isLoaded": self._fashn_parser is not None,
                },
                "fashionClip": {
                    "name": FASHION_CLIP_MODEL_NAME,
                    "localPath": self.fashionclip_path,
                    "isLoaded": self._fashion_clip_model is not None,
                },
            },
        }

    def get_mediapipe_pose(self) -> Optional[Any]:
        """Load and cache MediaPipe Pose Landmarker."""
        if self._pose_landmarker is not None:
            return self._pose_landmarker

        try:
            import mediapipe as mp
            from mediapipe.tasks import python as mp_python
            from mediapipe.tasks.python import vision as mp_vision

            if os.path.exists(self.mediapipe_path):
                base_options = mp_python.BaseOptions(model_asset_path=self.mediapipe_path)
                options = mp_vision.PoseLandmarkerOptions(
                    base_options=base_options,
                    running_mode=mp_vision.RunningMode.IMAGE,
                    num_poses=1,
                    min_pose_detection_confidence=0.5,
                    min_pose_presence_confidence=0.5,
                )
                self._pose_landmarker = mp_vision.PoseLandmarker.create_from_options(options)
                logger.info("Loaded MediaPipe Pose Landmarker from %s", self.mediapipe_path)
            else:
                logger.info(
                    "MediaPipe model file not found at %s. Using heuristic pose analyzer.",
                    self.mediapipe_path,
                )
        except Exception as exc:
            logger.info("MediaPipe pose initialization note: %s (fallback active)", exc)

        return self._pose_landmarker

    def get_fashn_parser(self) -> Tuple[Optional[Any], Optional[Any]]:
        """Load and cache FASHN Human Parser (SegFormer) model and processor."""
        if self._fashn_parser is not None:
            return self._fashn_parser, self._fashn_processor

        try:
            from transformers import SegformerForSemanticSegmentation, SegformerImageProcessor

            load_source = self.fashn_path if os.path.exists(self.fashn_path) and os.listdir(self.fashn_path) else FASHN_HUMAN_PARSER_MODEL_NAME

            # Only attempt loading if local files exist or local path configured
            if os.path.exists(self.fashn_path) and os.listdir(self.fashn_path):
                self._fashn_processor = SegformerImageProcessor.from_pretrained(load_source)
                model = SegformerForSemanticSegmentation.from_pretrained(load_source)
                model.to(self.device)
                model.eval()
                self._fashn_parser = model
                logger.info("Loaded FASHN Human Parser from %s on %s", load_source, self.device)
        except Exception as exc:
            logger.info("FASHN Human Parser loading note: %s (heuristic segmentation active)", exc)

        return self._fashn_parser, self._fashn_processor

    def get_fashion_clip(self) -> Tuple[Optional[Any], Optional[Any]]:
        """Load and cache FashionCLIP / CLIP model and processor."""
        if self._fashion_clip_model is not None:
            return self._fashion_clip_model, self._fashion_clip_processor

        try:
            from transformers import CLIPModel, CLIPProcessor

            load_source = self.fashionclip_path if os.path.exists(self.fashionclip_path) and os.listdir(self.fashionclip_path) else FASHION_CLIP_MODEL_NAME

            if os.path.exists(self.fashionclip_path) and os.listdir(self.fashionclip_path):
                self._fashion_clip_processor = CLIPProcessor.from_pretrained(load_source)
                model = CLIPModel.from_pretrained(load_source)
                model.to(self.device)
                model.eval()
                self._fashion_clip_model = model
                logger.info("Loaded FashionCLIP model from %s on %s", load_source, self.device)
        except Exception as exc:
            logger.info("FashionCLIP model loading note: %s (fallback active)", exc)

        return self._fashion_clip_model, self._fashion_clip_processor

    def clear_cache(self) -> None:
        """Clear cached models in memory (useful for test isolation)."""
        self._pose_landmarker = None
        self._fashn_parser = None
        self._fashn_processor = None
        self._fashion_clip_model = None
        self._fashion_clip_processor = None
        self._fashion_clip_text_embeddings.clear()
