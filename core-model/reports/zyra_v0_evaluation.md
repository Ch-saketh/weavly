# Zyra V0 Recommendation Quality & Evaluation Report

## Executive Summary
- **Total Evaluation Cases:** 24
- **Successful Executions:** 24
- **Failed Executions:** 0
- **Suspicious Items Flagged:** 24

---

## 1. Baseline Comparison (Raw Retrieval vs. Zyra V0)

| Metric | Baseline (Top 10 Retrieval) | Zyra V0 (Full Scoring) | Delta |
| :--- | :---: | :---: | :---: |
| **Precision@10** | `0.0000` | `0.0000` | `+0.0000` |
| **Recall@10** | `NOT AVAILABLE` | `NOT AVAILABLE` | N/A |
| **Hit Rate@10** | `0.0000` | `0.0000` | `+0.0000` |
| **Category Diversity** | `0.0000` | `0.0000` | `+0.0000` |
| **Color Diversity** | `0.0000` | `0.0000` | `+0.0000` |
| **Uniqueness Ratio** | `1.0000` | `1.0000` | `+0.0000` |
| **Average Score** | `0.9300` | `0.7437` | `-0.1863` |

---

## 2. Component Score Analysis

| Component Score | Mean | Min | Max | Std Dev | Sample Size |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `retrieval_score` | `0.9300` | `0.9100` | `0.9500` | `0.0129` | 216 |
| `person_garment_score` | `0.7456` | `0.6332` | `0.8249` | `0.0487` | 216 |
| `outfit_compatibility_score` | `0.7811` | `0.7500` | `0.7900` | `0.0166` | 216 |
| `occasion_score` | `0.5621` | `0.2750` | `0.8150` | `0.1629` | 216 |
| `final_suitability_score` | `0.7437` | `0.6344` | `0.8324` | `0.0464` | 216 |

---

## 3. Execution Latency
- **Average End-to-End Latency:** `487.27 ms`
- **Median Latency (p50):** `462.91 ms`
- **95th Percentile Latency (p95):** `470.80 ms`
- **Retrieval Latency:** `174.12 ms`
- **Multi-Model Scoring Latency:** `313.13 ms`

---

## 4. Anomaly & Suspicious Recommendation Detection
| Case ID | Occasion | Product ID | Rank | Flag Reason |
| :--- | :--- | :--- | :---: | :--- |
| `EVAL-FORMAL-01` | `formal` | `P-API-P7-FULL` | #3 | Low occasion score (0.275) ranked high in Top 5 |
| `EVAL-FORMAL-01` | `formal` | `P-API-TRIPLE-01` | #4 | Low occasion score (0.275) ranked high in Top 5 |
| `EVAL-FORMAL-01` | `formal` | `P-LUXZERA-HOODIE-001` | #7 | Casual/Athletic garment recommended for Formal/Wedding occasion |
| `EVAL-FORMAL-01` | `formal` | `P-98765-HOODIE` | #9 | Casual/Athletic garment recommended for Formal/Wedding occasion |
| `EVAL-FORMAL-02` | `formal` | `P-API-TRIPLE-01` | #4 | Low occasion score (0.275) ranked high in Top 5 |
| `EVAL-FORMAL-02` | `formal` | `P-API-P6-FULL` | #5 | Low occasion score (0.275) ranked high in Top 5 |
| `EVAL-FORMAL-02` | `formal` | `P-LUXZERA-HOODIE-001` | #7 | Casual/Athletic garment recommended for Formal/Wedding occasion |
| `EVAL-FORMAL-02` | `formal` | `P-98765-HOODIE` | #8 | Casual/Athletic garment recommended for Formal/Wedding occasion |
| `EVAL-FORMAL-03` | `formal` | `P-API-TRIPLE-01` | #4 | Low occasion score (0.275) ranked high in Top 5 |
| `EVAL-FORMAL-03` | `formal` | `P-API-P6-FULL` | #5 | Low occasion score (0.275) ranked high in Top 5 |
| `EVAL-FORMAL-03` | `formal` | `P-LUXZERA-HOODIE-001` | #7 | Casual/Athletic garment recommended for Formal/Wedding occasion |
| `EVAL-FORMAL-03` | `formal` | `P-98765-HOODIE` | #9 | Casual/Athletic garment recommended for Formal/Wedding occasion |
| `EVAL-WEDDING-01` | `wedding` | `P-API-TRIPLE-01` | #4 | Low occasion score (0.275) ranked high in Top 5 |
| `EVAL-WEDDING-01` | `wedding` | `P-API-P6-FULL` | #5 | Low occasion score (0.275) ranked high in Top 5 |
| `EVAL-WEDDING-01` | `wedding` | `P-LUXZERA-HOODIE-001` | #7 | Casual/Athletic garment recommended for Formal/Wedding occasion |
| `EVAL-WEDDING-01` | `wedding` | `P-98765-HOODIE` | #9 | Casual/Athletic garment recommended for Formal/Wedding occasion |
| `EVAL-WEDDING-02` | `wedding` | `P-API-P7-FULL` | #3 | Low occasion score (0.275) ranked high in Top 5 |
| `EVAL-WEDDING-02` | `wedding` | `P-API-TRIPLE-01` | #4 | Low occasion score (0.275) ranked high in Top 5 |
| `EVAL-WEDDING-02` | `wedding` | `P-LUXZERA-HOODIE-001` | #7 | Casual/Athletic garment recommended for Formal/Wedding occasion |
| `EVAL-WEDDING-02` | `wedding` | `P-98765-HOODIE` | #9 | Casual/Athletic garment recommended for Formal/Wedding occasion |
| `EVAL-WEDDING-03` | `wedding` | `P-API-TRIPLE-01` | #4 | Low occasion score (0.275) ranked high in Top 5 |
| `EVAL-WEDDING-03` | `wedding` | `P-API-P6-FULL` | #5 | Low occasion score (0.275) ranked high in Top 5 |
| `EVAL-WEDDING-03` | `wedding` | `P-LUXZERA-HOODIE-001` | #7 | Casual/Athletic garment recommended for Formal/Wedding occasion |
| `EVAL-WEDDING-03` | `wedding` | `P-98765-HOODIE` | #8 | Casual/Athletic garment recommended for Formal/Wedding occasion |
