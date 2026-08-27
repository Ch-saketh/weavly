"""Constants and model specifications for Phase U3 Image Encoder."""

import os

IMAGE_ENCODER_VERSION = "v1"
VISUAL_REPRESENTATION_DIMENSION = 512

# Model Checkpoints & Names
FASHION_CLIP_MODEL_NAME = "patrickjohncyh/fashion-clip"
FASHN_HUMAN_PARSER_MODEL_NAME = "fashn-ai/fashn-human-parser"
MEDIAPIPE_POSE_MODEL_NAME = "pose_landmarker_heavy.task"

# Default Model Paths inside repository
MODELS_BASE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../models")
)
MEDIAPIPE_MODEL_DIR = os.path.join(MODELS_BASE_DIR, "mediapipe")
FASHN_MODEL_DIR = os.path.join(MODELS_BASE_DIR, "fashn_human_parser")
FASHIONCLIP_MODEL_DIR = os.path.join(MODELS_BASE_DIR, "fashionclip")

# Image Validation Thresholds
MAX_IMAGE_SIZE_BYTES = 15 * 1024 * 1024  # 15 MB
MIN_IMAGE_DIMENSION = 64
MAX_IMAGE_DIMENSION = 4096
DOWNLOAD_TIMEOUT_SECONDS = 10.0

SUPPORTED_MIME_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/avif",
}

# Image Roles & Importance Weights
ROLE_PROFILE_IMAGE = "PROFILE_IMAGE"
ROLE_RECOMMENDATION_IMAGE = "RECOMMENDATION_IMAGE"

ROLE_WEIGHTS = {
    ROLE_PROFILE_IMAGE: 0.3,
    ROLE_RECOMMENDATION_IMAGE: 1.0,
}

# Canonical Visual Style Concepts for Zero-Shot Classification
CANONICAL_VISUAL_STYLES = [
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

# Canonical Visual Patterns
CANONICAL_VISUAL_PATTERNS = [
    "Solid",
    "Stripes",
    "Checks / Plaid",
    "Graphic / Print",
    "Floral",
    "Textured / Knit",
]

# Canonical Visual Silhouettes
CANONICAL_VISUAL_SILHOUETTES = [
    "Fitted",
    "Relaxed",
    "Oversized",
    "Tailored",
    "Loose",
]

# Canonical Color Palette Reference (RGB Centroids)
CANONICAL_COLOR_RGB_MAP = {
    "Black": (20, 20, 20),
    "White": (245, 245, 245),
    "Navy": (20, 35, 75),
    "Grey": (128, 128, 128),
    "Beige / Tan": (210, 185, 150),
    "Brown": (110, 65, 35),
    "Olive": (105, 115, 60),
    "Green": (35, 140, 60),
    "Blue": (40, 100, 210),
    "Red": (210, 35, 40),
    "Burgundy": (120, 20, 45),
    "Pastel Pink": (245, 195, 210),
    "Hot Pink": (240, 40, 140),
    "Neon Yellow": (235, 245, 40),
}

# FASHN Human Parser / SegFormer Standard Garment Class Indices
FASHN_PARSER_CLASSES = {
    0: "Background",
    1: "Hat / Cap",
    2: "Hair",
    3: "Sunglasses / Glasses",
    4: "Upper-clothes / Top",
    5: "Dress",
    6: "Coat / Jacket / Outerwear",
    7: "Socks",
    8: "Pants / Bottoms",
    9: "Gloves",
    10: "Scarf",
    11: "Skirt",
    12: "Face",
    13: "Left-arm",
    14: "Right-arm",
    15: "Left-leg",
    16: "Right-leg",
    17: "Left-shoe",
    18: "Right-shoe",
}
