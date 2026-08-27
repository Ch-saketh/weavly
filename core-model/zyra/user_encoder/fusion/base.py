from abc import ABC, abstractmethod
from zyra.user_encoder.schemas.image_encoder_schemas import ImageEncoderOutput
from zyra.user_encoder.schemas.data_encoder_schemas import DataEncoderOutput
from zyra.user_encoder.schemas.encoder_schemas import (
    BehaviourEncoderOutput,
    UnifiedUserRepresentation,
)


class BaseFusionLayer(ABC):
    """Abstract Interface for the future Multi-Modal Fusion Layer (Stage 4).

    Responsibilities in future phases:
    1. Align and cross-attend between visual embeddings and questionnaire fit signals.
    2. Weight signals based on profile completion and interaction density.
    3. Synthesize a unified, coherent User Representation.
    """

    @abstractmethod
    async def fuse_modalities(
        self,
        visual_output: ImageEncoderOutput,
        data_output: DataEncoderOutput,
        behaviour_output: BehaviourEncoderOutput,
    ) -> UnifiedUserRepresentation:
        """Fuse multimodal encoder outputs into a unified user representation."""
        raise NotImplementedError("Fusion layer will be implemented in future phases.")
