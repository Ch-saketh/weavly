from uuid import UUID
import pytest
from unittest.mock import AsyncMock, patch
from zyra.user_encoder.pipeline.orchestration import UserEncoderPipeline, PipelineExecutionResult
from zyra.user_encoder.ingestion.springboot_client import SpringBootClient
from zyra.user_encoder.schemas.input_schema import UserEncoderInput, UserFitDataInput
from zyra.user_encoder.schemas.events import UserProfileUpdatedEvent
from zyra.user_encoder.embedding.base import BaseEmbeddingGenerator


@pytest.mark.asyncio
async def test_pipeline_executes_successfully_for_user(
    sample_user_id: UUID,
) -> None:
    """Test: Pipeline fetches, normalizes, routes data, executes all 3 encoders, aggregates insights, fuses, and persists (Phase U7)."""
    mock_client = AsyncMock(spec=SpringBootClient)
    expected_input = UserEncoderInput(
        userId=sample_user_id,
        profileCompleted=True,
        profileImage="https://pub-b09de1c5dd3640839563534a412f1988.r2.dev/profiles/avatar.jpg",
        fitData=UserFitDataInput(
            clothingSize="L",
            preferredStyles=["  streetwear  ", "Minimal"],
            avoidedStyles=["Formal"],
            shoppingPriorities=["Quality", "Fit"],
        ),
    )
    mock_client.fetch_user_encoder_data.return_value = expected_input

    pipeline = UserEncoderPipeline(springboot_client=mock_client)
    result: PipelineExecutionResult = await pipeline.execute_for_user(sample_user_id)

    assert result.status == "SUCCESS"
    assert result.currentStage == "U7_PERSISTED"
    assert result.userId == sample_user_id
    assert result.inputData is not None
    assert result.inputData.userId == sample_user_id
    assert result.inputData.profileCompleted is True

    # Verify routed inputs
    assert result.pipelineInput is not None
    assert result.pipelineInput.imageEncoderInput.profileImage == "https://pub-b09de1c5dd3640839563534a412f1988.r2.dev/profiles/avatar.jpg"
    assert result.pipelineInput.dataEncoderInput.clothingSize == "L"
    assert result.pipelineInput.dataEncoderInput.preferredStyles == ["Streetwear", "Minimal"]

    # Verify Data Encoder Output (U2)
    assert result.dataEncoderOutput is not None
    assert result.dataEncoderOutput.userId == sample_user_id
    assert result.dataEncoderOutput.dataRepresentation.dimension == 86

    # Verify Image Encoder Output (U3)
    assert result.imageEncoderOutput is not None
    assert result.imageEncoderOutput.userId == sample_user_id
    assert result.imageEncoderOutput.visualRepresentation.dimension == 512

    # Verify Behaviour Encoder Output (U4)
    assert result.behaviourEncoderOutput is not None
    assert result.behaviourEncoderOutput.userId == sample_user_id
    assert result.behaviourEncoderOutput.behaviourRepresentation.dimension == 64

    # Verify Unified User Insights (U5)
    assert result.unifiedUserInsights is not None
    assert result.unifiedUserInsights.userId == sample_user_id
    assert result.unifiedUserInsights.sourceSummary.hasQuestionnaireData is True
    assert len(result.unifiedUserInsights.fashionIdentity.dominantSignals) > 0

    # Verify Multimodal Fusion Output (U6)
    assert result.fusionOutput is not None
    assert result.fusionOutput.userEmbedding.dimension == 662
    assert result.fusionOutput.unifiedUserRepresentation.userId == sample_user_id

    # Verify Persisted Representation (U7)
    assert result.persistedRepresentation is not None
    assert result.persistedRepresentation.embeddingReference.dimension == 662
    assert len(result.betaRecommendations) > 0

    mock_client.fetch_user_encoder_data.assert_called_once_with(sample_user_id)


@pytest.mark.asyncio
async def test_pipeline_processes_rabbitmq_event(
    sample_event_id: UUID,
    sample_user_id: UUID,
) -> None:
    """Test: Pipeline process_event handles incoming event trigger and produces full U7 persisted output."""
    mock_client = AsyncMock(spec=SpringBootClient)
    mock_client.fetch_user_encoder_data.return_value = UserEncoderInput(
        userId=sample_user_id,
        profileCompleted=True,
    )

    event = UserProfileUpdatedEvent(
        eventId=sample_event_id,
        userId=sample_user_id,
        eventType="USER_FIT_DATA_UPDATED",
    )

    pipeline = UserEncoderPipeline(springboot_client=mock_client)
    result: PipelineExecutionResult = await pipeline.process_event(event)

    assert result.status == "SUCCESS"
    assert result.userId == sample_user_id
    assert result.currentStage == "U7_PERSISTED"
    assert result.pipelineInput is not None
    assert result.pipelineInput.eventId == sample_event_id
    assert result.pipelineInput.eventType == "USER_FIT_DATA_UPDATED"
    assert result.dataEncoderOutput is not None
    assert result.imageEncoderOutput is not None
    assert result.behaviourEncoderOutput is not None
    assert result.unifiedUserInsights is not None
    assert result.fusionOutput is not None
    assert result.persistedRepresentation is not None


@pytest.mark.asyncio
async def test_pipeline_isolates_product_encoder_and_core_model(sample_user_id: UUID) -> None:
    """Test: Verify that Phase U7 User Encoder does not execute future Product Encoder or core recommendation neural model."""
    mock_client = AsyncMock(spec=SpringBootClient)
    mock_client.fetch_user_encoder_data.return_value = UserEncoderInput(
        userId=sample_user_id,
        profileCompleted=True,
    )

    pipeline = UserEncoderPipeline(springboot_client=mock_client)
    result = await pipeline.execute_for_user(sample_user_id)

    # 1. Pipeline completes at U7_PERSISTED
    assert result.currentStage == "U7_PERSISTED"

    # 2. Verify abstract base embedding interface raises NotImplementedError
    class ConcreteEmbeddingGenerator(BaseEmbeddingGenerator):
        async def generate_and_index_embedding(self, user_id, representation):
            return await super().generate_and_index_embedding(user_id, representation)

    with pytest.raises(NotImplementedError):
        await ConcreteEmbeddingGenerator().generate_and_index_embedding(sample_user_id, None)
