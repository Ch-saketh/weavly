"""Product Encoder Constants and Version Manifest."""

# Version identifiers
PRODUCT_ENCODER_VERSION: str = "v0-foundation"
SCHEMA_VERSION: str = "v1"
IMAGE_ENCODER_VERSION: str = "v0-foundation"
TEXT_ENCODER_VERSION: str = "v0-foundation"
ATTRIBUTE_ENCODER_VERSION: str = "v0-foundation"
FUSION_VERSION: str = "v0-foundation"
EMBEDDING_VERSION: str = "v0-foundation"

# Future embedding vector dimensions (contracts)
PRODUCT_VISUAL_EMBEDDING_DIM: int = 512
PRODUCT_TEXT_EMBEDDING_DIM: int = 512
PRODUCT_ATTRIBUTE_EMBEDDING_DIM: int = 128
PRODUCT_UNIFIED_EMBEDDING_DIM: int = 662  # Matches user representation space

# Image limits
MAX_PRODUCT_IMAGES: int = 12
DEFAULT_IMAGE_TIMEOUT_SECONDS: float = 10.0

# Supported image view types
VALID_IMAGE_VIEW_TYPES = [
    "front",
    "back",
    "side",
    "detail",
    "close_up",
    "flat_lay",
    "on_model",
    "outfit",
    "additional",
]
