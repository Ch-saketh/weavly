import hashlib
import logging
from typing import List, Dict, Any, Tuple, Optional
import numpy as np
import torch

from zyra.product_encoder.text_encoder.model_manager import ProductTextModelManager

logger = logging.getLogger("zyra.product_encoder.text_encoder.transformer")

EMBEDDING_DIM = 512


class ProductTextTransformer:
    """
    Executes transformer inference over product text representations.
    Supports long-text chunking, mean-pooling aggregation, and 512-dim L2 normalization.
    Provides deterministic heuristic fallback for offline testing environments.
    """

    def __init__(self, model_manager: Optional[ProductTextModelManager] = None) -> None:
        self.model_manager = model_manager or ProductTextModelManager()

    def generate_embedding(
        self,
        prepared_fields: Dict[str, Any],
    ) -> Tuple[List[float], Dict[str, Any]]:
        """
        Generate 512-dimensional normalized dense text embedding for the product.
        """
        model, tokenizer = self.model_manager.get_text_model()
        primary_prompt = prepared_fields.get("primaryPrompt", "")
        chunks = prepared_fields.get("descriptionChunks", [])
        device = self.model_manager.get_device()

        if model is not None and tokenizer is not None:
            try:
                # 1. Encode primary prompt
                with torch.no_grad():
                    inputs = tokenizer(
                        [primary_prompt],
                        padding=True,
                        truncation=True,
                        max_length=77,
                        return_tensors="pt",
                    ).to(device)

                    outputs = model(**inputs)
                    # Text projection vector (512-dim)
                    prompt_embed = outputs.text_embeds if hasattr(outputs, "text_embeds") else outputs.last_hidden_state[:, 0, :]
                    prompt_vec = prompt_embed.cpu().numpy()[0]

                    chunk_vectors = [prompt_vec]

                    # 2. Encode description chunks if present
                    if len(chunks) > 1:
                        for chunk in chunks[:4]:  # Cap at 4 chunks for performance
                            chunk_inputs = tokenizer(
                                [chunk],
                                padding=True,
                                truncation=True,
                                max_length=77,
                                return_tensors="pt",
                            ).to(device)
                            chunk_out = model(**chunk_inputs)
                            chunk_emb = chunk_out.text_embeds if hasattr(chunk_out, "text_embeds") else chunk_out.last_hidden_state[:, 0, :]
                            chunk_vectors.append(chunk_emb.cpu().numpy()[0])

                    # 3. Mean pool across prompt and chunks
                    aggregated = np.mean(chunk_vectors, axis=0)
                    norm = np.linalg.norm(aggregated)
                    if norm > 1e-8:
                        aggregated = aggregated / norm
                    else:
                        aggregated = np.zeros(EMBEDDING_DIM)

                    metadata = {
                        "device": str(device),
                        "model": self.model_manager.text_model_name,
                        "mode": "neural_clip_transformer",
                        "chunksProcessed": len(chunk_vectors) - 1,
                        "embeddingDimension": len(aggregated),
                    }
                    return aggregated.tolist(), metadata

            except Exception as exc:
                logger.warning("Error running transformer inference (%s). Using deterministic fallback.", str(exc))

        # Deterministic offline heuristic mode
        return self._deterministic_heuristic_embedding(prepared_fields)

    def _deterministic_heuristic_embedding(
        self,
        prepared_fields: Dict[str, Any],
    ) -> Tuple[List[float], Dict[str, Any]]:
        """
        Deterministic, mathematically valid 512-dimensional L2-normalized vector
        derived from hashing token n-grams and character distributions of product text.
        """
        title = prepared_fields.get("title", "")
        desc = prepared_fields.get("description", "")
        brand = prepared_fields.get("brand") or ""
        cat = prepared_fields.get("category", "")
        styles = " ".join(prepared_fields.get("styles", []))
        occasions = " ".join(prepared_fields.get("occasions", []))

        text_corpus = f"{title}|{desc}|{brand}|{cat}|{styles}|{occasions}"

        vec = np.zeros(EMBEDDING_DIM, dtype=np.float32)

        # Distribute seed hashes across the 512 dimensions
        for i in range(16):
            seed_str = f"{text_corpus}_{i}"
            digest = hashlib.sha256(seed_str.encode("utf-8")).digest()
            chunk_vals = np.frombuffer(digest, dtype=np.int8).astype(np.float32) / 128.0
            start_idx = i * 32
            end_idx = start_idx + len(chunk_vals)
            vec[start_idx:end_idx] = chunk_vals[: (end_idx - start_idx)]

        # Modulate by character length & presence of key fashion keywords
        if "streetwear" in text_corpus.lower():
            vec[10:20] += 0.5
        if "cotton" in text_corpus.lower():
            vec[30:40] += 0.5
        if "oversized" in text_corpus.lower():
            vec[50:60] += 0.5
        if "wool" in text_corpus.lower():
            vec[70:80] += 0.5

        # Normalize to unit sphere
        norm = np.linalg.norm(vec)
        if norm > 1e-8:
            vec = vec / norm
        else:
            vec[0] = 1.0

        metadata = {
            "device": str(self.model_manager.get_device()),
            "model": self.model_manager.text_model_name,
            "mode": "deterministic_offline_heuristic",
            "chunksProcessed": len(prepared_fields.get("descriptionChunks", [])),
            "embeddingDimension": EMBEDDING_DIM,
        }

        return vec.tolist(), metadata
