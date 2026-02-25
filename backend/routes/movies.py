from fastapi import APIRouter
from database.connection import movies_collection

router = APIRouter()


@router.get("/api/movies")
async def get_movies():
    """Get all currently showing movies."""
    movies = []
    cursor = movies_collection.find({"status": "now_showing"})
    async for movie in cursor:
        movie["id"] = movie.pop("_id")
        movies.append(movie)
    return movies
