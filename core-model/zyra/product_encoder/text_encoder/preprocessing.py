import html
import logging
import re
from typing import List, Dict, Any, Optional

from zyra.product_encoder.ingestion.router import ProductTextEncoderInput

logger = logging.getLogger("zyra.product_encoder.text_encoder.preprocessing")

# Maximum token character approximation for single CLIP sequence (77 tokens ~ 300-350 chars)
CHUNK_MAX_CHARS = 320


class ProductTextPreprocessor:
    """
    Performs field-aware cleaning, formatting, and chunking of product text inputs.
    Preserves fashion terminology, brand identifiers, and field provenance.
    """

    def clean_text(self, text: Optional[str]) -> str:
        """Strip extraneous spaces, unescape HTML, and collapse repeated spacing."""
        if not text:
            return ""
        unescaped = html.unescape(text)
        collapsed = re.sub(r"[ \t]+", " ", unescaped)
        collapsed = re.sub(r"\n{3,}", "\n\n", collapsed)
        return collapsed.strip()

    def prepare_field_representations(
        self,
        input_data: ProductTextEncoderInput,
    ) -> Dict[str, Any]:
        """
        Extract clean individual field strings and construct structured composite representation.
        """
        clean_title = self.clean_text(input_data.title)
        clean_desc = self.clean_text(input_data.description) if input_data.description else ""
        clean_brand = self.clean_text(input_data.brand) if input_data.brand else ""
        clean_category = self.clean_text(input_data.category)
        clean_subcategory = self.clean_text(input_data.subcategory) if input_data.subcategory else ""

        clean_tags = [self.clean_text(t) for t in input_data.tags if t and self.clean_text(t)]
        clean_styles = [self.clean_text(s) for s in input_data.styles if s and self.clean_text(s)]
        clean_occasions = [self.clean_text(o) for o in input_data.occasions if o and self.clean_text(o)]
        clean_seasons = [self.clean_text(se) for se in input_data.seasons if se and self.clean_text(se)]

        # Construct primary prompt for transformer
        # Example: "Luxzera Studio Oversized Heavyweight Cotton Hoodie. Premium 450 GSM French terry cotton. Styles: Streetwear. Category: Outerwear."
        prompt_parts = []
        if clean_brand:
            prompt_parts.append(clean_brand)
        if clean_title:
            prompt_parts.append(clean_title)
        if clean_category:
            prompt_parts.append(f"Category: {clean_category}")
        if clean_styles:
            prompt_parts.append(f"Style: {', '.join(clean_styles)}")
        if clean_occasions:
            prompt_parts.append(f"Occasion: {', '.join(clean_occasions)}")

        primary_prompt = ". ".join(prompt_parts) + "."

        # Build chunks for long descriptions
        description_chunks = self._chunk_text(clean_desc, max_chars=CHUNK_MAX_CHARS)

        return {
            "productId": input_data.productId,
            "title": clean_title,
            "description": clean_desc,
            "brand": clean_brand if clean_brand else None,
            "category": clean_category,
            "subcategory": clean_subcategory if clean_subcategory else None,
            "styles": clean_styles,
            "occasions": clean_occasions,
            "seasons": clean_seasons,
            "tags": clean_tags,
            "primaryPrompt": primary_prompt,
            "descriptionChunks": description_chunks,
        }

    def _chunk_text(self, text: str, max_chars: int = CHUNK_MAX_CHARS) -> List[str]:
        """Split long description into coherent sentence/phrase chunks."""
        if not text:
            return []
        if len(text) <= max_chars:
            return [text]

        sentences = re.split(r"(?<=[.!?\n])\s+", text)
        chunks: List[str] = []
        curr_chunk = ""

        for sent in sentences:
            sent_clean = sent.strip()
            if not sent_clean:
                continue

            if len(curr_chunk) + len(sent_clean) + 1 <= max_chars:
                curr_chunk = f"{curr_chunk} {sent_clean}".strip()
            else:
                if curr_chunk:
                    chunks.append(curr_chunk)
                # If single sentence is itself too long, slice safely
                if len(sent_clean) > max_chars:
                    for i in range(0, len(sent_clean), max_chars):
                        chunks.append(sent_clean[i : i + max_chars].strip())
                    curr_chunk = ""
                else:
                    curr_chunk = sent_clean

        if curr_chunk:
            chunks.append(curr_chunk)

        return chunks if chunks else [text[:max_chars]]
