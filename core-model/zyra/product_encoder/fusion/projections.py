import logging
from typing import List, Sequence
import numpy as np

logger = logging.getLogger("zyra.product_encoder.fusion.projections")

PROJECTION_SEED = 42


class DeterministicProjectionLayer:
    """
    Provides deterministic, platform-invariant orthogonal projection matrices
    for dimensional alignment between 128-dim attribute vectors, 512-dim semantic vectors,
    and 150-dim structured feature spaces.
    """

    def __init__(self, seed: int = PROJECTION_SEED) -> None:
        self.seed = seed
        rng = np.random.RandomState(seed)

        # 1. Orthogonal Projection: 128 -> 512 (shape 128, 512)
        raw_mat_128_512 = rng.randn(512, 128)
        q_128_512, _ = np.linalg.qr(raw_mat_128_512)
        self.proj_128_to_512 = q_128_512.T.astype(np.float32)  # shape (128, 512)

        # 2. Orthogonal Projection: 128 -> 150 (shape 128, 150)
        raw_mat_128_150 = rng.randn(150, 128)
        q_128_150, _ = np.linalg.qr(raw_mat_128_150)
        self.proj_128_to_150 = q_128_150.T.astype(np.float32)  # shape (128, 150)

        # 3. Orthogonal Projection: 512 -> 150 (shape 512, 150)
        raw_mat_512_150 = rng.randn(512, 150)
        q_512_150, _ = np.linalg.qr(raw_mat_512_150)
        self.proj_512_to_150 = q_512_150.astype(np.float32)  # shape (512, 150)

        logger.info("DeterministicProjectionLayer initialized with seed=%d", seed)


    def project_attribute_to_semantic(self, vector_128: Sequence[float]) -> List[float]:
        """Project 128-dim attribute vector into 512-dim common semantic space."""
        v = np.array(vector_128, dtype=np.float32)
        out = np.dot(v, self.proj_128_to_512)
        norm = np.linalg.norm(out)
        if norm > 1e-9:
            out = out / norm
        return out.tolist()

    def project_attribute_to_structured(self, vector_128: Sequence[float]) -> List[float]:
        """Project 128-dim attribute vector into 150-dim structured space."""
        v = np.array(vector_128, dtype=np.float32)
        out = np.dot(v, self.proj_128_to_150)
        norm = np.linalg.norm(out)
        if norm > 1e-9:
            out = out / norm
        return out.tolist()

    def project_semantic_to_structured(self, vector_512: Sequence[float]) -> List[float]:
        """Project 512-dim semantic vector into 150-dim structured space for fallback."""
        v = np.array(vector_512, dtype=np.float32)
        out = np.dot(v, self.proj_512_to_150)
        norm = np.linalg.norm(out)
        if norm > 1e-9:
            out = out / norm
        return out.tolist()
