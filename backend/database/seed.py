import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import sys
import os

# To import from backend correctly
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import MONGO_URI, DB_NAME
from data import MOVIES, CINEMAS, SHOWTIMES

async def seed_database():
    print(f"Connecting to MongoDB at {MONGO_URI}...")
    try:
        client = AsyncIOMotorClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        await client.server_info() # Check connection
        db = client[DB_NAME]
        
        # Collections
        movies_col = db["movies"]
        cinemas_col = db["cinemas"]
        showtimes_col = db["showtimes"]
        
        print("Clearing old data...")
        await movies_col.delete_many({})
        await cinemas_col.delete_many({})
        await showtimes_col.delete_many({})
        
        print(f"Inserting {len(MOVIES)} movies...")
        if MOVIES:
            await movies_col.insert_many(MOVIES)
            
        print(f"Inserting {len(CINEMAS)} cinemas...")
        if CINEMAS:
            await cinemas_col.insert_many(CINEMAS)
            
        print(f"Inserting {len(SHOWTIMES)} showtimes...")
        if SHOWTIMES:
            await showtimes_col.insert_many(SHOWTIMES)
            
        print("✅ Database seeded successfully!")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        print("Please ensure MongoDB is installed and running locally on port 27017, or update your .env with a valid MONGO_URI.")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(seed_database())
