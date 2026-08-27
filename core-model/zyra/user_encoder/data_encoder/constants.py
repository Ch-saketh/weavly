"""Constants and canonical vocabularies for Phase U2 Data Encoder."""

DATA_ENCODER_VERSION = "v1"

# Canonical sizes for one-hot/categorical projection
CANONICAL_SIZES = [
    "XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL", "CUSTOM_OR_NUMERIC"
]

# Canonical fit preferences
CANONICAL_FIT_PREFERENCES = [
    "Slim", "Regular", "Relaxed", "Oversized", "Skinny", "Loose", "Tailored"
]

# Canonical styles
CANONICAL_STYLES = [
    "Casual", "Minimal", "Streetwear", "Luxury / High Fashion", "Formal",
    "Classic", "Vintage / Retro", "Sporty / Athleisure", "Bohemian", "Avant-garde"
]

# Canonical clothing categories
CANONICAL_CLOTHING_TYPES = [
    "T-shirts", "Shirts", "Jeans", "Trousers / Chinos", "Jackets / Outerwear",
    "Hoodies / Sweatshirts", "Suits / Blazers", "Dresses", "Skirts", "Shorts", "Knitwear"
]

# Canonical colors
CANONICAL_COLORS = [
    "Black", "White", "Navy", "Grey", "Beige / Tan", "Brown", "Olive",
    "Green", "Blue", "Red", "Burgundy", "Pastel Pink", "Hot Pink", "Neon Yellow"
]

# Canonical occasions
CANONICAL_OCCASIONS = [
    "Everyday / Casual", "Work / Office", "Evening / Party",
    "Formal / Black Tie", "Gym / Workout", "Travel / Vacation"
]

# Canonical budget ranges
CANONICAL_BUDGET_RANGES = [
    "Under ₹1,500", "₹1,500–₹2,500", "₹2,500–₹5,000", "₹5,000–₹10,000", "₹10,000+"
]

# Canonical shopping priorities (max 3 selectable by user)
CANONICAL_SHOPPING_PRIORITIES = [
    "Fit", "Comfort", "Appearance", "Price / Value", "Quality", "Brand",
    "Style & Trends", "Versatility", "Uniqueness", "Material", "Durability", "Sustainability"
]

# Canonical fashion goals
CANONICAL_FASHION_GOALS = [
    "Discover personal style", "Build complete outfits", "Upgrade wardrobe quality",
    "Dress better for work", "Find better fitting clothes", "Experiment with new trends",
    "Create minimalist capsule wardrobe", "Shop sustainably"
]

# Mapping of supported style and priority signals to fashion orientation descriptions (NO psychological traits)
FASHION_SIGNAL_MAP = {
    "minimal": "Minimalist-oriented",
    "casual": "Casual-oriented",
    "streetwear": "Streetwear-oriented",
    "luxury / high fashion": "Luxury-oriented",
    "formal": "Formal-oriented",
    "classic": "Classic-oriented",
    "vintage / retro": "Vintage-oriented",
    "sporty / athleisure": "Sporty-oriented",
    "bohemian": "Bohemian-oriented",
    "avant-garde": "Experimentation-oriented",
    "comfort": "Comfort-oriented",
    "style & trends": "Trend-oriented",
    "versatility": "Versatility-oriented",
    "fit": "Fit-focused",
    "quality": "Quality-focused",
    "sustainability": "Sustainability-conscious",
}

# Dimension breakdown:
# - Continuous numericals: 4 (heightNorm, weightNorm, hasHeight, hasWeight)
# - Sizes: 9
# - Fit preferences: 7
# - Styles (+1 pref, -1 avoid): 10
# - Clothing types (+1 pref, -1 avoid): 11
# - Colors (+1 pref, -1 avoid): 14
# - Occasions: 6
# - Budget: 5
# - Shopping Priorities: 12
# - Fashion Goals: 8
# Total = 4 + 9 + 7 + 10 + 11 + 14 + 6 + 5 + 12 + 8 = 86
DATA_REPRESENTATION_DIMENSION = 86
