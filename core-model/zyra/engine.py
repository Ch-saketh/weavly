"""Zyra V1 Standalone Recommendation Engine.

Encapsulates the validated P9/P10 production recommendation pipeline into a
self-contained, standalone class with zero global/notebook dependencies.
"""

import json
from pathlib import Path
import time
from typing import Any, Dict, List, Optional, Set, Union
import numpy as np
import pandas as pd

from zyra.config import ZyraConfig
from zyra.metadata import (
    REQUIRED_METADATA_COLUMNS,
    compute_budget_score,
    compute_occasion_affinity,
    compute_price_score,
    detect_product_occasions,
    get_product_metadata,
    is_gender_compatible,
    is_wearable_fashion,
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

        # 7. Precompute real catalog occasions, wearable status, and text search corpus
        self.product_occasions = [
            detect_product_occasions(self.metadata.iloc[i])
            for i in range(expected_products)
        ]
        self.product_is_wearable = [
            is_wearable_fashion(self.metadata.iloc[i])
            for i in range(expected_products)
        ]
        self.product_text_corpus = [
            f"{str(self.metadata.iloc[i]['name'])} {str(self.metadata.iloc[i].get('description', ''))} {str(self.metadata.iloc[i]['category_clean'])}".lower()
            for i in range(expected_products)
        ]

    def recommend(
        self,
        product_id: Optional[Any] = None,
        top_k: int = 50,
        user_gender: Optional[str] = None,
        occasion: Optional[str] = None,
        user_occasions: Optional[List[str]] = None,
        preferred_categories: Optional[List[str]] = None,
        preferred_styles: Optional[List[str]] = None,
        preferred_colors: Optional[List[str]] = None,
        avoided_categories: Optional[List[str]] = None,
        avoided_styles: Optional[List[str]] = None,
        avoided_colors: Optional[List[str]] = None,
        budget_range: Optional[str] = None,
        user_embedding: Optional[Union[List[float], np.ndarray]] = None,
    ) -> Dict[str, Any]:
        """Unified recommendation entry point.

        Routes to `recommend_for_user()` when rich user preferences or embeddings are present,
        otherwise executes the validated P9/P10 product-to-product or occasion retrieval engine.
        """
        has_rich_personalization = bool(
            preferred_categories
            or preferred_styles
            or preferred_colors
            or avoided_categories
            or avoided_styles
            or avoided_colors
            or budget_range
            or (user_embedding is not None and len(user_embedding) > 0)
        )

        if has_rich_personalization:
            return self.recommend_for_user(
                user_gender=user_gender,
                preferred_categories=preferred_categories,
                preferred_styles=preferred_styles,
                preferred_colors=preferred_colors,
                avoided_categories=avoided_categories,
                avoided_styles=avoided_styles,
                avoided_colors=avoided_colors,
                occasions=user_occasions,
                target_occasion=occasion,
                budget_range=budget_range,
                user_embedding=user_embedding,
                product_id=product_id,
                top_k=top_k,
            )

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
            # Occasion-Aware Multi-Category Pipeline with Wearable Fashion & Occasion Specificity
            query_embedding = None
            if query_index is not None:
                query_emb = self.embeddings[query_index]
                q_norm = np.linalg.norm(query_emb)
                if q_norm > 1e-12:
                    query_embedding = query_emb / q_norm

            scored_candidates = []
            for idx in range(len(self.metadata)):
                if query_index is not None and idx == query_index:
                    continue
                row = self.metadata.iloc[idx]
                g = str(row["gender_clean"])
                if g not in compatible_genders:
                    continue

                # Filter out non-wearable appliances / beauty kits
                if not self.product_is_wearable[idx]:
                    continue

                cand_cat = str(row["category_clean"])
                cand_brand = str(row["brand_clean"])
                cand_price = float(row["price_numeric"])
                
                # Compute fine-grained occasion affinity
                occ_affinity = compute_occasion_affinity(row, target_occ)
                
                # Baseline occasion membership score
                occs = self.product_occasions[idx]
                if target_occ:
                    cand_occ_score = 1.0 if target_occ in occs else (0.4 if any(o in occs for o in user_occ_set) else 0.0)
                elif user_occ_set:
                    cand_occ_score = 1.0 if any(o in occs for o in user_occ_set) else 0.0
                else:
                    cand_occ_score = 0.5

                combined_occ = 0.70 * occ_affinity + 0.30 * cand_occ_score

                if query_embedding is not None:
                    cand_emb = self.embeddings[idx]
                    c_norm = np.linalg.norm(cand_emb)
                    sim = float(cand_emb @ query_embedding / (c_norm + 1e-12))
                    sim = max(0.0, min(1.0, sim))
                    rel = 0.40 * sim + 0.45 * combined_occ + 0.15 * (1.0 if g == target_gender else 0.7)
                else:
                    # Dynamic similarity score reflecting occasion alignment
                    sim = max(0.85, min(0.99, 0.88 + 0.10 * combined_occ))
                    rel = 0.75 * combined_occ + 0.25 * (1.0 if g == target_gender else 0.7)

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

            # Progressive diversity re-ranker across top 400 pool
            remaining_items = scored_candidates[:400]
            selected_candidates = []
            brand_counts: Dict[str, int] = {}
            cat_counts: Dict[str, int] = {}

            while remaining_items and len(selected_candidates) < top_k:
                best_pos = None
                best_score = -np.inf

                for pos, item in enumerate(remaining_items):
                    b_cnt = brand_counts.get(item["brand"], 0)
                    b_pen = 0.0 if b_cnt == 0 else (0.015 if b_cnt == 1 else (0.05 if b_cnt == 2 else 0.12))

                    c_cnt = cat_counts.get(item["category"], 0)
                    c_pen = 0.0 if c_cnt < 4 else (0.04 if c_cnt < 7 else (0.10 if c_cnt < 11 else 0.22 + 0.04 * (c_cnt - 11)))

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
            "productId": str(norm_product_id) if norm_product_id else (str(target_occ) if target_occ else "occasion-feed"),
            "modelVersion": self.config.engine_version,
            "recommendations": recommendations,
            "metadata": {
                "candidateK": self.config.candidate_k,
                "finalK": self.config.final_k,
                "minimumSimilarity": self.config.minimum_similarity,
                "targetGender": target_gender,
                "occasion": target_occ,
                "latencyMs": round(latency_ms, 2),
            },
        }

    def recommend_for_user(
        self,
        user_id: Optional[str] = None,
        user_gender: Optional[str] = None,
        preferred_categories: Optional[List[str]] = None,
        preferred_styles: Optional[List[str]] = None,
        preferred_colors: Optional[List[str]] = None,
        avoided_categories: Optional[List[str]] = None,
        avoided_styles: Optional[List[str]] = None,
        avoided_colors: Optional[List[str]] = None,
        occasions: Optional[List[str]] = None,
        target_occasion: Optional[str] = None,
        budget_range: Optional[str] = None,
        user_embedding: Optional[Union[List[float], np.ndarray]] = None,
        product_id: Optional[Any] = None,
        top_k: int = 50,
    ) -> Dict[str, Any]:
        """Generate high-precision personalized recommendations for an authenticated user.

        Guarantees:
        1. HARD GENDER CONSTRAINT: Zero cross-gender leakage. Female users strictly get Women/Unisex.
        2. EXPLICIT PREFERENCE SENSITIVITY: Categories, styles, colors, occasions, and budget measurably steer rankings.
        3. DENSE REPRESENTATION COHERENCE: Incorporates 662-dim User Encoder embeddings when available.
        4. PROGRESSIVE DIVERSITY: Curates multi-brand, multi-category outfits without repetition.
        """
        start_time = time.perf_counter()

        if not isinstance(top_k, int) or top_k <= 0 or top_k > self.config.final_k:
            top_k = self.config.final_k

        # 1. Resolve Target Gender & Enforce Hard Compatibility Filter
        target_gender = normalize_gender(user_gender)
        compatible_genders = set(
            self.config.gender_compatibility.get(target_gender, [target_gender])
        )

        norm_pid = normalize_product_id(product_id) if product_id is not None else None
        seed_idx: Optional[int] = None
        if norm_pid and norm_pid in self.product_id_to_index:
            seed_idx = self.product_id_to_index[norm_pid]

        # 2. Preprocess Preferences
        def _clean_set(items: Optional[List[str]]) -> Set[str]:
            if not items:
                return set()
            return {str(x).lower().strip() for x in items if str(x).strip()}

        pref_cats = _clean_set(preferred_categories)
        avoid_cats = _clean_set(avoided_categories)
        pref_styles = _clean_set(preferred_styles)
        avoid_styles = _clean_set(avoided_styles)
        pref_colors = _clean_set(preferred_colors)
        avoid_colors = _clean_set(avoided_colors)

        target_occ = target_occasion.lower().strip() if target_occasion else None
        user_occ_set = _clean_set(occasions)

        def match_cat(p_cat: str) -> float:
            p_lower = p_cat.lower().strip()
            for pref in pref_cats:
                if p_lower == pref or (pref.endswith('s') and p_lower == pref[:-1]) or (p_lower.endswith('s') and p_lower[:-1] == pref) or pref in p_lower or p_lower in pref:
                    return 1.0
            for avoid in avoid_cats:
                if p_lower == avoid or (avoid.endswith('s') and p_lower == avoid[:-1]) or avoid in p_lower:
                    return -1.0
            return 0.15

        def match_text_signal(text: str, pref_set: Set[str], avoid_set: Set[str]) -> float:
            if not pref_set and not avoid_set:
                return 0.25
            has_pref = any(kw in text for kw in pref_set) if pref_set else False
            has_avoid = any(kw in text for kw in avoid_set) if avoid_set else False
            if has_pref and has_avoid:
                return 0.0
            if has_pref:
                return 1.0
            if has_avoid:
                return -1.0
            return 0.25

        # 3. Vector Projection (662-dim Cosine Similarity)
        u_vec: Optional[np.ndarray] = None
        if user_embedding is not None and len(user_embedding) == self.config.embedding_dimension:
            arr = np.array(user_embedding, dtype=np.float32)
            u_norm = np.linalg.norm(arr)
            if u_norm > 1e-12:
                u_vec = arr / u_norm

        if seed_idx is not None:
            p_emb = self.embeddings[seed_idx]
            p_norm = np.linalg.norm(p_emb)
            if p_norm > 1e-12:
                p_vec = p_emb / p_norm
                if u_vec is not None:
                    hybrid = 0.65 * u_vec + 0.35 * p_vec
                    u_vec = hybrid / (np.linalg.norm(hybrid) + 1e-12)
                else:
                    u_vec = p_vec

        if u_vec is not None:
            vector_sims = self.embeddings @ u_vec
        else:
            vector_sims = None

        # 4. Strict Hard-Filtered Candidate Scoring
        scored_candidates = []
        total_gender_compatible = 0

        for idx in range(len(self.metadata)):
            if seed_idx is not None and idx == seed_idx:
                continue

            row = self.metadata.iloc[idx]
            cand_gender = str(row["gender_clean"])

            # HARD GENDER CONSTRAINT
            if cand_gender not in compatible_genders:
                continue

            # Filter out non-wearable appliances / beauty kits from wardrobe recommendations
            if not self.product_is_wearable[idx]:
                continue

            total_gender_compatible += 1

            cand_cat = str(row["category_clean"])
            cand_brand = str(row["brand_clean"])
            cand_price = float(row["price_numeric"])
            text_corpus = self.product_text_corpus[idx]
            cand_occs = self.product_occasions[idx]

            # Vector similarity
            if vector_sims is not None:
                s_vector = float(np.clip(vector_sims[idx], 0.0, 1.0))
            else:
                s_vector = 0.85

            # Preference sub-scores
            s_cat = match_cat(cand_cat)
            s_style = match_text_signal(text_corpus, pref_styles, avoid_styles)
            s_color = match_text_signal(text_corpus, pref_colors, avoid_colors)

            # Occasion score with high-precision affinity
            s_occ_aff = compute_occasion_affinity(row, target_occ if target_occ else (list(user_occ_set)[0] if user_occ_set else None))
            if target_occ:
                s_occ_base = 1.0 if target_occ in cand_occs else (0.75 if any(o in cand_occs for o in user_occ_set) else 0.25)
            elif user_occ_set:
                s_occ_base = 1.0 if any(o in cand_occs for o in user_occ_set) else 0.25
            else:
                s_occ_base = 0.40
            s_occ = 0.70 * s_occ_aff + 0.30 * s_occ_base

            # Budget score
            s_budget = compute_budget_score(budget_range, cand_price) if budget_range else 0.50

            # Target gender direct bonus
            s_gen = 1.0 if cand_gender == target_gender else 0.85

            # Weighted Composite Relevance
            relevance = (
                0.30 * s_vector
                + 0.24 * s_cat
                + 0.16 * s_style
                + 0.12 * s_color
                + 0.10 * s_occ
                + 0.04 * s_budget
                + 0.04 * s_gen
            )

            similarity_display = s_vector if vector_sims is not None else (0.88 + 0.10 * s_cat)

            scored_candidates.append({
                "index": idx,
                "similarity": float(similarity_display),
                "relevanceScore": float(relevance),
                "category": cand_cat,
                "brand": cand_brand,
                "gender": cand_gender,
            })

        # Sort all eligible candidates by relevance descending
        scored_candidates.sort(key=lambda x: -x["relevanceScore"])

        # 5. Progressive Diversity Reranker (Top-400 Pool)
        pool = scored_candidates[:400]
        selected_candidates = []
        brand_counts: Dict[str, int] = {}
        cat_counts: Dict[str, int] = {}

        while pool and len(selected_candidates) < top_k:
            best_pos = None
            best_score = -np.inf

            for pos, item in enumerate(pool):
                b_cnt = brand_counts.get(item["brand"], 0)
                b_pen = 0.0 if b_cnt == 0 else (0.02 if b_cnt == 1 else (0.06 if b_cnt == 2 else 0.15))

                c_cnt = cat_counts.get(item["category"], 0)
                c_pen = 0.0 if c_cnt < 4 else (0.04 if c_cnt < 7 else (0.10 if c_cnt < 11 else 0.22 + 0.04 * (c_cnt - 11)))

                final_score = item["relevanceScore"] - b_pen - c_pen
                if final_score > best_score:
                    best_score = final_score
                    best_pos = pos

            if best_pos is None:
                break

            chosen = pool.pop(best_pos)
            selected_candidates.append(chosen)
            brand_counts[chosen["brand"]] = brand_counts.get(chosen["brand"], 0) + 1
            cat_counts[chosen["category"]] = cat_counts.get(chosen["category"], 0) + 1

        # 6. Assemble Recommendations
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
            "productId": str(norm_pid) if norm_pid else (str(target_occ) if target_occ else "personalized-user"),
            "modelVersion": f"{self.config.engine_version}-personalized",
            "recommendations": recommendations,
            "metadata": {
                "candidateK": self.config.candidate_k,
                "finalK": self.config.final_k,
                "minimumSimilarity": self.config.minimum_similarity,
                "genderFilteredCount": total_gender_compatible,
                "targetGender": target_gender,
                "personalizationApplied": True,
                "latencyMs": round(latency_ms, 2),
            },
        }
