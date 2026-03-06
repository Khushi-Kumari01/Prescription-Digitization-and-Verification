"""
RxGuardian AI - Flask Backend Application
==========================================
Prescription Digitization and Verification System

Pipeline:
  1. Prescription Image Upload
  2. OpenCV Image Preprocessing
  3. EasyOCR Text Extraction
  4. SpaCy Medicine Detection
  5. OpenFDA Drug Verification
  6. Risk Analysis
  7. HuggingFace AI Summary
  8. JSON Response
"""

import os
import sys
import uuid
from datetime import datetime, timezone

from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from werkzeug.utils import secure_filename

# Load environment variables
load_dotenv()

# Ensure backend/ is on the Python path so local packages resolve
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

# Import services
from utils.image_processing import preprocess_image, save_processed_image
from services.ocr_service import extract_text
from services.nlp_service import detect_medicines
from services.drug_service import verify_drug, analyze_risk
from services.summary_service import generate_summary

# ── App Configuration ────────────────────────────────────────────────────────

app = Flask(__name__)
CORS(app)

# Upload folder configuration
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16 MB max upload

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "bmp", "tiff", "webp"}


def allowed_file(filename):
    """Check if the uploaded file has a valid image extension."""
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# ── API Endpoints ────────────────────────────────────────────────────────────

@app.route("/", methods=["GET"])
def index():
    """Health check endpoint."""
    return jsonify({
        "service": "RxGuardian AI",
        "status": "running",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })


@app.route("/analyze", methods=["POST"])
def analyze_prescription():
    """
    POST /analyze

    Accepts a prescription image upload and processes it through the full
    RxGuardian AI pipeline.

    Expects: multipart/form-data with an 'image' field containing the file.

    Returns JSON:
    {
        "extracted_text": "...",
        "medicines_detected": [...],
        "drug_verification": [...],
        "risk_analysis": {...},
        "ai_summary": "..."
    }
    """
    # ── Step 0: Validate the upload ──────────────────────────────────────
    if "image" not in request.files:
        return jsonify({"error": "No image file provided. Use 'image' as the form field name."}), 400

    file = request.files["image"]

    if file.filename == "":
        return jsonify({"error": "No file selected."}), 400

    if not allowed_file(file.filename):
        return jsonify({
            "error": f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        }), 400

    try:
        # ── Step 1: Save uploaded image ──────────────────────────────────
        filename = secure_filename(file.filename)
        unique_name = f"{uuid.uuid4().hex}_{filename}"
        image_path = os.path.join(app.config["UPLOAD_FOLDER"], unique_name)
        file.save(image_path)

        # ── Step 2: Preprocess image using OpenCV ────────────────────────
        processed_image = preprocess_image(image_path)
        processed_path = os.path.join(
            app.config["UPLOAD_FOLDER"], f"processed_{unique_name}"
        )
        save_processed_image(processed_image, processed_path)

        # ── Step 3: Extract text using EasyOCR ───────────────────────────
        extracted_text = extract_text(processed_path)

        # ── Step 4: Detect medicines and dosage using NLP (SpaCy) ────────
        medicines_detected = detect_medicines(extracted_text)

        # ── Step 5: Verify drugs using OpenFDA ───────────────────────────
        drug_verification = []
        for med in medicines_detected:
            med_name = med.get("medicine", "")
            if med_name and med_name.lower() != "unknown":
                verification = verify_drug(med_name)
                drug_verification.append(verification)

        # ── Step 6: Perform risk analysis ────────────────────────────────
        risk_analysis = analyze_risk(medicines_detected)

        # ── Step 7: Generate AI summary using HuggingFace ────────────────
        ai_summary = generate_summary(extracted_text)

        # ── Step 8: Return consolidated JSON response ────────────────────
        response = {
            "extracted_text": extracted_text,
            "medicines_detected": medicines_detected,
            "drug_verification": drug_verification,
            "risk_analysis": risk_analysis,
            "ai_summary": ai_summary,
        }

        return jsonify(response), 200

    except FileNotFoundError as e:
        return jsonify({"error": f"File processing error: {str(e)}"}), 404

    except ValueError as e:
        return jsonify({"error": f"Image processing error: {str(e)}"}), 422

    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500


# ── Run Server ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    debug = os.getenv("FLASK_DEBUG", "true").lower() == "true"

    print(f"\n{'='*50}")
    print(f"  RxGuardian AI Backend - v1.0.0")
    print(f"  Running on http://127.0.0.1:{port}")
    print(f"  Debug mode: {debug}")
    print(f"{'='*50}\n")

    # use_reloader=False prevents Flask from spawning a second process,
    # which would double memory usage and crash PyTorch on low-memory systems.
    app.run(host="0.0.0.0", port=port, debug=debug, use_reloader=False)
