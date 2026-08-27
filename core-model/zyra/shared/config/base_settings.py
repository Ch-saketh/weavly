from pydantic_settings import BaseSettings, SettingsConfigDict


class ZyraBaseSettings(BaseSettings):
    """Base configuration class supporting environment variables and .env files."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )
