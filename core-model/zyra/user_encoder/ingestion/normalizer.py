import logging
from typing import Optional, List
from zyra.user_encoder.schemas.input_schema import (
    UserEncoderInput,
    GeneralProfileInput,
    UserFitDataInput,
    RecommendationImageInput,
)

logger = logging.getLogger("zyra.ingestion.normalizer")

# Standard letter clothing sizes to canonicalize
STANDARD_LETTER_SIZES = {"XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL", "2XL", "3XL", "4XL"}

# Canonical mapping for common styles, categories, fits, and colors
CANONICAL_CHOICE_MAP = {
    # Fit preferences
    "slim": "Slim",
    "regular": "Regular",
    "relaxed": "Relaxed",
    "oversized": "Oversized",
    "skinny": "Skinny",
    "loose": "Loose",
    "tailored": "Tailored",
    # Styles
    "casual": "Casual",
    "minimal": "Minimal",
    "streetwear": "Streetwear",
    "luxury": "Luxury",
    "luxury / high fashion": "Luxury / High Fashion",
    "formal": "Formal",
    "classic": "Classic",
    "vintage": "Vintage",
    "vintage / retro": "Vintage / Retro",
    "sporty": "Sporty",
    "sporty / athleisure": "Sporty / Athleisure",
    "bohemian": "Bohemian",
    "avant-garde": "Avant-garde",
    "experimental / avant-garde": "Experimental / Avant-garde",
    # Clothing types
    "t-shirts": "T-shirts",
    "shirts": "Shirts",
    "jeans": "Jeans",
    "trousers": "Trousers",
    "trousers / chinos": "Trousers / Chinos",
    "jackets": "Jackets",
    "jackets / outerwear": "Jackets / Outerwear",
    "hoodies / sweatshirts": "Hoodies / Sweatshirts",
    "suits": "Suits",
    "suits / blazers": "Suits / Blazers",
    "dresses": "Dresses",
    "skirts": "Skirts",
    "shorts": "Shorts",
    "knitwear": "Knitwear",
    # Colors
    "black": "Black",
    "white": "White",
    "navy": "Navy",
    "grey": "Grey",
    "gray": "Gray",
    "charcoal": "Charcoal",
    "beige": "Beige",
    "beige / tan": "Beige / Tan",
    "brown": "Brown",
    "olive": "Olive",
    "green": "Green",
    "blue": "Blue",
    "red": "Red",
    "burgundy": "Burgundy",
    "pastel pink": "Pastel Pink",
    "hot pink": "Hot Pink",
    "neon yellow": "Neon Yellow",
    # Occasions
    "everyday / casual": "Everyday / Casual",
    "work / office": "Work / Office",
    "evening / party": "Evening / Party",
    "formal / black tie": "Formal / Black Tie",
    "gym / workout": "Gym / Workout",
    "travel / vacation": "Travel / Vacation",
    # Shopping priorities
    "fit": "Fit",
    "comfort": "Comfort",
    "quality": "Quality",
    "style & trends": "Style & Trends",
    "price / value": "Price / Value",
    "sustainability": "Sustainability",
    # Fashion goals
    "build complete outfits": "Build complete outfits",
    "discover personal style": "Discover personal style",
    "upgrade wardrobe quality": "Upgrade wardrobe quality",
    "dress better for work": "Dress better for work",
}


class UserInputNormalizer:
    """Deterministic normalizer for canonical UserEncoderInput data.

    Ensures consistent casing, trims whitespace, standardizes multi-select lists,
    and preserves exact numerical measurements, custom answers, and optional data.
    """

    @staticmethod
    def normalize_string(val: Optional[str]) -> Optional[str]:
        """Strip whitespace and convert empty/blank strings to None."""
        if val is None:
            return None
        cleaned = val.strip()
        return cleaned if cleaned else None

    @staticmethod
    def normalize_choice(val: Optional[str]) -> Optional[str]:
        """Normalize a single choice string against canonical dictionary while preserving custom values."""
        cleaned = UserInputNormalizer.normalize_string(val)
        if cleaned is None:
            return None
        lower_key = cleaned.lower()
        return CANONICAL_CHOICE_MAP.get(lower_key, cleaned)

    @staticmethod
    def normalize_clothing_size(val: Optional[str]) -> Optional[str]:
        """Normalize clothing size string (upper for letter sizes, preserves numbers and custom)."""
        cleaned = UserInputNormalizer.normalize_string(val)
        if cleaned is None:
            return None
        upper_val = cleaned.upper()
        if upper_val in STANDARD_LETTER_SIZES:
            return upper_val
        return cleaned

    @staticmethod
    def normalize_measurement(val: Optional[float]) -> Optional[float]:
        """Validate and round numerical measurement (height, weight). Returns None if non-positive."""
        if val is None:
            return None
        try:
            num = float(val)
            if num <= 0:
                return None
            return round(num, 1)
        except (ValueError, TypeError):
            return None

    @staticmethod
    def normalize_list(items: Optional[List[str]]) -> List[str]:
        """Normalize list items: trim whitespace, canonicalize choices, and deduplicate case-insensitively."""
        if not items:
            return []

        seen_lower = set()
        normalized_items: List[str] = []

        for raw_item in items:
            cleaned = UserInputNormalizer.normalize_choice(raw_item)
            if cleaned:
                lower_key = cleaned.lower()
                if lower_key not in seen_lower:
                    seen_lower.add(lower_key)
                    normalized_items.append(cleaned)

        return normalized_items

    @classmethod
    def normalize(cls, raw_input: UserEncoderInput) -> UserEncoderInput:
        """Apply deterministic normalization across all sub-models of UserEncoderInput."""
        # 1. Normalize General Profile
        norm_profile = None
        if raw_input.profile:
            gender_norm = cls.normalize_choice(raw_input.profile.gender)
            if gender_norm:
                gender_norm = gender_norm.upper() if gender_norm.upper() in {"MALE", "FEMALE", "UNISEX", "OTHER"} else gender_norm

            norm_profile = GeneralProfileInput(
                gender=gender_norm,
                dateOfBirth=cls.normalize_string(raw_input.profile.dateOfBirth),
                bio=cls.normalize_string(raw_input.profile.bio),
            )

        # 2. Normalize Fit Data
        norm_fit_data = None
        if raw_input.fitData:
            norm_fit_data = UserFitDataInput(
                topSize=cls.normalize_clothing_size(raw_input.fitData.topSize),
                bottomSize=cls.normalize_clothing_size(raw_input.fitData.bottomSize),
                shoeSize=cls.normalize_string(raw_input.fitData.shoeSize),
                heightRange=cls.normalize_string(raw_input.fitData.heightRange),
                exactHeightCm=cls.normalize_measurement(raw_input.fitData.exactHeightCm),
                weightRange=cls.normalize_string(raw_input.fitData.weightRange),
                exactWeightKg=cls.normalize_measurement(raw_input.fitData.exactWeightKg),
                clothingSize=cls.normalize_clothing_size(raw_input.fitData.clothingSize),
                fitPreferences=cls.normalize_list(raw_input.fitData.fitPreferences),
                preferredStyles=cls.normalize_list(raw_input.fitData.preferredStyles),
                avoidedStyles=cls.normalize_list(raw_input.fitData.avoidedStyles),
                preferredClothingTypes=cls.normalize_list(raw_input.fitData.preferredClothingTypes),
                avoidedClothingTypes=cls.normalize_list(raw_input.fitData.avoidedClothingTypes),
                preferredColors=cls.normalize_list(raw_input.fitData.preferredColors),
                avoidedColors=cls.normalize_list(raw_input.fitData.avoidedColors),
                occasions=cls.normalize_list(raw_input.fitData.occasions),
                primaryOccasion=cls.normalize_choice(raw_input.fitData.primaryOccasion),
                budgetRange=cls.normalize_string(raw_input.fitData.budgetRange),
                shoppingPriorities=cls.normalize_list(raw_input.fitData.shoppingPriorities),
                fashionGoals=cls.normalize_list(raw_input.fitData.fashionGoals),
            )

        # 3. Normalize Images
        norm_profile_image = cls.normalize_string(raw_input.profileImage)

        norm_recommendation_images = []
        for img in raw_input.recommendationImages:
            cleaned_url = cls.normalize_string(img.imageUrl)
            if cleaned_url:
                norm_recommendation_images.append(
                    RecommendationImageInput(
                        id=img.id,
                        imageUrl=cleaned_url,
                        createdAt=img.createdAt,
                    )
                )

        return UserEncoderInput(
            userId=raw_input.userId,
            profileCompleted=raw_input.profileCompleted,
            profile=norm_profile,
            fitData=norm_fit_data,
            profileImage=norm_profile_image,
            recommendationImages=norm_recommendation_images,
        )
