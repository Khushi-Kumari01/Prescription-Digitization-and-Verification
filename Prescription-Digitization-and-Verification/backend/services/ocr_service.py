"""
OCR Service for RxGuardian AI
Uses EasyOCR to extract text from preprocessed prescription images.
"""

import easyocr

# Lazy-load EasyOCR reader to avoid slow startup
_reader = None


def _get_reader():
    """Initialize EasyOCR reader on first use."""
    global _reader
    if _reader is None:
        _reader = easyocr.Reader(["en"], gpu=False)
    return _reader


def extract_text(image_path):
    """
    Extract text from a prescription image using EasyOCR.

    Args:
        image_path (str): Path to the image file (original or preprocessed).

    Returns:
        str: Combined extracted text from the prescription image.
    """
    try:
        reader = _get_reader()
        results = reader.readtext(image_path)

        # Each result is a tuple: (bounding_box, text, confidence)
        extracted_lines = [text for (_, text, confidence) in results if confidence > 0.25]

        combined_text = " ".join(extracted_lines)

        if not combined_text.strip():
            return "No readable text detected in the prescription image."

        return combined_text.strip()

    except Exception as e:
        return f"OCR extraction failed: {str(e)}"
