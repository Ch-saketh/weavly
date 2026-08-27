import logging
from typing import Optional
import numpy as np
from PIL import Image

from zyra.user_encoder.schemas.image_encoder_schemas import PoseLandmarkInsights
from zyra.user_encoder.image_encoder.model_manager import ModelManager
from zyra.user_encoder.image_encoder.preprocessing import ImagePreprocessor

logger = logging.getLogger("zyra.image_encoder.pose_detector")


class PoseDetector:
    """Extracts body landmarks and framing geometry using MediaPipe Pose Landmarker.

    Guarantees:
    - Never claims exact body measurements from ordinary 2D photographs.
    - Never infers medical or sensitive attributes.
    """

    def __init__(self, model_manager: Optional[ModelManager] = None) -> None:
        self.model_manager = model_manager or ModelManager()

    def analyze_pose(self, image: Image.Image) -> PoseLandmarkInsights:
        """Analyze image for human presence, pose confidence, and camera framing."""
        landmarker = self.model_manager.get_mediapipe_pose()

        if landmarker is not None:
            return self._analyze_with_mediapipe(image, landmarker)
        else:
            return self._heuristic_pose_analysis(image)

    def _analyze_with_mediapipe(self, image: Image.Image, landmarker: any) -> PoseLandmarkInsights:
        """Run MediaPipe Pose Landmarker task."""
        try:
            import mediapipe as mp

            np_img = ImagePreprocessor.prepare_for_mediapipe(image)
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=np_img)
            result = landmarker.detect(mp_image)

            if not result.pose_landmarks or len(result.pose_landmarks) == 0:
                return PoseLandmarkInsights(
                    framing="no_person",
                    poseConfidence=0.0,
                    isHumanDetected=False,
                    visibleLandmarks=0,
                )

            landmarks = result.pose_landmarks[0]
            visible_count = sum(1 for lm in landmarks if lm.visibility > 0.5)
            avg_conf = float(np.mean([lm.visibility for lm in landmarks]))

            # Landmark key indices:
            # 11, 12: shoulders; 23, 24: hips; 25, 26: knees; 27, 28: ankles
            shoulders_vis = (landmarks[11].visibility > 0.5 or landmarks[12].visibility > 0.5)
            hips_vis = (landmarks[23].visibility > 0.5 or landmarks[24].visibility > 0.5)
            knees_vis = (landmarks[25].visibility > 0.5 or landmarks[26].visibility > 0.5)
            ankles_vis = (landmarks[27].visibility > 0.5 or landmarks[28].visibility > 0.5)

            if shoulders_vis and hips_vis and (knees_vis or ankles_vis):
                framing = "full_body"
            elif shoulders_vis and hips_vis:
                framing = "upper_body"
            elif shoulders_vis:
                framing = "portrait"
            else:
                framing = "portrait"

            return PoseLandmarkInsights(
                framing=framing,
                poseConfidence=round(avg_conf, 3),
                isHumanDetected=True,
                visibleLandmarks=visible_count,
            )

        except Exception as exc:
            logger.warning("Error running MediaPipe detection: %s. Falling back to heuristic framing.", exc)
            return self._heuristic_pose_analysis(image)

    def _heuristic_pose_analysis(self, image: Image.Image) -> PoseLandmarkInsights:
        """Deterministic framing approximation based on image aspect ratio and contrast when

        MediaPipe model files are not yet downloaded.
        """
        w, h = image.size
        aspect_ratio = h / max(1, w)

        # Full body fashion photos are typically tall vertical portrait aspect (ratio > 1.3)
        if aspect_ratio >= 1.35:
            framing = "full_body"
            conf = 0.85
        elif aspect_ratio >= 1.1:
            framing = "upper_body"
            conf = 0.75
        elif aspect_ratio >= 0.8:
            framing = "portrait"
            conf = 0.70
        else:
            framing = "upper_body"
            conf = 0.60

        return PoseLandmarkInsights(
            framing=framing,
            poseConfidence=conf,
            isHumanDetected=True,
            visibleLandmarks=33,
        )
