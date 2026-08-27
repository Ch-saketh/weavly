import os
import sys
from typing import Dict, Any
from uuid import UUID, uuid4
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport

# Ensure repository root is in python path
repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
parent_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../.."))
for p in (repo_root, parent_root):
    if p not in sys.path:
        sys.path.insert(0, p)

from zyra.user_encoder.main import app
from zyra.user_encoder.config.settings import UserEncoderSettings
from zyra.user_encoder.schemas.input_schema import UserEncoderInput
from zyra.user_encoder.persistence.db import close_db_pool


@pytest.fixture
def sample_user_id() -> UUID:
    return UUID("9e9e7b92-54db-4d77-9ee9-af5e3cccad79")


@pytest.fixture
def sample_event_id() -> UUID:
    return UUID("11111111-2222-3333-4444-555555555555")


@pytest.fixture
def sample_image_id() -> UUID:
    return UUID("b64750af-0764-4178-b5c9-fd266f4d3906")


@pytest.fixture
def sample_springboot_raw_response(sample_user_id: UUID, sample_image_id: UUID) -> Dict[str, Any]:
    """Sample JSON response payload from Spring Boot GET /api/internal/users/{userId}/encoder-data."""
    return {
        "userId": str(sample_user_id),
        "profileCompleted": True,
        "generalProfile": {
            "gender": "MALE",
            "dateOfBirth": "1996-06-12",
            "bio": "Minimalist streetwear and tailoring enthusiast",
        },
        "fitData": {
            "topSize": "M",
            "bottomSize": "32",
            "shoeSize": "10",
            "heightRange": "170–179 cm",
            "exactHeightCm": 175.5,
            "weightRange": "70–79 kg",
            "exactWeightKg": 73.0,
            "clothingSize": "L",
            "fitPreferences": ["Regular", "Relaxed"],
            "preferredStyles": ["Casual", "Minimal", "Streetwear"],
            "avoidedStyles": ["Experimental / Avant-garde"],
            "preferredClothingTypes": ["T-shirts", "Jeans", "Jackets / Outerwear"],
            "avoidedClothingTypes": ["Suits / Blazers"],
            "preferredColors": ["Black", "Navy", "Charcoal"],
            "avoidedColors": ["Neon Yellow", "Hot Pink"],
            "occasions": ["Everyday / Casual", "Work / Office"],
            "primaryOccasion": "Everyday / Casual",
            "budgetRange": "₹2,500–₹5,000",
            "shoppingPriorities": ["Fit", "Comfort", "Quality"],
            "fashionGoals": ["Build complete outfits", "Discover personal style"],
        },
        "profileImage": "https://pub-b09de1c5dd3640839563534a412f1988.r2.dev/profiles/avatar.jpg",
        "recommendationImages": [
            {
                "id": str(sample_image_id),
                "imageUrl": "https://pub-b09de1c5dd3640839563534a412f1988.r2.dev/recommendation-images/outfit1.jpg",
                "createdAt": "2026-08-24T17:28:00",
            }
        ],
    }


@pytest.fixture
def sample_incomplete_springboot_response(sample_user_id: UUID) -> Dict[str, Any]:
    """Sample response for a newly registered user with incomplete profile and no images."""
    return {
        "userId": str(sample_user_id),
        "profileCompleted": False,
        "generalProfile": None,
        "fitData": None,
        "profileImage": None,
        "recommendationImages": [],
    }


@pytest_asyncio.fixture(autouse=True)
async def cleanup_db_pool_after_test():
    """Ensure database connection pool is cleanly closed between tests."""
    yield
    await close_db_pool()


@pytest_asyncio.fixture
async def async_test_client() -> AsyncClient:
    """Async test client for FastAPI endpoints."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client
