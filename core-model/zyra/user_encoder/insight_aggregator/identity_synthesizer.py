import logging
from typing import List
from collections import defaultdict
from zyra.user_encoder.schemas.data_encoder_schemas import DataEncoderOutput
from zyra.user_encoder.schemas.image_encoder_schemas import ImageEncoderOutput
from zyra.user_encoder.schemas.behaviour_encoder_schemas import BehaviourEncoderOutput
from zyra.user_encoder.schemas.unified_insight_schemas import UnifiedFashionIdentity
from zyra.user_encoder.insight_aggregator.constants import (
    SOURCE_QUESTIONNAIRE,
    SOURCE_IMAGE,
    SOURCE_BEHAVIOUR,
    SUPPORTED_FASHION_IDENTITIES,
)

logger = logging.getLogger("zyra.insight_aggregator.identity_synthesizer")


class FashionIdentitySynthesizer:
    """Synthesizes unified fashion identity orientations across all active encoders.

    STRICT GUARANTEES:
    - Derives ONLY factual fashion orientations (e.g. Minimalist-oriented, Streetwear-oriented).
    - NEVER infers psychological personality traits, emotional states, confidence, intelligence,
      or socioeconomic status.
    """

    @classmethod
    def synthesize_identity(
        cls,
        data_output: DataEncoderOutput,
        image_output: ImageEncoderOutput,
        behaviour_output: BehaviourEncoderOutput,
    ) -> UnifiedFashionIdentity:
        """Derive consolidated fashion identity signals and confidence level."""
        signal_sources = defaultdict(set)

        # 1. Questionnaire / Fit Data Signals
        for sig in data_output.structuredInsights.styleIdentity.dominantSignals:
            if sig in SUPPORTED_FASHION_IDENTITIES:
                signal_sources[sig].add(SOURCE_QUESTIONNAIRE)

        # 2. Visual Aesthetic Signals
        dominant_vis = image_output.visualInsights.dominantVisualAesthetic
        if dominant_vis:
            candidate = f"{dominant_vis}-oriented"
            # Map canonical names if candidate matches
            for supp in SUPPORTED_FASHION_IDENTITIES:
                if supp.lower() == candidate.lower() or supp.lower().startswith(dominant_vis.lower()):
                    signal_sources[supp].add(SOURCE_IMAGE)
                    break

        for rec_st in image_output.visualInsights.recurringStyles:
            candidate = f"{rec_st}-oriented"
            for supp in SUPPORTED_FASHION_IDENTITIES:
                if supp.lower() == candidate.lower() or supp.lower().startswith(rec_st.lower()):
                    signal_sources[supp].add(SOURCE_IMAGE)

        # 3. Behavioural Signals
        if not behaviour_output.behaviourInsights.isColdStart:
            for st_sig in behaviour_output.behaviourInsights.styleSignals:
                candidate = f"{st_sig.style}-oriented"
                for supp in SUPPORTED_FASHION_IDENTITIES:
                    if supp.lower() == candidate.lower() or supp.lower().startswith(st_sig.style.lower()):
                        signal_sources[supp].add(SOURCE_BEHAVIOUR)

            # Price sensitivity behaviour signal
            if behaviour_output.behaviourInsights.priceSummary:
                avg_p = behaviour_output.behaviourInsights.priceSummary.avgViewedPrice
                if avg_p and avg_p < 2000.0:
                    signal_sources["Budget-conscious"].add(SOURCE_BEHAVIOUR)

        # Rank signals by number of contributing sources, then by name
        ranked_signals = sorted(
            signal_sources.keys(),
            key=lambda s: (len(signal_sources[s]), s),
            reverse=True,
        )

        top_signals = ranked_signals[:4] if ranked_signals else ["Casual-oriented"]

        # Determine supporting sources across top signals
        all_supporting = set()
        for s in top_signals:
            all_supporting.update(signal_sources.get(s, set()))

        # Confidence level
        active_count = len(all_supporting)
        if active_count >= 3:
            confidence = "HIGH"
        elif active_count == 2:
            confidence = "MEDIUM"
        else:
            confidence = "LOW"

        logger.info(
            "Synthesized fashion identity: dominant=%s, confidence=%s, sources=%s",
            top_signals,
            confidence,
            list(all_supporting),
        )

        return UnifiedFashionIdentity(
            dominantSignals=top_signals,
            confidenceLevel=confidence,
            supportingSources=sorted(list(all_supporting)),
        )
