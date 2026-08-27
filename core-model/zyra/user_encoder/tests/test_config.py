import os
from zyra.user_encoder.config.settings import UserEncoderSettings


def test_default_configuration_loading() -> None:
    """Test 2a: Configuration loads default parameters cleanly."""
    settings = UserEncoderSettings()
    assert settings.SERVICE_NAME == "zyra-user-encoder"
    assert settings.SPRING_BOOT_BASE_URL == "http://localhost:8081"
    assert settings.RABBITMQ_HOST == "localhost"
    assert settings.RABBITMQ_PORT == 5672
    assert settings.RABBITMQ_EXCHANGE == "zyra.user.events"
    assert settings.RABBITMQ_QUEUE == "zyra.user.profile.updated"
    assert settings.RABBITMQ_ROUTING_KEY == "user.profile.updated"


def test_environment_override_configuration(monkeypatch) -> None:
    """Test 2b: Environment variables override defaults properly."""
    monkeypatch.setenv("SPRING_BOOT_BASE_URL", "http://backend.internal:8080")
    monkeypatch.setenv("RABBITMQ_HOST", "rabbitmq.internal")
    monkeypatch.setenv("RABBITMQ_PORT", "5673")
    monkeypatch.setenv("LOG_LEVEL", "DEBUG")

    settings = UserEncoderSettings()
    assert settings.SPRING_BOOT_BASE_URL == "http://backend.internal:8080"
    assert settings.RABBITMQ_HOST == "rabbitmq.internal"
    assert settings.RABBITMQ_PORT == 5673
    assert settings.LOG_LEVEL == "DEBUG"
