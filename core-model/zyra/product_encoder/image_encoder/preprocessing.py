import logging
from typing import Tuple, Dict, Any
import numpy as np
from PIL import Image
import torch
from torchvision import transforms

logger = logging.getLogger("zyra.product_encoder.image_encoder.preprocessing")

# CLIP Standard Image Normalization constants
CLIP_MEAN = [0.48145466, 0.4578275, 0.40821073]
CLIP_STD = [0.26862954, 0.26130258, 0.27577711]
TARGET_IMAGE_SIZE = 224


class ProductImagePreprocessor:
    """
    Standardizes input product images for vision model inference.
    Handles color space normalization, aspect-ratio preservation, and tensor conversion.
    """

    def __init__(self, target_size: int = TARGET_IMAGE_SIZE) -> None:
        self.target_size = target_size
        self._transform = transforms.Compose([
            transforms.Resize(target_size, interpolation=transforms.InterpolationMode.BICUBIC),
            transforms.CenterCrop(target_size),
            transforms.ToTensor(),
            transforms.Normalize(mean=CLIP_MEAN, std=CLIP_STD),
        ])

    def preprocess(self, image: Image.Image) -> Tuple[torch.Tensor, Image.Image, Dict[str, Any]]:
        """
        Preprocesses a PIL Image into a normalized PyTorch tensor and clean PIL RGB image.
        Returns (tensor, resized_pil_image, metadata).
        """
        # Ensure RGB mode
        if image.mode != "RGB":
            image = image.convert("RGB")

        orig_w, orig_h = image.size
        aspect_ratio = round(orig_w / max(orig_h, 1), 3)

        # Apply tensor transforms
        tensor = self._transform(image)  # [3, target_size, target_size]

        # Resized PIL for feature extraction & color analysis
        resized_pil = image.resize((self.target_size, self.target_size), Image.Resampling.BICUBIC)

        metadata = {
            "originalWidth": orig_w,
            "originalHeight": orig_h,
            "aspectRatio": aspect_ratio,
            "targetSize": self.target_size,
            "qualityScore": self._estimate_quality_score(image),
        }

        return tensor, resized_pil, metadata

    def _estimate_quality_score(self, image: Image.Image) -> float:
        """Estimate image clarity/resolution quality score in [0.5, 1.0]."""
        w, h = image.size
        resolution = w * h
        if resolution >= 1000 * 1000:
            return 1.0
        elif resolution >= 500 * 500:
            return 0.9
        elif resolution >= 250 * 250:
            return 0.75
        else:
            return 0.6
