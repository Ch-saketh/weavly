import logging
import re
from typing import List, Dict, Any, Optional, Tuple

from zyra.product_encoder.schemas.insight_schemas import (
    TextInsights,
    ConfidenceScore,
)

logger = logging.getLogger("zyra.product_encoder.text_encoder.insight_extractor")

# Canonical Fashion Lexicons
MATERIAL_PATTERNS = [
    (r"\b(\d{1,3}%\s+)?organic\s+cotton\b", "Organic Cotton"),
    (r"\b(\d{1,3}%\s+)?cotton\b", "Cotton"),
    (r"\bfrench\s+terry(\s+cotton)?\b", "French Terry"),
    (r"\b(\d{1,3}%\s+)?(merino\s+)?wool\b", "Wool"),
    (r"\b(\d{1,3}%\s+)?cashmere\b", "Cashmere"),
    (r"\b(\d{1,3}%\s+)?linen\b", "Linen"),
    (r"\b(\d{1,3}%\s+)?silk\b", "Silk"),
    (r"\b(\d{1,3}%\s+)?denim\b", "Denim"),
    (r"\b(\d{1,3}%\s+)?polyester\b", "Polyester"),
    (r"\b(\d{1,3}%\s+)?nylon\b", "Nylon"),
    (r"\b(\d{1,3}%\s+)?(spandex|elastane)\b", "Spandex / Elastane"),
    (r"\b(\d{1,3}%\s+)?(genuine\s+)?leather\b", "Leather"),
    (r"\bfaux\s+leather\b", "Faux Leather"),
    (r"\bvelvet\b", "Velvet"),
    (r"\bsatin\b", "Satin"),
    (r"\bfleece\b", "Fleece"),
    (r"\bcorduroy\b", "Corduroy"),
]

FIT_PATTERNS = [
    (r"\boversized(\s+fit)?\b", "Oversized"),
    (r"\brelaxed(\s+fit)?\b", "Relaxed"),
    (r"\bregular(\s+fit)?\b", "Regular"),
    (r"\bslim(\s+fit)?\b", "Slim"),
    (r"\bboxy(\s+fit|\s+cut)?\b", "Boxy"),
    (r"\bcropped(\s+fit|\s+cut)?\b", "Cropped"),
    (r"\bskinny(\s+fit)?\b", "Skinny"),
    (r"\bloose(\s+fit)?\b", "Loose"),
    (r"\btailored(\s+fit)?\b", "Tailored"),
]

STYLE_PATTERNS = [
    (r"\bstreetwear\b", "Streetwear"),
    (r"\bminimal(ist|ism)?\b", "Minimalist"),
    (r"\bcasual\b", "Casual"),
    (r"\bformal\b", "Formal"),
    (r"\bcontemporary\b", "Contemporary"),
    (r"\bvintage|retro\b", "Vintage / Retro"),
    (r"\bsporty|athleisure\b", "Sporty / Athleisure"),
    (r"\bbohemian|boho\b", "Bohemian"),
    (r"\bclassic\b", "Classic"),
    (r"\bgrunge\b", "Grunge"),
    (r"\bluxury|designer\b", "Luxury"),
]

OCCASION_PATTERNS = [
    (r"\b(casual|everyday|daily\s+wear)\b", "Casual / Everyday"),
    (r"\b(office|work|business|workwear)\b", "Work / Office"),
    (r"\b(party|evening|night\s+out|cocktail)\b", "Evening / Party"),
    (r"\b(formal|black\s+tie|gala)\b", "Formal"),
    (r"\b(streetwear|urban)\b", "Streetwear / Urban"),
    (r"\b(lounge|loungewear|home)\b", "Loungewear"),
    (r"\b(travel|airport|commute)\b", "Travel"),
    (r"\b(gym|workout|athletic|running)\b", "Sports / Activewear"),
    (r"\b(resort|vacation|beach|holiday)\b", "Vacation / Resort"),
]

SEASON_PATTERNS = [
    (r"\b(winter|cold\s+weather|heavyweight)\b", "Winter"),
    (r"\b(summer|hot\s+weather|lightweight)\b", "Summer"),
    (r"\b(autumn|fall)\b", "Autumn / Fall"),
    (r"\b(spring)\b", "Spring"),
    (r"\b(all-season|year-round|all\s+year)\b", "All-Season"),
]

KEYWORD_STOPWORDS = {
    "the", "a", "an", "and", "or", "in", "on", "at", "to", "for", "with", "by",
    "is", "are", "was", "were", "this", "that", "it", "from", "of", "as", "be",
    "product", "item", "clothing", "apparel", "wear", "design", "designed",
}


class ProductTextInsightExtractor:
    """
    Extracts structured fashion insights, materials, fit descriptors, styles,
    occasions, seasons, and detects cross-field semantic contradictions.
    """

    def extract_insights(self, prepared_fields: Dict[str, Any]) -> TextInsights:
        title = prepared_fields.get("title", "")
        description = prepared_fields.get("description", "")
        brand = prepared_fields.get("brand")
        category = prepared_fields.get("category", "")
        styles_in = prepared_fields.get("styles", [])
        occasions_in = prepared_fields.get("occasions", [])
        seasons_in = prepared_fields.get("seasons", [])
        tags_in = prepared_fields.get("tags", [])

        full_corpus = f"{title} {description} {' '.join(tags_in)}".lower()

        # 1. Extract Materials
        extracted_materials = self._extract_materials(full_corpus, description)

        # 2. Extract Fit & Detect Fit Contradictions
        fit_descriptor, fit_contradiction = self._extract_fit_and_contradictions(title, description)

        # 3. Extract Styles (combining explicit inputs and text matches)
        primary_style, secondary_styles = self._extract_styles(full_corpus, styles_in)

        # 4. Extract Occasions
        target_occasions = self._extract_occasions(full_corpus, occasions_in)

        # 5. Extract Seasons
        target_seasons = self._extract_seasons(full_corpus, seasons_in)

        # 6. Extract Intended Use
        intended_use = self._extract_intended_use(full_corpus, target_occasions)

        # 7. Semantic Keywords
        semantic_keywords = self._extract_semantic_keywords(title, description, tags_in)

        # 8. Contradictions list
        contradictions = []
        if fit_contradiction:
            contradictions.append(fit_contradiction)

        # Material Contradiction Check (e.g. Leather in title vs Faux Leather / Polyester in desc)
        mat_contradiction = self._check_material_contradiction(title, description)
        if mat_contradiction:
            contradictions.append(mat_contradiction)

        # 9. Synthesize Product Meaning
        meaning_components = []
        if brand:
            meaning_components.append(brand)
        if primary_style:
            meaning_components.append(primary_style.value)
        if fit_descriptor:
            meaning_components.append(f"{fit_descriptor.value} fit")
        if extracted_materials:
            meaning_components.append(extracted_materials[0].value)
        meaning_components.append(category if category else title)
        product_meaning = " ".join(meaning_components).strip()

        # Field provenance tracking
        field_prov = {
            "title": title,
            "descriptionPresent": bool(description),
            "brand": brand,
            "category": category,
            "tagsCount": len(tags_in),
        }

        return TextInsights(
            productMeaning=product_meaning,
            primaryStyle=primary_style,
            secondaryStyles=secondary_styles,
            intendedUse=intended_use,
            extractedMaterials=extracted_materials,
            fitDescriptor=fit_descriptor,
            targetSeasons=target_seasons,
            targetOccasions=target_occasions,
            semanticKeywords=semantic_keywords,
            detectedContradictions=contradictions,
            fieldProvenance=field_prov,
        )

    def _extract_materials(self, corpus: str, desc: str) -> List[ConfidenceScore]:
        materials: List[ConfidenceScore] = []
        seen = set()

        for pattern, label in MATERIAL_PATTERNS:
            match = re.search(pattern, corpus, re.IGNORECASE)
            if match and label not in seen:
                seen.add(label)
                # Higher confidence if exact percentage or in description
                matched_str = match.group(0).strip()
                has_pct = "%" in matched_str
                conf = 0.95 if has_pct else 0.85
                materials.append(
                    ConfidenceScore(
                        attribute="material",
                        value=f"{matched_str.title()}" if has_pct else label,
                        confidence=conf,
                        source="text",
                    )
                )

        return materials

    def _extract_fit_and_contradictions(
        self,
        title: str,
        description: str,
    ) -> Tuple[Optional[ConfidenceScore], Optional[Dict[str, Any]]]:
        title_fit = None
        desc_fit = None

        for pattern, label in FIT_PATTERNS:
            if re.search(pattern, title, re.IGNORECASE) and not title_fit:
                title_fit = label
            if re.search(pattern, description, re.IGNORECASE) and not desc_fit:
                desc_fit = label

        contradiction = None
        if title_fit and desc_fit and title_fit.lower() != desc_fit.lower():
            contradiction = {
                "attribute": "fit",
                "values": [
                    {"value": title_fit, "source": "title"},
                    {"value": desc_fit, "source": "description"},
                ],
                "conflict": True,
                "severity": "medium",
                "description": f"Title states '{title_fit}' but description mentions '{desc_fit}'",
            }

        chosen_fit = title_fit or desc_fit
        if not chosen_fit:
            return None, contradiction

        return (
            ConfidenceScore(
                attribute="fit",
                value=chosen_fit,
                confidence=0.90 if title_fit else 0.80,
                source="text",
            ),
            contradiction,
        )

    def _check_material_contradiction(self, title: str, description: str) -> Optional[Dict[str, Any]]:
        title_has_leather = bool(re.search(r"\bleather\b", title, re.IGNORECASE))
        desc_has_faux = bool(re.search(r"\bfaux\s+leather|polyurethane|polyester\b", description, re.IGNORECASE))

        if title_has_leather and desc_has_faux and not re.search(r"\bfaux\b", title, re.IGNORECASE):
            return {
                "attribute": "material",
                "values": [
                    {"value": "Leather", "source": "title"},
                    {"value": "Faux Leather / Synthetic", "source": "description"},
                ],
                "conflict": True,
                "severity": "high",
                "description": "Title claims 'Leather' while description states synthetic/faux composition.",
            }
        return None

    def _extract_styles(
        self,
        corpus: str,
        explicit_styles: List[str],
    ) -> Tuple[Optional[ConfidenceScore], List[ConfidenceScore]]:
        found_styles: List[ConfidenceScore] = []
        seen = set()

        # Prioritize explicit input styles from P1
        for s in explicit_styles:
            if s and s not in seen:
                seen.add(s)
                found_styles.append(
                    ConfidenceScore(attribute="style", value=s, confidence=0.95, source="text")
                )

        # Regex match styles in corpus
        for pattern, label in STYLE_PATTERNS:
            if re.search(pattern, corpus, re.IGNORECASE) and label not in seen:
                seen.add(label)
                found_styles.append(
                    ConfidenceScore(attribute="style", value=label, confidence=0.85, source="text")
                )

        primary = found_styles[0] if found_styles else None
        secondary = found_styles[1:] if len(found_styles) > 1 else []
        return primary, secondary

    def _extract_occasions(
        self,
        corpus: str,
        explicit_occasions: List[str],
    ) -> List[ConfidenceScore]:
        found: List[ConfidenceScore] = []
        seen = set()

        for o in explicit_occasions:
            if o and o not in seen:
                seen.add(o)
                found.append(ConfidenceScore(attribute="occasion", value=o, confidence=0.95, source="text"))

        for pattern, label in OCCASION_PATTERNS:
            if re.search(pattern, corpus, re.IGNORECASE) and label not in seen:
                seen.add(label)
                found.append(ConfidenceScore(attribute="occasion", value=label, confidence=0.80, source="text"))

        return found

    def _extract_seasons(
        self,
        corpus: str,
        explicit_seasons: List[str],
    ) -> List[ConfidenceScore]:
        found: List[ConfidenceScore] = []
        seen = set()

        for se in explicit_seasons:
            if se and se not in seen:
                seen.add(se)
                found.append(ConfidenceScore(attribute="season", value=se, confidence=0.95, source="text"))

        for pattern, label in SEASON_PATTERNS:
            if re.search(pattern, corpus, re.IGNORECASE) and label not in seen:
                seen.add(label)
                found.append(ConfidenceScore(attribute="season", value=label, confidence=0.80, source="text"))

        return found

    def _extract_intended_use(
        self,
        corpus: str,
        occasions: List[ConfidenceScore],
    ) -> List[ConfidenceScore]:
        uses: List[ConfidenceScore] = []
        seen = set()

        if re.search(r"\blayer(ing)?\b", corpus, re.IGNORECASE):
            uses.append(ConfidenceScore(attribute="intendedUse", value="Layering Piece", confidence=0.85, source="text"))
        if re.search(r"\bwarmth|insulat(ion|ed)\b", corpus, re.IGNORECASE):
            uses.append(ConfidenceScore(attribute="intendedUse", value="Cold Weather Warmth", confidence=0.85, source="text"))
        if re.search(r"\bstatement\b", corpus, re.IGNORECASE):
            uses.append(ConfidenceScore(attribute="intendedUse", value="Statement Piece", confidence=0.80, source="text"))

        for occ in occasions:
            if occ.value not in seen:
                seen.add(occ.value)
                uses.append(ConfidenceScore(attribute="intendedUse", value=f"Suitable for {occ.value}", confidence=0.75, source="text"))

        return uses

    def _extract_semantic_keywords(
        self,
        title: str,
        description: str,
        tags: List[str],
    ) -> List[str]:
        words = re.findall(r"\b[a-zA-Z0-9-]{3,}\b", f"{title} {description}".lower())
        keywords: List[str] = []
        seen = set(KEYWORD_STOPWORDS)

        # Include tags directly
        for t in tags:
            clean_t = t.lower().strip()
            if clean_t and clean_t not in seen:
                seen.add(clean_t)
                keywords.append(clean_t)

        for w in words:
            if w not in seen and len(keywords) < 15:
                seen.add(w)
                keywords.append(w)

        return keywords
