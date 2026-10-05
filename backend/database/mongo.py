"""MongoDB connection (PyMongo). Credentials come from the MONGODB_URI environment variable."""
import os
import logging
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()
log = logging.getLogger("mongo")

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
_client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=3000)
db = _client["stock_prediction_db"]

stocks = db["stocks"]
predictions = db["predictions"]
model_performance = db["model_performance"]
search_history = db["search_history"]


def safe(fn, *args, default=None, **kwargs):
    """Run a DB operation; if MongoDB is down, log a warning instead of crashing the API."""
    try:
        return fn(*args, **kwargs)
    except Exception as e:  # noqa: BLE001
        log.warning("MongoDB operation failed: %s", e)
        return default


def is_connected() -> bool:
    try:
        _client.admin.command("ping")
        return True
    except Exception:  # noqa: BLE001
        return False
