import math
import logging
from typing import List, Sequence, Union
import numpy as np

logger = logging.getLogger("zyra.product_encoder.fusion.validator")


class EmbeddingValidator:
    """
    Validates numerical integrity, finite bounds, and dimensional consistency
    for input and fused modality embeddings.
    """

    def validate_vector(
        self,
        vector: Union[List[float], Sequence[float], np.ndarray],
        expected_dim: int,
        modality_name: str,
    ) -> List[float]:
        """
        Validates that vector is finite, non-empty, contains no NaNs/Infs,
        and matches the exact expected dimension.
        """
        if vector is None:
            raise ValueError(f"Embedding vector for {modality_name} is None")

        vec_list = list(vector)
        actual_dim = len(vec_list)

        if actual_dim != expected_dim:
            raise ValueError(
                f"Dimension mismatch for {modality_name}: expected {expected_dim}, got {actual_dim}"
            )

        for i, val in enumerate(vec_list):
            if val is None or math.isnan(val) or math.isinf(val):
                raise ValueError(
                    f"Corrupted numerical value at index {i} in {modality_name} vector: {val}"
                )

        return vec_list

    def compute_l2_norm(self, vector: Sequence[float]) -> float:
        sum_sq = sum(x * x for x in vector)
        return math.sqrt(sum_sq)
