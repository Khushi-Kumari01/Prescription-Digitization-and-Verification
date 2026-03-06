"""
Drug Verification & Risk Analysis Service for RxGuardian AI
Uses OpenFDA API to verify drugs and check for interaction risks.
"""

import requests

OPENFDA_BASE_URL = "https://api.fda.gov/drug/label.json"

# Known dangerous drug interaction pairs
DANGEROUS_INTERACTIONS = [
    ({"warfarin"}, {"aspirin", "ibuprofen", "naproxen", "diclofenac"}),
    ({"metformin"}, {"alcohol", "contrast dye"}),
    ({"lisinopril", "losartan"}, {"potassium", "spironolactone"}),
    ({"simvastatin", "atorvastatin", "rosuvastatin"}, {"gemfibrozil", "niacin"}),
    ({"sertraline", "fluoxetine"}, {"tramadol", "sumatriptan"}),
    ({"ciprofloxacin", "levofloxacin"}, {"antacids", "iron", "calcium"}),
    ({"metoprolol", "atenolol"}, {"verapamil", "diltiazem"}),
    ({"clopidogrel"}, {"omeprazole", "esomeprazole"}),
    ({"insulin", "glimepiride"}, {"alcohol", "beta-blockers"}),
    ({"azithromycin"}, {"amiodarone", "sotalol"}),
]


def verify_drug(medicine_name):
    """
    Verify a drug using the OpenFDA Drug Label API.

    Args:
        medicine_name (str): Name of the medicine to verify.

    Returns:
        dict: Drug verification result containing:
            - name (str): Medicine name queried
            - verified (bool): Whether the drug was found in OpenFDA
            - brand_name (str): Brand name from OpenFDA (if found)
            - generic_name (str): Generic name from OpenFDA (if found)
            - warnings (str): Drug warnings/precautions (if found)
            - purpose (str): Drug purpose/indications (if found)
    """
    result = {
        "name": medicine_name,
        "verified": False,
        "brand_name": "N/A",
        "generic_name": "N/A",
        "warnings": "No data available",
        "purpose": "No data available",
    }

    try:
        params = {
            "search": f'openfda.generic_name:"{medicine_name}" OR openfda.brand_name:"{medicine_name}"',
            "limit": 1,
        }
        response = requests.get(OPENFDA_BASE_URL, params=params, timeout=10)

        if response.status_code == 200:
            data = response.json()
            if "results" in data and len(data["results"]) > 0:
                drug = data["results"][0]
                openfda = drug.get("openfda", {})

                result["verified"] = True
                result["brand_name"] = openfda.get("brand_name", ["N/A"])[0]
                result["generic_name"] = openfda.get("generic_name", ["N/A"])[0]

                # Extract warnings
                warnings = drug.get("warnings", drug.get("warnings_and_cautions", ["No warnings found"]))
                if isinstance(warnings, list):
                    result["warnings"] = warnings[0][:500]  # Truncate for readability
                else:
                    result["warnings"] = str(warnings)[:500]

                # Extract purpose / indications
                purpose = drug.get("purpose", drug.get("indications_and_usage", ["No purpose data"]))
                if isinstance(purpose, list):
                    result["purpose"] = purpose[0][:500]
                else:
                    result["purpose"] = str(purpose)[:500]

    except requests.exceptions.RequestException as e:
        result["warnings"] = f"API request failed: {str(e)}"

    return result


def analyze_risk(medicines):
    """
    Analyze risk level based on detected medicines and known drug interactions.

    Args:
        medicines (list[dict]): List of detected medicines from NLP service.
            Each dict should have a 'medicine' key.

    Returns:
        dict: Risk analysis result containing:
            - risk_level (str): "Low", "Moderate", or "High"
            - explanation (str): Human-readable explanation of the risk
            - interactions_found (list[str]): List of flagged interaction descriptions
    """
    if not medicines:
        return {
            "risk_level": "Low",
            "explanation": "No medicines detected to analyze.",
            "interactions_found": [],
        }

    med_names = {m.get("medicine", "").lower() for m in medicines if m.get("medicine", "").lower() != "unknown"}
    interactions_found = []

    # Check each known dangerous interaction pair
    for group_a, group_b in DANGEROUS_INTERACTIONS:
        found_a = med_names & group_a
        found_b = med_names & group_b
        if found_a and found_b:
            interactions_found.append(
                f"⚠ {', '.join(found_a).title()} + {', '.join(found_b).title()}: "
                f"Known dangerous interaction. Consult physician immediately."
            )

    # Determine risk level
    num_meds = len(med_names)
    num_interactions = len(interactions_found)

    if num_interactions > 0:
        risk_level = "High"
        explanation = (
            f"CRITICAL: {num_interactions} dangerous drug interaction(s) detected among "
            f"{num_meds} prescribed medicine(s). Immediate medical review is recommended."
        )
    elif num_meds >= 5:
        risk_level = "Moderate"
        explanation = (
            f"Polypharmacy detected: {num_meds} medicines prescribed. While no direct "
            f"dangerous interactions were found, taking multiple medications increases the "
            f"risk of side effects. Regular monitoring is recommended."
        )
    elif num_meds >= 3:
        risk_level = "Moderate"
        explanation = (
            f"{num_meds} medicines detected. No known dangerous interactions found, "
            f"but patients should be aware of potential cumulative side effects."
        )
    else:
        risk_level = "Low"
        explanation = (
            f"{num_meds} medicine(s) detected with no known dangerous interactions. "
            f"Standard precautions apply. Follow prescribed dosage and schedule."
        )

    return {
        "risk_level": risk_level,
        "explanation": explanation,
        "interactions_found": interactions_found,
    }
