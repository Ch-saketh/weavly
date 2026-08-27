from abc import ABC, abstractmethod
from typing import Optional, List
from uuid import UUID
from zyra.user_encoder.schemas.image_encoder_schemas import ImageEncoderOutput
from zyra.user_encoder.schemas.input_schema import RecommendationImageInput


class BaseImageEncoder(ABC):
    """Abstract Interface for the Zyra Image Encoder (Phase U3).

    Responsibilities:
    1. Extract visual attributes from user avatar (if available).
    2. Extract aesthetic, color, and silhouette representations from recommendation images.
    3. Produce structured UserVisualInsights and machine-readable VisualRepresentation.
    """

    @abstractmethod
    async def encode_visuals(
        self,
        user_id: UUID,
        profile_image: Optional[str],
        recommendation_images: List[RecommendationImageInput],
    ) -> ImageEncoderOutput:
        """Encode visual inputs into structured visual insights and visual representation."""
        raise NotImplementedError("Image Encoder will be implemented in future phases.")

