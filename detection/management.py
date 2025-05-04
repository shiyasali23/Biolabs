import os
from dotenv import load_dotenv
import logging
import numpy as np
import cv2
import httpx
import sys
import asyncio
import tensorflow as tf
from fastapi import UploadFile

from responses import ResponseHandler
from coco_labels import COCO_LABELS

load_dotenv()
logger = logging.getLogger(__name__)
response_handler = ResponseHandler()

class AppManagement:
    def __init__(self):
        # Set models_dir to the folder containing your new model folder.
        self.models_dir = "model"
        self.loaded_model = None
        self.BACKEND_URL = os.getenv('BACKEND_API_URL', '/backend')
        # Save COCO_LABELS to a class attribute for faster access
        self.coco_labels = COCO_LABELS
        try:
            self._load_model()
        except Exception as e:
            print(f"FATAL ERROR: {e}")
            logger.critical(f"FATAL ERROR during model loading: {e}")
            sys.exit(1)

    def _load_model(self):
        try:
            model_path = os.path.join(
                self.models_dir,
                "ssd_mobilenet_v2_fpnlite_320x320_coco17_tpu-8",
                "saved_model"
            )
            if not os.path.exists(model_path):
                raise FileNotFoundError(f"Saved model not found in {model_path}")

            self.loaded_model = tf.saved_model.load(model_path)
            logger.info("Detection model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load detection model: {e}")
            raise RuntimeError(f"Failed to load detection model: {e}")

    async def get_prediction(self, token: str = None, input_image: UploadFile = None):
        try:
            if input_image is None:
                return response_handler.handle_response(
                    error=response_handler.MESSAGES["NO_IMAGE"],
                    message=response_handler.MESSAGES["REQUEST_FAILED"]
                )

            image_bytes = await input_image.read()
            if len(image_bytes) == 0:
                return response_handler.handle_response(
                    error=response_handler.MESSAGES["NO_IMAGE"],
                    message=response_handler.MESSAGES["REQUEST_FAILED"],
                    status_code=400
                )

            # Convert image bytes to NumPy array and decode using OpenCV
            np_image = np.frombuffer(image_bytes, np.uint8)
            preprocessed_image = cv2.imdecode(np_image, cv2.IMREAD_COLOR)
            if preprocessed_image is None:
                return response_handler.handle_exception(
                    exception="Failed to decode image using OpenCV"
                )

            # Preprocess the image:
            # 1. Convert from BGR (OpenCV default) to RGB
            preprocessed_image = cv2.cvtColor(preprocessed_image, cv2.COLOR_BGR2RGB)
            # 2. Resize image to 320x320, which the model was trained on
            preprocessed_image = cv2.resize(preprocessed_image, (320, 320))
            # 3. (Optional) Normalize pixel values if needed:
            # preprocessed_image = preprocessed_image.astype(np.float32) / 255.0

            input_tensor = tf.convert_to_tensor(preprocessed_image)
            input_tensor = input_tensor[tf.newaxis, ...]

            detections = self.loaded_model(input_tensor)
            num_detections = int(detections.pop("num_detections"))
            detections = {
                key: value[0, :num_detections].numpy()
                for key, value in detections.items()
            }
            classes = detections["detection_classes"].astype(np.int32)
            scores = detections["detection_scores"]

            detected_items = set()
            
            # Use a realistic threshold (e.g., 0.5)
            for i in range(num_detections):
                if scores[i] > 0.4:
                    label = self.coco_labels.get(classes[i], "Unknown")
                    detected_items.add(label)

            if detected_items:
                asyncio.create_task(self._register_prediction(token, detected_items))
                return response_handler.handle_response(
                    response=list(detected_items)
                )
                    
            else:
                return response_handler.handle_response(
                    error=response_handler.MESSAGES["NO_DETECTION"],
                    message=response_handler.MESSAGES["REQUEST_FAILED"]
                )
        except Exception as e:
            return response_handler.handle_exception(
                exception=f"Error while predicting: {str(e)}"
            )

    async def _register_prediction(self, token: str, detected_items: set):
        try:
            payload = {
                "token": token,
                "prediction": list(detected_items),
                "model_id": "qrtdh67fhtyrhd"
            }
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.BACKEND_URL}/register_prediction",
                    json={'data': payload}
                )
                logger.info(f"Response: {response.status_code}")
        except Exception as e:
            logger.error(f"Error sending prediction data: {e}")
