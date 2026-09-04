"""Benchmark script for Zyra V2 request path performance."""

import os
os.environ.setdefault("KMP_DUPLICATE_LIB_OK", "TRUE")

import json
import time
import numpy as np
import torch

from zyra import ZyraV2

def run_benchmark():
    print("=" * 60)
    print("⚡ BENCHMARKING ZYRA V2 REQUEST PATH")
    print("=" * 60)

    t_load_start = time.perf_counter()
    z = ZyraV2()
    model_load_time_s = time.perf_counter() - t_load_start
    print(f"Model & Catalog loading time: {model_load_time_s:.2f}s")

    test_payload = {
        "user_gender": "Men",
        "occasion": "Casual",
        "preferred_styles": ["Streetwear"],
        "preferred_categories": ["tshirt", "jeans", "sneakers"],
        "budget_range": "₹3000",
        "top_k": 10,
    }

    # 1. Cold Start
    t_cold_start = time.perf_counter()
    cold_res = z.recommend(**test_payload)
    cold_latency_ms = (time.perf_counter() - t_cold_start) * 1000.0
    print(f"Cold-start latency: {cold_latency_ms:.1f}ms")

    # 2. Warm iterations
    iterations = 20
    latencies = []
    retrieval_times = []
    transformer_times = []

    print(f"Running {iterations} warm iterations...")
    for i in range(iterations):
        t0 = time.perf_counter()

        profile = {
            "user_id": f"user_bench_{i}",
            "gender": "Men",
            "preferred_styles": ["Streetwear"],
            "preferred_categories": ["tshirt", "jeans", "sneakers"],
            "budget_range": "₹3000",
            "formality_target": "STREETWEAR_CASUAL",
        }
        uvec = z.generate_user_vector(profile)

        # Retrieval time
        t_ret = time.perf_counter()
        cands = z.retrieve_candidates(profile, uvec, top_k_per_slot=15)
        ret_time = (time.perf_counter() - t_ret) * 1000.0
        retrieval_times.append(ret_time)

        # Outfits
        outfits = z.assemble_outfits(cands, profile, max_outfits=12)

        # Transformer inference time
        t_inf = time.perf_counter()
        scores = z.score_outfit_compatibility(outfits)
        inf_time = (time.perf_counter() - t_inf) * 1000.0
        transformer_times.append(inf_time)

        # Ranking
        ranked = z.rank_and_select(outfits, scores, top_n=3)

        total_latency = (time.perf_counter() - t0) * 1000.0
        latencies.append(total_latency)

    mean_lat = float(np.mean(latencies))
    median_lat = float(np.median(latencies))
    p95_lat = float(np.percentile(latencies, 95))
    min_lat = float(np.min(latencies))
    max_lat = float(np.max(latencies))
    mean_ret = float(np.mean(retrieval_times))
    mean_inf = float(np.mean(transformer_times))

    results = {
        "model_loading_time_s": round(model_load_time_s, 2),
        "cold_start_latency_ms": round(cold_latency_ms, 1),
        "warm_iterations": iterations,
        "mean_latency_ms": round(mean_lat, 1),
        "median_latency_ms": round(median_lat, 1),
        "p95_latency_ms": round(p95_lat, 1),
        "min_latency_ms": round(min_lat, 1),
        "max_latency_ms": round(max_lat, 1),
        "mean_retrieval_time_ms": round(mean_ret, 1),
        "mean_transformer_inference_ms": round(mean_inf, 1),
    }

    print("-" * 60)
    print(f"Mean Latency:                {mean_lat:.1f} ms")
    print(f"Median Latency:              {median_lat:.1f} ms")
    print(f"P95 Latency:                 {p95_lat:.1f} ms")
    print(f"Min / Max Latency:           {min_lat:.1f} ms / {max_lat:.1f} ms")
    print(f"Mean Retrieval Time:         {mean_ret:.1f} ms")
    print(f"Mean Transformer Inference:  {mean_inf:.1f} ms")
    print("=" * 60)

    with open("reports/benchmark_zyra_v2.json", "w") as f:
        json.dump(results, f, indent=2)
    print("Saved results to reports/benchmark_zyra_v2.json")


if __name__ == "__main__":
    run_benchmark()
