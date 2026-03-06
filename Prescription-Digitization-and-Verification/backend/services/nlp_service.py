"""
NLP Service for RxGuardian AI
Uses SpaCy to detect medicine names, dosage values, and frequency from OCR text.
"""

import re
import spacy

# Load SpaCy English model
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    import subprocess
    subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"], check=True)
    nlp = spacy.load("en_core_web_sm")

# Common medicine keywords / known drug names for pattern matching
COMMON_MEDICINES = [
    "amoxicillin", "paracetamol", "ibuprofen", "metformin", "aspirin",
    "ciprofloxacin", "azithromycin", "omeprazole", "cetirizine", "atorvastatin",
    "lisinopril", "amlodipine", "losartan", "metoprolol", "simvastatin",
    "levothyroxine", "hydrochlorothiazide", "gabapentin", "sertraline",
    "fluoxetine", "prednisone", "albuterol", "montelukast", "pantoprazole",
    "clopidogrel", "warfarin", "diclofenac", "naproxen", "tramadol",
    "doxycycline", "clindamycin", "cephalexin", "augmentin", "ranitidine",
    "loratadine", "insulin", "glimepiride", "pioglitazone", "rosuvastatin",
    "atenolol", "furosemide", "spironolactone", "ceftriaxone", "levofloxacin",
    "hydroxychloroquine", "prednisolone", "methylprednisolone", "acetaminophen",
]

# Dosage pattern: matches values like 500mg, 10ml, 250 mg, 2 tablets
DOSAGE_PATTERN = re.compile(
    r"\b(\d+\.?\d*)\s*(mg|ml|mcg|g|tablets?|caps?|capsules?|units?|iu)\b",
    re.IGNORECASE,
)

# Frequency pattern: matches phrases like "twice daily", "once a day", "3 times a day"
FREQUENCY_PATTERN = re.compile(
    r"\b(once|twice|thrice|one|two|three|four|\d+)\s*(times?\s*)?(a\s+)?(daily|a\s*day|per\s*day|"
    r"weekly|hourly|every\s+\d+\s+hours?|morning|evening|night|bedtime|after\s+meals?|"
    r"before\s+meals?|with\s+food|on\s+empty\s+stomach)\b",
    re.IGNORECASE,
)


def detect_medicines(text):
    """
    Detect medicine names, dosage, and frequency from prescription text.

    Args:
        text (str): Extracted OCR text from a prescription.

    Returns:
        list[dict]: List of detected medicines with dosage and frequency info.
            Each dict contains:
                - medicine (str): Detected medicine name
                - dosage (str): Detected dosage value (e.g., "500mg")
                - frequency (str): Detected frequency (e.g., "twice daily")
    """
    if not text or not text.strip():
        return []

    doc = nlp(text)
    detected = []
    text_lower = text.lower()

    # --- Method 1: Match against known medicine list ---
    found_medicines = set()
    for med in COMMON_MEDICINES:
        if med in text_lower:
            found_medicines.add(med.capitalize())

    # --- Method 2: Use SpaCy NER for potential drug entities ---
    for ent in doc.ents:
        # Drug names are often tagged as PRODUCT, ORG, or not recognized
        if ent.label_ in ("PRODUCT", "ORG", "GPE", "PERSON"):
            candidate = ent.text.strip()
            if len(candidate) > 2 and candidate.lower() not in ("dr", "mr", "mrs", "ms"):
                found_medicines.add(candidate.title())

    # --- Method 3: Heuristic – capitalized words near dosage patterns ---
    words = text.split()
    for i, word in enumerate(words):
        clean = re.sub(r"[^a-zA-Z]", "", word)
        if (
            clean
            and clean[0].isupper()
            and len(clean) > 3
            and clean.lower() not in ("patient", "doctor", "name", "date", "hospital", "clinic", "prescription")
        ):
            # Check if a dosage pattern follows within the next 3 words
            lookahead = " ".join(words[i : i + 4])
            if DOSAGE_PATTERN.search(lookahead):
                found_medicines.add(clean.title())

    # --- Extract dosage and frequency for each medicine ---
    dosage_matches = DOSAGE_PATTERN.findall(text)
    frequency_matches = FREQUENCY_PATTERN.findall(text)

    dosage_list = [f"{val}{unit}" for val, unit in dosage_matches] if dosage_matches else ["Not specified"]
    frequency_list = [" ".join(match).strip() for match in frequency_matches] if frequency_matches else ["Not specified"]

    # Build result list
    for idx, med in enumerate(found_medicines):
        dosage = dosage_list[idx] if idx < len(dosage_list) else dosage_list[-1] if dosage_list else "Not specified"
        frequency = frequency_list[idx] if idx < len(frequency_list) else frequency_list[-1] if frequency_list else "Not specified"

        detected.append({
            "medicine": med,
            "dosage": dosage,
            "frequency": frequency,
        })

    # If no medicines found, return a fallback
    if not detected:
        detected.append({
            "medicine": "Unknown",
            "dosage": dosage_list[0] if dosage_list else "Not specified",
            "frequency": frequency_list[0] if frequency_list else "Not specified",
        })

    return detected
