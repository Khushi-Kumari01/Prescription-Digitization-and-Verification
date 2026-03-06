"""
AI Summary Service for RxGuardian AI
Uses HuggingFace Transformers (facebook/bart-large-cnn) to generate
patient-friendly prescription summaries.
"""

from transformers import pipeline

# Initialize the summarization pipeline (loads model on first call)
_summarizer = None


def _get_summarizer():
    """Lazy-load the summarization model to avoid startup delay."""
    global _summarizer
    if _summarizer is None:
        _summarizer = pipeline(
            "summarization",
            model="facebook/bart-large-cnn",
            device=-1,  # Use CPU (-1); set to 0 for GPU
        )
    return _summarizer


def generate_summary(text):
    """
    Generate a patient-friendly summary of a prescription.

    Uses the facebook/bart-large-cnn model to summarize the prescription text
    into clear, understandable instructions for the patient.

    Args:
        text (str): The full prescription/OCR text to summarize.

    Returns:
        str: A concise, patient-friendly summary explaining:
            - What medicines to take
            - How to take them
            - Key warnings or instructions
    """
    if not text or len(text.strip()) < 20:
        return "Insufficient prescription text to generate a summary."

    try:
        # Build a structured prompt for better summarization
        prompt = (
            f"Summarize this prescription for a patient in simple language. "
            f"Explain what medicines to take, dosage, and any important instructions: {text}"
        )

        # BART has a max input of 1024 tokens; truncate if needed
        max_input_length = 1024
        if len(prompt.split()) > max_input_length:
            words = prompt.split()[:max_input_length]
            prompt = " ".join(words)

        summarizer = _get_summarizer()

        summary = summarizer(
            prompt,
            max_length=150,
            min_length=40,
            do_sample=False,
            truncation=True,
        )

        if summary and len(summary) > 0:
            return summary[0]["summary_text"]

        return "Unable to generate summary from the provided prescription text."

    except Exception as e:
        return f"Summary generation failed: {str(e)}"
