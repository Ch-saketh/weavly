"""Zyra V1 Standalone Recommendation Engine.

Encapsulates the validated P9/P10 production recommendation pipeline into a
self-contained, standalone class with zero global/notebook dependencies.
"""

import json
from pathlib import Path
import time
from typing import Any, Dict, List, Optional, Union
import numpy as np
import pandas as pd

from zyra.config import ZyraConfig
from zyra.metadata import (
    REQUIRED_METADATA_COLUMNS,
    compute_price_score,
    get_product_metadata,
    is_gender_compatible,
    normalize_gender,
    normalize_product_id,
    validate_metadata_dataframe,
)


class ZyraV1:
    """Standalone Zyra V1 Recommendation Engine."""

    def __init__(
        self,
        artifact_dir: Union[str, Path] = "p10_production_artifacts",
        config: Optional[ZyraConfig] = None,
    ) -> None:
        """Initialize and validate the Zyra V1 Engine from production artifacts.

        Parameters
        ----------
        artifact_dir : Union[str, Path]
            Path to the directory containing production artifacts.
        config : Optional[ZyraConfig]
            Engine configuration. If not provided, loads from zyra_v1_config.json
            or uses frozen production defaults.
        """
        self.artifact_dir = self._resolve_artifact_dir(artifact_dir)
        self._load_and_validate_artifacts(config)

    def _resolve_artifact_dir(self, artifact_dir: Union[str, Path]) -> Path:
        """Resolve path to production artifacts directory."""
        dir_path = Path(artifact_dir)
        if dir_path.is_dir():
            return dir_path.resolve()

        # Fallback relative to project root
        project_root = Path(__file__).resolve().parent.parent
        candidate = project_root / artifact_dir
        if candidate.is_dir():
            return candidate.resolve()

        raise FileNotFoundError(
            f"Production artifact directory not found: {artifact_dir}"
        )

    def _load_and_validate_artifacts(self, config: Optional[ZyraConfig]) -> None:
        """Load and strictly validate all production artifacts."""
        embeddings_path = self.artifact_dir / "product_embeddings.npy"
        metadata_path = self.artifact_dir / "product_metadata.csv"
        index_path = self.artifact_dir / "product_id_to_index.json"
        config_path = self.artifact_dir / "zyra_v1_config.json"
        manifest_path = self.artifact_dir / "manifest.json"

        # 1. Existence check
        for required_file in [embeddings_path, metadata_path, index_path, config_path]:
            if not required_file.is_file():
                raise FileNotFoundError(
                    f"Required production artifact missing: {required_file}"
                )

        # 2. Load Configuration
        if config is not None:
            self.config = config
        else:
            self.config = ZyraConfig.from_json_file(config_path)

        # Load Manifest if available
        self.manifest: Optional[Dict[str, Any]] = None
        if manifest_path.is_file():
            with open(manifest_path, "r", encoding="utf-8") as f:
                self.manifest = json.load(f)

        # 3. Load Embeddings
        self.embeddings: np.ndarray = np.load(embeddings_path, allow_pickle=False)

        # 4. Load Metadata
        self.metadata: pd.DataFrame = pd.read_csv(metadata_path)

        # 5. Load Index
        with open(index_path, "r", encoding="utf-8") as f:
            raw_index: Dict[str, Any] = json.load(f)
        self.product_id_to_index: Dict[str, int] = {
            normalize_product_id(k): int(v) for k, v in raw_index.items()
        }

        # 6. Strict Validations
        expected_products = self.config.catalog_size
        expected_dim = self.config.embedding_dimension

        # Dimensions
        if self.embeddings.ndim != 2:
            raise ValueError(
                f"Embeddings must be a 2D matrix, got ndim={self.embeddings.ndim}"
            )

        if self.embeddings.shape[0] != expected_products:
            raise ValueError(
                f"Embedding product count mismatch: expected {expected_products}, got {self.embeddings.shape[0]}"
            )

        if self.embeddings.shape[1] != expected_dim:
            raise ValueError(
                f"Embedding dimension mismatch: expected {expected_dim}, got {self.embeddings.shape[1]}"
            )

        # Numerical integrity
        if not np.isfinite(self.embeddings).all():
            raise ValueError("Embeddings matrix contains NaN or Inf values")

        norms = np.linalg.norm(self.embeddings, axis=1)
        if np.any(norms <= 0):
            raise ValueError("Zero-norm vector detected in embeddings matrix")

        # Metadata validation
        validate_metadata_dataframe(self.metadata, expected_count=expected_products)

        # Product index validation
        if len(self.product_id_to_index) != expected_products:
            raise ValueError(
                f"Product index count mismatch: expected {expected_products}, got {len(self.product_id_to_index)}"
            )

        # Clean metadata fields for fast retrieval
        self.metadata = self.metadata.copy()
        self.metadata["productId"] = (
            self.metadata["productId"].astype(str).str.strip()
        )
        self.metadata["name"] = self.metadata["name"].astype(str)
        self.metadata["brand_clean"] = (
            self.metadata["brand_clean"].astype(str).str.strip()
        )
        self.metadata["gender_clean"] = (
            self.metadata["gender_clean"].astype(str).str.strip()
        )
        self.metadata["category_clean"] = (
            self.metadata["category_clean"].astype(str).str.strip()
        )
        self.metadata["price_numeric"] = pd.to_numeric(
            self.metadata["price_numeric"], errors="coerce"
        ).fillna(0.0)

        # Validate index mapping & alignment with metadata
        for pid, idx in self.product_id_to_index.items():
            if not (0 <= idx < expected_products):
                raise ValueError(f"Index out of bounds for productId {pid}: {idx}")
            row_pid = self.metadata.iloc[idx]["productId"]
            if row_pid != pid:
                raise ValueError(
                    f"Product ordering mismatch: index {idx} has productId {row_pid}, expected {pid}"
                )

    def recommend(
        self,
        product_id: Any,
        top_k: int = 50,
        user_gender: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Generate top_k recommendations for a given query product.

        Parameters
        ----------
        product_id : Any
            The query product ID.
        top_k : int
            Number of recommendations to return (default 50, max 50).
        user_gender : Optional[str]
            Authenticated user profile gender constraint (e.g. 'Men', 'Women', 'Kids', 'Unisex').
            If provided, hard compatibility is enforced for the user. If None, query product gender is used.

        Returns
        -------
        Dict[str, Any]
            Standard response dictionary containing productId, modelVersion,
            and recommendations list.
        """
        start_time = time.perf_counter()

        # 1. Validate top_k
        if not isinstance(top_k, int) or top_k <= 0 or top_k > self.config.final_k:
            raise ValueError(
                f"Invalid top_k: {top_k}. Expected an integer between 1 and {self.config.final_k}."
            )

        # 2. Validate product_id
        if product_id is None:
            raise ValueError(f"Unknown productId: {product_id}")

        norm_product_id = normalize_product_id(product_id)
        if not norm_product_id or norm_product_id not in self.product_id_to_index:
            raise ValueError(f"Unknown productId: {product_id}")

        query_index = self.product_id_to_index[norm_product_id]
        query = self.metadata.iloc[query_index]
        query_gender = str(query["gender_clean"])
        query_brand = str(query["brand_clean"])
        query_category = str(query["category_clean"])
        query_price = float(query["price_numeric"])

        # 3. Query Embedding & Cosine Similarity
        query_embedding = self.embeddings[query_index]
        query_norm = np.linalg.norm(query_embedding)
        if query_norm > 1e-12:
            query_embedding = query_embedding / query_norm

        similarities = self.embeddings @ query_embedding

        # Exclude self
        similarities[query_index] = -np.inf

        # 4. Candidate Pool Retrieval (K = candidate_k, default 200)
        candidate_k = self.config.candidate_k
        available_count = len(similarities) - 1
        candidate_count = min(candidate_k, available_count)

        candidate_indices = np.argpartition(-similarities, candidate_count)[
            :candidate_count
        ]
        # Sort candidate indices by descending similarity
        candidate_indices = candidate_indices[
            np.argsort(-similarities[candidate_indices])
        ]

        # 5. HARD Gender Compatibility & Similarity Threshold Filtering
        target_gender = normalize_gender(user_gender) if user_gender else query_gender
        compatible_genders = set(
            self.config.gender_compatibility.get(target_gender, [target_gender])
        )
        min_similarity = self.config.minimum_similarity

        filtered_indices: List[int] = []
        filtered_similarities: List[float] = []

        for idx in candidate_indices:
            idx_int = int(idx)
            candidate = self.metadata.iloc[idx_int]
            candidate_gender = str(candidate["gender_clean"])
            sim = float(similarities[idx_int])

            if candidate_gender not in compatible_genders:
                continue

            if sim < min_similarity:
                continue

            filtered_indices.append(idx_int)
            filtered_similarities.append(sim)

        # Fallback if filtered candidates are fewer than requested top_k
        if len(filtered_indices) < top_k:
            filtered_indices = []
            filtered_similarities = []
            for idx in range(len(self.metadata)):
                if idx == query_index:
                    continue
                candidate = self.metadata.iloc[idx]
                candidate_gender = str(candidate["gender_clean"])
                if candidate_gender not in compatible_genders:
                    continue
                sim = float(similarities[idx])
                if sim < min_similarity:
                    continue
                filtered_indices.append(idx)
                filtered_similarities.append(sim)

            ordering = np.argsort(-np.asarray(filtered_similarities))
            filtered_indices = [filtered_indices[i] for i in ordering]
            filtered_similarities = [filtered_similarities[i] for i in ordering]

        # 6. Relevance Scoring
        weights = self.config.weights
        scored_candidates: List[Dict[str, Any]] = []

        for idx_int, sim in zip(filtered_indices, filtered_similarities):
            candidate = self.metadata.iloc[idx_int]
            candidate_brand = str(candidate["brand_clean"])
            candidate_category = str(candidate["category_clean"])
            candidate_gender = str(candidate["gender_clean"])
            candidate_price = float(candidate["price_numeric"])

            gender_score = 1.0 if candidate_gender in compatible_genders else 0.0
            category_score = 1.0 if candidate_category == query_category else 0.0
            brand_score = 1.0 if candidate_brand == query_brand else 0.0
            price_score = compute_price_score(query_price, candidate_price)

            relevance_score = (
                weights["similarity"] * sim
                + weights["gender"] * gender_score
                + weights["category"] * category_score
                + weights["brand"] * brand_score
                + weights["price"] * price_score
            )

            scored_candidates.append(
                {
                    "index": idx_int,
                    "similarity": float(sim),
                    "relevanceScore": float(relevance_score),
                }
            )

        # 7. Diversity Reranking (Greedy selection with brand penalties)
        diversity_penalties = self.config.diversity_penalties
        remaining = list(range(len(scored_candidates)))
        selected_candidates: List[Dict[str, Any]] = []
        brand_counts: Dict[str, int] = {}

        while remaining and len(selected_candidates) < top_k:
            best_position: Optional[int] = None
            best_score = -np.inf

            for position in remaining:
                item = scored_candidates[position]
                candidate = self.metadata.iloc[item["index"]]
                brand = str(candidate["brand_clean"])
                count = brand_counts.get(brand, 0)

                if count == 0:
                    penalty = float(diversity_penalties.get("count0", 0.0))
                elif count == 1:
                    penalty = float(diversity_penalties.get("count1", 0.015))
                elif count == 2:
                    penalty = float(diversity_penalties.get("count2", 0.05))
                else:
                    penalty = float(diversity_penalties.get("count3Plus", 0.12))

                final_score = item["relevanceScore"] - penalty
                if final_score > best_score:
                    best_score = final_score
                    best_position = position

            if best_position is None:
                break

            chosen_item = scored_candidates[best_position]
            selected_candidates.append(chosen_item)
            chosen_brand = str(
                self.metadata.iloc[chosen_item["index"]]["brand_clean"]
            )
            brand_counts[chosen_brand] = brand_counts.get(chosen_brand, 0) + 1
            remaining.remove(best_position)

        # 8. Build Response
        recommendations: List[Dict[str, Any]] = []
        for rank, item in enumerate(selected_candidates, start=1):
            row = self.metadata.iloc[item["index"]]
            meta_dict = get_product_metadata(row)
            rec_item: Dict[str, Any] = {
                "rank": rank,
                "productId": meta_dict["productId"],
                "name": meta_dict["name"],
                "brand": meta_dict["brand"],
                "gender": meta_dict["gender"],
                "category": meta_dict["category"],
                "price": meta_dict["price"],
                "similarity": float(item["similarity"]),
                "relevanceScore": float(item["relevanceScore"]),
            }

            if "imageUrl" in meta_dict:
                rec_item["imageUrl"] = meta_dict["imageUrl"]

            if "productUrl" in meta_dict:
                rec_item["productUrl"] = meta_dict["productUrl"]

            recommendations.append(rec_item)

        latency_ms = (time.perf_counter() - start_time) * 1000.0

        return {
            "productId": norm_product_id,
            "modelVersion": self.config.engine_version,
            "recommendations": recommendations,
            "metadata": {
                "candidateK": self.config.candidate_k,
                "finalK": self.config.final_k,
                "minimumSimilarity": self.config.minimum_similarity,
                "latencyMs": round(latency_ms, 2),
            },
        }
