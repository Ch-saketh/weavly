"""Constants, source labels, and signal agreements for Phase U5 Insight Aggregation."""

from enum import Enum
from typing import List

INSIGHT_AGGREGATION_VERSION = "v1"

# Information Source Identifiers
SOURCE_QUESTIONNAIRE = "questionnaire"
SOURCE_IMAGE = "image"
SOURCE_BEHAVIOUR = "behaviour"
SOURCE_PROFILE = "profile"

ALL_SOURCES: List[str] = [
    SOURCE_QUESTIONNAIRE,
    SOURCE_IMAGE,
    SOURCE_BEHAVIOUR,
    SOURCE_PROFILE,
]


class SignalAgreementLevel(str, Enum):
    """Qualitative agreement level across independent modalities."""

    SINGLE_SOURCE = "single_source"
    MULTI_SOURCE = "multi_source"
    STRONGLY_SUPPORTED = "strongly_supported"


# Supported Canonical Fashion Identity Orientations (Strictly fashion, never psychological)
SUPPORTED_FASHION_IDENTITIES: List[str] = [
    "Minimalist-oriented",
    "Streetwear-oriented",
    "Casual-oriented",
    "Classic-oriented",
    "Trend-oriented",
    "Comfort-oriented",
    "Versatility-oriented",
    "Experimentation-oriented",
    "Fit-focused",
    "Quality-focused",
    "Budget-conscious",
]
