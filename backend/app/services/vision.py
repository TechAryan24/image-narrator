from ultralytics import YOLO
import cv2
import numpy as np

# Lazy-load YOLO model to reduce memory usage on startup
model = None

def get_model():
    global model
    if model is None:
        # Load only when first request comes
        model = YOLO('yolov8n.pt')  # Nano model for speed and efficiency
    return model

def detect_objects(image_bytes):
    # Convert bytes to OpenCV image
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        return {"error": "Failed to decode image."}

    # Lazy-load YOLO
    yolo_model = get_model()
    results = yolo_model(img)

    detected_items = []

    for result in results:
        for box in result.boxes:
            class_id = int(box.cls[0])
            label = yolo_model.names[class_id]
            confidence = float(box.conf[0])
            if confidence > 0.5:
                detected_items.append({
                    "object": label,
                    "confidence": f"{confidence:.2%}"
                })

    return {
        "count": len(detected_items),
        "objects": detected_items
    }

def get_annotated_image(image_bytes):
    # Convert bytes to OpenCV image
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        return None

    # Lazy-load YOLO
    yolo_model = get_model()
    results = yolo_model(img)

    # Annotate image
    for result in results:
        annotated_frame = result.plot()  # Ultralytics built-in plot

    # Encode annotated image to bytes
    _, encoded_img = cv2.imencode('.jpg', annotated_frame)
    return encoded_img.tobytes()
