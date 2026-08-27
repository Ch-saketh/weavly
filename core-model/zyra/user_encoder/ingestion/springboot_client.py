import logging
from typing import Optional
from uuid import UUID
from zyra.shared.clients.http_client import BaseHttpClient, HttpClientError, HttpResourceNotFoundError
from zyra.user_encoder.schemas.springboot_dto import SpringBootUserEncoderResponse
from zyra.user_encoder.schemas.input_schema import (
    UserEncoderInput,
    GeneralProfileInput,
    UserFitDataInput,
    RecommendationImageInput,
)

logger = logging.getLogger("zyra.ingestion.springboot_client")


class SpringBootClient(BaseHttpClient):
    """Client for fetching canonical user and encoder data from Spring Boot backend."""

    def __init__(
        self,
        base_url: str = "http://localhost:8081",
        timeout_seconds: float = 10.0,
    ) -> None:
        super().__init__(base_url=base_url, timeout_seconds=timeout_seconds)

    async def fetch_user_encoder_data(self, user_id: UUID) -> UserEncoderInput:
        """Fetch encoder data for a specific user and transform into canonical UserEncoderInput.

        Args:
            user_id: The UUID of the user to fetch.

        Returns:
            UserEncoderInput: Validated, domain-level canonical input model.

        Raises:
            HttpResourceNotFoundError: If user or encoder data is not found (404).
            HttpClientError: If HTTP/network communication fails.
        """
        path = f"/api/internal/users/{user_id}/encoder-data"
        logger.debug("Fetching user encoder data from Spring Boot for user %s at %s", user_id, path)

        raw_data = await self.get(path)
        dto = SpringBootUserEncoderResponse.model_validate(raw_data)

        return self._map_dto_to_canonical_input(dto)

    def _map_dto_to_canonical_input(self, dto: SpringBootUserEncoderResponse) -> UserEncoderInput:
        """Map Spring Boot DTO into Zyra's clean domain input contract."""
        profile = None
        if dto.generalProfile:
            profile = GeneralProfileInput(
                gender=dto.generalProfile.gender,
                dateOfBirth=dto.generalProfile.dateOfBirth,
                bio=dto.generalProfile.bio,
            )

        fit_data = None
        if dto.fitData:
            fit_data = UserFitDataInput(
                topSize=dto.fitData.topSize,
                bottomSize=dto.fitData.bottomSize,
                shoeSize=dto.fitData.shoeSize,
                heightRange=dto.fitData.heightRange,
                exactHeightCm=dto.fitData.exactHeightCm,
                weightRange=dto.fitData.weightRange,
                exactWeightKg=dto.fitData.exactWeightKg,
                clothingSize=dto.fitData.clothingSize,
                fitPreferences=dto.fitData.fitPreferences,
                preferredStyles=dto.fitData.preferredStyles,
                avoidedStyles=dto.fitData.avoidedStyles,
                preferredClothingTypes=dto.fitData.preferredClothingTypes,
                avoidedClothingTypes=dto.fitData.avoidedClothingTypes,
                preferredColors=dto.fitData.preferredColors,
                avoidedColors=dto.fitData.avoidedColors,
                occasions=dto.fitData.occasions,
                primaryOccasion=dto.fitData.primaryOccasion,
                budgetRange=dto.fitData.budgetRange,
                shoppingPriorities=dto.fitData.shoppingPriorities,
                fashionGoals=dto.fitData.fashionGoals,
            )

        recommendation_images = [
            RecommendationImageInput(
                id=img.id,
                imageUrl=img.imageUrl,
                createdAt=img.createdAt,
            )
            for img in dto.recommendationImages
        ]

        return UserEncoderInput(
            userId=dto.userId,
            profileCompleted=dto.profileCompleted,
            profile=profile,
            fitData=fit_data,
            profileImage=dto.profileImage,
            recommendationImages=recommendation_images,
        )
