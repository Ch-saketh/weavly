from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Header

from zyra.zyra_model.config.settings import ZyraModelSettings
from zyra.zyra_model.config.constants import ZYRA_MODEL_VERSION, SCHEMA_VERSION, DEFAULT_OCCASIONS
from zyra.zyra_model.api.deps import (
    get_settings,
    get_recommendation_repository,
    get_recommendation_engine,
    resolve_user_representation,
)
from zyra.zyra_model.persistence.repository import AbstractRecommendationRepository
from zyra.zyra_model.recommendation.engine import ZyraRecommendationEngine
from zyra.zyra_model.recommendation.generator import ZyraRecommendationResponse, RecommendationItem
from zyra.zyra_model.api.schemas import (
    ZeraRecommendationRequest,
    ZeraRecommendationResponse,
    ZeraProductRecommendationItem,
    ZeraMultiRecommendationRequest,
    ZeraMultiRecommendationResponse,
)
from zyra.zyra_model.recommendation.exceptions import InvalidUserInputException

router = APIRouter(prefix="/api/v1/zyra", tags=["Zyra Recommendation Model"])


def _format_recommendation_items(
    raw_items: List[Any],
    limit: int = 10,
) -> List[ZeraProductRecommendationItem]:
    """Helper to convert domain RecommendationItem or DB dict rows into clean frontend items."""
    formatted: List[ZeraProductRecommendationItem] = []
    seen_ids = set()

    for item in raw_items:
        if isinstance(item, RecommendationItem):
            pid = str(item.product_id).strip()
            if pid in seen_ids:
                continue
            seen_ids.add(pid)

            prof = dict(item.product_profile or {})
            formatted.append(
                ZeraProductRecommendationItem(
                    product_id=pid,
                    rank=len(formatted) + 1,
                    score=item.final_suitability_score,
                    title=prof.get("title") or prof.get("name") or f"Product {pid[:8]}",
                    category=prof.get("category"),
                    subcategory=prof.get("subcategory"),
                    brand=prof.get("brand") or "Luxzera Studio",
                    primary_color=prof.get("primaryColor") or prof.get("primary_color"),
                    price=prof.get("price") or prof.get("sale_price") or 2999.0,
                    image_url=prof.get("imageUrl") or prof.get("image_url"),
                    reason=f"Top recommendation (Rank #{len(formatted) + 1})",
                )
            )
        elif isinstance(item, dict):
            pid = str(item.get("product_id") or item.get("productId") or "").strip()
            if not pid or pid in seen_ids:
                continue
            seen_ids.add(pid)

            metadata = item.get("recommendation_metadata") or {}
            prof = dict(metadata.get("product_profile") or {})
            formatted.append(
                ZeraProductRecommendationItem(
                    product_id=pid,
                    rank=len(formatted) + 1,
                    score=float(item.get("score") or item.get("final_suitability_score") or 0.88),
                    title=prof.get("title") or prof.get("name") or f"Product {pid[:8]}",
                    category=prof.get("category"),
                    subcategory=prof.get("subcategory"),
                    brand=prof.get("brand") or "Luxzera Studio",
                    primary_color=prof.get("primaryColor") or prof.get("primary_color"),
                    price=prof.get("price") or prof.get("sale_price") or 2999.0,
                    image_url=prof.get("imageUrl") or prof.get("image_url"),
                    reason=item.get("reason"),
                )
            )

        if len(formatted) >= limit:
            break

    return formatted


@router.post(
    "/recommendations",
    response_model=ZeraRecommendationResponse,
    summary="Get personalized Top-10 recommendations for ZeraCollection page",
)
async def get_zera_recommendations(
    request: ZeraRecommendationRequest,
    repository: AbstractRecommendationRepository = Depends(get_recommendation_repository),
    engine: ZyraRecommendationEngine = Depends(get_recommendation_engine),
    settings: ZyraModelSettings = Depends(get_settings),
) -> ZeraRecommendationResponse:
    """
    Main recommendation endpoint for ZeraCollection page.
    
    1. Checks for existing CURRENT recommendations in PostgreSQL.
    2. If found and not force_refresh, returns cached recommendations immediately.
    3. If not found or force_refresh=True, executes full live inference pipeline:
       Vector Retrieval (50) -> Hydration -> Models 1 & 2 -> Occasion -> Ranker -> Top 10 -> Persistence.
    """
    user_id = request.user_id
    occasion = request.occasion
    limit = request.limit
    gender = (request.gender or "").strip().lower() if request.gender else None

    # 1. Check for existing CURRENT recommendations in database
    # Skip cache when gender filter is active to ensure gender-specific results
    if not request.force_refresh and not gender:
        existing_recs = await repository.get_recommendations_by_user_and_occasion(
            user_id=user_id,
            occasion=occasion,
            status="CURRENT",
        )
        if existing_recs and len(existing_recs) > 0:
            formatted_items = _format_recommendation_items(existing_recs, limit=limit)
            return ZeraRecommendationResponse(
                user_id=user_id,
                occasion=occasion,
                recommendations=formatted_items,
                total=len(formatted_items),
                model_version=f"zyra_core_{ZYRA_MODEL_VERSION}",
                source="CURRENT_CACHE",
            )

    # 2. Resolve User Representation
    user_rep = await resolve_user_representation(
        user_id=user_id,
        user_embedding=request.user_embedding,
        user_profile=request.user_profile,
    )

    # 3. Execute Complete Live Recommendation Pipeline
    rec_response: ZyraRecommendationResponse = await engine.recommend_for_occasion(
        user=user_rep,
        occasion=occasion,
        limit=limit,
        gender=gender,
    )

    # 4. Atomically Persist Recommendations to PostgreSQL
    if settings.ENABLE_PERSISTENCE and rec_response.recommendations:
        await repository.save_recommendations(
            user_id=user_id,
            occasion=occasion,
            recommendations=rec_response.recommendations,
            model_version=ZYRA_MODEL_VERSION,
            status="CURRENT",
        )

    # 5. Format and return response
    formatted_items = _format_recommendation_items(rec_response.recommendations, limit=limit)

    return ZeraRecommendationResponse(
        user_id=user_id,
        occasion=occasion,
        recommendations=formatted_items,
        total=len(formatted_items),
        model_version=f"zyra_core_{ZYRA_MODEL_VERSION}",
        source="LIVE_INFERENCE",
    )


@router.post(
    "/recommendations/multi",
    response_model=ZeraMultiRecommendationResponse,
    summary="Get multi-occasion recommendations for ZeraCollection tabs",
)
async def get_zera_multi_recommendations(
    request: ZeraMultiRecommendationRequest,
    repository: AbstractRecommendationRepository = Depends(get_recommendation_repository),
    engine: ZyraRecommendationEngine = Depends(get_recommendation_engine),
    settings: ZyraModelSettings = Depends(get_settings),
) -> ZeraMultiRecommendationResponse:
    """
    Generate independent Top-10 recommendation sets across multiple requested occasions.
    """
    user_id = request.user_id
    limit = request.limit

    # Resolve user representation
    user_rep = await resolve_user_representation(
        user_id=user_id,
        user_embedding=request.user_embedding,
        user_profile=request.user_profile,
    )

    # Run multi-occasion inference
    multi_response = await engine.recommend_multi_occasion(
        user=user_rep,
        occasions=request.occasions,
        limit=limit,
    )

    # Persist all occasions atomically
    if settings.ENABLE_PERSISTENCE and multi_response.recommendations:
        await repository.save_multi_occasion_recommendations(
            user_id=user_id,
            recommendations_map=multi_response.recommendations,
            model_version=ZYRA_MODEL_VERSION,
            status="CURRENT",
        )

    # Format response
    formatted_map: Dict[str, List[ZeraProductRecommendationItem]] = {}
    for occ, items in multi_response.recommendations.items():
        formatted_map[occ] = _format_recommendation_items(items, limit=limit)

    return ZeraMultiRecommendationResponse(
        user_id=user_id,
        recommendations=formatted_map,
        total_occasions=len(formatted_map),
        model_version=f"zyra_core_{ZYRA_MODEL_VERSION}",
    )


@router.get(
    "/recommendations/{user_id}",
    response_model=ZeraMultiRecommendationResponse,
    summary="Fetch stored CURRENT recommendations for a user across all occasions",
)
async def get_user_stored_recommendations(
    user_id: str,
    repository: AbstractRecommendationRepository = Depends(get_recommendation_repository),
) -> ZeraMultiRecommendationResponse:
    """Retrieve stored CURRENT recommendations for a user."""
    if not user_id or not user_id.strip():
        raise InvalidUserInputException("user_id cannot be blank")

    stored = await repository.get_recommendations_by_user(user_id=user_id, status="CURRENT")
    formatted: Dict[str, List[ZeraProductRecommendationItem]] = {}
    for occ, items in stored.items():
        formatted[occ] = _format_recommendation_items(items)

    return ZeraMultiRecommendationResponse(
        user_id=user_id,
        recommendations=formatted,
        total_occasions=len(formatted),
        model_version=f"zyra_core_{ZYRA_MODEL_VERSION}",
    )


@router.get("/health")
async def get_zyra_health(settings: ZyraModelSettings = Depends(get_settings)) -> Dict[str, Any]:
    """Health check endpoint for ZYRA-MODEL recommendation service."""
    return {
        "status": "HEALTHY",
        "service": settings.SERVICE_NAME,
        "environment": settings.ENVIRONMENT,
        "version": ZYRA_MODEL_VERSION,
        "schema_version": SCHEMA_VERSION,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/status")
async def get_zyra_status(settings: ZyraModelSettings = Depends(get_settings)) -> Dict[str, Any]:
    """Operational status and active configuration for ZYRA-MODEL."""
    return {
        "status": "OPERATIONAL",
        "service": settings.SERVICE_NAME,
        "version": ZYRA_MODEL_VERSION,
        "schema_version": SCHEMA_VERSION,
        "configuration": {
            "retrieval_top_k": settings.RETRIEVAL_TOP_K,
            "default_limit": settings.DEFAULT_RECOMMENDATION_LIMIT,
            "vector_dimension": settings.QDRANT_VECTOR_DIMENSION,
            "ranking_weights": {
                "retrieval": settings.WEIGHT_RETRIEVAL,
                "person_garment": settings.WEIGHT_PERSON_GARMENT,
                "outfit_compatibility": settings.WEIGHT_OUTFIT,
                "occasion_compatibility": settings.WEIGHT_OCCASION,
            },
            "persistence_enabled": settings.ENABLE_PERSISTENCE,
        },
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
