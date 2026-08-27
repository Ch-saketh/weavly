import logging
from typing import Dict, List, Any, Optional

from zyra.product_encoder.schemas.output_schemas import (
    ProductVisualRepresentation,
    TextRepresentation,
    AttributeRepresentation,
)
from zyra.product_encoder.schemas.insight_schemas import (
    ConfidenceAwareInsight,
)
from zyra.product_encoder.insights.models import (
    UnifiedProductProfile,
    ProductIdentityInsight,
    ColorInsightSummary,
    MaterialInsightSummary,
    FitInsightSummary,
    DesignDetailsSummary,
    SizeProfileSummary,
    ResolvedAttribute,
    CrossModalConflict,
    AttributeEvidence,
)
from zyra.product_encoder.insights.conflict_detector import ProductConflictDetector
from zyra.product_encoder.insights.confidence_aggregator import ProductConfidenceAggregator

logger = logging.getLogger("zyra.product_encoder.insights.builder")


class ProductProfileBuilder:
    """
    Constructs the canonical UnifiedProductProfile from grouped evidence,
    detected conflicts, and aggregated confidence calculations.
    """

    def __init__(
        self,
        conflict_detector: Optional[ProductConflictDetector] = None,
        confidence_aggregator: Optional[ProductConfidenceAggregator] = None,
    ) -> None:
        self.conflict_detector = conflict_detector or ProductConflictDetector()
        self.confidence_aggregator = confidence_aggregator or ProductConfidenceAggregator()

    def build_profile(
        self,
        product_id: str,
        evidence_by_attr: Dict[str, List[AttributeEvidence]],
        visual: Optional[ProductVisualRepresentation] = None,
        text: Optional[TextRepresentation] = None,
        attribute: Optional[AttributeRepresentation] = None,
        encoder_versions: Optional[Dict[str, str]] = None,
    ) -> UnifiedProductProfile:
        conflicts: List[CrossModalConflict] = []
        missing_info: List[str] = []

        # 1. Identity
        cat_ev = evidence_by_attr.get("category", [])
        subcat_ev = evidence_by_attr.get("subcategory", [])
        cat_conflict = self.conflict_detector.detect_conflicts("category", cat_ev)
        if cat_conflict:
            conflicts.append(cat_conflict)
            cat_val = cat_conflict.resolvedValue
        else:
            cat_val = cat_ev[0].value if cat_ev else None

        subcat_val = subcat_ev[0].value if subcat_ev else None
        brand_val = None
        if text and text.textInsights:
            brand_val = getattr(text.textInsights, "brand", None)
            if not brand_val and hasattr(text.textInsights, "fieldProvenance") and isinstance(text.textInsights.fieldProvenance, dict):
                brand_val = text.textInsights.fieldProvenance.get("brand")

        identity = ProductIdentityInsight(
            productType=subcat_val or cat_val,
            category=cat_val,
            subcategory=subcat_val,
            brand=brand_val,
            confidence=self.confidence_aggregator.aggregate_confidence(cat_ev, has_conflict=bool(cat_conflict)),
            sources=list(set(e.source for e in (cat_ev + subcat_ev))),
        )


        # 2. Color
        col_ev = evidence_by_attr.get("color", [])
        col_conflict = self.conflict_detector.detect_conflicts("color", col_ev)
        if col_conflict:
            conflicts.append(col_conflict)

        primary_col = None
        secondary_cols: List[str] = []
        if col_ev:
            unique_cols = list(dict.fromkeys(str(e.value) for e in col_ev))
            primary_col = unique_cols[0]
            if len(unique_cols) > 1:
                secondary_cols = unique_cols[1:]

        color_summary = ColorInsightSummary(
            primaryColor=primary_col,
            secondaryColors=secondary_cols,
            colorFamily=primary_col,
            confidence=self.confidence_aggregator.aggregate_confidence(col_ev, has_conflict=bool(col_conflict)),
            sources=list(set(e.source for e in col_ev)),
            hasVisualEvidence=any(e.source == "visual" for e in col_ev),
            hasAttributeEvidence=any(e.source == "attribute" for e in col_ev),
        )
        if not primary_col:
            missing_info.append("color")

        # 3. Material
        mat_ev = evidence_by_attr.get("material", [])
        mat_comp = (
            attribute.structuredAttributes.materialBreakdown
            if attribute and attribute.structuredAttributes
            else {}
        )
        mat_name = mat_ev[0].value if mat_ev else None

        mat_sources = list(set(e.source for e in mat_ev) | ({"attribute"} if mat_comp else set()))
        mat_summary = MaterialInsightSummary(
            materialName=mat_name,
            materialComposition=mat_comp,
            appearanceDescription=f"{mat_name} fabric" if mat_name else None,
            confidence=self.confidence_aggregator.aggregate_confidence(mat_ev),
            sources=mat_sources,
        )

        if not mat_name and not mat_comp:
            missing_info.append("material")

        # 4. Fit & Silhouette
        fit_ev = evidence_by_attr.get("fit", [])
        fit_conflict = self.conflict_detector.detect_conflicts("fit", fit_ev)
        if fit_conflict:
            conflicts.append(fit_conflict)
            fit_val = fit_conflict.resolvedValue
        else:
            fit_val = fit_ev[0].value if fit_ev else None

        sil_ev = evidence_by_attr.get("silhouette", [])
        sil_val = sil_ev[0].value if sil_ev else None

        fit_summary = FitInsightSummary(
            fitType=fit_val,
            silhouette=sil_val,
            confidence=self.confidence_aggregator.aggregate_confidence(
                fit_ev, has_conflict=bool(fit_conflict), conflict_severity="high" if fit_conflict else "medium"
            ),
            sources=list(set(e.source for e in (fit_ev + sil_ev))),
            hasConflict=bool(fit_conflict),
        )
        if not fit_val:
            missing_info.append("fit")

        # 5. Pattern
        pat_ev = evidence_by_attr.get("pattern", [])
        pat_conflict = self.conflict_detector.detect_conflicts("pattern", pat_ev)
        if pat_conflict:
            conflicts.append(pat_conflict)
            pat_val = pat_conflict.resolvedValue
        else:
            pat_val = pat_ev[0].value if pat_ev else None

        resolved_pat = (
            ResolvedAttribute(
                attribute="pattern",
                value=pat_val,
                confidence=self.confidence_aggregator.aggregate_confidence(pat_ev, has_conflict=bool(pat_conflict)),
                sources=list(set(e.source for e in pat_ev)),
                agreement="strong" if len(pat_ev) > 1 and not pat_conflict else "single_source",
                evidence=pat_ev,
                hasConflict=bool(pat_conflict),
            )
            if pat_val
            else None
        )
        if not pat_val:
            missing_info.append("pattern")

        # 6. Design Details
        neck_ev = evidence_by_attr.get("neckline", [])
        sleeve_ev = evidence_by_attr.get("sleeve", [])
        len_ev = evidence_by_attr.get("length", [])
        sleeve_conflict = self.conflict_detector.detect_conflicts("sleeve", sleeve_ev)
        if sleeve_conflict:
            conflicts.append(sleeve_conflict)

        closure_val = (
            attribute.structuredAttributes.closureType
            if attribute and attribute.structuredAttributes
            else None
        )

        design_summary = DesignDetailsSummary(
            neckline=neck_ev[0].value if neck_ev else None,
            sleeve=sleeve_conflict.resolvedValue if sleeve_conflict else (sleeve_ev[0].value if sleeve_ev else None),
            length=len_ev[0].value if len_ev else None,
            closure=closure_val,
            pockets=False,
            visibleFeatures=[
                getattr(v, "value", str(v))
                for v in (getattr(visual.visualInsights, "visibleDetails", []) or [])
            ] if visual and visual.visualInsights else [],
        )


        # 7. Multi-label Style, Occasion, Season Profiles
        def build_multilabel(attr_name: str) -> List[ConfidenceAwareInsight]:
            evs = evidence_by_attr.get(attr_name, [])
            val_map: Dict[str, List[AttributeEvidence]] = {}
            for e in evs:
                k = str(e.value).strip()
                if k not in val_map:
                    val_map[k] = []
                val_map[k].append(e)

            insights: List[ConfidenceAwareInsight] = []
            for k, sub_evs in val_map.items():
                c = self.confidence_aggregator.aggregate_confidence(sub_evs)
                srcs = list(set(e.source for e in sub_evs))
                insights.append(
                    ConfidenceAwareInsight(
                        insight=k,
                        confidence=c,
                        evidence=[f"source={e.source}" for e in sub_evs],
                    )
                )
            return insights

        style_profile = build_multilabel("style")
        occasion_profile = build_multilabel("occasion")
        season_profile = build_multilabel("season")

        if not style_profile:
            missing_info.append("style")
        if not occasion_profile:
            missing_info.append("occasion")
        if not season_profile:
            missing_info.append("season")

        # 8. Sizing Profile
        size_range = (
            attribute.structuredAttributes.sizeRange
            if attribute and attribute.structuredAttributes
            else []
        )
        measurements = (
            attribute.structuredAttributes.garmentMeasurements
            if attribute and attribute.structuredAttributes
            else {}
        )
        size_summary = SizeProfileSummary(
            availableSizes=size_range,
            sizeScale="ALPHA_STANDARD" if size_range else None,
            measurementsCm=measurements,
        )

        # 9. Modality Summary
        modality_summary = {
            "visual": {
                "available": visual is not None,
                "successfulImages": visual.successfulImageCount if visual else 0,
                "failedImages": visual.failedImageCount if visual else 0,
            },
            "text": {
                "available": text is not None,
                "confidence": text.confidence if text else 0.0,
            },
            "attribute": {
                "available": attribute is not None,
                "confidence": attribute.confidence if attribute else 0.0,
            },
        }

        # 10. Overall Confidence
        active_confs = [identity.confidence, color_summary.confidence, mat_summary.confidence, fit_summary.confidence]
        valid_confs = [c for c in active_confs if c > 0.0]
        overall_conf = round(sum(valid_confs) / max(1, len(valid_confs)), 2)
        if conflicts:
            overall_conf = max(0.50, round(overall_conf * 0.90, 2))

        return UnifiedProductProfile(
            productId=product_id,
            identity=identity,
            color=color_summary,
            material=mat_summary,
            fit=fit_summary,
            pattern=resolved_pat,
            designDetails=design_summary,
            styleProfile=style_profile,
            occasionProfile=occasion_profile,
            seasonProfile=season_profile,
            sizeProfile=size_summary,
            conflicts=conflicts,
            missingInformation=missing_info,
            provenance={
                "modalitiesUsed": [m for m, v in modality_summary.items() if v["available"]],
                "conflictsCount": len(conflicts),
                "evidenceCounts": {k: len(v) for k, v in evidence_by_attr.items()},
            },
            confidence=overall_conf,
            modalitySummary=modality_summary,
            encoderVersions=encoder_versions or {},
        )
