import logging
from typing import Dict, List, Optional, Any

from zyra.product_encoder.schemas.output_schemas import (
    ProductVisualRepresentation,
    TextRepresentation,
    AttributeRepresentation,
)
from zyra.product_encoder.insights.models import AttributeEvidence
from zyra.product_encoder.insights.aligner import CrossModalAttributeAligner

logger = logging.getLogger("zyra.product_encoder.insights.collector")


class AttributeEvidenceCollector:
    """
    Collects, normalizes, and groups raw evidence items across Visual, Text,
    and Attribute modality representations using defensive field inspection.
    """

    def __init__(self, aligner: Optional[CrossModalAttributeAligner] = None) -> None:
        self.aligner = aligner or CrossModalAttributeAligner()

    def collect(
        self,
        visual: Optional[ProductVisualRepresentation] = None,
        text: Optional[TextRepresentation] = None,
        attribute: Optional[AttributeRepresentation] = None,
    ) -> Dict[str, List[AttributeEvidence]]:
        evidence_by_attr: Dict[str, List[AttributeEvidence]] = {}

        def add_evidence(attr: str, val: Any, src: str, conf: float = 1.0, raw: Optional[str] = None):
            if val is None or val == "":
                return
            if attr not in evidence_by_attr:
                evidence_by_attr[attr] = []
            evidence_by_attr[attr].append(
                AttributeEvidence(
                    attribute=attr,
                    value=val,
                    source=src,
                    confidence=conf,
                    rawText=raw,
                )
            )

        def extract_score_val(obj: Any) -> Optional[tuple[Any, float]]:
            if obj is None:
                return None
            if hasattr(obj, "value") and hasattr(obj, "confidence"):
                return obj.value, getattr(obj, "confidence", 1.0)
            if isinstance(obj, dict) and "value" in obj:
                return obj["value"], obj.get("confidence", 1.0)
            return obj, 1.0

        # 1. Collect from Visual Representation (Phase P2)
        if visual and visual.visualInsights:
            v_ins = visual.visualInsights

            # Garment type / Category
            g_type = getattr(v_ins, "garmentType", None) or getattr(v_ins, "dominantGarmentType", None)
            if g_type:
                v, c = extract_score_val(g_type)
                add_evidence("category", v, "visual", c)

            # Colors
            dom_colors = getattr(v_ins, "dominantColors", []) or []
            for item in dom_colors:
                res = extract_score_val(item)
                if res:
                    add_evidence("color", res[0], "visual", res[1])

            # Pattern
            pat = getattr(v_ins, "pattern", None)
            if pat:
                v, c = extract_score_val(pat)
                canon_p = self.aligner.align_pattern(v)
                add_evidence("pattern", canon_p, "visual", c, raw=str(v))
            for p_item in (getattr(v_ins, "detectedPatterns", []) or []):
                res = extract_score_val(p_item)
                if res:
                    canon_p = self.aligner.align_pattern(res[0])
                    add_evidence("pattern", canon_p, "visual", res[1], raw=str(res[0]))

            # Silhouette & Fit
            sil = getattr(v_ins, "silhouette", None)
            if sil:
                v, c = extract_score_val(sil)
                canon_fit = self.aligner.align_fit(v)
                add_evidence("fit", canon_fit, "visual", c, raw=str(v))
                add_evidence("silhouette", v, "visual", c)
            for s_item in (getattr(v_ins, "detectedSilhouettes", []) or []):
                res = extract_score_val(s_item)
                if res:
                    canon_fit = self.aligner.align_fit(res[0])
                    add_evidence("fit", canon_fit, "visual", res[1], raw=str(res[0]))
                    add_evidence("silhouette", res[0], "visual", res[1])

            fit_val = getattr(v_ins, "fit", None)
            if fit_val:
                v, c = extract_score_val(fit_val)
                canon_fit = self.aligner.align_fit(v)
                add_evidence("fit", canon_fit, "visual", c, raw=str(v))

            # Neckline
            neck = getattr(v_ins, "neckline", None)
            if neck:
                v, c = extract_score_val(neck)
                canon_neck = self.aligner.align_neckline(v)
                add_evidence("neckline", canon_neck, "visual", c, raw=str(v))
            for n_item in (getattr(v_ins, "detectedNecklines", []) or []):
                res = extract_score_val(n_item)
                if res:
                    canon_neck = self.aligner.align_neckline(res[0])
                    add_evidence("neckline", canon_neck, "visual", res[1], raw=str(res[0]))

            # Sleeve
            slv = getattr(v_ins, "sleeve", None)
            if slv:
                v, c = extract_score_val(slv)
                canon_slv = self.aligner.align_sleeve(v)
                add_evidence("sleeve", canon_slv, "visual", c, raw=str(v))
            for sl_item in (getattr(v_ins, "detectedSleeves", []) or []):
                res = extract_score_val(sl_item)
                if res:
                    canon_slv = self.aligner.align_sleeve(res[0])
                    add_evidence("sleeve", canon_slv, "visual", res[1], raw=str(res[0]))

            # Length
            lng = getattr(v_ins, "length", None)
            if lng:
                v, c = extract_score_val(lng)
                add_evidence("length", v, "visual", c)

        # 2. Collect from Text Representation (Phase P3)
        if text and text.textInsights:
            t_ins = text.textInsights

            cat = getattr(t_ins, "category", None)
            if cat:
                v, c = extract_score_val(cat)
                add_evidence("category", v, "text", c)

            subcat = getattr(t_ins, "subcategory", None)
            if subcat:
                v, c = extract_score_val(subcat)
                add_evidence("subcategory", v, "text", c)

            for m_item in (getattr(t_ins, "extractedMaterials", []) or []):
                res = extract_score_val(m_item)
                if res:
                    add_evidence("material", res[0], "text", res[1])

            fit_item = getattr(t_ins, "fitDescriptor", None) or getattr(t_ins, "fitType", None)
            if fit_item:
                v, c = extract_score_val(fit_item)
                canon_fit = self.aligner.align_fit(v)
                add_evidence("fit", canon_fit, "text", c, raw=str(v))

            pri_style = getattr(t_ins, "primaryStyle", None)
            if pri_style:
                v, c = extract_score_val(pri_style)
                add_evidence("style", v, "text", c)

            for s_item in (getattr(t_ins, "secondaryStyles", []) or []):
                res = extract_score_val(s_item)
                if res:
                    add_evidence("style", res[0], "text", res[1])

            for o_item in (getattr(t_ins, "targetOccasions", []) or []):
                res = extract_score_val(o_item)
                if res:
                    add_evidence("occasion", res[0], "text", res[1])

            for se_item in (getattr(t_ins, "targetSeasons", []) or []):
                res = extract_score_val(se_item)
                if res:
                    add_evidence("season", res[0], "text", res[1])

        # 3. Collect from Attribute Representation (Phase P4)
        if attribute and attribute.structuredAttributes:
            a_ins = attribute.structuredAttributes

            std_cat = getattr(a_ins, "standardizedCategory", None)
            if std_cat:
                v, c = extract_score_val(std_cat)
                add_evidence("category", v, "attribute", c)

            std_subcat = getattr(a_ins, "standardizedSubcategory", None)
            if std_subcat:
                v, c = extract_score_val(std_subcat)
                add_evidence("subcategory", v, "attribute", c)

            if getattr(a_ins, "materialBreakdown", None):
                for m_key in a_ins.materialBreakdown.keys():
                    add_evidence("material", m_key, "attribute", 1.0)

            fit_cat = getattr(a_ins, "fitCategory", None)

            if fit_cat:
                v, c = extract_score_val(fit_cat)
                canon_fit = self.aligner.align_fit(v)
                add_evidence("fit", canon_fit, "attribute", c, raw=str(v))

            sil = getattr(a_ins, "silhouette", None)
            if sil:
                v, c = extract_score_val(sil)
                add_evidence("silhouette", v, "attribute", c)

            pat = getattr(a_ins, "pattern", None)
            if pat:
                v, c = extract_score_val(pat)
                canon_p = self.aligner.align_pattern(v)
                add_evidence("pattern", canon_p, "attribute", c, raw=str(v))

            neck = getattr(a_ins, "neckline", None)
            if neck:
                v, c = extract_score_val(neck)
                canon_neck = self.aligner.align_neckline(v)
                add_evidence("neckline", canon_neck, "attribute", c, raw=str(v))

            slv = getattr(a_ins, "sleeve", None)
            if slv:
                v, c = extract_score_val(slv)
                canon_slv = self.aligner.align_sleeve(v)
                add_evidence("sleeve", canon_slv, "attribute", c, raw=str(v))

            lng = getattr(a_ins, "length", None)
            if lng:
                v, c = extract_score_val(lng)
                add_evidence("length", v, "attribute", c)

            for col_item in (getattr(a_ins, "colorProfile", []) or []):
                res = extract_score_val(col_item)
                if res:
                    add_evidence("color", res[0], "attribute", res[1])

            for s_item in (getattr(a_ins, "styleTags", []) or []):
                res = extract_score_val(s_item)
                if res:
                    add_evidence("style", res[0], "attribute", res[1])

            for o_item in (getattr(a_ins, "occasionTags", []) or []):
                res = extract_score_val(o_item)
                if res:
                    add_evidence("occasion", res[0], "attribute", res[1])

            for se_item in (getattr(a_ins, "seasonTags", []) or []):
                res = extract_score_val(se_item)
                if res:
                    add_evidence("season", res[0], "attribute", res[1])

        return evidence_by_attr
