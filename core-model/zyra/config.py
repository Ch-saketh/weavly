"""Zyra V1 Recommendation Engine Configuration.

Frozen production parameters and configuration schema for Zyra V1.
"""

from dataclasses import dataclass, field
import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Union


# Default Frozen Production Constants
DEFAULT_ENGINE_VERSION = "zyra-v1-p9"
DEFAULT_CANDIDATE_K = 200
DEFAULT_FINAL_K = 50
DEFAULT_MINIMUM_SIMILARITY = 0.88
DEFAULT_EMBEDDING_DIMENSION = 662
DEFAULT_CATALOG_SIZE = 12465

DEFAULT_WEIGHTS = {
    "similarity": 0.55,
    "gender": 0.20,
    "category": 0.15,
    "brand": 0.05,
    "price": 0.05,
}

DEFAULT_DIVERSITY_PENALTIES = {
    "count0": 0.0,
    "count1": 0.015,
    "count2": 0.05,
    "count3Plus": 0.12,
}

DEFAULT_GENDER_COMPATIBILITY = {
    "Women": ["Women", "Unisex"],
    "Men": ["Men", "Unisex"],
    "Unisex": ["Women", "Men", "Unisex"],
    "Kids": ["Kids"],
}

DEFAULT_GENDER_NORMALIZATION = {
    "women": "Women",
    "men": "Men",
    "unisex": "Unisex",
    "kids": "Kids",
    "boys": "Kids",
    "girls": "Kids",
    "unisex kids": "Kids",
    "boy": "Kids",
    "girl": "Kids",
}


@dataclass
class ZyraConfig:
    """Frozen configuration dataclass for Zyra V1."""

    engine_version: str = DEFAULT_ENGINE_VERSION
    candidate_k: int = DEFAULT_CANDIDATE_K
    final_k: int = DEFAULT_FINAL_K
    minimum_similarity: float = DEFAULT_MINIMUM_SIMILARITY
    embedding_dimension: int = DEFAULT_EMBEDDING_DIMENSION
    catalog_size: int = DEFAULT_CATALOG_SIZE
    weights: Dict[str, float] = field(default_factory=lambda: dict(DEFAULT_WEIGHTS))
    diversity_penalties: Dict[str, float] = field(
        default_factory=lambda: dict(DEFAULT_DIVERSITY_PENALTIES)
    )
    gender_compatibility: Dict[str, List[str]] = field(
        default_factory=lambda: {k: list(v) for k, v in DEFAULT_GENDER_COMPATIBILITY.items()}
    )
    gender_normalization: Dict[str, str] = field(
        default_factory=lambda: dict(DEFAULT_GENDER_NORMALIZATION)
    )

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ZyraConfig":
        """Create ZyraConfig from a dictionary with flexible key naming."""
        config = cls()
        if "engineVersion" in data:
            config.engine_version = str(data["engineVersion"])
        elif "engine_version" in data:
            config.engine_version = str(data["engine_version"])

        if "candidateK" in data:
            config.candidate_k = int(data["candidateK"])
        elif "candidate_k" in data:
            config.candidate_k = int(data["candidate_k"])

        if "finalK" in data:
            config.final_k = int(data["finalK"])
        elif "final_k" in data:
            config.final_k = int(data["final_k"])

        if "minimumSimilarity" in data:
            config.minimum_similarity = float(data["minimumSimilarity"])
        elif "minimum_similarity" in data:
            config.minimum_similarity = float(data["minimum_similarity"])
        elif "min_similarity" in data:
            config.minimum_similarity = float(data["min_similarity"])

        if "embeddingDimension" in data:
            config.embedding_dimension = int(data["embeddingDimension"])
        elif "embedding_dimension" in data:
            config.embedding_dimension = int(data["embedding_dimension"])

        if "catalogSize" in data:
            config.catalog_size = int(data["catalogSize"])
        elif "catalog_size" in data:
            config.catalog_size = int(data["catalog_size"])

        if "weights" in data and isinstance(data["weights"], dict):
            config.weights.update({k: float(v) for k, v in data["weights"].items()})

        if "diversityPenalties" in data and isinstance(data["diversityPenalties"], dict):
            config.diversity_penalties.update(
                {k: float(v) for k, v in data["diversityPenalties"].items()}
            )
        elif "diversity_penalties" in data and isinstance(data["diversity_penalties"], dict):
            config.diversity_penalties.update(
                {k: float(v) for k, v in data["diversity_penalties"].items()}
            )

        if "genderCompatibility" in data and isinstance(data["genderCompatibility"], dict):
            config.gender_compatibility.update(data["genderCompatibility"])
        elif "gender_compatibility" in data and isinstance(data["gender_compatibility"], dict):
            config.gender_compatibility.update(data["gender_compatibility"])

        return config

    @classmethod
    def from_json_file(cls, file_path: Union[str, Path]) -> "ZyraConfig":
        """Load ZyraConfig from a json configuration file."""
        path = Path(file_path)
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return cls.from_dict(data)
