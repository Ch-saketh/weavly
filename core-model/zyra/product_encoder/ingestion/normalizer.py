import html
import logging
import re
from typing import List, Dict, Any, Tuple, Optional
from zyra.product_encoder.schemas.input_schemas import (
    ProductDataPackage,
    ProductImageInput,
    ProductAttributes,
    SizeInfo,
    FitInformation,
    StaticProductData,
)
from zyra.product_encoder.schemas.ingestion_schemas import NormalizationWarning

logger = logging.getLogger("zyra.product_encoder.ingestion.normalizer")

# Canonical Image View Map
IMAGE_VIEW_MAP: Dict[str, str] = {
    "front": "front",
    "front-view": "front",
    "frontview": "front",
    "front_view": "front",
    "f": "front",
    "back": "back",
    "back-view": "back",
    "backview": "back",
    "back_view": "back",
    "b": "back",
    "rear": "back",
    "side": "side",
    "side-view": "side",
    "sideview": "side",
    "side_view": "side",
    "left": "side",
    "right": "side",
    "detail": "detail",
    "detail-view": "detail",
    "detail_view": "detail",
    "texture": "detail",
    "fabric": "detail",
    "macro": "detail",
    "close_up": "close_up",
    "close-up": "close_up",
    "closeup": "close_up",
    "zoom": "close_up",
    "flat_lay": "flat_lay",
    "flat-lay": "flat_lay",
    "flatlay": "flat_lay",
    "ghost": "flat_lay",
    "on_model": "on_model",
    "on-model": "on_model",
    "onmodel": "on_model",
    "model": "on_model",
    "editorial": "on_model",
    "outfit": "outfit",
    "lookbook": "outfit",
    "styled": "outfit",
    "additional": "additional",
    "alt": "additional",
    "other": "additional",
}

# Deterministic Fit Map
FIT_NORMALIZATION_MAP: Dict[str, str] = {
    "oversized": "Oversized",
    "oversize": "Oversized",
    "oversized fit": "Oversized",
    "relaxed": "Relaxed",
    "relaxed fit": "Relaxed",
    "slim": "Slim",
    "slim fit": "Slim",
    "regular": "Regular",
    "regular fit": "Regular",
    "standard": "Regular",
    "standard fit": "Regular",
    "skinny": "Skinny",
    "skinny fit": "Skinny",
    "loose": "Loose",
    "loose fit": "Loose",
    "boxy": "Boxy",
    "boxy fit": "Boxy",
    "tailored": "Tailored",
    "tailored fit": "Tailored",
    "athletic": "Athletic",
    "athletic fit": "Athletic",
    "compression": "Compression",
}


class ProductDataNormalizer:
    """
    Performs deterministic, idempotent cleaning and normalization of raw ProductDataPackage data.
    Preserves all semantic fashion terms while standardizing view types, casing, and multi-labels.
    """

    def normalize(self, package: ProductDataPackage) -> Tuple[ProductDataPackage, List[NormalizationWarning]]:
        """
        Normalize text, images, attributes, and multi-labels.
        Returns a tuple of (normalized_package, warnings_generated_during_normalization).
        """
        warnings: List[NormalizationWarning] = []
        pid = str(package.productId).strip()
        logger.debug("Normalizing ProductDataPackage for productId=%s", pid)

        # 1. Text Normalization
        clean_title = self._clean_text(package.title)
        clean_description = self._clean_text(package.description) if package.description else None
        if clean_description and len(clean_description) > 10000:
            clean_description = clean_description[:10000].rsplit(" ", 1)[0]
            warnings.append(
                NormalizationWarning(
                    warningType="VALUE_TRUNCATED",
                    field="description",
                    message="Description truncated to 10000 characters.",
                )
            )

        clean_brand = self._clean_text(package.brand) if package.brand else None
        clean_category = self._clean_text(package.category)
        clean_subcategory = self._clean_text(package.subcategory) if package.subcategory else None

        # 2. Image Normalization & Deduplication
        normalized_images, img_warnings = self._normalize_images(package.images, pid)
        warnings.extend(img_warnings)

        # 3. Attribute Normalization
        clean_attrs, attr_warnings = self._normalize_attributes(package.attributes)
        warnings.extend(attr_warnings)

        # 4. Multi-Label Normalization (styles, occasions, seasons, tags)
        clean_styles = self._normalize_title_list(package.styles)
        clean_occasions = self._normalize_title_list(package.occasions)
        clean_seasons = self._normalize_title_list(package.seasons)
        clean_tags = self._normalize_tag_list(package.tags)

        # 5. Build Normalized Package
        normalized_package = ProductDataPackage(
            productId=pid,
            images=normalized_images,
            title=clean_title,
            description=clean_description,
            brand=clean_brand,
            category=clean_category,
            subcategory=clean_subcategory,
            attributes=clean_attrs,
            sizeInfo=package.sizeInfo,
            fitInformation=self._normalize_fit_info(package.fitInformation),
            occasions=clean_occasions,
            styles=clean_styles,
            seasons=clean_seasons,
            tags=clean_tags,
            dynamicCommerceData=package.dynamicCommerceData,
            extraMetadata=package.extraMetadata,
        )

        return normalized_package, warnings

    def _clean_text(self, text: Optional[str]) -> str:
        """Strip extraneous whitespace, decode HTML entities, and collapse repeated spacing."""
        if not text:
            return ""
        # HTML unescape (&amp; -> &)
        unescaped = html.unescape(text)
        # Collapse multiple spaces, tabs, and newlines
        collapsed = re.sub(r"[ \t]+", " ", unescaped)
        collapsed = re.sub(r"\n{3,}", "\n\n", collapsed)
        return collapsed.strip()

    def _normalize_images(
        self,
        images: List[ProductImageInput],
        product_id: str,
    ) -> Tuple[List[ProductImageInput], List[NormalizationWarning]]:
        """Normalize view types and deduplicate identical image URLs."""
        normalized: List[ProductImageInput] = []
        warnings: List[NormalizationWarning] = []
        seen_urls = set()

        for idx, img in enumerate(images):
            clean_url = img.imageUrl.strip()
            if clean_url in seen_urls:
                warnings.append(
                    NormalizationWarning(
                        warningType="DUPLICATE_IMAGE",
                        field=f"images[{idx}]",
                        message=f"Duplicate image reference skipped: {clean_url}",
                        originalValue=clean_url,
                    )
                )
                continue
            seen_urls.add(clean_url)

            # View type mapping
            raw_view = (img.viewType or "front").strip().lower()
            if raw_view in IMAGE_VIEW_MAP:
                canonical_view = IMAGE_VIEW_MAP[raw_view]
            else:
                canonical_view = "unknown"
                warnings.append(
                    NormalizationWarning(
                        warningType="UNKNOWN_VIEW_TYPE",
                        field=f"images[{idx}].viewType",
                        message=f"Unrecognized image viewType '{img.viewType}' mapped to 'unknown'",
                        originalValue=img.viewType,
                    )
                )

            clean_alt = self._clean_text(img.altText) if img.altText else None

            normalized.append(
                ProductImageInput(
                    imageId=img.imageId or f"img-{product_id}-{len(normalized)}",
                    imageUrl=clean_url,
                    viewType=canonical_view,
                    sortOrder=img.sortOrder if img.sortOrder is not None else len(normalized),
                    altText=clean_alt,
                    imageMetadata=img.imageMetadata,
                )
            )

        return normalized, warnings

    def _normalize_attributes(
        self,
        attrs: ProductAttributes,
    ) -> Tuple[ProductAttributes, List[NormalizationWarning]]:
        """Normalize structured fashion attributes."""
        warnings: List[NormalizationWarning] = []

        # Color: Title Case
        clean_color = None
        if attrs.color:
            c = self._clean_text(attrs.color)
            clean_color = c.title() if c.islower() or c.isupper() else c

        # Fit: Deterministic map or Title Case
        clean_fit = None
        if attrs.fit:
            f_raw = self._clean_text(attrs.fit).lower()
            clean_fit = FIT_NORMALIZATION_MAP.get(f_raw, self._clean_text(attrs.fit).title())

        # Silhouette
        clean_silhouette = self._clean_text(attrs.silhouette).title() if attrs.silhouette else None

        # Pattern
        clean_pattern = self._clean_text(attrs.pattern).title() if attrs.pattern else None

        # Neckline
        clean_neckline = self._clean_text(attrs.neckline).title() if attrs.neckline else None

        # Sleeve
        clean_sleeve = self._clean_text(attrs.sleeve).title() if attrs.sleeve else None

        # Length
        clean_length = self._clean_text(attrs.length).title() if attrs.length else None

        # Closure
        clean_closure = self._clean_text(attrs.closure).title() if attrs.closure else None

        # Material: Preserve exact composition wording
        clean_material = self._clean_text(attrs.material) if attrs.material else None

        # Garment details: Title case & deduplicate
        clean_details = self._normalize_title_list(attrs.garmentDetails)

        # Care instructions
        clean_care = self._clean_text(attrs.careInstructions) if attrs.careInstructions else None

        clean_attrs = ProductAttributes(
            color=clean_color,
            material=clean_material,
            fit=clean_fit,
            silhouette=clean_silhouette,
            pattern=clean_pattern,
            neckline=clean_neckline,
            sleeve=clean_sleeve,
            length=clean_length,
            closure=clean_closure,
            garmentDetails=clean_details,
            careInstructions=clean_care,
            customAttributes=attrs.customAttributes,
        )
        return clean_attrs, warnings

    def _normalize_fit_info(self, fit_info: FitInformation) -> FitInformation:
        """Normalize fit advisory metadata."""
        clean_fit_type = None
        if fit_info.fitType:
            f_raw = self._clean_text(fit_info.fitType).lower()
            clean_fit_type = FIT_NORMALIZATION_MAP.get(f_raw, self._clean_text(fit_info.fitType).title())

        return FitInformation(
            fitType=clean_fit_type,
            stretchiness=self._clean_text(fit_info.stretchiness).title() if fit_info.stretchiness else None,
            drape=self._clean_text(fit_info.drape).title() if fit_info.drape else None,
            sizingAdvice=self._clean_text(fit_info.sizingAdvice) if fit_info.sizingAdvice else None,
            modelHeightCm=fit_info.modelHeightCm,
            modelWearingSize=fit_info.modelWearingSize.strip().upper() if fit_info.modelWearingSize else None,
        )

    def _normalize_title_list(self, items: List[str]) -> List[str]:
        """Normalize multi-label strings to title case and deduplicate case-insensitively."""
        seen = set()
        result = []
        for item in items:
            cleaned = self._clean_text(item)
            if not cleaned:
                continue
            parts = [p.strip().title() for p in cleaned.split("/")]
            canonical = " / ".join(parts) if len(parts) > 1 else cleaned.title()
            if canonical.lower() not in seen:
                seen.add(canonical.lower())
                result.append(canonical)
        return result

    def _normalize_tag_list(self, items: List[str]) -> List[str]:
        """Normalize product tags to clean lowercase and deduplicate."""
        seen = set()
        result = []
        for item in items:
            cleaned = self._clean_text(item).lower()
            if cleaned and cleaned not in seen:
                seen.add(cleaned)
                result.append(cleaned)
        return result
