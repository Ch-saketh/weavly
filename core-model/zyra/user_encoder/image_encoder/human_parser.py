import logging
from typing import Tuple, Dict, List, Optional
import numpy as np
from PIL import Image
import torch
import torch.nn.functional as F

from zyra.user_encoder.schemas.image_encoder_schemas import GarmentSegmentationInsights
from zyra.user_encoder.image_encoder.model_manager import ModelManager
from zyra.user_encoder.image_encoder.preprocessing import ImagePreprocessor
from zyra.user_encoder.image_encoder.constants import FASHN_PARSER_CLASSES

logger = logging.getLogger("zyra.image_encoder.human_parser")


class HumanGarmentParser:
    """Performs semantic human & garment parsing using FASHN Human Parser (SegFormer).

    Isolates clothing categories (tops, bottoms, outerwear, dresses) for downstream color & style analysis.
    """

    def __init__(self, model_manager: Optional[ModelManager] = None) -> None:
        self.model_manager = model_manager or ModelManager()

    def parse_garments(
        self,
        image: Image.Image,
    ) -> Tuple[GarmentSegmentationInsights, Optional[np.ndarray]]:
        """Segment image into clothing regions and return structured insights + segmentation mask."""
        model, processor = self.model_manager.get_fashn_parser()

        if model is not None and processor is not None:
            return self._parse_with_segformer(image, model, processor)
        else:
            return self._heuristic_garment_parse(image)

    def _parse_with_segformer(
        self,
        image: Image.Image,
        model: any,
        processor: any,
    ) -> Tuple[GarmentSegmentationInsights, np.ndarray]:
        """Inference with FASHN Human Parser SegFormer model."""
        try:
            device = self.model_manager.get_device()
            inputs = processor(images=image, return_tensors="pt")
            inputs = {k: v.to(device) for k, v in inputs.items()}

            with torch.no_grad():
                outputs = model(**inputs)
                logits = outputs.logits  # [1, num_classes, H, W]

                # Upsample to original image size
                orig_w, orig_h = image.size
                upsampled_logits = F.interpolate(
                    logits,
                    size=(orig_h, orig_w),
                    mode="bilinear",
                    align_corners=False,
                )
                pred_mask = upsampled_logits.argmax(dim=1)[0].cpu().numpy()

            return self._extract_insights_from_mask(pred_mask)

        except Exception as exc:
            logger.warning("Error running SegFormer model: %s. Falling back to heuristic segmentation.", exc)
            return self._heuristic_garment_parse(image)

    def _extract_insights_from_mask(
        self,
        mask: np.ndarray,
    ) -> Tuple[GarmentSegmentationInsights, np.ndarray]:
        """Derive garment categories, proportions, and presence from class mask."""
        total_pixels = mask.size
        unique_classes, counts = np.unique(mask, return_counts=True)
        class_counts = dict(zip(unique_classes, counts))

        coverage: Dict[str, float] = {}
        detected_categories: List[str] = []
        upper_body = None
        lower_body = None
        dress_detected = False
        outerwear_detected = False

        for cls_idx, count in class_counts.items():
            if cls_idx == 0:  # Background
                continue
            cls_name = FASHN_PARSER_CLASSES.get(int(cls_idx), f"Class_{cls_idx}")
            pct = round(float(count) / total_pixels, 4)
            if pct > 0.01:  # At least 1% coverage
                coverage[cls_name] = pct
                detected_categories.append(cls_name)

                if "Upper-clothes" in cls_name or "Top" in cls_name:
                    upper_body = "T-shirts / Tops"
                elif "Pants" in cls_name or "Bottoms" in cls_name:
                    lower_body = "Pants / Trousers"
                elif "Dress" in cls_name:
                    dress_detected = True
                elif "Coat" in cls_name or "Jacket" in cls_name or "Outerwear" in cls_name:
                    outerwear_detected = True

        insights = GarmentSegmentationInsights(
            detectedCategories=detected_categories,
            upperBodyGarment=upper_body,
            lowerBodyGarment=lower_body,
            dressDetected=dress_detected,
            outerwearDetected=outerwear_detected,
            coveragePercentage=coverage,
        )
        return insights, mask

    def _heuristic_garment_parse(
        self,
        image: Image.Image,
    ) -> Tuple[GarmentSegmentationInsights, np.ndarray]:
        """Deterministic heuristic segmentation based on spatial regions (upper 30-60% = top, lower 60-90% = bottoms)

        when SegFormer weights are not loaded.
        """
        w, h = image.size
        dummy_mask = np.zeros((h, w), dtype=np.uint8)

        # Upper body region: y from 0.25 to 0.60
        y1_top = int(h * 0.25)
        y2_top = int(h * 0.60)
        x1 = int(w * 0.2)
        x2 = int(w * 0.8)
        dummy_mask[y1_top:y2_top, x1:x2] = 4  # Upper-clothes

        # Lower body region: y from 0.60 to 0.90
        y1_bot = int(h * 0.60)
        y2_bot = int(h * 0.90)
        dummy_mask[y1_bot:y2_bot, x1:x2] = 8  # Pants/Bottoms

        insights = GarmentSegmentationInsights(
            detectedCategories=["Upper-clothes / Top", "Pants / Bottoms"],
            upperBodyGarment="T-shirts / Tops",
            lowerBodyGarment="Pants / Bottoms",
            dressDetected=False,
            outerwearDetected=False,
            coveragePercentage={
                "Upper-clothes / Top": 0.25,
                "Pants / Bottoms": 0.22,
            },
        )
        return insights, dummy_mask
