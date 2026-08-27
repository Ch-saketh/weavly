import math
import logging
from typing import Dict, List, Optional, Tuple
import numpy as np

from zyra.product_encoder.config.constants import (
    PRODUCT_VISUAL_EMBEDDING_DIM,
    PRODUCT_TEXT_EMBEDDING_DIM,
    PRODUCT_ATTRIBUTE_EMBEDDING_DIM,
    PRODUCT_UNIFIED_EMBEDDING_DIM,
)
from zyra.product_encoder.fusion.models import FusionWeightsConfig, ModalityContribution
from zyra.product_encoder.fusion.projections import DeterministicProjectionLayer
from zyra.product_encoder.fusion.validator import EmbeddingValidator

logger = logging.getLogger("zyra.product_encoder.fusion.strategy")

SEMANTIC_LATENT_DIM = 512
STRUCTURED_LATENT_DIM = 150


class ProductFusionStrategy:
    """
    Deterministic mathematical multimodal fusion strategy (Phase P6).
    Combines 512-dim visual, 512-dim text, and 128-dim attribute embeddings into
    a canonical 662-dimensional normalized product vector.
    """

    def __init__(
        self,
        projections: Optional[DeterministicProjectionLayer] = None,
        validator: Optional[EmbeddingValidator] = None,
    ) -> None:
        self.projections = projections or DeterministicProjectionLayer()
        self.validator = validator or EmbeddingValidator()

    def fuse_embeddings(
        self,
        visual_vec: Optional[List[float]] = None,
        text_vec: Optional[List[float]] = None,
        attribute_vec: Optional[List[float]] = None,
        weights_config: Optional[FusionWeightsConfig] = None,
    ) -> Tuple[List[float], Dict[str, ModalityContribution], float]:
        cfg = weights_config or FusionWeightsConfig()

        # 1. Validate present vectors and dimensions
        has_vis = visual_vec is not None
        has_txt = text_vec is not None
        has_attr = attribute_vec is not None

        if not (has_vis or has_txt or has_attr):
            raise ValueError("All modality embeddings are unavailable; cannot perform multimodal fusion")

        if has_vis:
            visual_vec = self.validator.validate_vector(
                visual_vec, PRODUCT_VISUAL_EMBEDDING_DIM, "visual"
            )
        if has_txt:
            text_vec = self.validator.validate_vector(
                text_vec, PRODUCT_TEXT_EMBEDDING_DIM, "text"
            )
        if has_attr:
            attribute_vec = self.validator.validate_vector(
                attribute_vec, PRODUCT_ATTRIBUTE_EMBEDDING_DIM, "attribute"
            )

        # 2. Adaptive weight renormalization
        w_vis = cfg.visualWeight if has_vis else 0.0
        w_txt = cfg.textWeight if has_txt else 0.0
        w_attr = cfg.attributeWeight if has_attr else 0.0

        total_weight = w_vis + w_txt + w_attr
        if total_weight > 0:
            w_vis /= total_weight
            w_txt /= total_weight
            w_attr /= total_weight

        # 3. Project and normalize active modalities
        f_sem = np.zeros(SEMANTIC_LATENT_DIM, dtype=np.float32)

        if has_vis:
            v_arr = np.array(visual_vec, dtype=np.float32)
            v_norm = np.linalg.norm(v_arr)
            if v_norm > 1e-9:
                v_arr = v_arr / v_norm
            f_sem += w_vis * v_arr

        if has_txt:
            t_arr = np.array(text_vec, dtype=np.float32)
            t_norm = np.linalg.norm(t_arr)
            if t_norm > 1e-9:
                t_arr = t_arr / t_norm
            f_sem += w_txt * t_arr

        if has_attr:
            a_sem = self.projections.project_attribute_to_semantic(attribute_vec)
            a_sem_arr = np.array(a_sem, dtype=np.float32)
            f_sem += w_attr * a_sem_arr

        # Normalize 512-dim semantic latent space
        sem_norm = np.linalg.norm(f_sem)
        if sem_norm > 1e-9:
            f_sem = f_sem / sem_norm
        else:
            f_sem[0] = 1.0

        # 4. Structured 150-dim feature space
        if has_attr:
            a_struct = self.projections.project_attribute_to_structured(attribute_vec)
            f_struct = np.array(a_struct, dtype=np.float32)
        else:
            # Fallback projection from 512-dim semantic vector to 150-dim structured space
            f_struct = np.array(
                self.projections.project_semantic_to_structured(f_sem.tolist()),
                dtype=np.float32,
            )

        struct_norm = np.linalg.norm(f_struct)
        if struct_norm > 1e-9:
            f_struct = f_struct / struct_norm
        else:
            f_struct[0] = 1.0

        # 5. Concatenate into 662-dimensional product embedding
        u_raw = np.concatenate([f_sem, f_struct])  # shape (662,)

        # 6. Final L2 Normalization
        raw_norm = float(np.linalg.norm(u_raw))
        if raw_norm > 1e-9:
            u_final = u_raw / raw_norm
            final_norm = 1.0
        else:
            u_final = np.zeros(PRODUCT_UNIFIED_EMBEDDING_DIM, dtype=np.float32)
            u_final[0] = 1.0
            final_norm = 1.0


        # 7. Safety validation on final vector
        validated_u = self.validator.validate_vector(
            u_final.tolist(), PRODUCT_UNIFIED_EMBEDDING_DIM, "unified"
        )

        contributions = {
            "visual": ModalityContribution(
                available=has_vis,
                effectiveWeight=round(w_vis, 4),
                nativeDimension=PRODUCT_VISUAL_EMBEDDING_DIM,
                l2Norm=round(self.validator.compute_l2_norm(visual_vec), 4) if has_vis else 0.0,
            ),
            "text": ModalityContribution(
                available=has_txt,
                effectiveWeight=round(w_txt, 4),
                nativeDimension=PRODUCT_TEXT_EMBEDDING_DIM,
                l2Norm=round(self.validator.compute_l2_norm(text_vec), 4) if has_txt else 0.0,
            ),
            "attribute": ModalityContribution(
                available=has_attr,
                effectiveWeight=round(w_attr, 4),
                nativeDimension=PRODUCT_ATTRIBUTE_EMBEDDING_DIM,
                l2Norm=round(self.validator.compute_l2_norm(attribute_vec), 4) if has_attr else 0.0,
            ),
        }

        return validated_u, contributions, round(final_norm, 6)
