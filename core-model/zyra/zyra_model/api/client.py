import logging
from typing import Optional, List, Dict, Any
import httpx

from zyra.zyra_model.config.constants import DEFAULT_RECOMMENDATION_LIMIT

logger = logging.getLogger("zyra.zyra_model.api.client")


class ZyraRecommendationClient:
    """
    Client for Weavly services and ZeraCollection frontend integration.
    
    Provides standard methods to communicate with the Zyra Recommendation API.
    """

    def __init__(
        self,
        base_url: str = "http://localhost:8001",
        timeout: float = 10.0,
        auth_token: Optional[str] = None,
    ) -> None:
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.auth_token = auth_token

    def _get_headers(self) -> Dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self.auth_token:
            headers["Authorization"] = f"Bearer {self.auth_token}"
        return headers

    async def get_recommendations(
        self,
        user_id: str,
        occasion: str = "casual",
        limit: int = DEFAULT_RECOMMENDATION_LIMIT,
        force_refresh: bool = False,
    ) -> Dict[str, Any]:
        """
        Request Top-10 personalized recommendations for a user and occasion.
        """
        url = f"{self.base_url}/api/v1/zyra/recommendations"
        payload = {
            "userId": user_id,
            "occasion": occasion,
            "limit": min(limit, 10),
            "forceRefresh": force_refresh,
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(url, json=payload, headers=self._get_headers())
            response.raise_for_status()
            return response.json()

    async def get_multi_recommendations(
        self,
        user_id: str,
        occasions: List[str],
        limit: int = DEFAULT_RECOMMENDATION_LIMIT,
        force_refresh: bool = False,
    ) -> Dict[str, Any]:
        """
        Request Top-10 recommendations across multiple occasions.
        """
        url = f"{self.base_url}/api/v1/zyra/recommendations/multi"
        payload = {
            "userId": user_id,
            "occasions": occasions,
            "limit": min(limit, 10),
            "forceRefresh": force_refresh,
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(url, json=payload, headers=self._get_headers())
            response.raise_for_status()
            return response.json()

    async def check_health(self) -> bool:
        """Check if Zyra Recommendation API service is healthy."""
        url = f"{self.base_url}/api/v1/zyra/health"
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                response = await client.get(url)
                return response.status_code == 200
        except Exception as exc:
            logger.warning("Zyra health check failed: %s", exc)
            return False
