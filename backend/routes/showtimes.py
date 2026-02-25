from fastapi import APIRouter, Query
from database.connection import showtimes_collection

router = APIRouter()


@router.get("/api/showtimes")
async def get_showtimes(
    movieId: str = Query(..., description="Movie ID"),
    cinemaId: str = Query(..., description="Cinema ID"),
    date: str = Query(..., description="Date in YYYY-MM-DD format"),
):
    """Get showtimes with prices for the selected movie + cinema + date."""
    cursor = showtimes_collection.find(
        {"movieId": movieId, "cinemaId": cinemaId, "date": date}
    ).sort("time", 1)

    showtimes = []
    async for st in cursor:
        st["id"] = st.pop("_id")
        showtimes.append(st)
    return showtimes
