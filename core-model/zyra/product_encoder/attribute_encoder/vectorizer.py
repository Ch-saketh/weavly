import logging
from typing import Dict, Any, List, Optional
import numpy as np

from zyra.product_encoder.attribute_encoder.taxonomies import (
    CATEGORY_INDEX,
    SUBCATEGORY_INDEX,
    COLOR_INDEX,
    MATERIAL_INDEX,
    FIT_INDEX,
    SILHOUETTE_INDEX,
    PATTERN_INDEX,
    NECKLINE_INDEX,
    SLEEVE_INDEX,
    LENGTH_INDEX,
    STYLE_INDEX,
    OCCASION_INDEX,
    SEASON_INDEX,
    SIZE_SCALES,
)

logger = logging.getLogger("zyra.product_encoder.attribute_encoder.vectorizer")

ATTRIBUTE_EMBEDDING_DIM = 128


class ProductAttributeVectorizer:
    """
    Transforms structured product attributes into a deterministic 128-dimensional
    normalized feature embedding across 6 dedicated semantic buckets:
    - 1. Category & Subcategory Hierarchy (24 dims)
    - 2. Color & Material Composition (20 dims)
    - 3. Fit, Silhouette & Pattern (20 dims)
    - 4. Neckline, Sleeve & Length (16 dims)
    - 5. Multi-Label Styles, Occasions & Seasons (32 dims)
    - 6. Size Scale & Numerical Measurements (16 dims)
    """

    def vectorize(self, prepared_data: Dict[str, Any]) -> List[float]:
        vec = np.zeros(ATTRIBUTE_EMBEDDING_DIM, dtype=np.float32)

        cat = prepared_data.get("category", "").lower()
        subcat = prepared_data.get("subcategory", "").lower()
        attrs = prepared_data.get("attributes")
        fit_info = prepared_data.get("fitInformation")
        size_info = prepared_data.get("sizeInfo")
        material_breakdown = prepared_data.get("materialBreakdown", {})
        measurements = prepared_data.get("measurementsCm", {})

        styles = prepared_data.get("styles", [])
        occasions = prepared_data.get("occasions", [])
        seasons = prepared_data.get("seasons", [])

        # Bucket 1: Category & Subcategory Hierarchy (dims 0..23 = 24 dims)
        # Category (dims 0..11)
        for c_key, c_idx in CATEGORY_INDEX.items():
            if c_key in cat:
                vec[c_idx % 12] = 1.0
                break

        # Subcategory (dims 12..23)
        for sc_key, sc_idx in SUBCATEGORY_INDEX.items():
            if sc_key in subcat or sc_key in cat:
                vec[12 + (sc_idx % 12)] = 1.0
                break

        # Bucket 2: Color & Material (dims 24..43 = 20 dims)
        # Color (dims 24..33 = 10 dims)
        if attrs and attrs.color:
            color_lower = attrs.color.lower()
            for col_key, col_idx in COLOR_INDEX.items():
                if col_key in color_lower:
                    vec[24 + (col_idx % 10)] = 1.0
                    break

        # Material Composition (dims 34..43 = 10 dims)
        if material_breakdown:
            for mat_key, pct in material_breakdown.items():
                weight = float(pct) / 100.0
                for m_key, m_idx in MATERIAL_INDEX.items():
                    if m_key in mat_key:
                        vec[34 + (m_idx % 10)] += weight
                        break
        elif attrs and attrs.material:
            mat_lower = attrs.material.lower()
            for m_key, m_idx in MATERIAL_INDEX.items():
                if m_key in mat_lower:
                    vec[34 + (m_idx % 10)] = 1.0
                    break

        # Bucket 3: Fit, Silhouette & Pattern (dims 44..63 = 20 dims)
        # Fit (dims 44..51 = 8 dims)
        chosen_fit = (attrs.fit if attrs and attrs.fit else None) or (fit_info.fitType if fit_info and fit_info.fitType else None)
        if chosen_fit:
            fit_lower = chosen_fit.lower()
            for f_key, f_idx in FIT_INDEX.items():
                if f_key in fit_lower:
                    vec[44 + (f_idx % 8)] = 1.0
                    break

        # Silhouette (dims 52..57 = 6 dims)
        if attrs and attrs.silhouette:
            sil_lower = attrs.silhouette.lower()
            for s_key, s_idx in SILHOUETTE_INDEX.items():
                if s_key in sil_lower:
                    vec[52 + (s_idx % 6)] = 1.0
                    break

        # Pattern (dims 58..63 = 6 dims)
        if attrs and attrs.pattern:
            pat_lower = attrs.pattern.lower()
            for p_key, p_idx in PATTERN_INDEX.items():
                if p_key in pat_lower:
                    vec[58 + (p_idx % 6)] = 1.0
                    break

        # Bucket 4: Neckline, Sleeve & Length (dims 64..79 = 16 dims)
        # Neckline (dims 64..69 = 6 dims)
        if attrs and attrs.neckline:
            neck_lower = attrs.neckline.lower()
            for n_key, n_idx in NECKLINE_INDEX.items():
                if n_key in neck_lower:
                    vec[64 + (n_idx % 6)] = 1.0
                    break

        # Sleeve (dims 70..74 = 5 dims)
        if attrs and attrs.sleeve:
            sleeve_lower = attrs.sleeve.lower()
            for sl_key, sl_idx in SLEEVE_INDEX.items():
                if sl_key in sleeve_lower:
                    vec[70 + (sl_idx % 5)] = 1.0
                    break

        # Length (dims 75..79 = 5 dims)
        if attrs and attrs.length:
            len_lower = attrs.length.lower()
            for l_key, l_idx in LENGTH_INDEX.items():
                if l_key in len_lower:
                    vec[75 + (l_idx % 5)] = 1.0
                    break

        # Bucket 5: Multi-Label Styles, Occasions & Seasons (dims 80..111 = 32 dims)
        # Styles (dims 80..91 = 12 dims)
        for st in styles:
            st_lower = st.lower()
            for st_key, st_idx in STYLE_INDEX.items():
                if st_key in st_lower:
                    vec[80 + (st_idx % 12)] = 1.0

        # Occasions (dims 92..101 = 10 dims)
        for occ in occasions:
            occ_lower = occ.lower()
            for o_key, o_idx in OCCASION_INDEX.items():
                if o_key in occ_lower:
                    vec[92 + (o_idx % 10)] = 1.0

        # Seasons (dims 102..111 = 10 dims)
        for sea in seasons:
            sea_lower = sea.lower()
            for se_key, se_idx in SEASON_INDEX.items():
                if se_key in sea_lower:
                    vec[102 + (se_idx % 10)] = 1.0

        # Bucket 6: Size Scale & Numerical Measurements (dims 112..127 = 16 dims)
        # Size Scale (dims 112..117 = 6 dims)
        if size_info and size_info.sizeScale:
            scale_str = str(size_info.sizeScale).upper()
            if scale_str in SIZE_SCALES:
                vec[112 + SIZE_SCALES.index(scale_str)] = 1.0

        # Numerical Measurements (dims 118..127 = 10 dims)
        # chest (typical 80-140 cm -> normalize [0, 1])
        if "chest" in measurements:
            vec[118] = min(1.0, max(0.0, (measurements["chest"] - 70.0) / 70.0))
        # waist (typical 60-120 cm)
        if "waist" in measurements:
            vec[119] = min(1.0, max(0.0, (measurements["waist"] - 50.0) / 70.0))
        # length (typical 40-120 cm)
        if "length" in measurements:
            vec[120] = min(1.0, max(0.0, (measurements["length"] - 30.0) / 90.0))
        # inseam (typical 60-95 cm)
        if "inseam" in measurements:
            vec[121] = min(1.0, max(0.0, (measurements["inseam"] - 50.0) / 50.0))
        # available sizes count
        if size_info and size_info.availableSizes:
            vec[122] = min(1.0, len(size_info.availableSizes) / 10.0)

        # Normalize vector to unit sphere
        norm = np.linalg.norm(vec)
        if norm > 1e-8:
            vec = vec / norm
        else:
            # Deterministic non-zero fallback for minimal empty input
            vec[0] = 1.0

        return vec.tolist()
