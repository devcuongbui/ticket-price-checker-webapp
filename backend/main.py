from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from data import MOVIES, CINEMAS, SHOWTIMES, generate_seats
from auth import (
    get_password_hash, verify_password, create_access_token,
    create_refresh_token, decode_token
)
import uuid

app = FastAPI(title="Ticket Price Checker API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# Mock Users Database
USERS = {
    "admin@admin.com": {
        "id": "u-admin",
        "email": "admin@admin.com",
        "password": get_password_hash("admin123"),
        "role": "admin"
    }
}

class UserRegister(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class TokenRefresh(BaseModel):
    refresh_token: str

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_token(token)
    if payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid token type")
    user_email = payload.get("sub")
    if user_email not in USERS:
        raise HTTPException(status_code=401, detail="User not found")
    return USERS[user_email]

def get_admin_user(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not enough privileges")
    return current_user

@app.post("/api/auth/register")
def register(user: UserRegister):
    if user.email in USERS:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = "u-" + str(uuid.uuid4())[:8]
    USERS[user.email] = {
        "id": user_id,
        "email": user.email,
        "password": get_password_hash(user.password),
        "role": "user"
    }
    return {"message": "User registered successfully"}

@app.post("/api/auth/login")
def login(user: UserLogin):
    db_user = USERS.get(user.email)
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": db_user["email"], "role": db_user["role"]})
    refresh_token = create_refresh_token(data={"sub": db_user["email"]})
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

@app.post("/api/auth/refresh")
def refresh(token_data: TokenRefresh):
    payload = decode_token(token_data.refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid token type")
    user_email = payload.get("sub")
    if user_email not in USERS:
        raise HTTPException(status_code=401, detail="User not found")
    
    db_user = USERS[user_email]
    access_token = create_access_token(data={"sub": db_user["email"], "role": db_user["role"]})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/me")
def read_users_me(current_user: dict = Depends(get_current_user)):
    return {"id": current_user["id"], "email": current_user["email"], "role": current_user["role"]}

@app.get("/api/admin/users")
def read_all_users(admin_user: dict = Depends(get_admin_user)):
    return [{"id": u["id"], "email": u["email"], "role": u["role"]} for u in USERS.values()]

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

