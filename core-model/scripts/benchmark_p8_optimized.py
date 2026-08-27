#!/usr/bin/env python3
"""
Zyra V1 — Phase P8 Optimized M5 GPU Benchmark
Evaluates the optimized batch CLIP Product Encoder over 100 real Myntra fashion products.
"""

import time
import os
import sys
from pathlib import Path
import numpy as np
import pandas as pd
import torch

# Ensure core-model is in Python path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from zyra.product_encoder.ingestion.router import (
    ProductTextEncoderInput,
    ProductAttributeEncoderInput,
    ProductAttributes,
    ProductImageEncoderInput,
    ProductImageInput,
)
from zyra.product_encoder.text_encoder.encoder import ProductTextEncoder
from zyra.product_encoder.attribute_encoder.encoder import ProductAttributeEncoder
from zyra.product_encoder.image_encoder.encoder import ProductImageEncoder
from zyra.product_encoder.insights.service import ProductInsightAggregationService
from zyra.product_encoder.fusion import (
    ProductFusionService,
    FusionWeightsConfig,
)


def parse_images(value):
    if isinstance(value, list):
        return value
    if value is None or (isinstance(value, float) and np.isnan(value)):
        return []
    return [x.strip() for x in str(value).split("~") if x.strip()]


def make_text_input(row):
    return ProductTextEncoderInput(
        productId=str(row["sku"]),
        title=str(row["name"]),
        description=str(row.get("description", "")),
        brand=str(row.get("brand", "")),
        category="fashion",
        styles=[],
        occasions=[],
        seasons=[],
        tags=[],
    )


def make_attribute_input(row, attribute_columns):
    attrs = {}
    for col in attribute_columns:
        if col.startswith("attr_"):
            val = row.get(col, 0)
            if val == 1 or val is True or val == "1":
                attrs[col.replace("attr_", "")] = True
        else:
            val = row.get(col)
            if val is not None and not (isinstance(val, float) and np.isnan(val)):
                attrs[col] = val

    return ProductAttributeEncoderInput(
        productId=str(row["sku"]),
        category="fashion",
        attributes=ProductAttributes(customAttributes=attrs),
        rawAttributes=attrs,
    )


def make_image_input(row):
    urls = parse_images(row.get("images"))
    images = [
        ProductImageInput(
            imageUrl=url,
            viewType="front" if i == 0 else "detail" if i > 2 else "on_model",
            sortOrder=i,
        )
        for i, url in enumerate(urls)
    ]
    return ProductImageEncoderInput(
        productId=str(row["sku"]),
        title=str(row["name"]),
        images=images,
    )


def run_benchmark():
    print("=" * 70)
    print("🚀 ZYRA V1 — P8 OPTIMIZED M5 GPU BENCHMARK")
    print("=" * 70)

    # 1. Load Dataset
    dataset_path = Path("/Users/saketh/Desktop/Projects/weavly/data/raw/myntra-fashion-products/Myntra_fashion_products.csv")
    if not dataset_path.exists():
        raise FileNotFoundError(f"Dataset not found at {dataset_path}")

    df = pd.read_csv(dataset_path)
    total_catalog = len(df)
    print(f"✅ Dataset loaded: {dataset_path}")
    print(f"Total catalog size: {total_catalog:,} products")

    # Load Catalog attributes if available
    catalog_path = Path(__file__).resolve().parent.parent / "data/recommendation/product_catalog.pkl"
    if catalog_path.exists():
        products_df = pd.read_pickle(catalog_path)
        attribute_columns = [col for col in products_df.columns if col.startswith("attr_")]
        print(f"✅ Product catalog loaded ({len(attribute_columns)} attribute columns)")
        # Merge catalog attributes onto df for the benchmark subset
        if "sku" in products_df.columns and "sku" in df.columns:
            df = df.merge(products_df[["sku"] + attribute_columns], on="sku", how="left")
    else:
        attribute_columns = [col for col in df.columns if col.startswith("attr_")]
        print(f"Using {len(attribute_columns)} attribute columns from raw dataframe")

    BENCHMARK_SIZE = 100
    benchmark_df = df.head(BENCHMARK_SIZE).copy()

    # 2. Check Hardware
    print("\n--- Hardware Acceleration Check ---")
    mps_available = torch.backends.mps.is_available()
    print(f"Apple MPS Available: {mps_available}")
    device = torch.device("mps" if mps_available else "cpu")
    print(f"Active Device: {device}")

    # 3. Initialize Pipeline Components
    print("\n--- Initializing Pipeline Components ---")
    text_encoder = ProductTextEncoder()
    attribute_encoder = ProductAttributeEncoder()
    image_encoder = ProductImageEncoder(use_batch_inference=True)
    insight_service = ProductInsightAggregationService()
    fusion_service = ProductFusionService(
        weights_config=FusionWeightsConfig(
            visualWeight=0.45,
            textWeight=0.35,
            attributeWeight=0.20,
        )
    )

    # 4. Verify CLIP Model
    model, processor = image_encoder.backbone.model_manager.get_vision_model()
    assert model is not None, "CLIP Model failed to load"
    assert processor is not None, "CLIP Processor failed to load"
    actual_model_device = next(model.parameters()).device
    print(f"✅ Real CLIP Model Loaded: {type(model).__name__} on {actual_model_device}")

    # 5. Execute 100 Product Benchmark
    print("\n" + "-" * 70)
    print(f"PROCESSING {BENCHMARK_SIZE} PRODUCTS (OPTIMIZED BATCH CLIP)")
    print("-" * 70)

    results = []
    errors = []
    total_images = 0
    fallback_count = 0
    confidences = []
    nan_count = 0
    inf_count = 0
    zero_vectors = 0
    l2_norms = []

    benchmark_start = time.perf_counter()

    for idx, (_, row) in enumerate(benchmark_df.iterrows(), start=1):
        product_id = str(row["sku"])
        product_start = time.perf_counter()

        try:
            # P3 Text Encoding
            text_output = text_encoder.encode(make_text_input(row))

            # P4 Attribute Encoding
            attribute_output = attribute_encoder.encode(make_attribute_input(row, attribute_columns))

            # P2 Image Encoding (Optimized Batch CLIP)
            image_input = make_image_input(row)
            image_output = image_encoder.encode(image_input)

            # Check if heuristic fallback was triggered
            if image_output.processingMetadata.get("inferenceMode") == "DeterministicHeuristic":
                fallback_count += 1

            # P5 Insight Aggregation
            profile = insight_service.aggregate(
                visual=image_output,
                text=text_output,
                attribute=attribute_output,
            )

            # P6 Multimodal 662D Fusion
            fused = fusion_service.fuse(
                profile=profile,
                visual=image_output,
                text=text_output,
                attribute=attribute_output,
            )

            # Numerical Validation of 662D Unified Vector
            vector = np.asarray(fused.unifiedEmbedding, dtype=np.float32)
            assert vector.shape == (662,), f"Invalid shape: {vector.shape}"

            if np.isnan(vector).any():
                nan_count += 1
            if np.isinf(vector).any():
                inf_count += 1

            norm = float(np.linalg.norm(vector))
            if norm == 0.0:
                zero_vectors += 1
            l2_norms.append(norm)

            elapsed = time.perf_counter() - product_start
            img_count = image_output.successfulImageCount
            total_images += img_count
            confidences.append(fused.confidence)

            results.append({
                "product_id": product_id,
                "embedding_dim": len(vector),
                "image_count": img_count,
                "confidence": fused.confidence,
                "elapsed_seconds": elapsed,
            })

            if idx % 10 == 0 or idx == BENCHMARK_SIZE:
                elapsed_total = time.perf_counter() - benchmark_start
                rate = idx / elapsed_total
                remaining = BENCHMARK_SIZE - idx
                eta_seconds = remaining / rate if rate > 0 else 0
                print(f"Processed {idx:3d}/{BENCHMARK_SIZE} | {rate:5.2f} products/sec | ETA {eta_seconds:5.1f}s")

        except Exception as exc:
            errors.append({"product_id": product_id, "error": str(exc)})
            print(f"❌ Product {idx}/{BENCHMARK_SIZE} | {product_id} | {exc}")

    total_time = time.perf_counter() - benchmark_start
    results_df = pd.DataFrame(results)

    # 6. Report Comparison & Summary
    print("\n" + "=" * 70)
    print("🏆 OPTIMIZED M5 GPU BENCHMARK RESULTS")
    print("=" * 70)

    successful = len(results)
    failed = len(errors)
    avg_time = results_df["elapsed_seconds"].mean() if successful > 0 else 0.0
    median_time = results_df["elapsed_seconds"].median() if successful > 0 else 0.0
    throughput = successful / total_time if total_time > 0 else 0.0
    avg_confidence = float(np.mean(confidences)) if confidences else 0.0
    mean_l2 = float(np.mean(l2_norms)) if l2_norms else 0.0

    # Baseline comparison metrics
    baseline_time = 131.11
    baseline_avg = 1.31
    baseline_throughput = 0.76
    speedup = throughput / baseline_throughput if baseline_throughput > 0 else 1.0

    full_catalog_seconds = total_catalog / throughput if throughput > 0 else 0.0
    full_catalog_minutes = full_catalog_seconds / 60.0
    full_catalog_hours = full_catalog_seconds / 3600.0

    print(f"Products Processed:       {successful + failed}")
    print(f"Images Processed:         {total_images}")
    print(f"Successful Products:      {successful}")
    print(f"Failed Products:          {failed}")
    print(f"Total Benchmark Time:     {total_time:.2f} seconds (Baseline: {baseline_time:.2f}s)")
    print(f"Average / Product:        {avg_time:.3f} seconds (Baseline: {baseline_avg:.2f}s)")
    print(f"Median / Product:         {median_time:.3f} seconds")
    print(f"Throughput:               {throughput:.2f} products/sec (Baseline: {baseline_throughput:.2f} prod/s)")
    print(f"Performance Speedup:      {speedup:.2f}x faster than baseline")
    print(f"Embedding Dimension:      662D (Validated)")
    print(f"NaN Values:               {nan_count}")
    print(f"Inf Values:               {inf_count}")
    print(f"Zero Vectors:             {zero_vectors}")
    print(f"Mean L2 Norm:             {mean_l2:.6f}")
    print(f"Average Confidence:       {avg_confidence:.2f}")
    print(f"Fallback Count:           {fallback_count}")
    print("-" * 70)
    print("FULL CATALOG ESTIMATE (12,491 products):")
    print(f"Estimated Time:           {full_catalog_minutes:.1f} minutes ({full_catalog_hours:.2f} hours)")
    print(f"Baseline Estimate:        273.0 minutes (4.55 hours)")
    print(f"Time Saved:               {(4.55 - full_catalog_hours):.2f} hours")
    print("=" * 70)


if __name__ == "__main__":
    run_benchmark()
