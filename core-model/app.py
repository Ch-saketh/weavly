"""Zyra V1 Recommendation Engine - Flask Inference & Persistence API.

Exposes the validated Zyra V1 standalone engine and recommendation persistence
services via a lightweight HTTP API.
"""

import logging
from pathlib import Path
import time
from typing import Any, Dict, Optional, Tuple

from flask import Flask, jsonify, request
from flask_cors import CORS

from zyra import RecommendationPersistenceService, ZyraV1

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("zyra.api")

# Determine project root, artifacts, and database paths
PROJECT_ROOT = Path(__file__).resolve().parent
ARTIFACT_DIR = PROJECT_ROOT / "p10_production_artifacts"
DB_PATH = PROJECT_ROOT / "zyra_recommendations.db"

# Initialize Zyra V1 Engine once at module import
logger.info("Initializing ZyraV1 engine from %s...", ARTIFACT_DIR)
zyra = ZyraV1(artifact_dir=ARTIFACT_DIR)
logger.info("ZyraV1 engine initialized successfully.")

# Initialize Persistence Service once
logger.info("Initializing RecommendationPersistenceService with %s...", DB_PATH)
persistence_service = RecommendationPersistenceService(db_path=DB_PATH)
logger.info("RecommendationPersistenceService initialized successfully.")

ALLOWED_ORIGINS = [
    r"^http:\/\/localhost:\d+$",
    r"^https:\/\/.*\.vercel\.app$",
    r"^https:\/\/.*\.onrender\.com$",
    r"^https:\/\/.*\.weavly\.store$",
    r"^https:\/\/.*\.luxzera\.store$",
]
CORS(app, origins=ALLOWED_ORIGINS, supports_credentials=True)


@app.route("/health", methods=["GET"])
def health() -> Tuple[Any, int]:
    """Health check endpoint. Confirms service and database liveness without running inference."""
    db_healthy = persistence_service.check_health()
    return (
        jsonify(
            {
                "status": "ok",
                "service": "zyra-v1",
                "engineVersion": zyra.config.engine_version,
                "database": "connected" if db_healthy else "degraded",
            }
        ),
        200,
    )


@app.route("/info", methods=["GET"])
def info() -> Tuple[Any, int]:
    """Engine info endpoint. Returns high-level production configuration."""
    return (
        jsonify(
            {
                "engineVersion": zyra.config.engine_version,
                "products": len(zyra.metadata),
                "embeddingDimension": zyra.config.embedding_dimension,
                "candidateK": zyra.config.candidate_k,
                "finalK": zyra.config.final_k,
                "minimumSimilarity": zyra.config.minimum_similarity,
            }
        ),
        200,
    )


@app.route("/recommend", methods=["POST"])
def recommend() -> Tuple[Any, int]:
    """Recommendation inference endpoint."""
    t_start = time.perf_counter()

    data: Optional[Dict[str, Any]] = request.get_json(silent=True)
    if data is None:
        return jsonify({"error": "Request body must be valid JSON"}), 400

    raw_pid = data.get("productId")
    product_id_str = str(raw_pid).strip() if raw_pid is not None else None
    if product_id_str == "":
        product_id_str = None

    user_gender = data.get("userGender")
    occasion = data.get("occasion")
    user_occasions = data.get("userOccasions")
    preferred_categories = data.get("preferredCategories") or data.get("preferred_categories")
    preferred_styles = data.get("preferredStyles") or data.get("preferred_styles")
    preferred_colors = data.get("preferredColors") or data.get("preferred_colors")
    avoided_categories = data.get("avoidedCategories") or data.get("avoided_categories")
    avoided_styles = data.get("avoidedStyles") or data.get("avoided_styles")
    avoided_colors = data.get("avoidedColors") or data.get("avoided_colors")
    budget_range = data.get("budgetRange") or data.get("budget_range")
    user_embedding = data.get("userEmbedding") or data.get("user_embedding")
    user_id = data.get("userId") or data.get("user_id")

    # If no product_id, no occasion, and no user profile context provided, error
    has_user_context = bool(user_gender or occasion or user_occasions or preferred_categories or preferred_styles or user_embedding)
    if product_id_str is None and not has_user_context:
        return jsonify({"error": "productId or user profile context (gender/occasion/preferences) is required"}), 400

    # Parse and validate topK
    top_k = zyra.config.final_k
    if "topK" in data:
        raw_top_k = data["topK"]
        if raw_top_k is None or isinstance(raw_top_k, bool) or not isinstance(raw_top_k, int):
            return (
                jsonify(
                    {"error": "topK must be an integer between 1 and 50", "topK": raw_top_k}
                ),
                400,
            )

        if raw_top_k < 1 or raw_top_k > zyra.config.final_k:
            return (
                jsonify(
                    {
                        "error": f"topK must be between 1 and {zyra.config.final_k}",
                        "topK": raw_top_k,
                    }
                ),
                400,
            )
        top_k = raw_top_k

    # Check product existence if productId is supplied
    if product_id_str is not None and product_id_str not in zyra.product_id_to_index:
        if not has_user_context:
            return (
                jsonify(
                    {
                        "error": "Product not found",
                        "productId": product_id_str,
                    }
                ),
                404,
            )

    # Run inference
    try:
        engine_result = zyra.recommend(
            product_id=product_id_str,
            top_k=top_k,
            user_gender=user_gender,
            occasion=occasion,
            user_occasions=user_occasions,
            preferred_categories=preferred_categories,
            preferred_styles=preferred_styles,
            preferred_colors=preferred_colors,
            avoided_categories=avoided_categories,
            avoided_styles=avoided_styles,
            avoided_colors=avoided_colors,
            budget_range=budget_range,
            user_embedding=user_embedding,
        )
    except ValueError as exc:
        return jsonify({"error": str(exc), "productId": product_id_str}), 400
    except Exception as exc:
        logger.exception("Unexpected error during recommendation inference")
        return jsonify({"error": "Internal inference error", "details": str(exc)}), 500

    latency_ms = round((time.perf_counter() - t_start) * 1000.0, 2)
    logger.info(
        "[ZYRA] productId=%s occasion=%s userGender=%s prefCats=%s topK=%d latency=%.2fms",
        product_id_str,
        occasion,
        user_gender,
        preferred_categories,
        top_k,
        latency_ms,
    )

    recs = engine_result.get("recommendations", [])
    meta = engine_result.get("metadata", {})
    meta["count"] = len(recs)
    meta["latencyMs"] = latency_ms

    response_payload = {
        "productId": product_id_str,
        "modelVersion": engine_result.get("modelVersion", zyra.config.engine_version),
        "recommendations": recs,
        "metadata": meta,
    }

    return jsonify(response_payload), 200


@app.route("/recommend/save", methods=["POST"])
@app.route("/recommendations/save", methods=["POST"])
def save_recommendations() -> Tuple[Any, int]:
    """Persist a recommendation generation."""
    data: Optional[Dict[str, Any]] = request.get_json(silent=True)
    if data is None:
        return jsonify({"error": "productId is required"}), 400

    if "productId" not in data or data["productId"] is None:
        return jsonify({"error": "productId is required"}), 400

    product_id_str = str(data["productId"]).strip()
    if not product_id_str:
        return jsonify({"error": "productId cannot be empty"}), 400

    # If recommendations array is supplied, use it; otherwise generate on-demand
    if "recommendations" in data and isinstance(data["recommendations"], list) and len(data["recommendations"]) > 0:
        recs = data["recommendations"]
        model_version = str(data.get("modelVersion", zyra.config.engine_version))
    else:
        if product_id_str not in zyra.product_id_to_index:
            return jsonify({"error": "Product not found", "productId": product_id_str}), 404
        top_k = data.get("topK", zyra.config.final_k)
        if not isinstance(top_k, int) or top_k < 1 or top_k > zyra.config.final_k:
            return jsonify({"error": f"topK must be between 1 and {zyra.config.final_k}"}), 400
        engine_result = zyra.recommend(product_id=product_id_str, top_k=top_k)
        recs = engine_result.get("recommendations", [])
        model_version = engine_result.get("modelVersion", zyra.config.engine_version)

    try:
        save_result = persistence_service.save_recommendations(
            query_product_id=product_id_str,
            recommendations=recs,
            model_version=model_version,
        )
        return jsonify(save_result), 201
    except Exception as exc:
        logger.exception("Failed to persist recommendations")
        return jsonify({"error": "Persistence failed", "details": str(exc)}), 500


@app.route("/recommendations/generation/<generation_id>", methods=["GET"])
def get_generation(generation_id: str) -> Tuple[Any, int]:
    """Retrieve a previously persisted recommendation generation."""
    generation = persistence_service.get_generation(generation_id)
    if not generation:
        return jsonify({"error": "Generation not found", "generationId": generation_id}), 404
    return jsonify(generation), 200


if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 5001))
    app.run(
        host="0.0.0.0",
        port=port,
        debug=False,
    )
