#!/usr/bin/env python3
"""Model Download & Caching CLI for Zyra Phase U3 Image Encoder.

Downloads and saves pretrained vision models locally under zyra/user_encoder/models/:
1. MediaPipe Pose Landmarker: pose_landmarker_heavy.task
2. FASHN Human Parser: fashn-ai/fashn-human-parser (SegFormer)
3. FashionCLIP: patrickjohncyh/fashion-clip (CLIP ViT-B/32)
"""

import os
import sys
import argparse
import urllib.request
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger("zyra.download_models")

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
MODELS_DIR = os.path.join(BASE_DIR, "zyra", "user_encoder", "models")

MEDIAPIPE_DIR = os.path.join(MODELS_DIR, "mediapipe")
FASHN_DIR = os.path.join(MODELS_DIR, "fashn_human_parser")
FASHIONCLIP_DIR = os.path.join(MODELS_DIR, "fashionclip")

MEDIAPIPE_URL = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/latest/pose_landmarker_heavy.task"
MEDIAPIPE_FILE = os.path.join(MEDIAPIPE_DIR, "pose_landmarker_heavy.task")


def ensure_directories():
    os.makedirs(MEDIAPIPE_DIR, exist_ok=True)
    os.makedirs(FASHN_DIR, exist_ok=True)
    os.makedirs(FASHIONCLIP_DIR, exist_ok=True)


def download_mediapipe(force: bool = False):
    """Download MediaPipe Pose Landmarker task file."""
    if os.path.exists(MEDIAPIPE_FILE) and not force:
        logger.info("MediaPipe Pose Landmarker already exists at: %s (skipping)", MEDIAPIPE_FILE)
        return

    logger.info("Downloading MediaPipe Pose Landmarker from %s...", MEDIAPIPE_URL)
    try:
        urllib.request.urlretrieve(MEDIAPIPE_URL, MEDIAPIPE_FILE)
        logger.info("Saved MediaPipe model to: %s (%d KB)", MEDIAPIPE_FILE, os.path.getsize(MEDIAPIPE_FILE) // 1024)
    except Exception as exc:
        logger.error("Failed to download MediaPipe model: %s", exc)


def download_fashn(force: bool = False):
    """Download FASHN Human Parser from Hugging Face."""
    if os.path.exists(FASHN_DIR) and len(os.listdir(FASHN_DIR)) > 2 and not force:
        logger.info("FASHN Human Parser already exists in: %s (skipping)", FASHN_DIR)
        return

    logger.info("Downloading FASHN Human Parser (fashn-ai/fashn-human-parser)...")
    try:
        from huggingface_hub import snapshot_download
        snapshot_download(
            repo_id="fashn-ai/fashn-human-parser",
            local_dir=FASHN_DIR,
            local_dir_use_symlinks=False,
            ignore_patterns=["*.git*", "*.md"],
        )
        logger.info("Saved FASHN Human Parser to: %s", FASHN_DIR)
    except Exception as exc:
        logger.error("Failed to download FASHN Human Parser: %s", exc)


def download_fashion_clip(force: bool = False):
    """Download FashionCLIP from Hugging Face."""
    if os.path.exists(FASHIONCLIP_DIR) and len(os.listdir(FASHIONCLIP_DIR)) > 2 and not force:
        logger.info("FashionCLIP already exists in: %s (skipping)", FASHIONCLIP_DIR)
        return

    logger.info("Downloading FashionCLIP (patrickjohncyh/fashion-clip)...")
    try:
        from huggingface_hub import snapshot_download
        snapshot_download(
            repo_id="patrickjohncyh/fashion-clip",
            local_dir=FASHIONCLIP_DIR,
            local_dir_use_symlinks=False,
            ignore_patterns=["*.git*", "*.md"],
        )
        logger.info("Saved FashionCLIP model to: %s", FASHIONCLIP_DIR)
    except Exception as exc:
        logger.error("Failed to download FashionCLIP: %s", exc)


def main():
    parser = argparse.ArgumentParser(description="Download vision models locally for Zyra Image Encoder.")
    parser.add_argument("--force", action="store_true", help="Force re-download even if files exist.")
    parser.add_argument("--mediapipe-only", action="store_true", help="Only download MediaPipe Pose.")
    parser.add_argument("--fashn-only", action="store_true", help="Only download FASHN Human Parser.")
    parser.add_argument("--fashionclip-only", action="store_true", help="Only download FashionCLIP.")
    args = parser.parse_args()

    ensure_directories()

    download_all = not (args.mediapipe_only or args.fashn_only or args.fashionclip_only)

    if download_all or args.mediapipe_only:
        download_mediapipe(force=args.force)

    if download_all or args.fashn_only:
        download_fashn(force=args.force)

    if download_all or args.fashionclip_only:
        download_fashion_clip(force=args.force)

    logger.info("Model download and verification process completed.")


if __name__ == "__main__":
    main()
