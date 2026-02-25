import os
from urllib.parse import quote_plus
from dotenv import load_dotenv

load_dotenv()

# ── MongoDB Atlas ─────────────────────────────────────────────────────────────
_USER = os.getenv("MONGO_USER", "YOUR_MONGO_USER")
_PASS = os.getenv("MONGO_PASS", "YOUR_MONGO_PASS")
_HOST = os.getenv("MONGO_HOST", "YOUR_MONGO_HOST")

# Full URI can also be set directly via MONGO_URI env var
MONGO_URI = os.getenv(
    "MONGO_URI",
    f"mongodb+srv://{quote_plus(_USER)}:{quote_plus(_PASS)}@{_HOST}/?appName=Cluster0&retryWrites=true&w=majority"
)
DB_NAME = os.getenv("DB_NAME", "movie_tickets")

# ── Project settings ──────────────────────────────────────────────────────────
TARGET_CITY = "Hải Phòng"
DEBUG = os.getenv("DEBUG", "0") == "1"
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
