import logging
from typing import List, Tuple
from zyra.product_encoder.schemas.input_schemas import ProductDataPackage
from zyra.product_encoder.schemas.ingestion_schemas import NormalizationWarning
from zyra.product_encoder.schemas.error_schemas import (
    ProductDataValidationError,
    ValidationErrorDetail,
)

logger = logging.getLogger("zyra.product_encoder.ingestion.validator")

# Safety limits for large inputs
MAX_PRODUCT_ID_LENGTH = 128
MAX_TITLE_LENGTH = 500
MAX_DESCRIPTION_LENGTH = 10000
MAX_CATEGORY_LENGTH = 250
MAX_BRAND_LENGTH = 250
MAX_IMAGES_COUNT = 50
MAX_TAGS_COUNT = 100
MAX_MULTISELECT_COUNT = 100
MAX_URL_LENGTH = 2048


class ProductDataValidator:
    """
    Validates incoming ProductDataPackage against structural, domain, and security rules.
    Detects fatal validation errors as well as non-fatal warnings.
    """

    def validate(self, package: ProductDataPackage) -> Tuple[List[ValidationErrorDetail], List[NormalizationWarning]]:
        """
        Validate product package.
        Raises ProductDataValidationError if fatal validation errors are encountered.
        Returns (errors, warnings) tuple.
        """
        errors: List[ValidationErrorDetail] = []
        warnings: List[NormalizationWarning] = []
        pid = str(package.productId).strip()

        # 1. Product ID Validation
        if not pid:
            errors.append(
                ValidationErrorDetail(
                    field="productId",
                    message="Product ID is required and cannot be empty",
                    rejectedValue=package.productId,
                )
            )
        elif len(pid) > MAX_PRODUCT_ID_LENGTH:
            errors.append(
                ValidationErrorDetail(
                    field="productId",
                    message=f"Product ID exceeds maximum length of {MAX_PRODUCT_ID_LENGTH} characters",
                    rejectedValue=package.productId,
                )
            )

        # 2. Title Validation
        if not package.title or not package.title.strip():
            errors.append(
                ValidationErrorDetail(
                    field="title",
                    message="Product title is required and cannot be empty",
                    rejectedValue=package.title,
                )
            )
        elif len(package.title.strip()) > MAX_TITLE_LENGTH:
            errors.append(
                ValidationErrorDetail(
                    field="title",
                    message=f"Product title exceeds maximum length of {MAX_TITLE_LENGTH} characters",
                    rejectedValue=package.title[:50] + "...",
                )
            )

        # 3. Category Validation
        if not package.category or not package.category.strip():
            errors.append(
                ValidationErrorDetail(
                    field="category",
                    message="Product category is required and cannot be empty",
                    rejectedValue=package.category,
                )
            )
        elif len(package.category.strip()) > MAX_CATEGORY_LENGTH:
            errors.append(
                ValidationErrorDetail(
                    field="category",
                    message=f"Product category exceeds maximum length of {MAX_CATEGORY_LENGTH} characters",
                    rejectedValue=package.category,
                )
            )

        # 4. Description Validation (Optional, non-fatal if oversized -> warn)
        if package.description is not None:
            desc_len = len(package.description)
            if desc_len > MAX_DESCRIPTION_LENGTH:
                warnings.append(
                    NormalizationWarning(
                        warningType="VALUE_TRUNCATED",
                        field="description",
                        message=f"Product description exceeds {MAX_DESCRIPTION_LENGTH} characters (length={desc_len}); will be safely truncated.",
                        originalValue=f"{desc_len} chars",
                    )
                )

        # 5. Brand Validation
        if package.brand and len(package.brand) > MAX_BRAND_LENGTH:
            errors.append(
                ValidationErrorDetail(
                    field="brand",
                    message=f"Product brand exceeds maximum length of {MAX_BRAND_LENGTH} characters",
                    rejectedValue=package.brand,
                )
            )

        # 6. Images Validation
        if len(package.images) > MAX_IMAGES_COUNT:
            warnings.append(
                NormalizationWarning(
                    warningType="VALUE_TRUNCATED",
                    field="images",
                    message=f"Product contains {len(package.images)} images exceeding recommended limit of {MAX_IMAGES_COUNT}.",
                    originalValue=len(package.images),
                )
            )

        for idx, img in enumerate(package.images):
            url = img.imageUrl.strip()
            is_data_uri = url.startswith("data:")
            max_allowed_len = 10 * 1024 * 1024 if is_data_uri else MAX_URL_LENGTH

            if not url:
                errors.append(
                    ValidationErrorDetail(
                        field=f"images[{idx}].imageUrl",
                        message="Image URL cannot be empty",
                        rejectedValue=img.imageUrl,
                    )
                )
            elif len(url) > max_allowed_len:
                errors.append(
                    ValidationErrorDetail(
                        field=f"images[{idx}].imageUrl",
                        message=f"Image URL exceeds maximum length of {max_allowed_len} characters",
                        rejectedValue=url[:50] + "...",
                    )
                )
            elif not (url.startswith("http://") or url.startswith("https://") or is_data_uri):
                errors.append(
                    ValidationErrorDetail(
                        field=f"images[{idx}].imageUrl",
                        message="Image URL must start with http://, https://, or data:",
                        rejectedValue=img.imageUrl,
                    )
                )


        # 7. Check optional multi-select limits
        for field_name, items in [
            ("styles", package.styles),
            ("occasions", package.occasions),
            ("seasons", package.seasons),
            ("tags", package.tags),
        ]:
            if len(items) > MAX_MULTISELECT_COUNT:
                warnings.append(
                    NormalizationWarning(
                        warningType="VALUE_TRUNCATED",
                        field=field_name,
                        message=f"Field '{field_name}' contains {len(items)} items exceeding limit of {MAX_MULTISELECT_COUNT}.",
                        originalValue=len(items),
                    )
                )

        # 8. Check missing optional fields for informational warnings
        if not package.description:
            warnings.append(
                NormalizationWarning(
                    warningType="MISSING_OPTIONAL_FIELD",
                    field="description",
                    message="Product is missing optional description text.",
                )
            )
        if not package.styles:
            warnings.append(
                NormalizationWarning(
                    warningType="MISSING_OPTIONAL_FIELD",
                    field="styles",
                    message="Product has no explicit style tags.",
                )
            )
        if not package.occasions:
            warnings.append(
                NormalizationWarning(
                    warningType="MISSING_OPTIONAL_FIELD",
                    field="occasions",
                    message="Product has no explicit occasion tags.",
                )
            )
        if not package.seasons:
            warnings.append(
                NormalizationWarning(
                    warningType="MISSING_OPTIONAL_FIELD",
                    field="seasons",
                    message="Product has no explicit seasonal tags.",
                )
            )

        if errors:
            logger.warning(
                "ProductDataPackage validation failed for productId=%s: %d errors, %d warnings",
                pid,
                len(errors),
                len(warnings),
            )
            raise ProductDataValidationError(
                message=f"Validation failed for product {pid} with {len(errors)} issues.",
                details={"errors": [e.model_dump() for e in errors]},
            )

        logger.debug("ProductDataPackage validated successfully for productId=%s (%d warnings)", pid, len(warnings))
        return errors, warnings
