from abc import ABC, abstractmethod
from typing import Optional
from uuid import UUID
from zyra.user_encoder.schemas.encoder_schemas import DataEncoderOutput
from zyra.user_encoder.schemas.input_schema import GeneralProfileInput, UserFitDataInput


class BaseDataEncoder(ABC):
    """Abstract Interface for the future Zyra Data Encoder (Stage 2).

    Responsibilities in future phases:
    1. Parse and normalize 15-area UserFitData questionnaire responses.
    2. Convert measurements and categorical fit choices into structured ProfileInsights.
    3. Generate high-dimensional numerical profile embeddings.
    """

    @abstractmethod
    async def encode_data(
        self,
        user_id: UUID,
        profile: Optional[GeneralProfileInput],
        fit_data: Optional[UserFitDataInput],
    ) -> DataEncoderOutput:
        """Encode structured profile and questionnaire inputs into structured profile insights."""
        raise NotImplementedError("Data Encoder will be implemented in future phases.")
