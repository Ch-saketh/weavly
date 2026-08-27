import logging
from typing import List, Dict, Any, Optional, Tuple

from zyra.product_encoder.insights.models import AttributeEvidence, CrossModalConflict

logger = logging.getLogger("zyra.product_encoder.insights.conflict_detector")

# Mutually exclusive pairs / sets
MUTUALLY_EXCLUSIVE_FITS = {
    ("oversized", "slim"),
    ("oversized", "skinny"),
    ("oversized", "tight"),
    ("relaxed", "skinny"),
    ("slim", "loose"),
}

MUTUALLY_EXCLUSIVE_PATTERNS = {
    ("solid", "striped"),
    ("solid", "plaid"),
    ("solid", "floral"),
    ("solid", "printed"),
}

MUTUALLY_EXCLUSIVE_SLEEVES = {
    ("sleeveless", "long sleeve"),
    ("sleeveless", "short sleeve"),
}


class ProductConflictDetector:
    """
    Detects cross-modal contradictions and distinguishes mutually exclusive
    conflicts from compatible multi-label differences.
    """

    def is_contradictory_fit(self, val1: str, val2: str) -> bool:
        v1, v2 = val1.lower(), val2.lower()
        if v1 == v2:
            return False
        return (v1, v2) in MUTUALLY_EXCLUSIVE_FITS or (v2, v1) in MUTUALLY_EXCLUSIVE_FITS

    def is_contradictory_pattern(self, val1: str, val2: str) -> bool:
        v1, v2 = val1.lower(), val2.lower()
        if v1 == v2:
            return False
        return (v1, v2) in MUTUALLY_EXCLUSIVE_PATTERNS or (v2, v1) in MUTUALLY_EXCLUSIVE_PATTERNS

    def is_contradictory_sleeve(self, val1: str, val2: str) -> bool:
        v1, v2 = val1.lower(), val2.lower()
        if v1 == v2:
            return False
        return (v1, v2) in MUTUALLY_EXCLUSIVE_SLEEVES or (v2, v1) in MUTUALLY_EXCLUSIVE_SLEEVES

    def detect_conflicts(
        self, attribute: str, evidence_list: List[AttributeEvidence]
    ) -> Optional[CrossModalConflict]:
        """
        Examines evidence items for a given attribute across modalities.
        Returns a CrossModalConflict if contradictory evidence is found.
        """
        if len(evidence_list) < 2:
            return None

        unique_vals = set(str(e.value).lower() for e in evidence_list if e.value is not None)
        if len(unique_vals) <= 1:
            return None

        vals_list = list(unique_vals)
        has_contradiction = False

        if attribute == "fit":
            for i in range(len(vals_list)):
                for j in range(i + 1, len(vals_list)):
                    if self.is_contradictory_fit(vals_list[i], vals_list[j]):
                        has_contradiction = True
                        break
        elif attribute == "pattern":
            for i in range(len(vals_list)):
                for j in range(i + 1, len(vals_list)):
                    if self.is_contradictory_pattern(vals_list[i], vals_list[j]):
                        has_contradiction = True
                        break
        elif attribute == "sleeve":
            for i in range(len(vals_list)):
                for j in range(i + 1, len(vals_list)):
                    if self.is_contradictory_sleeve(vals_list[i], vals_list[j]):
                        has_contradiction = True
                        break
        elif attribute in ("color", "category"):
            # Multi-color or category divergence
            has_contradiction = True

        if not has_contradiction:
            return None

        # Build conflict record with resolution
        resolved_val, strategy = self.resolve_conflict(attribute, evidence_list)

        return CrossModalConflict(
            attribute=attribute,
            values=[
                {
                    "value": e.value,
                    "source": e.source,
                    "confidence": e.confidence,
                }
                for e in evidence_list
            ],
            conflict=True,
            severity="high" if attribute in ("fit", "category") else "medium",
            description=f"Contradictory evidence detected for '{attribute}' across modalities ({', '.join(unique_vals)})",
            resolvedValue=resolved_val,
            resolutionStrategy=strategy,
        )

    def resolve_conflict(
        self, attribute: str, evidence_list: List[AttributeEvidence]
    ) -> Tuple[Any, str]:
        """
        Deterministically selects the most reliable resolved value based on domain source priority.
        """
        # Material: attribute > text > visual
        if attribute == "material":
            for src in ("attribute", "text", "visual"):
                for e in evidence_list:
                    if e.source == src and e.value:
                        return e.value, f"source_priority({src})"

        # Color / Pattern: visual > text > attribute
        if attribute in ("color", "pattern", "silhouette"):
            for src in ("visual", "text", "attribute"):
                for e in evidence_list:
                    if e.source == src and e.value:
                        return e.value, f"source_priority({src})"

        # Default: majority voting weighted by confidence
        score_by_val: Dict[str, float] = {}
        for e in evidence_list:
            v_str = str(e.value)
            score_by_val[v_str] = score_by_val.get(v_str, 0.0) + e.confidence

        best_val = max(score_by_val.items(), key=lambda item: item[1])[0]
        return best_val, "confidence_weighted_majority"
