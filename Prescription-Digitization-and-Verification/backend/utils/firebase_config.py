"""
Firebase Configuration Utility for RxGuardian AI
Provides Firebase initialization for cloud storage and database access.

Note: firebase-admin is optional. Install it only if you need Firebase.
"""

import os
from dotenv import load_dotenv

try:
    import firebase_admin
    from firebase_admin import credentials, firestore, storage
    FIREBASE_AVAILABLE = True
except ImportError:
    FIREBASE_AVAILABLE = False

load_dotenv()

# Firebase configuration
_firebase_app = None


def initialize_firebase():
    """
    Initialize Firebase Admin SDK using a service account key.

    The path to the service account JSON file should be set in the
    FIREBASE_CREDENTIALS environment variable.

    Returns:
        firebase_admin.App: The initialized Firebase app instance.
    """
    global _firebase_app

    if _firebase_app is not None:
        return _firebase_app

    if not FIREBASE_AVAILABLE:
        print("[Firebase] firebase-admin not installed. Firebase disabled.")
        return None

    cred_path = os.getenv("FIREBASE_CREDENTIALS", "firebase-service-account.json")
    bucket_name = os.getenv("FIREBASE_STORAGE_BUCKET", "")

    if not os.path.exists(cred_path):
        print(f"[Firebase] Warning: Credentials file not found at '{cred_path}'. Firebase disabled.")
        return None

    try:
        cred = credentials.Certificate(cred_path)
        _firebase_app = firebase_admin.initialize_app(cred, {
            "storageBucket": bucket_name,
        })
        print("[Firebase] Initialized successfully.")
        return _firebase_app
    except Exception as e:
        print(f"[Firebase] Initialization failed: {e}")
        return None


def get_firestore_client():
    """Get a Firestore database client."""
    if _firebase_app is None:
        initialize_firebase()
    try:
        return firestore.client()
    except Exception:
        return None


def get_storage_bucket():
    """Get a Firebase Cloud Storage bucket reference."""
    if _firebase_app is None:
        initialize_firebase()
    try:
        return storage.bucket()
    except Exception:
        return None
