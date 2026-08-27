import logging
from typing import Optional, Dict, Any
import httpx

logger = logging.getLogger("zyra.clients.http")


class HttpClientError(Exception):
    """Base exception for HTTP client failures."""

    def __init__(self, message: str, status_code: Optional[int] = None, response_data: Any = None):
        super().__init__(message)
        self.status_code = status_code
        self.response_data = response_data


class HttpResourceNotFoundError(HttpClientError):
    """Raised when resource returns 404."""
    pass


class HttpConnectionError(HttpClientError):
    """Raised when server cannot be reached."""
    pass


class BaseHttpClient:
    """Reusable async HTTP client wrapper with robust error translation."""

    def __init__(
        self,
        base_url: str,
        timeout_seconds: float = 10.0,
        headers: Optional[Dict[str, str]] = None,
    ) -> None:
        self.base_url = base_url.rstrip("/")
        self.timeout_seconds = timeout_seconds
        self.default_headers = headers or {"Accept": "application/json"}
        self._client: Optional[httpx.AsyncClient] = None

    async def get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                base_url=self.base_url,
                timeout=httpx.Timeout(self.timeout_seconds),
                headers=self.default_headers,
            )
        return self._client

    async def close(self) -> None:
        if self._client and not self._client.is_closed:
            await self._client.aclose()
            self._client = None

    async def get(self, path: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Perform GET request with automatic error mapping."""
        client = await self.get_client()
        url_path = f"/{path.lstrip('/')}"
        try:
            response = await client.get(url_path, params=params)
            if response.status_code == 404:
                raise HttpResourceNotFoundError(
                    f"Resource at '{url_path}' not found (404).",
                    status_code=404,
                )
            if response.is_error:
                raise HttpClientError(
                    f"HTTP error {response.status_code} fetching '{url_path}': {response.text}",
                    status_code=response.status_code,
                    response_data=response.text,
                )
            return response.json()
        except httpx.ConnectError as exc:
            logger.error("Connection failure connecting to '%s%s': %s", self.base_url, url_path, exc)
            raise HttpConnectionError(f"Cannot connect to backend server at '{self.base_url}': {exc}") from exc
        except httpx.TimeoutException as exc:
            logger.error("Timeout fetching '%s%s': %s", self.base_url, url_path, exc)
            raise HttpClientError(f"Timeout waiting for response from '{self.base_url}{url_path}' after {self.timeout_seconds}s") from exc
