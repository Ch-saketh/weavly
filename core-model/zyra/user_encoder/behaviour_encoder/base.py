from abc import ABC, abstractmethod
from typing import Any, Dict, List
from uuid import UUID
from zyra.user_encoder.schemas.behaviour_encoder_schemas import BehaviourEncoderOutput


class BaseBehaviourEncoder(ABC):
    """Abstract Interface for the Zyra Behaviour Encoder (Phase U4).

    Responsibilities:
    1. Process user clickstreams, wishlist saves, cart additions, and order histories.
    2. Model real-time stylistic interest signals and brand affinity.
    3. Generate deterministic behavioural representations ready for future multimodal fusion.
    """

    @abstractmethod
    async def encode_behaviour(
        self,
        user_id: UUID,
        interaction_events: List[Dict[str, Any]],
    ) -> BehaviourEncoderOutput:
        """Encode behavioural signals into structured interaction insights."""
        raise NotImplementedError("Behaviour Encoder will be implemented in future phases.")
