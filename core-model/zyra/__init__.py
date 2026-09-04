"""Zyra Fashion Recommendation Intelligence System."""

from zyra.config import ZyraConfig
from zyra.engine import ZyraV1
from zyra.persistence import RecommendationPersistenceService
from zyra.zyra_v2 import ZyraV2

__version__ = "2.0.0"

__all__ = [
    "ZyraV1",
    "ZyraV2",
    "ZyraConfig",
    "RecommendationPersistenceService",
]
