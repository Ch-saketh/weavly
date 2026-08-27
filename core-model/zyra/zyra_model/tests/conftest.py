import os
import sys
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport

# Ensure repository root is in sys.path
repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
if repo_root not in sys.path:
    sys.path.insert(0, repo_root)

from zyra.zyra_model.main import app
from zyra.zyra_model.config.settings import ZyraModelSettings, get_zyra_model_settings


@pytest.fixture
def zyra_settings() -> ZyraModelSettings:
    """Fixture providing ZyraModelSettings instance."""
    return get_zyra_model_settings()


@pytest_asyncio.fixture
async def async_client() -> AsyncClient:
    """Async HTTP test client for ZYRA-MODEL FastAPI application."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client
