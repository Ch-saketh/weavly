import os
from unittest.mock import patch
from zyra.product_encoder.config.settings import ProductEncoderSettings, get_product_settings
from zyra.product_encoder.config.constants import (
    PRODUCT_ENCODER_VERSION,
    SCHEMA_VERSION,
    IMAGE_ENCODER_VERSION,
    TEXT_ENCODER_VERSION,
    ATTRIBUTE_ENCODER_VERSION,
    FUSION_VERSION,
    EMBEDDING_VERSION,
)


def test_product_config_defaults() -> None:
    """Test 24: Default product encoder settings load correctly."""
    settings = get_product_settings()
    assert settings.SERVICE_NAME == "zyra-product-encoder"
    assert settings.PORT == 8000
    assert settings.PRODUCT_ENCODER_VERSION == PRODUCT_ENCODER_VERSION
    assert settings.SCHEMA_VERSION == SCHEMA_VERSION
    assert settings.QDRANT_COLLECTION_NAME == "zyra_product_embeddings"
    assert settings.ENABLE_ML_ENCODING is False


def test_product_config_environment_overrides() -> None:
    """Test 25: Environment variable overrides are reflected in settings."""
    with patch.dict(
        os.environ,
        {
            "SERVICE_NAME": "custom-product-encoder",
            "PORT": "9000",
            "ENVIRONMENT": "production",
            "QDRANT_COLLECTION_NAME": "custom_prod_coll",
        },
    ):
        custom_settings = ProductEncoderSettings()
        assert custom_settings.SERVICE_NAME == "custom-product-encoder"
        assert custom_settings.PORT == 9000
        assert custom_settings.ENVIRONMENT == "production"
        assert custom_settings.QDRANT_COLLECTION_NAME == "custom_prod_coll"


def test_no_hardcoded_secrets_in_settings() -> None:
    """Test 26: Settings class does not contain hardcoded API keys or external secrets."""
    settings = ProductEncoderSettings()
    assert settings.QDRANT_API_KEY is None


def test_version_manifest_availability() -> None:
    """Test 27: All modular version constants are defined and non-empty."""
    assert PRODUCT_ENCODER_VERSION == "v0-foundation"
    assert SCHEMA_VERSION == "v1"
    assert IMAGE_ENCODER_VERSION == "v0-foundation"
    assert TEXT_ENCODER_VERSION == "v0-foundation"
    assert ATTRIBUTE_ENCODER_VERSION == "v0-foundation"
    assert FUSION_VERSION == "v0-foundation"
    assert EMBEDDING_VERSION == "v0-foundation"
