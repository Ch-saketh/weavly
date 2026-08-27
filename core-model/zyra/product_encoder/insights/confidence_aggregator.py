import logging
from typing import List, Optional

from zyra.product_encoder.insights.models import AttributeEvidence

logger = logging.getLogger("zyra.product_encoder.insights.confidence_aggregator")

MODALITY_WEIGHTS = {
    "attribute": 1.00,
    "text": 0.90,
    "visual": 0.85,
}


class ProductConfidenceAggregator:
    """
    Computes multi-source aggregated confidence scores considering
    source reliability, agreement amplification, and conflict penalties.
    """

    def aggregate_confidence(
        self,
        supporting_evidence: List[AttributeEvidence],
        has_conflict: bool = False,
        conflict_severity: str = "medium",
    ) -> float:
        """
        Calculates combined confidence score across independent supporting evidence.
        c_agg = 1.0 - prod(1.0 - c_i * w_i)
        """
        if not supporting_evidence:
            return 0.0

        if len(supporting_evidence) == 1:
            base_c = supporting_evidence[0].confidence
            src = supporting_evidence[0].source
            w = MODALITY_WEIGHTS.get(src, 0.8)
            conf = base_c * w
        else:
            # Multi-source agreement amplification
            complement_prod = 1.0
            for e in supporting_evidence:
                w = MODALITY_WEIGHTS.get(e.source, 0.8)
                eff_c = min(0.99, max(0.01, e.confidence * w))
                complement_prod *= (1.0 - eff_c)
            conf = 1.0 - complement_prod

        # Apply conflict penalty if contradictory evidence exists
        if has_conflict:
            penalty = 0.25 if conflict_severity == "high" else 0.15
            conf *= (1.0 - penalty)

        return round(min(1.0, max(0.1, conf)), 2)
