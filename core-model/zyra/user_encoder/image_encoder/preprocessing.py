import logging
from typing import Tuple, Optional
import numpy as np
from PIL import Image, ImageOps, ImageFilter
import torch
import torchvision.transforms.functional as TF

logger = logging.getLogger("zyra.image_encoder.preprocessing")

# CLIP Standard Normalization
CLIP_MEAN = [0.48145466, 0.4578275, 0.40821073]
CLIP_STD = [0.26862954, 0.26130258, 0.27577711]


class ImagePreprocessor:
    """Deterministic image preprocessing for MediaPipe, FASHN Human Parser, and FashionCLIP."""

    @classmethod
    def resize_with_aspect_ratio(
        cls,
        image: Image.Image,
        target_size: Tuple[int, int] = (224, 224),
        fill_color: Tuple[int, int, int] = (255, 255, 255),
    ) -> Image.Image:
        """Resize image preserving aspect ratio with letterbox/padding to exact target dimension."""
        target_w, target_h = target_size
        img_w, img_h = image.size

        ratio = min(target_w / img_w, target_h / img_h)
        new_w = max(1, int(img_w * ratio))
        new_h = max(1, int(img_h * ratio))

        resized = image.resize((new_w, new_h), Image.Resampling.BICUBIC)

        padded = Image.new("RGB", (target_w, target_h), fill_color)
        pad_x = (target_w - new_w) // 2
        pad_y = (target_h - new_h) // 2
        padded.paste(resized, (pad_x, pad_y))

        return padded

    @classmethod
    def prepare_for_fashion_clip(
        cls,
        image: Image.Image,
        target_size: Tuple[int, int] = (224, 224),
    ) -> torch.Tensor:
        """Transform PIL Image into normalized (1, 3, 224, 224) float tensor for CLIP/FashionCLIP."""
        padded_img = cls.resize_with_aspect_ratio(image, target_size=target_size)
        tensor = TF.to_tensor(padded_img)  # [3, H, W] in [0, 1]
        normalized = TF.normalize(tensor, mean=CLIP_MEAN, std=CLIP_STD)
        return normalized.unsqueeze(0)  # [1, 3, 224, 224]

    @classmethod
    def prepare_for_human_parser(
        cls,
        image: Image.Image,
        target_size: Tuple[int, int] = (512, 512),
    ) -> Tuple[torch.Tensor, Tuple[int, int]]:
        """Transform PIL image into normalized tensor for SegFormer human parser."""
        orig_size = image.size
        resized = image.resize(target_size, Image.Resampling.BILINEAR)
        tensor = TF.to_tensor(resized)  # [3, 512, 512]
        # Standard ImageNet normalization for SegFormer
        normalized = TF.normalize(
            tensor,
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225],
        )
        return normalized.unsqueeze(0), orig_size

    @classmethod
    def prepare_for_mediapipe(cls, image: Image.Image) -> np.ndarray:
        """Convert PIL image to contiguous uint8 RGB numpy array for MediaPipe processing."""
        if image.mode != "RGB":
            image = image.convert("RGB")
        return np.ascontiguousarray(np.array(image, dtype=np.uint8))

    @classmethod
    def compute_image_quality_score(
        cls,
        image: Image.Image,
        metadata: Optional[dict] = None,
    ) -> float:
        """Compute a deterministic quality score in [0.0, 1.0] based on image resolution,

        aspect ratio, and contrast.
        """
        w, h = image.size
        min_dim = min(w, h)

        # 1. Resolution factor (peaks around 1024px, penalizes tiny < 200px)
        if min_dim >= 800:
            res_score = 1.0
        elif min_dim >= 400:
            res_score = 0.85
        elif min_dim >= 200:
            res_score = 0.70
        else:
            res_score = 0.40

        # 2. Aspect Ratio reasonableness (penalizes extreme thin banners)
        ratio = max(w / max(1, h), h / max(1, w))
        if ratio <= 2.5:
            ratio_score = 1.0
        elif ratio <= 3.5:
            ratio_score = 0.8
        else:
            ratio_score = 0.5

        # 3. Dynamic range / contrast factor
        gray = image.convert("L")
        stat_arr = np.array(gray, dtype=np.float32)
        std_dev = float(np.std(stat_arr))
        contrast_score = min(1.0, std_dev / 40.0)

        quality = round(0.5 * res_score + 0.3 * ratio_score + 0.2 * contrast_score, 3)
        return max(0.1, min(1.0, quality))
