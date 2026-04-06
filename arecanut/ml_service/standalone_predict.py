"""
standalone_predict.py
Called directly by Node.js as a child process
Usage: python standalone_predict.py "path/to/image.jpg"
"""
import sys
import json
import os
import traceback

def main():
    # Flush print immediately so Node can read it
    sys.stdout.reconfigure(encoding='utf-8')

    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided"}), flush=True)
        sys.exit(1)

    image_path = sys.argv[1]

    # Normalize path — fix Windows backslashes
    image_path = os.path.normpath(image_path)

    if not os.path.exists(image_path):
        print(json.dumps({"error": f"Image not found at: {image_path}"}), flush=True)
        sys.exit(1)

    try:
        from ultralytics import YOLO
        import cv2

        BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
        MODEL_PATH = os.path.join(BASE_DIR, "weights", "best.pt")

        if not os.path.exists(MODEL_PATH):
            print(json.dumps({"error": f"Model not found at: {MODEL_PATH}"}), flush=True)
            sys.exit(1)

        # Load model and predict
        model   = YOLO(MODEL_PATH)
        results = model.predict(source=image_path, save=False, verbose=False)

        # Save annotated image
        annotated_img      = results[0].plot()
        SAVE_DIR           = os.path.join(BASE_DIR, "annotated")
        os.makedirs(SAVE_DIR, exist_ok=True)

        filename           = os.path.basename(image_path)
        annotated_filename = f"annotated_{filename}"
        annotated_path     = os.path.join(SAVE_DIR, annotated_filename)
        cv2.imwrite(annotated_path, annotated_img[..., ::-1])

        # Count grades
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

        # IMPORTANT: print JSON as the very last line
        result = {
            "grade_a":         grade_a,
            "grade_b":         grade_b,
            "total":           total,
            "final_grade":     final_grade,
            "annotated_image": annotated_path
        }
        print(json.dumps(result), flush=True)

    except Exception as e:
        # Print full traceback to stderr so Node can log it
        traceback.print_exc(file=sys.stderr)
        # Print error JSON to stdout so Node can parse it
        print(json.dumps({"error": str(e)}), flush=True)
        sys.exit(1)

if __name__ == "__main__":
    main()
