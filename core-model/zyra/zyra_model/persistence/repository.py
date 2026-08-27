import uuid
import datetime
from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any, Union

from zyra.zyra_model.config.constants import ZYRA_MODEL_VERSION
from zyra.zyra_model.recommendation.generator import (
    RecommendationItem,
    ZyraRecommendationResponse,
    ZyraMultiOccasionRecommendationResponse,
)
from zyra.zyra_model.recommendation.exceptions import (
    InvalidUserInputException,
    RecommendationPersistenceException,
)


class AbstractRecommendationRepository(ABC):
    """Abstract interface for persisting and querying generated Zyra recommendations."""

    @abstractmethod
    async def save_recommendations(
        self,
        user_id: str,
        occasion: str,
        recommendations: List[Union[RecommendationItem, Dict[str, Any]]],
        model_version: str = ZYRA_MODEL_VERSION,
        status: str = "CURRENT",
    ) -> List[Dict[str, Any]]:
        """Atomically persist or replace recommendations for a user and occasion."""
        pass

    @abstractmethod
    async def save_multi_occasion_recommendations(
        self,
        user_id: str,
        recommendations_map: Dict[str, List[Union[RecommendationItem, Dict[str, Any]]]],
        model_version: str = ZYRA_MODEL_VERSION,
        status: str = "CURRENT",
    ) -> Dict[str, List[Dict[str, Any]]]:
        """Atomically persist multi-occasion recommendation sets for a user."""
        pass

    @abstractmethod
    async def get_recommendations_by_user(
        self,
        user_id: str,
        status: str = "CURRENT",
    ) -> Dict[str, List[Dict[str, Any]]]:
        """Fetch all recommendations for a user grouped by occasion."""
        pass

    @abstractmethod
    async def get_recommendations_by_user_and_occasion(
        self,
        user_id: str,
        occasion: str,
        status: str = "CURRENT",
    ) -> List[Dict[str, Any]]:
        """Fetch all recommendations for a specific user and occasion ordered by rank."""
        pass

    @abstractmethod
    async def replace_current_recommendations(
        self,
        user_id: str,
        occasion: str,
        recommendations: List[Union[RecommendationItem, Dict[str, Any]]],
        model_version: str = ZYRA_MODEL_VERSION,
    ) -> List[Dict[str, Any]]:
        """Safely transition old CURRENT recommendations to HISTORICAL and insert new CURRENT recommendations."""
        pass

    @abstractmethod
    async def check_health(self) -> bool:
        """Check database connectivity."""
        pass


class MockRecommendationRepository(AbstractRecommendationRepository):
    """
    In-memory mock repository for unit and integration testing.
    
    Provides atomic transactions, state rollbacks, and query filtering.
    """

    def __init__(self, simulate_error: bool = False) -> None:
        # Internal storage: id -> dict
        self._records: Dict[str, Dict[str, Any]] = {}
        self.simulate_error = simulate_error

    def clear(self) -> None:
        self._records.clear()

    async def check_health(self) -> bool:
        return not self.simulate_error

    def _extract_item_dict(
        self,
        user_id: str,
        occasion: str,
        item: Union[RecommendationItem, Dict[str, Any]],
        model_version: str,
        status: str,
    ) -> Dict[str, Any]:
        """Helper to assemble a standardized recommendation row dict."""
        now_str = datetime.datetime.now(datetime.timezone.utc).isoformat()

        if isinstance(item, RecommendationItem):
            pid = item.product_id
            rank = item.rank
            score = item.final_suitability_score
            metadata = {
                "retrieval_score": item.retrieval_score,
                "person_garment_score": item.person_garment_score,
                "outfit_compatibility_score": item.outfit_compatibility_score,
                "occasion_score": item.occasion_score,
                "final_suitability_score": item.final_suitability_score,
                "score_breakdown": item.score_breakdown.model_dump(),
                "product_profile": item.product_profile,
                "metadata": item.metadata,
            }
        elif isinstance(item, dict):
            pid = str(item.get("product_id") or item.get("productId"))
            rank = int(item.get("rank", 1))
            score = float(item.get("final_suitability_score") or item.get("score", 0.0))
            metadata = item.get("recommendation_metadata") or item.get("metadata") or {
                "retrieval_score": item.get("retrieval_score"),
                "person_garment_score": item.get("person_garment_score"),
                "outfit_compatibility_score": item.get("outfit_compatibility_score"),
                "occasion_score": item.get("occasion_score"),
                "final_suitability_score": score,
            }
        else:
            raise InvalidUserInputException(f"Unsupported recommendation item type: {type(item)}")

        rec_id = str(uuid.uuid4())
        return {
            "id": rec_id,
            "user_id": user_id,
            "product_id": pid,
            "occasion": occasion,
            "score": score,
            "rank": rank,
            "reason": f"Top recommendation for {occasion} (Rank #{rank})",
            "recommendation_metadata": metadata,
            "model_version": model_version,
            "status": status,
            "generated_at": now_str,
            "updated_at": now_str,
        }

    async def save_recommendations(
        self,
        user_id: str,
        occasion: str,
        recommendations: List[Union[RecommendationItem, Dict[str, Any]]],
        model_version: str = ZYRA_MODEL_VERSION,
        status: str = "CURRENT",
    ) -> List[Dict[str, Any]]:
        if self.simulate_error:
            raise RecommendationPersistenceException("Simulated database failure during recommendation save")

        # Snapshot for atomic rollback simulation
        backup = dict(self._records)

        try:
            # Transition old CURRENT records for this user+occasion to HISTORICAL
            if status == "CURRENT":
                for rid, row in self._records.items():
                    if row["user_id"] == user_id and row["occasion"] == occasion and row["status"] == "CURRENT":
                        row["status"] = "HISTORICAL"
                        row["updated_at"] = datetime.datetime.now(datetime.timezone.utc).isoformat()

            saved_rows: List[Dict[str, Any]] = []
            for item in recommendations:
                row = self._extract_item_dict(user_id, occasion, item, model_version, status)
                self._records[row["id"]] = row
                saved_rows.append(row)

            # Sort by rank ascending
            saved_rows.sort(key=lambda r: r["rank"])
            return saved_rows
        except Exception as e:
            # Atomic rollback
            self._records = backup
            raise RecommendationPersistenceException(f"Failed to save recommendations: {str(e)}") from e

    async def replace_current_recommendations(
        self,
        user_id: str,
        occasion: str,
        recommendations: List[Union[RecommendationItem, Dict[str, Any]]],
        model_version: str = ZYRA_MODEL_VERSION,
    ) -> List[Dict[str, Any]]:
        return await self.save_recommendations(
            user_id=user_id,
            occasion=occasion,
            recommendations=recommendations,
            model_version=model_version,
            status="CURRENT",
        )

    async def save_multi_occasion_recommendations(
        self,
        user_id: str,
        recommendations_map: Dict[str, List[Union[RecommendationItem, Dict[str, Any]]]],
        model_version: str = ZYRA_MODEL_VERSION,
        status: str = "CURRENT",
    ) -> Dict[str, List[Dict[str, Any]]]:
        if self.simulate_error:
            raise RecommendationPersistenceException("Simulated database failure during multi-occasion save")

        # Atomic transaction across all occasions
        backup = dict(self._records)
        try:
            results: Dict[str, List[Dict[str, Any]]] = {}
            for occ, recs in recommendations_map.items():
                results[occ] = await self.save_recommendations(
                    user_id=user_id,
                    occasion=occ,
                    recommendations=recs,
                    model_version=model_version,
                    status=status,
                )
            return results
        except Exception as e:
            self._records = backup
            raise RecommendationPersistenceException(f"Failed multi-occasion save: {str(e)}") from e

    async def get_recommendations_by_user(
        self,
        user_id: str,
        status: str = "CURRENT",
    ) -> Dict[str, List[Dict[str, Any]]]:
        grouped: Dict[str, List[Dict[str, Any]]] = {}
        for row in self._records.values():
            if row["user_id"] == user_id and (status is None or row["status"] == status):
                occ = row["occasion"]
                if occ not in grouped:
                    grouped[occ] = []
                grouped[occ].append(row)

        for occ in grouped:
            grouped[occ].sort(key=lambda r: r["rank"])

        return grouped

    async def get_recommendations_by_user_and_occasion(
        self,
        user_id: str,
        occasion: str,
        status: str = "CURRENT",
    ) -> List[Dict[str, Any]]:
        matched = [
            row for row in self._records.values()
            if row["user_id"] == user_id and row["occasion"] == occasion and (status is None or row["status"] == status)
        ]
        matched.sort(key=lambda r: r["rank"])
        return matched
