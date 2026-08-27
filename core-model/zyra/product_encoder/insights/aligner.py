import logging
import re
from typing import Optional

logger = logging.getLogger("zyra.product_encoder.insights.aligner")

# Canonical alignment maps
FIT_SYNONYMS = {
    "oversized": "oversized",
    "oversize": "oversized",
    "relaxed oversized": "oversized",
    "baggy": "oversized",
    "loose": "relaxed",
    "relaxed": "relaxed",
    "relaxed fit": "relaxed",
    "regular": "regular",
    "regular fit": "regular",
    "standard": "regular",
    "classic": "regular",
    "slim": "slim",
    "slim fit": "slim",
    "skinny": "skinny",
    "tailored": "tailored",
    "fitted": "fitted",
}

PATTERN_SYNONYMS = {
    "solid": "solid",
    "plain": "solid",
    "monochrome": "solid",
    "striped": "striped",
    "stripes": "striped",
    "pinstripe": "striped",
    "plaid": "plaid",
    "tartan": "plaid",
    "check": "checked",
    "checked": "checked",
    "floral": "floral",
    "graphic": "graphic",
    "printed": "printed",
    "print": "printed",
    "polka dot": "polka dot",
    "dots": "polka dot",
}

SLEEVE_SYNONYMS = {
    "long sleeve": "long sleeve",
    "long": "long sleeve",
    "full sleeve": "long sleeve",
    "short sleeve": "short sleeve",
    "short": "short sleeve",
    "half sleeve": "short sleeve",
    "sleeveless": "sleeveless",
    "no sleeve": "sleeveless",
    "3/4 sleeve": "3/4 sleeve",
    "three quarter": "3/4 sleeve",
}

NECKLINE_SYNONYMS = {
    "crew neck": "crew neck",
    "crewneck": "crew neck",
    "round neck": "crew neck",
    "v-neck": "v-neck",
    "v neck": "v-neck",
    "hooded": "hooded",
    "hood": "hooded",
    "collar": "collared",
    "collared": "collared",
    "polo": "polo collar",
    "turtleneck": "turtleneck",
    "mock neck": "mock neck",
}


class CrossModalAttributeAligner:
    """
    Normalizes and aligns linguistic and categorical descriptions across
    visual, textual, and attribute modalities into common canonical concepts.
    """

    def align_fit(self, value: Optional[str]) -> Optional[str]:
        if not value:
            return None
        val_clean = re.sub(r"[^a-zA-Z\s]", "", str(value).lower()).strip()
        for k, canon in FIT_SYNONYMS.items():
            if k in val_clean or val_clean == k:
                return canon
        return val_clean

    def align_pattern(self, value: Optional[str]) -> Optional[str]:
        if not value:
            return None
        val_clean = re.sub(r"[^a-zA-Z\s]", "", str(value).lower()).strip()
        for k, canon in PATTERN_SYNONYMS.items():
            if k in val_clean or val_clean == k:
                return canon
        return val_clean

    def align_sleeve(self, value: Optional[str]) -> Optional[str]:
        if not value:
            return None
        val_clean = re.sub(r"[^a-zA-Z0-9\s/]", "", str(value).lower()).strip()
        for k, canon in SLEEVE_SYNONYMS.items():
            if k in val_clean or val_clean == k:
                return canon
        return val_clean

    def align_neckline(self, value: Optional[str]) -> Optional[str]:
        if not value:
            return None
        val_clean = re.sub(r"[^a-zA-Z\s-]", "", str(value).lower()).strip()
        for k, canon in NECKLINE_SYNONYMS.items():
            if k in val_clean or val_clean == k:
                return canon
        return val_clean

    def align_generic(self, value: Optional[str]) -> Optional[str]:
        if not value:
            return None
        return str(value).strip().lower()
