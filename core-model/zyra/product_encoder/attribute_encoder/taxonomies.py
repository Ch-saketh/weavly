from typing import Dict, List

# Canonical Taxonomy Maps for Fast Categorical & Hierarchical Indexing

CATEGORIES = [
    "Tops",
    "Bottoms",
    "Outerwear",
    "Dresses",
    "Footwear",
    "Accessories",
    "Activewear",
    "Knitwear",
    "Tailoring",
    "Loungewear",
    "Underwear / Intimates",
    "Other",
]

SUBCATEGORIES = [
    "T-Shirts",
    "Hoodies",
    "Sweatshirts",
    "Shirts",
    "Sweaters",
    "Coats",
    "Jackets",
    "Blazers",
    "Jeans",
    "Trousers",
    "Pants",
    "Shorts",
    "Skirts",
    "Dresses",
    "Boots",
    "Sneakers",
    "Loafers",
    "Bags",
    "Hats",
    "Scarves",
    "Belts",
    "Other",
]

COLORS = [
    "Black",
    "White",
    "Grey",
    "Navy",
    "Blue",
    "Beige / Tan",
    "Brown",
    "Cream / Off-White",
    "Olive / Green",
    "Burgundy / Maroon",
    "Red",
    "Pink",
    "Yellow",
    "Orange",
    "Purple",
    "Gold",
    "Silver",
]

MATERIALS = [
    "Cotton",
    "Organic Cotton",
    "French Terry",
    "Wool",
    "Merino Wool",
    "Cashmere",
    "Linen",
    "Silk",
    "Denim",
    "Polyester",
    "Nylon",
    "Spandex / Elastane",
    "Leather",
    "Faux Leather",
    "Velvet",
    "Satin",
    "Fleece",
    "Corduroy",
    "Viscose / Rayon",
    "Acrylic",
    "Modal",
    "Other",
]

FITS = [
    "Oversized",
    "Relaxed",
    "Regular",
    "Slim",
    "Boxy",
    "Cropped",
    "Skinny",
    "Loose",
    "Tailored",
    "Structured",
]

SILHOUETTES = [
    "Boxy",
    "A-Line",
    "Hourglass",
    "Straight",
    "Tapered",
    "Wide-Leg",
    "Oversized",
    "Fitted",
    "Cocoon",
    "Draped",
    "Structured",
]

PATTERNS = [
    "Solid",
    "Striped",
    "Checked / Plaid",
    "Graphic / Print",
    "Floral",
    "Textured / Knit",
    "Colorblock",
    "Animal Print",
    "Polka Dot",
    "Abstract",
]

NECKLINES = [
    "Crew Neck",
    "V-Neck",
    "Hooded",
    "Polo Collar",
    "Turtleneck",
    "Collared / Button-Down",
    "Scoop Neck",
    "Square Neck",
    "Boat Neck",
    "Off-Shoulder",
]

SLEEVES = [
    "Long Sleeve",
    "Short Sleeve",
    "Sleeveless",
    "Cap Sleeve",
    "Raglan Sleeve",
    "3/4 Sleeve",
]

LENGTHS = [
    "Cropped",
    "Waist Length",
    "Hip Length",
    "Thigh Length",
    "Knee Length",
    "Midi",
    "Maxi / Full Length",
    "Ankle Length",
]

STYLES = [
    "Streetwear",
    "Minimalist",
    "Contemporary",
    "Casual",
    "Formal",
    "Vintage / Retro",
    "Sporty / Athleisure",
    "Bohemian",
    "Classic",
    "Grunge",
    "Luxury / Designer",
]

OCCASIONS = [
    "Casual / Everyday",
    "Work / Office",
    "Evening / Party",
    "Formal / Black Tie",
    "Streetwear / Urban",
    "Loungewear / Home",
    "Travel",
    "Sports / Activewear",
    "Vacation / Resort",
]

SEASONS = [
    "Autumn / Fall",
    "Winter",
    "Spring",
    "Summer",
    "All-Season",
    "Transitional",
]

SIZE_SCALES = [
    "ALPHA_STANDARD",
    "NUMERIC_US",
    "NUMERIC_UK",
    "NUMERIC_EU",
    "WAIST_INSEAM",
    "ONE_SIZE",
]

CATEGORY_INDEX: Dict[str, int] = {k.lower(): idx for idx, k in enumerate(CATEGORIES)}
SUBCATEGORY_INDEX: Dict[str, int] = {k.lower(): idx for idx, k in enumerate(SUBCATEGORIES)}
COLOR_INDEX: Dict[str, int] = {k.lower(): idx for idx, k in enumerate(COLORS)}
MATERIAL_INDEX: Dict[str, int] = {k.lower(): idx for idx, k in enumerate(MATERIALS)}
FIT_INDEX: Dict[str, int] = {k.lower(): idx for idx, k in enumerate(FITS)}
SILHOUETTE_INDEX: Dict[str, int] = {k.lower(): idx for idx, k in enumerate(SILHOUETTES)}
PATTERN_INDEX: Dict[str, int] = {k.lower(): idx for idx, k in enumerate(PATTERNS)}
NECKLINE_INDEX: Dict[str, int] = {k.lower(): idx for idx, k in enumerate(NECKLINES)}
SLEEVE_INDEX: Dict[str, int] = {k.lower(): idx for idx, k in enumerate(SLEEVES)}
LENGTH_INDEX: Dict[str, int] = {k.lower(): idx for idx, k in enumerate(LENGTHS)}
STYLE_INDEX: Dict[str, int] = {k.lower(): idx for idx, k in enumerate(STYLES)}
OCCASION_INDEX: Dict[str, int] = {k.lower(): idx for idx, k in enumerate(OCCASIONS)}
SEASON_INDEX: Dict[str, int] = {k.lower(): idx for idx, k in enumerate(SEASONS)}
