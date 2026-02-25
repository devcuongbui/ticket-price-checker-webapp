from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from data import generate_seats
from database.connection import users_collection, movies_collection, cinemas_collection, showtimes_collection
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

@app.on_event("startup")
async def startup_event():
    # Seed default admin if user collection is empty or admin doesn't exist
    admin_exists = await users_collection.find_one({"email": "admin@admin.com"})
    if not admin_exists:
        await users_collection.insert_one({
            "id": "u-admin",
            "email": "admin@admin.com",
            "password": get_password_hash("admin123"),
            "role": "admin"
        })

class UserRegister(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class TokenRefresh(BaseModel):
    refresh_token: str

class UserRoleUpdate(BaseModel):
    role: str

class AdminUserCreate(BaseModel):
    email: str
    password: str
    role: str

class AdminUserUpdate(BaseModel):
    email: str
    password: str | None = None
    role: str

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_token(token)
    if payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid token type")
    user_email = payload.get("sub")
    
    db_user = await users_collection.find_one({"email": user_email})
    if not db_user:
        raise HTTPException(status_code=401, detail="User not found")
    return db_user

async def get_admin_user(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not enough privileges")
    return current_user

@app.post("/api/auth/register")
async def register(user: UserRegister):
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = "u-" + str(uuid.uuid4())[:8]
    new_user = {
        "id": user_id,
        "email": user.email,
        "password": get_password_hash(user.password),
        "role": "user"
    }
    await users_collection.insert_one(new_user)
    return {"message": "User registered successfully"}

@app.post("/api/auth/login")
async def login(user: UserLogin):
    db_user = await users_collection.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": db_user["email"], "role": db_user["role"]})
    refresh_token = create_refresh_token(data={"sub": db_user["email"]})
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

@app.post("/api/auth/refresh")
async def refresh(token_data: TokenRefresh):
    payload = decode_token(token_data.refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid token type")
    user_email = payload.get("sub")
    
    db_user = await users_collection.find_one({"email": user_email})
    if not db_user:
        raise HTTPException(status_code=401, detail="User not found")
    
    access_token = create_access_token(data={"sub": db_user["email"], "role": db_user["role"]})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/me")
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return {"id": current_user["id"], "email": current_user["email"], "role": current_user["role"]}

@app.get("/api/admin/users")
async def read_all_users(admin_user: dict = Depends(get_admin_user)):
    users = []
    cursor = users_collection.find({})
    async for u in cursor:
        users.append({"id": u["id"], "email": u["email"], "role": u["role"]})
    return users

@app.put("/api/admin/users/{user_id}/role")
async def update_user_role(user_id: str, payload: UserRoleUpdate, admin_user: dict = Depends(get_admin_user)):
    if payload.role not in ["user", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    result = await users_collection.update_one(
        {"id": user_id},
        {"$set": {"role": payload.role}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {"message": "User role updated successfully"}

@app.post("/api/admin/users")
async def create_user(payload: AdminUserCreate, admin_user: dict = Depends(get_admin_user)):
    existing_user = await users_collection.find_one({"email": payload.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")
    if payload.role not in ["user", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role")
        
    user_id = "u-" + str(uuid.uuid4())[:8]
    new_user = {
        "id": user_id,
        "email": payload.email,
        "password": get_password_hash(payload.password),
        "role": payload.role
    }
    await users_collection.insert_one(new_user)
    return {"message": "User created successfully", "id": user_id}

@app.put("/api/admin/users/{user_id}")
async def update_user(user_id: str, payload: AdminUserUpdate, admin_user: dict = Depends(get_admin_user)):
    if payload.role not in ["user", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role")
        
    update_data = {"email": payload.email, "role": payload.role}
    if payload.password:
        update_data["password"] = get_password_hash(payload.password)
        
    result = await users_collection.update_one(
        {"id": user_id},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User updated successfully"}

@app.delete("/api/admin/users/{user_id}")
async def delete_user(user_id: str, admin_user: dict = Depends(get_admin_user)):
    if user_id == admin_user["id"]:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
        
    result = await users_collection.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}

@app.get("/")
def root():
    return {"message": "Ticket Price Checker API", "version": "1.0.0"}


@app.get("/api/movies")
async def get_movies():
    """All currently showing movies."""
    movies = []
    async for m in movies_collection.find({"status": "now_showing"}):
        # map _id back to id maybe if needed, or if stored with 'id'
        m["_id"] = str(m.get("_id"))
        movies.append(m)
    return movies


@app.get("/api/cinemas")
async def get_cinemas(movieId: str, date: str = None):
    """Cinemas that have showtimes for the given movie (optionally filtered by date)."""
    filter_q = {"movieId": movieId}
    if date:
        filter_q["date"] = date
        
    showtimes = showtimes_collection.find(filter_q)
    cinema_ids = set()
    async for st in showtimes:
        cinema_ids.add(st["cinemaId"])
        
    cinemas = []
    async for c in cinemas_collection.find({"id": {"$in": list(cinema_ids)}}):
        c["_id"] = str(c.get("_id"))
        cinemas.append(c)
    return cinemas


@app.get("/api/dates")
async def get_dates(movieId: str, cinemaId: str = None):
    """Available dates for a movie (optionally filtered by cinema)."""
    filter_q = {"movieId": movieId}
    if cinemaId:
        filter_q["cinemaId"] = cinemaId
        
    dates = set()
    async for st in showtimes_collection.find(filter_q):
        dates.add(st["date"])
    return sorted(list(dates))


@app.get("/api/showtimes")
async def get_showtimes(movieId: str, date: str, cinemaId: str = None):
    """Showtimes (with prices) for a movie + date, optionally filtered by cinema."""
    filter_q = {"movieId": movieId, "date": date}
    if cinemaId:
        filter_q["cinemaId"] = cinemaId
        
    results = []
    async for st in showtimes_collection.find(filter_q):
        st["_id"] = str(st.get("_id"))
        results.append(st)

    # Enrich with cinema name
    cinema_map = {}
    async for c in cinemas_collection.find({}):
        cinema_map[c["id"]] = c

    for st in results:
        cinema = cinema_map.get(st["cinemaId"], {})
        st["cinemaName"] = cinema.get("name", "")
        st["cinemaChain"] = cinema.get("chain", "")
        
    return sorted(results, key=lambda x: (x["cinemaId"], x["time"]))


@app.get("/api/seats")
async def get_seats(showtimeId: str):
    """Seat map for a specific showtime. Kept generated on-the-fly for simplicity."""
    return generate_seats(showtimeId)

