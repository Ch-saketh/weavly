import base64
import io
import logging
from typing import Tuple, Optional
import httpx
from PIL import Image

logger = logging.getLogger("zyra.product_encoder.image_encoder.retrieval")

MAX_IMAGE_BYTES = 25 * 1024 * 1024  # 25MB safety limit
DEFAULT_TIMEOUT_SECONDS = 8.0


class ProductImageLoader:
    """
    Retrieves and decodes product images from HTTP/HTTPS URLs and base64 data URIs.
    Validates content types, image integrity, dimensions, and payload bounds.
    """

    def __init__(self, timeout: float = DEFAULT_TIMEOUT_SECONDS) -> None:
        self.timeout = timeout

    async def load_image_async(self, url: str) -> Tuple[Optional[Image.Image], Optional[str]]:
        """Asynchronously load and validate an image by URL or data URI."""
        url_clean = url.strip()
        if not url_clean:
            return None, "Empty image URL"

        # Handle base64 data URI
        if url_clean.startswith("data:image/"):
            return self._load_from_data_uri(url_clean)

        # Handle remote HTTP/HTTPS URL
        try:
            async with httpx.AsyncClient(timeout=self.timeout, follow_redirects=True) as client:
                response = await client.get(url_clean)

            if response.status_code != 200:
                return None, f"HTTP request failed with status code {response.status_code}"

            content_type = response.headers.get("content-type", "").lower()
            if "image" not in content_type and not url_clean.lower().endswith((".jpg", ".jpeg", ".png", ".webp", ".avif")):
                return None, f"Unsupported Content-Type header: '{content_type}'"

            raw_bytes = response.content
            if len(raw_bytes) > MAX_IMAGE_BYTES:
                return None, f"Image payload exceeds maximum limit of 25MB (size={len(raw_bytes)} bytes)"

            return self._decode_pil_image(raw_bytes)

        except httpx.TimeoutException:
            return None, f"Connection timed out after {self.timeout}s fetching {url_clean}"
        except httpx.RequestError as req_err:
            return None, f"Network request error: {str(req_err)}"
        except Exception as exc:
            return None, f"Unexpected error reading image: {str(exc)}"

    def load_image_sync(self, url: str) -> Tuple[Optional[Image.Image], Optional[str]]:
        """Synchronously load and validate an image by URL or data URI."""
        url_clean = url.strip()
        if not url_clean:
            return None, "Empty image URL"

        if url_clean.startswith("data:image/"):
            return self._load_from_data_uri(url_clean)

        try:
            with httpx.Client(timeout=self.timeout, follow_redirects=True) as client:
                response = client.get(url_clean)

            if response.status_code != 200:
                return None, f"HTTP request failed with status code {response.status_code}"

            content_type = response.headers.get("content-type", "").lower()
            if "image" not in content_type and not url_clean.lower().endswith((".jpg", ".jpeg", ".png", ".webp", ".avif")):
                return None, f"Unsupported Content-Type header: '{content_type}'"

            raw_bytes = response.content
            if len(raw_bytes) > MAX_IMAGE_BYTES:
                return None, f"Image payload exceeds 25MB limit (size={len(raw_bytes)} bytes)"

            return self._decode_pil_image(raw_bytes)

        except httpx.TimeoutException:
            return None, f"Connection timed out after {self.timeout}s fetching {url_clean}"
        except httpx.RequestError as req_err:
            return None, f"Network request error: {str(req_err)}"
        except Exception as exc:
            return None, f"Unexpected error reading image: {str(exc)}"

    def _load_from_data_uri(self, data_uri: str) -> Tuple[Optional[Image.Image], Optional[str]]:
        """Decode base64 data URI."""
        try:
            header, base64_data = data_uri.split(",", 1)
            raw_bytes = base64.b64decode(base64_data)
            return self._decode_pil_image(raw_bytes)
        except Exception as exc:
            return None, f"Failed to parse base64 data URI: {str(exc)}"

    def _decode_pil_image(self, raw_bytes: bytes) -> Tuple[Optional[Image.Image], Optional[str]]:
        """Validate and construct PIL RGB Image."""
        try:
            image = Image.open(io.BytesIO(raw_bytes))
            image.load()  # Verify byte integrity

            if image.width <= 0 or image.height <= 0:
                return None, f"Invalid image dimensions: {image.width}x{image.height}"

            # Convert to standard RGB
            if image.mode != "RGB":
                image = image.convert("RGB")

            return image, None
        except Exception as exc:
            return None, f"Failed to decode image bytes: {str(exc)}"
