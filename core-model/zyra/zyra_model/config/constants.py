"""Constants and version definitions for ZYRA-MODEL V0."""

ZYRA_MODEL_VERSION: str = "v0"
SCHEMA_VERSION: str = "v1"

# Vector and candidate dimensions
UNIFIED_VECTOR_DIMENSION: int = 662
RETRIEVAL_TOP_K: int = 50
DEFAULT_RECOMMENDATION_LIMIT: int = 10

# Default scoring weights for Model 3 Ranker
DEFAULT_RETRIEVAL_WEIGHT: float = 0.20
DEFAULT_PERSON_GARMENT_WEIGHT: float = 0.35
DEFAULT_OUTFIT_WEIGHT: float = 0.20
DEFAULT_OCCASION_WEIGHT: float = 0.25

# Default component weights for Model 2 (Person-Garment Suitability)
DEFAULT_PG_FIT_WEIGHT: float = 0.25
DEFAULT_PG_PREFERENCE_WEIGHT: float = 0.35
DEFAULT_PG_VISUAL_WEIGHT: float = 0.40

# Supported occasion defaults
DEFAULT_OCCASIONS = [
    "college",
    "casual",
    "party",
    "formal",
    "wedding",
    "date",
    "work",
    "sport",
]
