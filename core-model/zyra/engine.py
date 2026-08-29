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
    detect_product_occasions,
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
        """Initialize and validate the Zyra V1 Engine from production artifacts."""
        dir_path = Path(artifact_dir)
        if dir_path.is_dir():
            self.artifact_dir = dir_path.resolve()
        else:
            project_root = Path(__file__).resolve().parent.parent
            candidate = project_root / artifact_dir
            if candidate.is_dir():
                self.artifact_dir = candidate.resolve()
            else:
                self.artifact_dir = dir_path.resolve()

        embeddings_path = self.artifact_dir / "product_embeddings.npy"
        metadata_path = self.artifact_dir / "product_metadata.csv"
        index_path = self.artifact_dir / "product_id_to_index.json"
        config_path = self.artifact_dir / "zyra_v1_config.json"
        manifest_path = self.artifact_dir / "manifest.json"

        # Load Configuration
        if config is not None:
            self.config = config
        else:
            self.config = ZyraConfig.from_json_file(config_path)

        # Load Manifest
        self.manifest: Optional[Dict[str, Any]] = None
        if manifest_path.is_file():
            with open(manifest_path, "r", encoding="utf-8") as f:
                self.manifest = json.load(f)

        # Load Data
        self.embeddings: np.ndarray = np.load(embeddings_path, allow_pickle=False)
        self.metadata: pd.DataFrame = pd.read_csv(metadata_path)
        with open(index_path, "r", encoding="utf-8") as f:
            raw_index: Dict[str, Any] = json.load(f)
        self.product_id_to_index: Dict[str, int] = {
            normalize_product_id(k): int(v) for k, v in raw_index.items()
        }

        # Validation
        expected_products = self.config.catalog_size
        validate_metadata_dataframe(self.metadata, expected_count=expected_products)

        # Clean metadata
        self.metadata = self.metadata.copy()
        self.metadata["productId"] = self.metadata["productId"].astype(str).str.strip()
        self.metadata["brand_clean"] = self.metadata["brand_clean"].astype(str).str.strip()
        self.metadata["gender_clean"] = self.metadata["gender_clean"].astype(str).str.strip()
        self.metadata["category_clean"] = self.metadata["category_clean"].astype(str).str.strip()
        self.metadata["price_numeric"] = pd.to_numeric(self.metadata["price_numeric"], errors="coerce").fillna(0.0)

        # Product index validation
        for pid, idx in self.product_id_to_index.items():
            if not (0 <= idx < expected_products):
                raise ValueError(f"Index out of bounds for productId {pid}: {idx}")
            row_pid = self.metadata.iloc[idx]["productId"]
            if row_pid != pid:
                raise ValueError(
                    f"Product ordering mismatch: index {idx} has productId {row_pid}, expected {pid}"
                )

        # 7. Precompute real catalog occasions
        self.product_occasions = [
            detect_product_occasions(self.metadata.iloc[i])
            for i in range(expected_products)
        ]

    def recommend(
        self,
        product_id: Optional[Any] = None,
        top_k: int = 50,
        user_gender: Optional[str] = None,
        occasion: Optional[str] = None,
        user_occasions: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """Generate top_k recommendations for a given query product or user profile.

        Parameters
        ----------
        product_id : Optional[Any]
            The query product ID (if recommendation is anchored on a viewed product).
        top_k : int
            Number of recommendations to return (default 50, max 50).
        user_gender : Optional[str]
            Authenticated user profile gender constraint ('Men', 'Women', 'Kids', 'Unisex').
        occasion : Optional[str]
            Target occasion filter (e.g. 'casual', 'party', 'formal', 'wedding', 'date', 'college', 'sport').
        user_occasions : Optional[List[str]]
            User profile preferred occasions list (e.g. ['casual', 'party', 'date']).

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

        # 2. Occasion & Gender Context Resolution
        target_occ = occasion.lower().strip() if occasion else None
        user_occ_set = {o.lower().strip() for o in user_occasions} if user_occasions else set()
        has_occasion_context = bool(target_occ or user_occ_set)

        query_index: Optional[int] = None
        query_gender = "Unisex"
        query_brand = ""
        query_category = ""
        query_price = 0.0
        norm_product_id = normalize_product_id(product_id) if product_id is not None else None

        if norm_product_id:
            if norm_product_id in self.product_id_to_index:
                query_index = self.product_id_to_index[norm_product_id]
                query = self.metadata.iloc[query_index]
                query_gender = str(query["gender_clean"])
                query_brand = str(query["brand_clean"])
                query_category = str(query["category_clean"])
                query_price = float(query["price_numeric"])
            elif not has_occasion_context:
                raise ValueError(f"Unknown productId: {product_id}")

        target_gender = normalize_gender(user_gender) if user_gender else query_gender
        compatible_genders = set(
            self.config.gender_compatibility.get(target_gender, [target_gender])
        )
        min_similarity = self.config.minimum_similarity

        # 3. Candidate Retrieval & Scoring
        if query_index is not None and not has_occasion_context:
            # Baseline P9 Standalone Product Recommendation Pipeline (Frozen)
            query_embedding = self.embeddings[query_index]
            query_norm = np.linalg.norm(query_embedding)
            if query_norm > 1e-12:
                query_embedding = query_embedding / query_norm

            similarities = self.embeddings @ query_embedding
            similarities[query_index] = -np.inf

            candidate_k = self.config.candidate_k
            available_count = len(similarities) - 1
            candidate_count = min(candidate_k, available_count)

            candidate_indices = np.argpartition(-similarities, candidate_count)[
                :candidate_count
            ]
            candidate_indices = candidate_indices[
                np.argsort(-similarities[candidate_indices])
            ]

            filtered_indices: List[int] = []
            filtered_similarities: List[float] = []

            for idx in candidate_indices:
                idx_int = int(idx)
                candidate = self.metadata.iloc[idx_int]
                cand_gender = str(candidate["gender_clean"])
                sim = float(similarities[idx_int])

                if cand_gender not in compatible_genders:
                    continue
                if sim < min_similarity:
                    continue

                filtered_indices.append(idx_int)
                filtered_similarities.append(sim)

            if len(filtered_indices) < top_k:
                filtered_indices = []
                filtered_similarities = []
                for idx in range(len(self.metadata)):
                    if idx == query_index:
                        continue
                    cand_gender = str(self.metadata.iloc[idx]["gender_clean"])
                    if cand_gender not in compatible_genders:
                        continue
                    sim = float(similarities[idx])
                    if sim < min_similarity:
                        continue
                    filtered_indices.append(idx)
                    filtered_similarities.append(sim)

                ordering = np.argsort(-np.asarray(filtered_similarities))
                filtered_indices = [filtered_indices[i] for i in ordering]
                filtered_similarities = [filtered_similarities[i] for i in ordering]

            weights = self.config.weights
            scored_candidates: List[Dict[str, Any]] = []

            for idx_int, sim in zip(filtered_indices, filtered_similarities):
                candidate = self.metadata.iloc[idx_int]
                cand_brand = str(candidate["brand_clean"])
                cand_category = str(candidate["category_clean"])
                cand_gender = str(candidate["gender_clean"])
                cand_price = float(candidate["price_numeric"])

                gender_score = 1.0 if cand_gender in compatible_genders else 0.0
                category_score = 1.0 if cand_category == query_category else 0.0
                brand_score = 1.0 if cand_brand == query_brand else 0.0
                price_score = compute_price_score(query_price, cand_price)

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

        else:
            # Occasion-Aware & Preference-Aware Multi-Category Pipeline
            query_embedding = None
            if query_index is not None:
                query_emb = self.embeddings[query_index]
                q_norm = np.linalg.norm(query_emb)
                if q_norm > 1e-12:
                    query_embedding = query_emb / q_norm

            eligible_indices: List[int] = []
            for idx in range(len(self.metadata)):
                if query_index is not None and idx == query_index:
                    continue
                row = self.metadata.iloc[idx]
                g = str(row["gender_clean"])
                if g not in compatible_genders:
                    continue

                occs = self.product_occasions[idx]
                if target_occ:
                    if target_occ in occs or any(o in occs for o in user_occ_set):
                        eligible_indices.append(idx)
                elif user_occ_set:
                    if any(o in occs for o in user_occ_set):
                        eligible_indices.append(idx)
                else:
                    eligible_indices.append(idx)

            if len(eligible_indices) < top_k:
                for idx in range(len(self.metadata)):
                    if idx not in eligible_indices and str(self.metadata.iloc[idx]["gender_clean"]) in compatible_genders:
                        eligible_indices.append(idx)

            scored_candidates = []
            for idx in eligible_indices:
                row = self.metadata.iloc[idx]
                cand_occs = self.product_occasions[idx]
                cand_cat = str(row["category_clean"])
                cand_brand = str(row["brand_clean"])

                if target_occ:
                    occ_score = 1.0 if target_occ in cand_occs else (0.6 if any(o in cand_occs for o in user_occ_set) else 0.0)
                elif user_occ_set:
                    occ_score = 1.0 if any(o in cand_occs for o in user_occ_set) else 0.0
                else:
                    occ_score = 0.5

                if query_embedding is not None:
                    cand_emb = self.embeddings[idx]
                    c_norm = np.linalg.norm(cand_emb)
                    sim = float(cand_emb @ query_embedding / (c_norm + 1e-12))
                    sim = max(0.0, min(1.0, sim))
                    rel = 0.45 * sim + 0.35 * occ_score + 0.20 * (1.0 if str(row["gender_clean"]) == target_gender else 0.7)
                else:
                    sim = 0.92 + 0.06 * occ_score
                    rel = 0.65 * occ_score + 0.35 * (1.0 if str(row["gender_clean"]) == target_gender else 0.7)

                scored_candidates.append(
                    {
                        "index": idx,
                        "similarity": float(sim),
                        "relevanceScore": float(rel),
                        "category": cand_cat,
                        "brand": cand_brand,
                    }
                )

            scored_candidates.sort(key=lambda x: -x["relevanceScore"])

            # Greedy selection with brand & progressive category penalties
            remaining_items = scored_candidates[:500]
            selected_candidates = []
            brand_counts = {}
            cat_counts: Dict[str, int] = {}

            while remaining_items and len(selected_candidates) < top_k:
                best_pos = None
                best_score = -np.inf

                for pos, item in enumerate(remaining_items):
                    b_cnt = brand_counts.get(item["brand"], 0)
                    b_pen = 0.0 if b_cnt == 0 else (0.015 if b_cnt == 1 else (0.05 if b_cnt == 2 else 0.12))

                    c_cnt = cat_counts.get(item["category"], 0)
                    c_pen = 0.0 if c_cnt < 3 else (0.05 if c_cnt < 6 else (0.12 if c_cnt < 10 else 0.25 + 0.05 * (c_cnt - 10)))

                    f_score = item["relevanceScore"] - b_pen - c_pen
                    if f_score > best_score:
                        best_score = f_score
                        best_pos = pos

                if best_pos is None:
                    break

                chosen = remaining_items.pop(best_pos)
                selected_candidates.append(chosen)
                brand_counts[chosen["brand"]] = brand_counts.get(chosen["brand"], 0) + 1
                cat_counts[chosen["category"]] = cat_counts.get(chosen["category"], 0) + 1

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
            "productId": str(norm_product_id) if norm_product_id else (str(target_occ) if target_occ else "personalized"),
            "modelVersion": self.config.engine_version,
            "recommendations": recommendations,
            "metadata": {
                "candidateK": self.config.candidate_k,
                "finalK": self.config.final_k,
                "minimumSimilarity": self.config.minimum_similarity,
                "latencyMs": round(latency_ms, 2),
            },
        }
