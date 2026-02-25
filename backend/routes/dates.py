from fastapi import APIRouter, Query
from database.connection import showtimes_collection

router = APIRouter()


@router.get("/api/dates")
async def get_dates(
    movieId: str = Query(..., description="Movie ID"),
    cinemaId: str = Query(..., description="Cinema ID"),
):
    """Get available dates for the selected movie + cinema."""
    pipeline = [
        {"$match": {"movieId": movieId, "cinemaId": cinemaId}},
        {"$group": {"_id": "$date"}},
        {"$sort": {"_id": 1}},
    ]
    dates = []
    async for doc in showtimes_collection.aggregate(pipeline):
        dates.append(doc["_id"])
    return dates
