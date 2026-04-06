"""
ML Microservice - predict.py
Runs as Flask API - called by Node.js server
"""
import os
import sys

print("Starting ML service...")

try:
    from flask import Flask, request, jsonify
    print("OK Flask loaded")
except ImportError:
    print("ERROR: pip install flask")
    sys.exit(1)

try:
    from ultralytics import YOLO
    print("OK Ultralytics loaded")
except ImportError:
    print("ERROR: pip install ultralytics")
    sys.exit(1)

try:
    import cv2
    print("OK OpenCV loaded")
except ImportError:
    print("ERROR: pip install opencv-python-headless")
    sys.exit(1)

app = Flask(__name__)

BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "weights", "best.pt")

if not os.path.exists(MODEL_PATH):
    print(f"ERROR: Model not found at {MODEL_PATH}")
    sys.exit(1)

print("Loading YOLO model...")
model = YOLO(MODEL_PATH)
print("YOLO model loaded!")

SAVE_DIR = os.path.join(BASE_DIR, "annotated")
TEMP_DIR = os.path.join(BASE_DIR, "temp")
os.makedirs(SAVE_DIR, exist_ok=True)
os.makedirs(TEMP_DIR, exist_ok=True)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ML service running"}), 200


@app.route("/predict", methods=["POST"])
def predict():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    temp_path = os.path.join(TEMP_DIR, file.filename)
    file.save(temp_path)

    try:
        results = model.predict(source=temp_path, save=False, verbose=False)

        annotated_img      = results[0].plot()
        annotated_filename = f"annotated_{file.filename}"
        annotated_path     = os.path.join(SAVE_DIR, annotated_filename)
        cv2.imwrite(annotated_path, annotated_img[..., ::-1])

        boxes   = results[0].boxes
        grade_a = 0
        grade_b = 0
        if boxes is not None and len(boxes):
            for cls in boxes.cls:
                if int(cls) == 0:
                    grade_a += 1
                else:
                    grade_b += 1

        total = grade_a + grade_b
        if total == 0:
            final_grade = "Invalid"
        elif grade_a >= grade_b:
            final_grade = "Grade A"
        else:
            final_grade = "Grade B"

        return jsonify({
            "grade_a":         grade_a,
            "grade_b":         grade_b,
            "total":           total,
            "final_grade":     final_grade,
            "annotated_image": annotated_filename,
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


if __name__ == "__main__":
    # Render provides PORT env variable
    port = int(os.environ.get("PORT", 5001))
    print(f"ML Service starting on port {port}")
    app.run(host="0.0.0.0", port=port, debug=False, use_reloader=False)
