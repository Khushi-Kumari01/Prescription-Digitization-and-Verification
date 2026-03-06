"""
Image Preprocessing Utility for RxGuardian AI
Uses OpenCV to enhance prescription images before OCR extraction.
"""

import cv2
import os


def preprocess_image(image_path):
    """
    Preprocess a prescription image for better OCR accuracy.

    Steps:
        1. Read image from path
        2. Convert to grayscale
        3. Reduce noise with Gaussian blur
        4. Apply adaptive thresholding

    Args:
        image_path (str): Path to the prescription image file.

    Returns:
        numpy.ndarray: The preprocessed binary image ready for OCR.

    Raises:
        FileNotFoundError: If the image path does not exist.
        ValueError: If the image cannot be read by OpenCV.
    """
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found: {image_path}")

    # Step 1: Read the image
    image = cv2.imread(image_path)

    if image is None:
        raise ValueError(f"Unable to read image: {image_path}")

    # Step 2: Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Step 3: Reduce noise using Gaussian blur
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)

    # Step 4: Apply adaptive thresholding for binarization
    processed = cv2.adaptiveThreshold(
        blurred,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        11,  # Block size
        2    # Constant subtracted from mean
    )

    return processed


def save_processed_image(processed_image, output_path):
    """
    Save a preprocessed image to disk (useful for debugging).

    Args:
        processed_image (numpy.ndarray): The preprocessed image.
        output_path (str): Destination file path.

    Returns:
        str: The output path where the image was saved.
    """
    cv2.imwrite(output_path, processed_image)
    return output_path
