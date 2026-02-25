from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from data import MOVIES, CINEMAS, SHOWTIMES, generate_seats

app = FastAPI(title="Ticket Price Checker API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Ticket Price Checker API", "version": "1.0.0"}


@app.get("/api/movies")
def get_movies():
    """All currently showing movies."""
    return [m for m in MOVIES if m["status"] == "now_showing"]


@app.get("/api/cinemas")
def get_cinemas(movieId: str, date: str = None):
    """Cinemas that have showtimes for the given movie (optionally filtered by date)."""
    cinema_ids = set(
        st["cinemaId"]
        for st in SHOWTIMES
        if st["movieId"] == movieId and (date is None or st["date"] == date)
    )
    return [c for c in CINEMAS if c["id"] in cinema_ids]


@app.get("/api/dates")
def get_dates(movieId: str, cinemaId: str = None):
    """Available dates for a movie (optionally filtered by cinema)."""
    dates = sorted(set(
        st["date"]
        for st in SHOWTIMES
        if st["movieId"] == movieId and (cinemaId is None or st["cinemaId"] == cinemaId)
    ))
    return dates


@app.get("/api/showtimes")
def get_showtimes(movieId: str, date: str, cinemaId: str = None):
    """Showtimes (with prices) for a movie + date, optionally filtered by cinema."""
    results = [
        st for st in SHOWTIMES
        if st["movieId"] == movieId
        and st["date"] == date
        and (cinemaId is None or st["cinemaId"] == cinemaId)
    ]
    # Enrich with cinema name
    cinema_map = {c["id"]: c for c in CINEMAS}
    for st in results:
        cinema = cinema_map.get(st["cinemaId"], {})
        st["cinemaName"] = cinema.get("name", "")
        st["cinemaChain"] = cinema.get("chain", "")
    return sorted(results, key=lambda x: (x["cinemaId"], x["time"]))


@app.get("/api/seats")
def get_seats(showtimeId: str):
    """Seat map for a specific showtime."""
    return generate_seats(showtimeId)

