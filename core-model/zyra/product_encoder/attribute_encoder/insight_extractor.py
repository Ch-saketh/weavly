import logging
from typing import Dict, Any, List, Optional

from zyra.product_encoder.schemas.insight_schemas import (
    AttributeInsights,
    ConfidenceScore,
)

logger = logging.getLogger("zyra.product_encoder.attribute_encoder.insight_extractor")


class ProductAttributeInsightExtractor:
    """
    Extracts structured fashion insights, categorical confidence scores,
    and detects intra-attribute structured conflicts.
    """

    def extract_insights(self, prepared_data: Dict[str, Any]) -> AttributeInsights:
        cat = prepared_data.get("category", "")
        subcat = prepared_data.get("subcategory", "")
        attrs = prepared_data.get("attributes")
        fit_info = prepared_data.get("fitInformation")
        size_info = prepared_data.get("sizeInfo")
        material_breakdown = prepared_data.get("materialBreakdown", {})
        measurements_cm = prepared_data.get("measurementsCm", {})

        styles = prepared_data.get("styles", [])
        occasions = prepared_data.get("occasions", [])
        seasons = prepared_data.get("seasons", [])

        # 1. Category & Subcategory
        std_cat = ConfidenceScore(attribute="category", value=cat, confidence=1.0, source="attribute") if cat else None
        std_subcat = ConfidenceScore(attribute="subcategory", value=subcat, confidence=1.0, source="attribute") if subcat else None

        # 2. Fit & Conflict Check
        attr_fit = attrs.fit if attrs and attrs.fit else None
        fit_info_type = fit_info.fitType if fit_info and fit_info.fitType else None

        contradictions: List[Dict[str, Any]] = []
        if attr_fit and fit_info_type and attr_fit.lower() != fit_info_type.lower():
            contradictions.append({
                "attribute": "fit",
                "values": [
                    {"value": attr_fit, "source": "attribute.fit"},
                    {"value": fit_info_type, "source": "attribute.fitInformation"},
                ],
                "conflict": True,
                "severity": "medium",
                "description": f"Attributes state fit='{attr_fit}' while fitInformation states fitType='{fit_info_type}'",
            })

        chosen_fit = attr_fit or fit_info_type
        fit_cat = ConfidenceScore(attribute="fit", value=chosen_fit, confidence=1.0, source="attribute") if chosen_fit else None

        # 3. Aesthetics & Attributes
        silhouette = ConfidenceScore(attribute="silhouette", value=attrs.silhouette, confidence=1.0, source="attribute") if attrs and attrs.silhouette else None
        pattern = ConfidenceScore(attribute="pattern", value=attrs.pattern, confidence=1.0, source="attribute") if attrs and attrs.pattern else None
        neckline = ConfidenceScore(attribute="neckline", value=attrs.neckline, confidence=1.0, source="attribute") if attrs and attrs.neckline else None
        sleeve = ConfidenceScore(attribute="sleeve", value=attrs.sleeve, confidence=1.0, source="attribute") if attrs and attrs.sleeve else None
        length = ConfidenceScore(attribute="length", value=attrs.length, confidence=1.0, source="attribute") if attrs and attrs.length else None

        # 4. Color Profile
        color_profile: List[ConfidenceScore] = []
        if attrs and attrs.color:
            color_profile.append(
                ConfidenceScore(attribute="color", value=attrs.color, confidence=1.0, source="attribute")
            )

        # 5. Multi-label Tags
        style_tags = [
            ConfidenceScore(attribute="style", value=s, confidence=1.0, source="attribute")
            for s in styles if s
        ]
        occasion_tags = [
            ConfidenceScore(attribute="occasion", value=o, confidence=1.0, source="attribute")
            for o in occasions if o
        ]
        season_tags = [
            ConfidenceScore(attribute="season", value=se, confidence=1.0, source="attribute")
            for se in seasons if se
        ]

        # 6. Sizing & Measurements
        size_range = size_info.availableSizes if size_info and size_info.availableSizes else []
        closure = attrs.closure if attrs and attrs.closure else None
        care = attrs.careInstructions if attrs and attrs.careInstructions else None

        # 7. Field Provenance
        field_prov = {
            "hasCategory": bool(cat),
            "hasSubcategory": bool(subcat),
            "hasMaterial": bool(attrs and attrs.material),
            "hasColor": bool(attrs and attrs.color),
            "hasFit": bool(chosen_fit),
            "hasSizeInfo": bool(size_range),
            "hasMeasurements": len(measurements_cm) > 0,
            "stylesCount": len(styles),
            "occasionsCount": len(occasions),
            "seasonsCount": len(seasons),
        }

        return AttributeInsights(
            standardizedCategory=std_cat,
            standardizedSubcategory=std_subcat,
            materialBreakdown=material_breakdown,
            fitCategory=fit_cat,
            silhouette=silhouette,
            pattern=pattern,
            neckline=neckline,
            sleeve=sleeve,
            length=length,
            colorProfile=color_profile,
            styleTags=style_tags,
            occasionTags=occasion_tags,
            seasonTags=season_tags,
            sizeRange=size_range,
            garmentMeasurements=measurements_cm,
            closureType=closure,
            careSummary=care,
            detectedContradictions=contradictions,
            fieldProvenance=field_prov,
        )
