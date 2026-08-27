import io
import logging
from typing import Optional, Tuple
import httpx
from PIL import Image

from zyra.user_encoder.image_encoder.constants import (
    MAX_IMAGE_SIZE_BYTES,
    MIN_IMAGE_DIMENSION,
    MAX_IMAGE_DIMENSION,
    DOWNLOAD_TIMEOUT_SECONDS,
    SUPPORTED_MIME_TYPES,
)

logger = logging.getLogger("zyra.image_encoder.retrieval")


class ImageRetrievalError(Exception):
    """Raised when an image URL cannot be fetched or resolved."""
    pass


class ImageDecodeError(Exception):
    """Raised when image bytes cannot be decoded into a valid PIL Image."""
    pass


class ImageValidationError(Exception):
    """Raised when an image fails format, size, or dimension validation."""
    pass


class ImageRetriever:
    """Safely retrieves and validates images from remote URLs into in-memory PIL Images."""

    def __init__(self, timeout: float = DOWNLOAD_TIMEOUT_SECONDS) -> None:
        self.timeout = timeout

    async def fetch_and_validate(
        self,
        image_url: str,
        image_id: Optional[str] = None,
    ) -> Tuple[Image.Image, dict]:
        """Download image, validate size/format/dimensions, and return in-memory RGB PIL Image with metadata."""
        if not image_url or not image_url.strip():
            raise ImageValidationError("Image URL is empty or missing.")

        clean_url = image_url.strip()
        logger.info("Fetching image [id=%s] from URL: %s", image_id or "unknown", clean_url)

        try:
            async with httpx.AsyncClient(timeout=self.timeout, follow_redirects=True) as client:
                response = await client.get(clean_url)
                if response.status_code != 200:
                    raise ImageRetrievalError(
                        f"HTTP {response.status_code} while downloading image from {clean_url}"
                    )
                content_bytes = response.content
                content_type = response.headers.get("content-type", "").split(";")[0].strip().lower()

        except httpx.RequestError as exc:
            logger.warning("Network request failed for image %s: %s", clean_url, exc)
            raise ImageRetrievalError(f"Network error fetching image: {exc}") from exc

        # 1. Payload Size Check
        size_bytes = len(content_bytes)
        if size_bytes == 0:
            raise ImageValidationError("Downloaded image payload is empty (0 bytes).")
        if size_bytes > MAX_IMAGE_SIZE_BYTES:
            raise ImageValidationError(
                f"Image size ({size_bytes / (1024*1024):.2f} MB) exceeds maximum allowed {MAX_IMAGE_SIZE_BYTES / (1024*1024)} MB."
            )

        # 2. Content-Type Check (if present in header)
        if content_type and content_type not in SUPPORTED_MIME_TYPES and not content_type.startswith("image/"):
            raise ImageValidationError(
                f"Unsupported content-type '{content_type}'. Supported: {SUPPORTED_MIME_TYPES}"
            )

        # 3. In-memory Decoding
        try:
            image_stream = io.BytesIO(content_bytes)
            pil_image = Image.open(image_stream)
            pil_image.load()  # Force load image data to catch truncation/corruption
        except Exception as exc:
            logger.warning("Failed to decode image from %s: %s", clean_url, exc)
            raise ImageDecodeError(f"Corrupted or undecodable image bytes: {exc}") from exc

        # 4. Color Mode & Format Normalization (Convert RGBA/Grayscale/CMYK to RGB)
        if pil_image.mode != "RGB":
            pil_image = pil_image.convert("RGB")

        # 5. Dimension Verification
        width, height = pil_image.size
        if width < MIN_IMAGE_DIMENSION or height < MIN_IMAGE_DIMENSION:
            raise ImageValidationError(
                f"Image dimensions ({width}x{height}) are smaller than minimum allowed {MIN_IMAGE_DIMENSION}x{MIN_IMAGE_DIMENSION}."
            )
        if width > MAX_IMAGE_DIMENSION or height > MAX_IMAGE_DIMENSION:
            logger.info("Resizing oversized image %dx%d down to max %d", width, height, MAX_IMAGE_DIMENSION)
            pil_image.thumbnail((MAX_IMAGE_DIMENSION, MAX_IMAGE_DIMENSION), Image.Resampling.LANCZOS)
            width, height = pil_image.size

        metadata = {
            "width": width,
            "height": height,
            "sizeBytes": size_bytes,
            "format": pil_image.format or "JPEG",
            "mode": pil_image.mode,
            "url": clean_url,
        }

        logger.info(
            "Successfully fetched and validated image [id=%s]: %dx%d (%d KB)",
            image_id or "unknown",
            width,
            height,
            size_bytes // 1024,
        )
        return pil_image, metadata
