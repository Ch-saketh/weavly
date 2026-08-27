import logging
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field

from zyra.user_encoder.schemas.events import UserProfileUpdatedEvent
from zyra.user_encoder.schemas.input_schema import UserEncoderInput
from zyra.user_encoder.schemas.encoder_inputs import UserEncoderPipelineInput
from zyra.user_encoder.schemas.data_encoder_schemas import DataEncoderOutput
from zyra.user_encoder.schemas.image_encoder_schemas import ImageEncoderOutput
from zyra.user_encoder.schemas.behaviour_encoder_schemas import BehaviourEncoderOutput
from zyra.user_encoder.schemas.unified_insight_schemas import (
    InsightAggregationInput,
    UnifiedUserInsights,
)
from zyra.user_encoder.schemas.fusion_schemas import FusionOutput
from zyra.user_encoder.schemas.persistence_schemas import (
    UserZyraRepresentationResponse,
    UserRecommendationEntity,
)
from zyra.user_encoder.ingestion.springboot_client import SpringBootClient
from zyra.user_encoder.ingestion.normalizer import UserInputNormalizer
from zyra.user_encoder.ingestion.router import InputRouter
from zyra.user_encoder.data_encoder.encoder import DataEncoder
from zyra.user_encoder.image_encoder.encoder import ImageEncoder
from zyra.user_encoder.behaviour_encoder.encoder import BehaviourEncoder
from zyra.user_encoder.insight_aggregator.aggregator import UnifiedInsightAggregator
from zyra.user_encoder.fusion.fusion_layer import MultimodalFusionLayer
from zyra.user_encoder.persistence.service import UserZyraRepresentationService

logger = logging.getLogger("zyra.pipeline.orchestration")


class PipelineExecutionResult(BaseModel):
    """Execution status summary for a user encoding pipeline run."""

    userId: UUID
    status: str = Field(default="SUCCESS", description="Pipeline status: SUCCESS, INCOMPLETE_INPUT, FAILED")
    currentStage: str = Field(default="U7_PERSISTED", description="Current pipeline checkpoint")
    inputData: Optional[UserEncoderInput] = Field(default=None, description="Normalized canonical input data")
    pipelineInput: Optional[UserEncoderPipelineInput] = Field(
        default=None,
        description="Routed inputs bundle for Image, Data, and Behaviour encoders",
    )
    dataEncoderOutput: Optional[DataEncoderOutput] = Field(
        default=None,
        description="Structured fashion insights and numerical data representation (Phase U2)",
    )
    imageEncoderOutput: Optional[ImageEncoderOutput] = Field(
        default=None,
        description="Aggregated visual fashion insights and 512-dim visual representation (Phase U3)",
    )
    behaviourEncoderOutput: Optional[BehaviourEncoderOutput] = Field(
        default=None,
        description="Structured behavioural insights and 64-dim behavioural representation (Phase U4)",
    )
    unifiedUserInsights: Optional[UnifiedUserInsights] = Field(
        default=None,
        description="Source-aware consolidated fashion insights across all three modalities (Phase U5)",
    )
    fusionOutput: Optional[FusionOutput] = Field(
        default=None,
        description="Dual output (UnifiedUserRepresentation JSON + UserEmbedding vector) (Phase U6)",
    )
    persistedRepresentation: Optional[UserZyraRepresentationResponse] = Field(
        default=None,
        description="PostgreSQL JSONB + Qdrant persisted representation metadata (Phase U7)",
    )
    betaRecommendations: List[UserRecommendationEntity] = Field(
        default_factory=list,
        description="User-specific Beta recommendations stored in PostgreSQL (Phase U7)",
    )
    message: str = Field(default="", description="Descriptive status message")


class UserEncoderPipeline:
    """Orchestrates the complete lifecycle of encoding, aggregating, fusing, and persisting user intelligence.

    Pipeline Stages:
    1. INGESTION: Fetches authoritative user encoder data from Spring Boot.
    2. NORMALIZATION: Deterministically normalizes strings, sizing, and multi-select values.
    3. ROUTING: Routes data into ImageEncoderInput, DataEncoderInput, and BehaviourEncoderInput.
    4. DATA ENCODER (U2): Produces StructuredFashionInsights and 86-dim DataRepresentation.
    5. IMAGE ENCODER (U3): Produces UserVisualInsights and 512-dim VisualRepresentation.
    6. BEHAVIOUR ENCODER (U4): Produces BehaviourInsights and 64-dim BehaviourRepresentation.
    7. INSIGHT AGGREGATOR (U5): Synthesizes source-aware UnifiedUserInsights & compiles conflicts.
    8. MULTIMODAL FUSION (U6): Produces UnifiedUserRepresentation (JSON) and UserEmbedding (662-dim vector).
    9. PERSISTENCE (U7): Stores JSONB in PostgreSQL, UserEmbedding in Qdrant, and Beta Recommendations.
    """

    def __init__(
        self,
        springboot_client: SpringBootClient,
        normalizer: Optional[UserInputNormalizer] = None,
        router: Optional[InputRouter] = None,
        data_encoder: Optional[DataEncoder] = None,
        image_encoder: Optional[ImageEncoder] = None,
        behaviour_encoder: Optional[BehaviourEncoder] = None,
        insight_aggregator: Optional[UnifiedInsightAggregator] = None,
        fusion_layer: Optional[MultimodalFusionLayer] = None,
        persistence_service: Optional[UserZyraRepresentationService] = None,
    ) -> None:
        self.springboot_client = springboot_client
        self.normalizer = normalizer or UserInputNormalizer()
        self.router = router or InputRouter()
        self.data_encoder = data_encoder or DataEncoder()
        self.image_encoder = image_encoder or ImageEncoder()
        self.behaviour_encoder = behaviour_encoder or BehaviourEncoder()
        self.insight_aggregator = insight_aggregator or UnifiedInsightAggregator()
        self.fusion_layer = fusion_layer or MultimodalFusionLayer()
        self.persistence_service = persistence_service or UserZyraRepresentationService()

    async def process_event(self, event: UserProfileUpdatedEvent) -> PipelineExecutionResult:
        """Handle incoming RabbitMQ event trigger and execute ingestion + encoding + persistence pipeline."""
        logger.info(
            "Starting ingestion and encoding pipeline from event [eventId=%s, userId=%s, type=%s]",
            event.eventId,
            event.userId,
            event.eventType,
        )
        return await self.execute_for_user(event.userId, event=event)

    async def execute_for_user(
        self,
        user_id: UUID,
        event: Optional[UserProfileUpdatedEvent] = None,
    ) -> PipelineExecutionResult:
        """Fetch raw user data, normalize, route, encode, aggregate, fuse, and persist."""
        logger.info("Executing User Encoder pipeline for user %s (Phase U7)", user_id)

        # 1. Fetch data from authoritative Spring Boot endpoint
        try:
            raw_input: UserEncoderInput = await self.springboot_client.fetch_user_encoder_data(user_id)
        except Exception as exc:
            logger.error("Ingestion pipeline failed while fetching data for user %s: %s", user_id, exc)
            return PipelineExecutionResult(
                userId=user_id,
                status="FAILED",
                currentStage="INGESTION_FAILED",
                inputData=None,
                pipelineInput=None,
                dataEncoderOutput=None,
                imageEncoderOutput=None,
                behaviourEncoderOutput=None,
                unifiedUserInsights=None,
                fusionOutput=None,
                persistedRepresentation=None,
                betaRecommendations=[],
                message=f"Failed to fetch user encoder data: {exc}",
            )

        # 2. Deterministic Normalization
        try:
            normalized_input = self.normalizer.normalize(raw_input)
            logger.info("Normalized user input for user %s successfully", user_id)
        except Exception as exc:
            logger.error("Normalization failed for user %s: %s", user_id, exc)
            return PipelineExecutionResult(
                userId=user_id,
                status="FAILED",
                currentStage="NORMALIZATION_FAILED",
                inputData=raw_input,
                pipelineInput=None,
                dataEncoderOutput=None,
                imageEncoderOutput=None,
                behaviourEncoderOutput=None,
                unifiedUserInsights=None,
                fusionOutput=None,
                persistedRepresentation=None,
                betaRecommendations=[],
                message=f"Normalization failed: {exc}",
            )

        # 3. Dedicated Input Routing
        try:
            routed_inputs: UserEncoderPipelineInput = self.router.route(normalized_input, event=event)
            logger.info("Routed user inputs for user %s into Image, Data, and Behaviour containers", user_id)
        except Exception as exc:
            logger.error("Routing failed for user %s: %s", user_id, exc)
            return PipelineExecutionResult(
                userId=user_id,
                status="FAILED",
                currentStage="ROUTING_FAILED",
                inputData=normalized_input,
                pipelineInput=None,
                dataEncoderOutput=None,
                imageEncoderOutput=None,
                behaviourEncoderOutput=None,
                unifiedUserInsights=None,
                fusionOutput=None,
                persistedRepresentation=None,
                betaRecommendations=[],
                message=f"Routing failed: {exc}",
            )

        # 4. Phase U2: Execute Data Encoder on DataEncoderInput
        try:
            data_output: DataEncoderOutput = self.data_encoder.encode(routed_inputs.dataEncoderInput)
            logger.info(
                "Data Encoder executed successfully for user %s [dim=%d, dominantSignals=%s, conflicts=%d]",
                user_id,
                data_output.dataRepresentation.dimension,
                data_output.structuredInsights.styleIdentity.dominantSignals,
                len(data_output.structuredInsights.conflicts),
            )
        except Exception as exc:
            logger.error("Data encoding failed for user %s: %s", user_id, exc)
            return PipelineExecutionResult(
                userId=user_id,
                status="FAILED",
                currentStage="DATA_ENCODING_FAILED",
                inputData=normalized_input,
                pipelineInput=routed_inputs,
                dataEncoderOutput=None,
                imageEncoderOutput=None,
                behaviourEncoderOutput=None,
                unifiedUserInsights=None,
                fusionOutput=None,
                persistedRepresentation=None,
                betaRecommendations=[],
                message=f"Data encoding failed: {exc}",
            )

        # 5. Phase U3: Execute Image Encoder on ImageEncoderInput
        try:
            image_output: ImageEncoderOutput = await self.image_encoder.encode(routed_inputs.imageEncoderInput)
            logger.info(
                "Image Encoder executed successfully for user %s [images=%d, dominantAesthetic=%s, rep_dim=%d]",
                user_id,
                len(image_output.processedImages),
                image_output.visualInsights.dominantVisualAesthetic,
                image_output.visualRepresentation.dimension,
            )
        except Exception as exc:
            logger.error("Image encoding failed for user %s: %s", user_id, exc)
            return PipelineExecutionResult(
                userId=user_id,
                status="FAILED",
                currentStage="IMAGE_ENCODING_FAILED",
                inputData=normalized_input,
                pipelineInput=routed_inputs,
                dataEncoderOutput=data_output,
                imageEncoderOutput=None,
                behaviourEncoderOutput=None,
                unifiedUserInsights=None,
                fusionOutput=None,
                persistedRepresentation=None,
                betaRecommendations=[],
                message=f"Image encoding failed: {exc}",
            )

        # 6. Phase U4: Execute Behaviour Encoder on BehaviourEncoderInput
        try:
            behaviour_output: BehaviourEncoderOutput = self.behaviour_encoder.encode(
                routed_inputs.behaviourEncoderInput,
                data_input=routed_inputs.dataEncoderInput,
            )
            logger.info(
                "Behaviour Encoder executed successfully for user %s [events=%d, isColdStart=%s, conflicts=%d, rep_dim=%d]",
                user_id,
                behaviour_output.eventSummary.totalEvents,
                behaviour_output.behaviourInsights.isColdStart,
                len(behaviour_output.behaviourInsights.conflicts),
                behaviour_output.behaviourRepresentation.dimension,
            )
        except Exception as exc:
            logger.error("Behaviour encoding failed for user %s: %s", user_id, exc)
            return PipelineExecutionResult(
                userId=user_id,
                status="FAILED",
                currentStage="BEHAVIOUR_ENCODING_FAILED",
                inputData=normalized_input,
                pipelineInput=routed_inputs,
                dataEncoderOutput=data_output,
                imageEncoderOutput=image_output,
                behaviourEncoderOutput=None,
                unifiedUserInsights=None,
                fusionOutput=None,
                persistedRepresentation=None,
                betaRecommendations=[],
                message=f"Behaviour encoding failed: {exc}",
            )

        # 7. Phase U5: Execute Unified Insight Aggregator
        try:
            aggregation_input = InsightAggregationInput(
                userId=user_id,
                dataEncoderOutput=data_output,
                imageEncoderOutput=image_output,
                behaviourEncoderOutput=behaviour_output,
            )
            unified_insights: UnifiedUserInsights = self.insight_aggregator.aggregate(aggregation_input)
            logger.info(
                "Unified Insight Aggregator executed successfully for user %s [activeSources=%d, dominantIdentity=%s, conflicts=%d]",
                user_id,
                unified_insights.sourceSummary.activeSourcesCount,
                unified_insights.fashionIdentity.dominantSignals,
                len(unified_insights.conflicts),
            )
        except Exception as exc:
            logger.error("Insight aggregation failed for user %s: %s", user_id, exc)
            return PipelineExecutionResult(
                userId=user_id,
                status="FAILED",
                currentStage="INSIGHT_AGGREGATION_FAILED",
                inputData=normalized_input,
                pipelineInput=routed_inputs,
                dataEncoderOutput=data_output,
                imageEncoderOutput=image_output,
                behaviourEncoderOutput=behaviour_output,
                unifiedUserInsights=None,
                fusionOutput=None,
                persistedRepresentation=None,
                betaRecommendations=[],
                message=f"Insight aggregation failed: {exc}",
            )

        # 8. Phase U6: Execute Multimodal Fusion Layer
        try:
            fusion_output: FusionOutput = self.fusion_layer.fuse(
                insights=unified_insights,
                data_output=data_output,
                image_output=image_output,
                behaviour_output=behaviour_output,
            )
            logger.info(
                "Multimodal Fusion executed successfully for user %s [genId=%s, vectorDim=%d]",
                user_id,
                fusion_output.unifiedUserRepresentation.representationGenerationId,
                fusion_output.userEmbedding.dimension,
            )
        except Exception as exc:
            logger.error("Multimodal fusion failed for user %s: %s", user_id, exc)
            return PipelineExecutionResult(
                userId=user_id,
                status="FAILED",
                currentStage="FUSION_FAILED",
                inputData=normalized_input,
                pipelineInput=routed_inputs,
                dataEncoderOutput=data_output,
                imageEncoderOutput=image_output,
                behaviourEncoderOutput=behaviour_output,
                unifiedUserInsights=unified_insights,
                fusionOutput=None,
                persistedRepresentation=None,
                betaRecommendations=[],
                message=f"Multimodal fusion failed: {exc}",
            )

        # 9. Phase U7: Execute Persistence (PostgreSQL JSONB + Qdrant Vector)
        try:
            persisted_rep: UserZyraRepresentationResponse = (
                await self.persistence_service.persist_user_representation(fusion_output)
            )
            logger.info(
                "UserZyraRepresentation persisted successfully for user %s in PostgreSQL + Qdrant",
                user_id,
            )
        except Exception as exc:
            logger.error("Persistence failed for user %s: %s", user_id, exc)
            return PipelineExecutionResult(
                userId=user_id,
                status="FAILED",
                currentStage="PERSISTENCE_FAILED",
                inputData=normalized_input,
                pipelineInput=routed_inputs,
                dataEncoderOutput=data_output,
                imageEncoderOutput=image_output,
                behaviourEncoderOutput=behaviour_output,
                unifiedUserInsights=unified_insights,
                fusionOutput=fusion_output,
                persistedRepresentation=None,
                betaRecommendations=[],
                message=f"Persistence failed: {exc}",
            )

        # 10. Phase U7: User representation persisted successfully (Live Zyra Engine handles recommendations on demand)
        saved_recs = []

        # 11. Complete Phase U7 Pipeline Checkpoint
        return PipelineExecutionResult(
            userId=user_id,
            status="SUCCESS",
            currentStage="U7_PERSISTED",
            inputData=normalized_input,
            pipelineInput=routed_inputs,
            dataEncoderOutput=data_output,
            imageEncoderOutput=image_output,
            behaviourEncoderOutput=behaviour_output,
            unifiedUserInsights=unified_insights,
            fusionOutput=fusion_output,
            persistedRepresentation=persisted_rep,
            betaRecommendations=saved_recs,
            message="User intelligence successfully ingested, encoded, aggregated, fused (U6), and persisted to PostgreSQL JSONB + Qdrant vector store with Beta recommendations (U7).",
        )
