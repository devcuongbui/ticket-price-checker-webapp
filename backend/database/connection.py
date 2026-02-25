from motor.motor_asyncio import AsyncIOMotorClient
from config import MONGO_URI, DB_NAME

client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]

# Collections
movies_collection = db["movies"]
cinemas_collection = db["cinemas"]
showtimes_collection = db["showtimes"]
