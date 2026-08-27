import logging
import re
from typing import Dict, Any, Optional

from zyra.product_encoder.ingestion.router import ProductAttributeEncoderInput

logger = logging.getLogger("zyra.product_encoder.attribute_encoder.preprocessor")


class ProductAttributePreprocessor:
    """
    Normalizes structured attributes, parses percentage material breakdowns,
    converts measurement units to standard metrics, and resolves missingness.
    """

    def parse_material_breakdown(self, material_str: Optional[str]) -> Dict[str, float]:
        """
        Parses material string into percentage breakdown dict.
        Examples:
            '80% Cotton, 20% Polyester' -> {'cotton': 80.0, 'polyester': 20.0}
            '100% Organic Cotton' -> {'organic cotton': 100.0}
            'Cotton' -> {'cotton': 100.0}
        """
        if not material_str:
            return {}

        breakdown: Dict[str, float] = {}
        segments = re.split(r"[,;/]+", material_str)

        for seg in segments:
            seg = seg.strip()
            if not seg:
                continue
            # Check for "80% Cotton"
            m1 = re.search(r"(\d{1,3})%\s*([a-zA-Z\s]+)", seg)
            if m1:
                pct = float(m1.group(1))
                mat = m1.group(2).strip().lower()
                if mat:
                    breakdown[mat] = pct
                continue

            # Check for "Cotton 80%"
            m2 = re.search(r"([a-zA-Z\s]+)\s*(\d{1,3})%", seg)
            if m2:
                pct = float(m2.group(2))
                mat = m2.group(1).strip().lower()
                if mat:
                    breakdown[mat] = pct
                continue

            # Fallback single material without % (e.g. "Cotton")
            clean_mat = re.sub(r"[^a-zA-Z\s]", "", seg).strip().lower()
            if clean_mat:
                breakdown[clean_mat] = 100.0

        return breakdown


    def normalize_measurement_to_cm(self, value: Any) -> Optional[float]:
        """
        Convert measurement (number or string with 'in', 'inch', 'cm') to centimeters.
        """
        if value is None:
            return None
        if isinstance(value, (int, float)):
            return float(value)

        val_str = str(value).strip().lower()
        num_match = re.search(r"[-+]?\d*\.?\d+", val_str)
        if not num_match:
            return None

        num = float(num_match.group(0))

        if "in" in val_str or "inch" in val_str or '"' in val_str:
            return round(num * 2.54, 2)
        return round(num, 2)

    def prepare(self, input_data: ProductAttributeEncoderInput) -> Dict[str, Any]:
        """
        Prepares clean structured fields for insight extraction and vectorization.
        """
        attrs = input_data.attributes
        fit_info = input_data.fitInformation
        size_info = input_data.sizeInfo

        # Material breakdown
        mat_str = attrs.material if attrs else None
        material_breakdown = self.parse_material_breakdown(mat_str)

        # Measurements
        measurements: Dict[str, float] = {}
        if size_info and size_info.sizeMeasurements:
            for k, v in size_info.sizeMeasurements.items():
                norm_cm = self.normalize_measurement_to_cm(v)
                if norm_cm is not None:
                    measurements[k.lower()] = norm_cm

        if fit_info and fit_info.measurementDetails:
            for k, v in fit_info.measurementDetails.items():
                norm_cm = self.normalize_measurement_to_cm(v)
                if norm_cm is not None and k.lower() not in measurements:
                    measurements[k.lower()] = norm_cm

        return {
            "productId": input_data.productId,
            "category": getattr(input_data, "category", "") or "",
            "subcategory": getattr(input_data, "subcategory", "") or "",
            "attributes": attrs,
            "sizeInfo": size_info,
            "fitInformation": fit_info,
            "styles": getattr(input_data, "styles", []) or [],
            "occasions": getattr(input_data, "occasions", []) or [],
            "seasons": getattr(input_data, "seasons", []) or [],
            "tags": getattr(input_data, "tags", []) or [],
            "materialBreakdown": material_breakdown,
            "measurementsCm": measurements,
            "rawAttributes": getattr(input_data, "rawAttributes", {}) or {},
        }

