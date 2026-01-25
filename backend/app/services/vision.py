from ultralytics import YOLO
import cv2
import numpy as np

# Load the model outside the function so it doesn't reload on every request
# 'yolov8n.pt' is the Nano model—perfect for speed and efficiency.
model = YOLO('yolov8n.pt') 

def detect_objects(image_bytes):
    # 1. Convert the uploaded bytes into a numpy array
    nparr = np.frombuffer(image_bytes, np.uint8)
    
    # 2. Decode the array into an OpenCV image
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        return {"error": "Failed to decode image."}

    # --- NEW MODIFICATIONS START HERE ---

    # 3. Run the image through the YOLO model
    # We pass the 'img' matrix directly to the model
    results = model(img)

    detected_items = []

    # 4. Extract information from the results
    for result in results:
        for box in result.boxes:
            # Get the name of the object (e.g., 'dog', 'person')
            class_id = int(box.cls[0])
            label = model.names[class_id]
            
            # Get the confidence score (how sure the AI is, 0.0 to 1.0)
            confidence = float(box.conf[0])
            
            # Only add if the AI is more than 50% sure
            if confidence > 0.5:
                detected_items.append({
                    "object": label,
                    "confidence": f"{confidence:.2%}"
                })

    return {
        "count": len(detected_items),
        "objects": detected_items
    }

# draw the boxes on the image and return the image data.
def get_annotated_image(image_bytes):
    """
    Runs detection and returns the image with bounding boxes drawn on it.
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        return None

    # Run YOLO
    results = model(img)

    # Plot results on the image (built-in Ultralytics method)
    # This draws boxes and labels automatically
    for result in results:
        annotated_frame = result.plot()

    # Encode back to memory (JPG format)
    _, encoded_img = cv2.imencode('.jpg', annotated_frame)
    return encoded_img.tobytes()