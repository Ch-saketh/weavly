import logging
from typing import Optional, List, Dict, Any, Union

from zyra.zyra_model.config.constants import (
    DEFAULT_OCCASIONS,
    DEFAULT_RECOMMENDATION_LIMIT,
    RETRIEVAL_TOP_K,
    ZYRA_MODEL_VERSION,
)
from zyra.zyra_model.contracts.user_contract import ZyraUserInput, ZyraUserRepresentation
from zyra.zyra_model.contracts.candidate_contract import CandidateProduct, CandidateSet
from zyra.zyra_model.retrieval.interface import AbstractCandidateRetriever
from zyra.zyra_model.retrieval.hydration import AbstractProductHydrator
from zyra.zyra_model.models.outfit_compatibility.model import OutfitCompatibilityModel
from zyra.zyra_model.models.person_garment.model import PersonGarmentSuitabilityModel
from zyra.zyra_model.models.occasion.model import OccasionCompatibilityModel
from zyra.zyra_model.models.ranking.ranker import (
    ZyraRecommendationRanker,
    CandidateEvaluationInput,
    RankedCandidateSet,
)
from zyra.zyra_model.recommendation.generator import (
    Top10RecommendationGenerator,
    RecommendationItem,
    ZyraRecommendationResponse,
    ZyraMultiOccasionRecommendationResponse,
)
from zyra.zyra_model.recommendation.exceptions import (
    InvalidUserInputException,
    CandidateRetrievalException,
    CandidateHydrationException,
    ModelInferenceException,
)

logger = logging.getLogger("zyra.zyra_model.recommendation.engine")


class ZyraRecommendationEngine:
    """
    End-to-End Zyra Intelligence Recommendation Engine.
    
    Orchestrates the single and multi-occasion recommendation pipeline:
    1. Product Retrieval Engine (Qdrant 662D vector retrieval -> 50 candidates)
    2. Candidate Product Hydrator (PostgreSQL profile + vector hydration)
    3. Intelligence Model Evaluation:
       - Model 1: Garment / Outfit Compatibility
       - Model 2: Person x Garment Suitability
       - Occasion Compatibility Model
    4. Model 3: Final Recommendation Ranker (All 50 candidates ranked descending)
    5. Top-K Recommendation Generator (Extracts final Top-K, default 10)
    """

    def __init__(
        self,
        retriever: AbstractCandidateRetriever,
        hydrator: AbstractProductHydrator,
        outfit_model: Optional[OutfitCompatibilityModel] = None,
        person_garment_model: Optional[PersonGarmentSuitabilityModel] = None,
        occasion_model: Optional[OccasionCompatibilityModel] = None,
        ranker: Optional[ZyraRecommendationRanker] = None,
        generator: Optional[Top10RecommendationGenerator] = None,
        supported_occasions: Optional[List[str]] = None,
    ) -> None:
        self.retriever = retriever
        self.hydrator = hydrator
        self.outfit_model = outfit_model or OutfitCompatibilityModel()
        self.person_garment_model = person_garment_model or PersonGarmentSuitabilityModel()
        self.occasion_model = occasion_model or OccasionCompatibilityModel()
        self.ranker = ranker or ZyraRecommendationRanker()
        self.generator = generator or Top10RecommendationGenerator()
        self.supported_occasions = set(supported_occasions or DEFAULT_OCCASIONS)

    def _normalize_user(
        self,
        user: Union[ZyraUserInput, ZyraUserRepresentation, Dict[str, Any]],
    ) -> ZyraUserRepresentation:
        """Helper to ensure user is validated into a ZyraUserRepresentation."""
        if isinstance(user, ZyraUserRepresentation):
            return user
        if isinstance(user, ZyraUserInput):
            return user.to_representation()
        if isinstance(user, dict):
            return ZyraUserInput(**user).to_representation()
        raise InvalidUserInputException(f"Unsupported user input type: {type(user)}")

    async def recommend(
        self,
        user: Union[ZyraUserInput, ZyraUserRepresentation, Dict[str, Any]],
        occasion: str,
        limit: int = DEFAULT_RECOMMENDATION_LIMIT,
        retrieval_limit: int = RETRIEVAL_TOP_K,
        gender: Optional[str] = None,
    ) -> ZyraRecommendationResponse:
        """
        Execute full intelligence recommendation pipeline for a single occasion (alias for recommend_for_occasion).
        """
        return await self.recommend_for_occasion(
            user=user,
            occasion=occasion,
            limit=limit,
            retrieval_limit=retrieval_limit,
            gender=gender,
        )

    async def recommend_for_occasion(
        self,
        user: Union[ZyraUserInput, ZyraUserRepresentation, Dict[str, Any]],
        occasion: str,
        limit: int = DEFAULT_RECOMMENDATION_LIMIT,
        retrieval_limit: int = RETRIEVAL_TOP_K,
        gender: Optional[str] = None,
    ) -> ZyraRecommendationResponse:
        """
        Execute full intelligence recommendation pipeline for a single occasion.
        """
        user_rep = self._normalize_user(user)

        norm_occasion = occasion.strip().lower() if isinstance(occasion, str) else ""
        if not norm_occasion or norm_occasion not in self.supported_occasions:
            raise InvalidUserInputException(
                f"Invalid or unsupported occasion: '{occasion}'. Supported: {sorted(list(self.supported_occasions))}",
                details={"occasion": occasion, "supported_occasions": list(self.supported_occasions)},
            )

        # 1. Retrieve Candidate IDs from Vector Database
        try:
            retrieval_candidates = await self.retriever.retrieve(
                user_embedding=user_rep.user_embedding,
                limit=retrieval_limit,
            )
        except Exception as e:
            if isinstance(e, InvalidUserInputException):
                raise
            logger.error("Failed to retrieve candidate products: %s", e)
            raise CandidateRetrievalException(f"Candidate retrieval failed: {str(e)}") from e

        # 2. Hydrate Candidates from PostgreSQL & Vector Payload
        try:
            candidate_set: CandidateSet = await self.hydrator.hydrate(retrieval_candidates)
        except Exception as e:
            logger.error("Failed to hydrate candidate products: %s", e)
            raise CandidateHydrationException(f"Candidate hydration failed: {str(e)}") from e

        # 2b. Gender filtering — only keep products that strictly match user gender (or are unisex)
        if gender:
            norm_gender = gender.strip().lower()
            MALE_TERMS = {"male", "men", "man"}
            FEMALE_TERMS = {"female", "women", "woman"}
            KIDS_TERMS = {"kids", "boy", "boys", "girl", "girls"}

            def _gender_matches(profile: dict) -> bool:
                pg = (profile.get("gender") or "").lower().strip()
                if not pg or pg == "unisex":
                    return True
                if norm_gender in MALE_TERMS:
                    return pg in MALE_TERMS or (pg == "unisex" and profile.get("category") != "Dresses")
                if norm_gender in FEMALE_TERMS:
                    return pg in FEMALE_TERMS or pg == "unisex"
                if norm_gender in KIDS_TERMS:
                    return pg in KIDS_TERMS or pg == "unisex"
                return True

            filtered_items = [c for c in candidate_set.items if _gender_matches(c.product_profile or {})]
            candidate_set = CandidateSet(
                candidates=filtered_items,
                total_retrieved=candidate_set.total_retrieved,
                total_hydrated=len(filtered_items),
            )
            logger.info("Gender filter '%s': %d/%d candidates remain", norm_gender, len(filtered_items), candidate_set.total_retrieved)

        if candidate_set.total_candidates == 0:
            logger.warning("No hydrated candidates found for user %s", user_rep.user_id)
            return ZyraRecommendationResponse(
                user_id=user_rep.user_id,
                occasion=norm_occasion,
                total_recommendations=0,
                recommendations=[],
                version=ZYRA_MODEL_VERSION,
            )

        # 3. Intelligence Model Evaluation
        evaluation_inputs: List[CandidateEvaluationInput] = []
        try:
            for cand in candidate_set.items:
                # Model 1: Outfit Compatibility (Standalone versatility evaluation)
                outfit_score = self.outfit_model.score_candidate(cand)

                # Model 2: Person x Garment Suitability
                pg_score_obj = self.person_garment_model.evaluate(user_rep, cand)

                # Occasion Compatibility
                occ_score_obj = self.occasion_model.evaluate(norm_occasion, cand, user_rep)

                evaluation_inputs.append(
                    CandidateEvaluationInput(
                        product_id=cand.product_id,
                        retrieval_score=cand.retrieval_score,
                        person_garment_score=pg_score_obj.person_garment_score,
                        outfit_compatibility_score=outfit_score,
                        occasion_score=occ_score_obj.occasion_score,
                        product_profile=cand.product_profile,
                        metadata=cand.metadata,
                    )
                )
        except Exception as e:
            logger.error("Intelligence model scoring failed: %s", e)
            raise ModelInferenceException(f"Model scoring failed: {str(e)}") from e

        # 4. Final Ranking (All 50 Candidates)
        ranked_set: RankedCandidateSet = self.ranker.rank(
            candidates=evaluation_inputs,
            user_id=user_rep.user_id,
            occasion=norm_occasion,
        )

        # 5. Top-K Recommendation Selection
        response: ZyraRecommendationResponse = self.generator.generate(
            ranked_candidates=ranked_set,
            user_id=user_rep.user_id,
            occasion=norm_occasion,
            limit=limit,
        )

        return response

    async def recommend_multi_occasion(
        self,
        user: Union[ZyraUserInput, ZyraUserRepresentation, Dict[str, Any]],
        occasions: List[str],
        limit: int = DEFAULT_RECOMMENDATION_LIMIT,
        retrieval_limit: int = RETRIEVAL_TOP_K,
    ) -> ZyraMultiOccasionRecommendationResponse:
        """
        Execute multi-occasion recommendation generation for a user.
        
        Evaluates each requested occasion independently to produce dedicated Top-10 sets.
        """
        user_rep = self._normalize_user(user)

        if not occasions or not isinstance(occasions, list) or len(occasions) == 0:
            raise InvalidUserInputException("Occasions list must be a non-empty list of strings")

        # Deduplicate occasions while preserving requested order
        seen = set()
        clean_occasions: List[str] = []
        for occ in occasions:
            if not isinstance(occ, str) or not occ.strip():
                raise InvalidUserInputException(f"Invalid occasion in list: '{occ}'")
            norm_occ = occ.strip().lower()
            if norm_occ not in self.supported_occasions:
                raise InvalidUserInputException(
                    f"Unsupported occasion '{occ}'. Supported: {sorted(list(self.supported_occasions))}",
                    details={"occasion": occ, "supported_occasions": list(self.supported_occasions)},
                )
            if norm_occ not in seen:
                seen.add(norm_occ)
                clean_occasions.append(norm_occ)

        # Execute recommendation generation independently per occasion
        results_map: Dict[str, List[RecommendationItem]] = {}
        for occ in clean_occasions:
            occ_response = await self.recommend_for_occasion(
                user=user_rep,
                occasion=occ,
                limit=limit,
                retrieval_limit=retrieval_limit,
            )
            results_map[occ] = occ_response.recommendations

        return ZyraMultiOccasionRecommendationResponse(
            user_id=user_rep.user_id,
            recommendations=results_map,
            total_occasions=len(results_map),
            version=ZYRA_MODEL_VERSION,
        )
