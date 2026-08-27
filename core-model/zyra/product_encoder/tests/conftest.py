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
from zyra.product_encoder.schemas.input_schemas import ProductDataPackage


@pytest.fixture
def sample_product_id() -> str:
    return "P-98765-HOODIE"


@pytest.fixture
def sample_complete_product_dict(sample_product_id: str) -> Dict[str, Any]:
    """Sample complete product payload from Spring Boot."""
    return {
        "productId": sample_product_id,
        "images": [
            {
                "imageUrl": "https://cdn.weavly.com/products/hoodie_front.jpg",
                "viewType": "front",
                "sortOrder": 0,
                "altText": "Front view of oversized black cotton hoodie",
            },
            {
                "imageUrl": "https://cdn.weavly.com/products/hoodie_back.jpg",
                "viewType": "back",
                "sortOrder": 1,
                "altText": "Back view of hoodie",
            },
            {
                "imageUrl": "https://cdn.weavly.com/products/hoodie_detail.jpg",
                "viewType": "detail",
                "sortOrder": 2,
                "altText": "Close-up of ribbed cuffs and drawstrings",
            },
        ],
        "title": "Oversized Heavyweight Cotton Hoodie",
        "description": "Premium 450 GSM organic French terry cotton hoodie with dropped shoulders and double-layered hood.",
        "brand": "Luxzera Studio",
        "category": "Outerwear / Hoodies",
        "subcategory": "Oversized Hoodies",
        "attributes": {
            "color": "Washed Black",
            "material": "100% Organic Cotton",
            "fit": "Oversized",
            "silhouette": "Boxy",
            "pattern": "Solid",
            "neckline": "Hooded",
            "sleeve": "Long Sleeve",
            "length": "Hip Length",
            "closure": "Pullover",
            "garmentDetails": ["Kangaroo pocket", "Ribbed hem and cuffs", "Metal drawstring aglets"],
            "careInstructions": "Machine wash cold inside out, hang dry.",
            "customAttributes": {"gsm": 450, "weave": "French Terry"},
        },
        "sizeInfo": {
            "availableSizes": ["S", "M", "L", "XL"],
            "sizeSystem": "ALPHA",
            "standardSizes": ["S", "M", "L", "XL"],
            "numericSizes": [],
            "customSizes": [],
        },
        "fitInformation": {
            "fitType": "Oversized",
            "stretchiness": "Slight stretch",
            "drape": "Structured Heavy",
            "sizingAdvice": "True to oversized fit; size down for standard fit.",
            "modelHeightCm": 185.0,
            "modelWearingSize": "L",
        },
        "occasions": ["Casual", "Loungewear", "Streetwear"],
        "styles": ["Minimalist", "Streetwear", "Contemporary"],
        "seasons": ["Autumn", "Winter"],
        "dynamicCommerceData": {
            "price": 3499.0,
            "originalPrice": 4999.0,
            "discountPercent": 30.0,
            "currency": "INR",
            "rating": 4.8,
            "reviewCount": 124,
            "inStock": True,
            "inventoryCount": 45,
            "salesRank": 3,
            "isTrending": True,
        },
        "extraMetadata": {
            "springBootEntityVersion": 1,
            "originCountry": "India",
        },
    }


@pytest.fixture
def sample_flexible_product_dict() -> Dict[str, Any]:
    """Sample product dictionary using Spring Boot aliases and raw image string list."""
    return {
        "product_id": "P-MINIMAL-TEE-01",
        "images": [
            "https://cdn.weavly.com/products/tee_front.jpg",
            "https://cdn.weavly.com/products/tee_back.jpg",
        ],
        "title": "Minimal Relaxed Fit T-Shirt",
        "category": "Tops",
        "occasion": "Casual",
        "style": "Minimal",
        "season": "All Season",
        "size_info": {
            "availableSizes": ["M", "L"],
        },
    }


@pytest_asyncio.fixture
async def async_test_client() -> AsyncClient:
    """Async test client for FastAPI endpoints."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client
