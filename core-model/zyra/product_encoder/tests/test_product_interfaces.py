from typing import Dict, Any
import pytest
from zyra.product_encoder.schemas.input_schemas import ProductDataPackage
from zyra.product_encoder.schemas.error_schemas import ProductDataValidationError
from zyra.product_encoder.ingestion.validator import ProductDataValidator
from zyra.product_encoder.ingestion.normalizer import ProductDataNormalizer
from zyra.product_encoder.ingestion.router import ProductInputRouter
from zyra.product_encoder.models.manager import ProductModelManager


def test_validator_and_normalizer_flow(sample_complete_product_dict: Dict[str, Any]) -> None:
    """Test 28: Ingestion validator passes valid package and normalizer trims whitespace."""
    validator = ProductDataValidator()
    normalizer = ProductDataNormalizer()

    pkg = ProductDataPackage(**sample_complete_product_dict)
    errors, warnings = validator.validate(pkg)
    assert len(errors) == 0

    norm, norm_warnings = normalizer.normalize(pkg)
    assert norm.title == "Oversized Heavyweight Cotton Hoodie"
    assert norm.attributes.fit == "Oversized"
    assert len(norm.occasions) == 3



def test_validator_raises_on_invalid_data() -> None:
    """Test 29: Validator raises ProductDataValidationError on invalid data."""
    validator = ProductDataValidator()
    pkg = ProductDataPackage(
        productId="P-VALIDATE-ERR",
        title="Valid Title",
        category="Tops",
    )
    # Mutate title to empty to trigger domain validator
    pkg.title = ""
    with pytest.raises(ProductDataValidationError):
        validator.validate(pkg)



def test_router_partitions_into_three_containers(sample_complete_product_dict: Dict[str, Any]) -> None:
    """Test 30: Router partitions product package into Image, Text, and Attribute inputs."""
    router = ProductInputRouter()
    pkg = ProductDataPackage(**sample_complete_product_dict)
    routed = router.route(pkg)

    assert routed.productId == "P-98765-HOODIE"
    # Image container
    assert len(routed.imageInput.images) == 3
    assert routed.imageInput.title == pkg.title
    # Text container
    assert routed.textInput.title == pkg.title
    assert routed.textInput.description == pkg.description
    assert routed.textInput.category == "Outerwear / Hoodies"
    assert len(routed.textInput.styles) == 3
    # Attribute container
    assert routed.attributeInput.category == "Outerwear / Hoodies"
    assert routed.attributeInput.attributes.material == "100% Organic Cotton"
    assert len(routed.attributeInput.sizeInfo.availableSizes) == 4


def test_model_manager_initialization() -> None:
    """Test 31: ProductModelManager initializes with models_dir and valid device resolution."""
    manager = ProductModelManager()
    assert manager.device in ["cpu", "mps", "cuda"]
    assert manager.models_dir is not None
    assert not manager.is_model_cached("non_existent_dummy_model")
