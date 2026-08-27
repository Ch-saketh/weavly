"""Constants, event types, and weights for Phase U4 Behaviour Encoder."""

from enum import Enum
from typing import Dict, List

BEHAVIOUR_ENCODER_VERSION = "v1"
BEHAVIOUR_REPRESENTATION_DIMENSION = 64

# Configurable Recency Parameters
DEFAULT_RECENCY_HALF_LIFE_DAYS = 14.0
MIN_RECENCY_WEIGHT = 0.05

# Configurable Time Windows (in days)
RECENT_WINDOW_DAYS = 7.0
MEDIUM_WINDOW_DAYS = 30.0
LONG_WINDOW_DAYS = 90.0


class BehaviourEventType(str, Enum):
    """Canonical supported behaviour event types in Weavly / Zyra."""

    SEARCH = "SEARCH"
    PRODUCT_VIEW = "PRODUCT_VIEW"
    PRODUCT_CLICK = "PRODUCT_CLICK"
    LIKE = "LIKE"
    SAVE = "SAVE"
    ADD_TO_CART = "ADD_TO_CART"
    REMOVE_FROM_CART = "REMOVE_FROM_CART"
    PURCHASE = "PURCHASE"
    WISHLIST_ADD = "WISHLIST_ADD"
    WISHLIST_REMOVE = "WISHLIST_REMOVE"
    RECOMMENDATION_VIEW = "RECOMMENDATION_VIEW"
    RECOMMENDATION_CLICK = "RECOMMENDATION_CLICK"


# Ordered canonical event types (12 types)
CANONICAL_EVENT_TYPES: List[str] = [
    BehaviourEventType.SEARCH.value,
    BehaviourEventType.PRODUCT_VIEW.value,
    BehaviourEventType.PRODUCT_CLICK.value,
    BehaviourEventType.LIKE.value,
    BehaviourEventType.SAVE.value,
    BehaviourEventType.ADD_TO_CART.value,
    BehaviourEventType.REMOVE_FROM_CART.value,
    BehaviourEventType.PURCHASE.value,
    BehaviourEventType.WISHLIST_ADD.value,
    BehaviourEventType.WISHLIST_REMOVE.value,
    BehaviourEventType.RECOMMENDATION_VIEW.value,
    BehaviourEventType.RECOMMENDATION_CLICK.value,
]

# Configurable Event Strength Weights (Action Intent & Evidence Quality)
EVENT_TYPE_WEIGHTS: Dict[str, float] = {
    BehaviourEventType.PURCHASE.value: 3.0,
    BehaviourEventType.ADD_TO_CART.value: 1.5,
    BehaviourEventType.SAVE.value: 1.0,
    BehaviourEventType.WISHLIST_ADD.value: 0.9,
    BehaviourEventType.LIKE.value: 0.8,
    BehaviourEventType.RECOMMENDATION_CLICK.value: 0.6,
    BehaviourEventType.PRODUCT_CLICK.value: 0.5,
    BehaviourEventType.SEARCH.value: 0.4,
    BehaviourEventType.PRODUCT_VIEW.value: 0.3,
    BehaviourEventType.RECOMMENDATION_VIEW.value: 0.2,
    BehaviourEventType.WISHLIST_REMOVE.value: -0.3,
    BehaviourEventType.REMOVE_FROM_CART.value: -0.5,
}

# Canonical Categories for Vector Projection (11 categories)
BEHAVIOUR_CANONICAL_CATEGORIES: List[str] = [
    "T-shirts",
    "Shirts",
    "Jeans",
    "Trousers / Chinos",
    "Jackets / Outerwear",
    "Hoodies / Sweatshirts",
    "Suits / Blazers",
    "Dresses",
    "Skirts",
    "Shorts",
    "Knitwear",
]

# Canonical Styles for Vector Projection (10 styles)
BEHAVIOUR_CANONICAL_STYLES: List[str] = [
    "Minimal",
    "Streetwear",
    "Casual",
    "Luxury / High Fashion",
    "Formal",
    "Classic",
    "Vintage / Retro",
    "Sporty / Athleisure",
    "Bohemian",
    "Avant-garde",
]

# Canonical Colors for Vector Projection (14 colors)
BEHAVIOUR_CANONICAL_COLORS: List[str] = [
    "Black",
    "White",
    "Navy",
    "Grey",
    "Beige / Tan",
    "Brown",
    "Olive",
    "Green",
    "Blue",
    "Red",
    "Burgundy",
    "Pastel Pink",
    "Hot Pink",
    "Neon Yellow",
]
