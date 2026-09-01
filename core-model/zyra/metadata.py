"""Zyra V1 Metadata and Compatibility Helpers.

Defines validation, normalization, compatibility scoring, and asset metadata extraction functions.
"""

from typing import Any, Dict, List, Optional, Set
import numpy as np
import pandas as pd

from zyra.config import (
    DEFAULT_GENDER_COMPATIBILITY,
    DEFAULT_GENDER_NORMALIZATION,
)

REQUIRED_METADATA_COLUMNS = [
    "productId",
    "name",
    "brand_clean",
    "gender_clean",
    "category_clean",
    "price_numeric",
]

IMAGE_URL_CANDIDATE_COLUMNS = [
    "imageUrl",
    "image_url",
    "image",
    "images",
    "image_urls",
]

PRODUCT_URL_CANDIDATE_COLUMNS = [
    "productUrl",
    "product_url",
    "url",
    "link",
    "product_link",
]


def normalize_product_id(value: Any) -> str:
    """Normalize product ID to clean string representation."""
    if value is None:
        return ""
    return str(value).strip()


def normalize_gender(
    gender: Any,
    normalization_map: Optional[Dict[str, str]] = None,
) -> str:
    """Normalize gender to standard categories (Women, Men, Unisex, Kids)."""
    if gender is None:
        return "Unisex"
    g_str = str(gender).strip()
    if not g_str:
        return "Unisex"

    mapping = normalization_map or DEFAULT_GENDER_NORMALIZATION
    g_lower = g_str.lower()
    if g_lower in mapping:
        return mapping[g_lower]
    # Check prefix matching for safety
    if g_lower.startswith("wom") or g_lower.startswith("fem"):
        return "Women"
    if g_lower.startswith("man") or g_lower.startswith("men") or g_lower.startswith("mal"):
        return "Men"
    if g_lower.startswith("kid") or g_lower.startswith("child") or g_lower.startswith("boy") or g_lower.startswith("girl"):
        return "Kids"
    if g_lower.startswith("uni"):
        return "Unisex"
    return "Unisex"


def is_gender_compatible(
    query_gender: str,
    candidate_gender: str,
    compatibility_map: Optional[Dict[str, List[str]]] = None,
) -> bool:
    """Evaluate HARD gender compatibility between query and candidate products.

    Rules:
    - Women -> Women, Unisex (NEVER Men, NEVER Kids)
    - Men -> Men, Unisex (NEVER Women, NEVER Kids)
    - Unisex -> Women, Men, Unisex (NEVER Kids)
    - Kids -> Kids (NEVER adult Women, NEVER adult Men)
    """
    q_gen = normalize_gender(query_gender)
    c_gen = normalize_gender(candidate_gender)

    mapping = compatibility_map or DEFAULT_GENDER_COMPATIBILITY
    compatible_set: Set[str] = set(mapping.get(q_gen, [q_gen]))
    return c_gen in compatible_set


def compute_price_score(query_price: float, candidate_price: float) -> float:
    """Compute price compatibility score between query and candidate.

    Formula:
    price_score = max(0.0, 1.0 - abs(log(max(candidate_price / query_price, 1e-12))))
    clipped to [0.0, 1.0].
    If either price <= 0, returns 0.0.
    """
    try:
        q_p = float(query_price)
        c_p = float(candidate_price)
    except (ValueError, TypeError):
        return 0.0

    if q_p <= 0.0 or c_p <= 0.0:
        return 0.0

    ratio = c_p / q_p
    score = 1.0 - abs(np.log(max(ratio, 1e-12)))
    return float(np.clip(score, 0.0, 1.0))


def compute_budget_score(budget_range_str: Optional[str], candidate_price: float) -> float:
    """Compute compatibility score between user's selected budget range and candidate product price."""
    if not budget_range_str or candidate_price <= 0:
        return 0.5

    b_str = str(budget_range_str).lower().replace(",", "").replace("₹", "").replace("rs.", "").strip()

    # Extract bounds
    import re
    nums = [float(n) for n in re.findall(r"\d+", b_str)]
    if not nums:
        return 0.5

    if len(nums) == 1:
        if "under" in b_str or "less" in b_str or "below" in b_str:
            min_p, max_p = 0.0, nums[0]
        else:
            min_p, max_p = nums[0], nums[0] * 3.0
    else:
        min_p, max_p = min(nums[0], nums[1]), max(nums[0], nums[1])

    if min_p <= candidate_price <= max_p:
        return 1.0
    elif candidate_price < min_p:
        diff_ratio = (min_p - candidate_price) / max(min_p, 1.0)
        return float(np.clip(1.0 - 0.5 * diff_ratio, 0.3, 1.0))
    else:
        diff_ratio = (candidate_price - max_p) / max(max_p, 1.0)
        return float(np.clip(1.0 - 0.8 * diff_ratio, 0.0, 1.0))


def is_valid_url(url: Any) -> bool:
    """Validate if a URL string is non-empty and well-formed (http:// or https://)."""
    if not isinstance(url, str):
        return False
    url_str = url.strip()
    if not url_str:
        return False
    return url_str.startswith("http://") or url_str.startswith("https://")


def get_product_metadata(row: Any) -> Dict[str, Any]:
    """Extract display metadata for a product row.

    Preserves existing metadata and extracts real imageUrl / productUrl if present
    in the dataset without inventing or fabricating missing fields.
    """
    if isinstance(row, pd.Series):
        row_dict = row.to_dict()
    elif isinstance(row, dict):
        row_dict = row
    else:
        row_dict = dict(row)

    meta: Dict[str, Any] = {
        "productId": normalize_product_id(row_dict.get("productId", "")),
        "name": str(row_dict.get("name", "")),
        "brand": str(row_dict.get("brand_clean", row_dict.get("brand", ""))).strip(),
        "gender": str(row_dict.get("gender_clean", row_dict.get("gender", ""))).strip(),
        "category": str(row_dict.get("category_clean", row_dict.get("category", ""))).strip(),
        "price": float(row_dict.get("price_numeric", row_dict.get("price", 0.0))),
    }

    # Extract real imageUrl if present
    for img_col in IMAGE_URL_CANDIDATE_COLUMNS:
        if img_col in row_dict and pd.notna(row_dict[img_col]):
            val = str(row_dict[img_col]).strip()
            if val and val.lower() not in ("nan", "none", "null"):
                meta["imageUrl"] = val
                break

    # Extract real productUrl if present
    for url_col in PRODUCT_URL_CANDIDATE_COLUMNS:
        if url_col in row_dict and pd.notna(row_dict[url_col]):
            val = str(row_dict[url_col]).strip()
            if val and val.lower() not in ("nan", "none", "null"):
                meta["productUrl"] = val
                break

    return meta


def validate_metadata_dataframe(
    df: pd.DataFrame,
    expected_count: int = 12465,
) -> None:
    """Validate that the metadata DataFrame conforms to the frozen production contract."""
    if not isinstance(df, pd.DataFrame):
        raise TypeError(f"Metadata must be a pandas DataFrame, got {type(df).__name__}")

    if len(df) != expected_count:
        raise ValueError(
            f"Metadata row count mismatch: expected {expected_count}, got {len(df)}"
        )

    missing_cols = [col for col in REQUIRED_METADATA_COLUMNS if col not in df.columns]
    if missing_cols:
        raise ValueError(f"Missing required metadata columns: {missing_cols}")

    # Check for NaN / null in crucial fields
    if df["productId"].isna().any():
        raise ValueError("Metadata contains null productId entries")

    # Check for duplicate product IDs
    unique_count = df["productId"].astype(str).str.strip().nunique()
    if unique_count != expected_count:
        raise ValueError(
            f"Duplicate product IDs detected in metadata: {unique_count} unique vs {expected_count} expected"
        )


def detect_product_occasions(row: Any) -> Set[str]:
    """Detect occasion affinities from product name, description, and category."""
    name = str(row.get("name", "") if hasattr(row, "get") else getattr(row, "name", "")).lower()
    desc = str(row.get("description", "") if hasattr(row, "get") else getattr(row, "description", "")).lower()
    cat = str(row.get("category_clean", "") if hasattr(row, "get") else getattr(row, "category_clean", "")).lower()
    full_text = f"{name} {desc} {cat}"

    occasions: Set[str] = set()

    # Keyword detection
    if any(w in full_text for w in ["party", "clubwear", "cocktail", "celebration", "evening", "night out"]):
        occasions.add("party")
    if any(w in full_text for w in ["wedding", "bridal", "groom", "festive", "saree", "sherwani", "lehenga"]):
        occasions.add("wedding")
    if any(w in full_text for w in ["formal", "office", "work", "corporate", "business", "suit", "blazer", "tuxedo", "oxford"]):
        occasions.add("formal")
        occasions.add("work")
    if any(w in full_text for w in ["sport", "running", "gym", "training", "athletic", "jogger", "track", "sneaker"]):
        occasions.add("sport")
    if any(w in full_text for w in ["date", "dinner", "stylish", "romantic", "dress", "heels", "perfume", "fragrance"]):
        occasions.add("date")
    if any(w in full_text for w in ["college", "campus", "streetwear", "casual", "denim", "jeans", "tshirt", "t-shirt", "hoodie", "shorts"]):
        occasions.add("casual")
        occasions.add("college")

    # Fashion category affinities
    if cat in ["suit"]:
        occasions.update(["formal", "wedding", "work", "party"])
    elif cat in ["saree", "kurta"]:
        occasions.update(["wedding", "festive", "party", "ethnic"])
    elif cat in ["dress", "playsuit"]:
        occasions.update(["party", "date", "casual"])
    elif cat in ["trousers", "shirt"]:
        occasions.update(["formal", "work", "casual", "date"])
    elif cat in ["tshirt", "jeans", "shorts", "sweatshirt"]:
        occasions.update(["casual", "college"])
    elif cat in ["shoes", "watch", "bag", "accessory", "jacket"]:
        occasions.update(["casual", "party", "formal", "date", "work"])

    if not occasions:
        occasions.add("casual")

    return occasions

