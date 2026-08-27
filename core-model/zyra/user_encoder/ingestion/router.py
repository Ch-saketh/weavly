import logging
from typing import Optional
from datetime import datetime, timezone
from zyra.user_encoder.schemas.events import UserProfileUpdatedEvent
from zyra.user_encoder.schemas.input_schema import UserEncoderInput
from zyra.user_encoder.schemas.encoder_inputs import (
    ImageEncoderInput,
    DataEncoderInput,
    BehaviourEncoderInput,
    UserEncoderPipelineInput,
)

logger = logging.getLogger("zyra.ingestion.router")


class InputRouter:
    """Deterministic router separating canonical UserEncoderInput into distinct encoder domains.

    Enforces strict separation of concerns:
    - ImageEncoderInput: Only visual assets and image references
    - DataEncoderInput: Only structured profile, sizing, and questionnaire fit data
    - BehaviourEncoderInput: Skeletal behavioural activity container
    """

    @staticmethod
    def route(
        normalized_input: UserEncoderInput,
        event: Optional[UserProfileUpdatedEvent] = None,
    ) -> UserEncoderPipelineInput:
        """Route normalized user data to dedicated encoder inputs.

        Args:
            normalized_input: Fully validated and normalized domain input.
            event: Optional triggering RabbitMQ event metadata.

        Returns:
            UserEncoderPipelineInput: Structured bundle with dedicated encoder inputs.
        """
        user_id = normalized_input.userId
        logger.debug("Routing normalized data for user %s into dedicated encoder inputs", user_id)

        # 1. Image Encoder Input
        image_input = ImageEncoderInput(
            userId=user_id,
            profileImage=normalized_input.profileImage,
            recommendationImages=normalized_input.recommendationImages,
        )

        # 2. Data Encoder Input
        profile = normalized_input.profile
        fit_data = normalized_input.fitData

        data_input = DataEncoderInput(
            userId=user_id,
            gender=profile.gender if profile else None,
            dateOfBirth=profile.dateOfBirth if profile else None,
            bio=profile.bio if profile else None,
            topSize=fit_data.topSize if fit_data else None,
            bottomSize=fit_data.bottomSize if fit_data else None,
            shoeSize=fit_data.shoeSize if fit_data else None,
            heightRange=fit_data.heightRange if fit_data else None,
            exactHeightCm=fit_data.exactHeightCm if fit_data else None,
            weightRange=fit_data.weightRange if fit_data else None,
            exactWeightKg=fit_data.exactWeightKg if fit_data else None,
            clothingSize=fit_data.clothingSize if fit_data else None,
            fitPreferences=fit_data.fitPreferences if fit_data else [],
            preferredStyles=fit_data.preferredStyles if fit_data else [],
            avoidedStyles=fit_data.avoidedStyles if fit_data else [],
            preferredClothingTypes=fit_data.preferredClothingTypes if fit_data else [],
            avoidedClothingTypes=fit_data.avoidedClothingTypes if fit_data else [],
            preferredColors=fit_data.preferredColors if fit_data else [],
            avoidedColors=fit_data.avoidedColors if fit_data else [],
            occasions=fit_data.occasions if fit_data else [],
            primaryOccasion=fit_data.primaryOccasion if fit_data else None,
            budgetRange=fit_data.budgetRange if fit_data else None,
            shoppingPriorities=fit_data.shoppingPriorities if fit_data else [],
            fashionGoals=fit_data.fashionGoals if fit_data else [],
            isProfileCompleted=normalized_input.profileCompleted,
        )

        # 3. Behaviour Encoder Input (Empty container at ingestion phase)
        behaviour_input = BehaviourEncoderInput(
            userId=user_id,
            interactionEvents=[],
        )

        # 4. Aggregated Pipeline Input Bundle
        pipeline_input = UserEncoderPipelineInput(
            userId=user_id,
            eventId=event.eventId if event else None,
            eventType=event.eventType if event else None,
            imageEncoderInput=image_input,
            dataEncoderInput=data_input,
            behaviourEncoderInput=behaviour_input,
            ingestedAt=datetime.now(timezone.utc),
            status="INGESTION_ROUTED",
            version="v1-u1",
            source="SPRING_BOOT_CANONICAL",
        )

        logger.info(
            "Successfully routed inputs for user %s: hasVisualData=%s, hasFitData=%s, hasBehaviourData=%s",
            user_id,
            image_input.hasVisualData,
            data_input.hasFitData,
            behaviour_input.hasBehaviourData,
        )

        return pipeline_input
