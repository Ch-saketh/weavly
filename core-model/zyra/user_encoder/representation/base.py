from abc import ABC, abstractmethod
from typing import Dict, Any
from uuid import UUID
from zyra.user_encoder.schemas.encoder_schemas import UnifiedUserRepresentation


class BaseRepresentationManager(ABC):
    """Abstract Interface for managing and persisting Unified User Representations (Stage 5).

    Responsibilities in future phases:
    1. Structure the user's unified profile insights into canonical JSON format.
    2. Manage storage into document/operational databases.
    """

    @abstractmethod
    async def store_representation(
        self,
        user_id: UUID,
        representation: UnifiedUserRepresentation,
    ) -> Dict[str, Any]:
        """Persist structured user representation."""
        raise NotImplementedError("Representation Manager will be implemented in future phases.")
