from fastapi import APIRouter, Query
from database.connection import cinemas_collection, showtimes_collection

router = APIRouter()


@router.get("/api/cinemas")
async def get_cinemas(movieId: str = Query(..., description="Movie ID to filter cinemas")):
    """Get cinemas that have showtimes for the selected movie."""
    # Find distinct cinema IDs from showtimes for this movie
    pipeline = [
        {"$match": {"movieId": movieId}},
        {"$group": {"_id": "$cinemaId"}},
    ]
    cinema_ids = []
    async for doc in showtimes_collection.aggregate(pipeline):
        cinema_ids.append(doc["_id"])

    # Fetch cinema details
    cinemas = []
    cursor = cinemas_collection.find({"_id": {"$in": cinema_ids}})
    async for cinema in cursor:
        cinema["id"] = cinema.pop("_id")
        cinemas.append(cinema)
    return cinemas
