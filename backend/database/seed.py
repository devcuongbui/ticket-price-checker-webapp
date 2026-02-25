"""
Seed script to populate MongoDB with mock data for Hai Phong cinemas.
Run: python -m database.seed
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from config import MONGO_URI, DB_NAME


MOVIES = [
    {
        "_id": "movie-1",
        "title": "Lật Mặt 8: Vòng Tay Nắng",
        "genre": "Hành động, Gia đình",
        "duration": 132,
        "poster": "https://placehold.co/300x450/1a1a2e/e94560?text=Lat+Mat+8",
        "rating": "T13",
        "status": "now_showing",
    },
    {
        "_id": "movie-2",
        "title": "Đào, Phở và Piano",
        "genre": "Tâm lý, Chiến tranh",
        "duration": 100,
        "poster": "https://placehold.co/300x450/16213e/0f3460?text=Dao+Pho+Piano",
        "rating": "T16",
        "status": "now_showing",
    },
    {
        "_id": "movie-3",
        "title": "Mai",
        "genre": "Tâm lý, Tình cảm",
        "duration": 131,
        "poster": "https://placehold.co/300x450/1a1a2e/e94560?text=Mai",
        "rating": "T18",
        "status": "now_showing",
    },
    {
        "_id": "movie-4",
        "title": "Godzilla x Kong: Đế Chế Mới",
        "genre": "Hành động, Khoa học viễn tưởng",
        "duration": 115,
        "poster": "https://placehold.co/300x450/0f3460/53d8fb?text=Godzilla+Kong",
        "rating": "T13",
        "status": "now_showing",
    },
    {
        "_id": "movie-5",
        "title": "Kung Fu Panda 4",
        "genre": "Hoạt hình, Hài",
        "duration": 94,
        "poster": "https://placehold.co/300x450/533483/e94560?text=Kung+Fu+Panda+4",
        "rating": "P",
        "status": "now_showing",
    },
]

CINEMAS = [
    {
        "_id": "cinema-1",
        "name": "CGV Vincom Hải Phòng",
        "address": "Tầng 5, TTTM Vincom Plaza, Lê Thánh Tông, Ngô Quyền",
        "chain": "CGV",
        "city": "Hải Phòng",
    },
    {
        "_id": "cinema-2",
        "name": "Lotte Cinema Hải Phòng",
        "address": "Tầng 4, Lotte Mart, Lê Hồng Phong, Ngô Quyền",
        "chain": "Lotte",
        "city": "Hải Phòng",
    },
    {
        "_id": "cinema-3",
        "name": "BHD Star Vincom Hải Phòng",
        "address": "Tầng 4, Vincom Center, Lê Thánh Tông, Ngô Quyền",
        "chain": "BHD",
        "city": "Hải Phòng",
    },
    {
        "_id": "cinema-4",
        "name": "Galaxy Cinema Hải Phòng",
        "address": "36 Điện Biên Phủ, Hồng Bàng",
        "chain": "Galaxy",
        "city": "Hải Phòng",
    },
]

# Generate showtimes for all movie-cinema-date combinations
def generate_showtimes():
    showtimes = []
    counter = 1
    dates = ["2026-02-25", "2026-02-26", "2026-02-27", "2026-02-28", "2026-03-01"]
    time_slots = ["09:00", "10:30", "13:00", "14:30", "16:00", "18:30", "20:00", "21:30"]
    formats_list = ["2D", "3D"]

    # Base prices vary by cinema chain
    chain_base_prices = {
        "cinema-1": {"momo": 75000, "zalopay": 72000, "vnpay": 78000},  # CGV
        "cinema-2": {"momo": 70000, "zalopay": 68000, "vnpay": 72000},  # Lotte
        "cinema-3": {"momo": 80000, "zalopay": 77000, "vnpay": 82000},  # BHD
        "cinema-4": {"momo": 65000, "zalopay": 63000, "vnpay": 67000},  # Galaxy
    }

    for movie in MOVIES:
        for cinema_id, base_prices in chain_base_prices.items():
            for date in dates:
                # Each cinema has 3-5 showtimes per movie per day
                import random
                random.seed(hash(f"{movie['_id']}-{cinema_id}-{date}"))
                selected_times = sorted(random.sample(time_slots, random.randint(3, 5)))

                for time_slot in selected_times:
                    fmt = random.choice(formats_list)
                    # 3D surcharge
                    surcharge = 20000 if fmt == "3D" else 0
                    # Weekend surcharge
                    weekend_surcharge = 15000 if date in ["2026-02-28", "2026-03-01"] else 0
                    # Evening surcharge
                    evening_surcharge = 10000 if time_slot >= "18:00" else 0

                    total_extra = surcharge + weekend_surcharge + evening_surcharge

                    prices = {
                        "momo": base_prices["momo"] + total_extra + random.randint(-5000, 5000),
                        "zalopay": base_prices["zalopay"] + total_extra + random.randint(-5000, 5000),
                        "vnpay": base_prices["vnpay"] + total_extra + random.randint(-5000, 5000),
                    }

                    # Randomly make one platform unavailable sometimes
                    if random.random() < 0.05:
                        platform = random.choice(["momo", "zalopay", "vnpay"])
                        prices[platform] = None

                    for seat_type in ["Thường", "VIP"]:
                        vip_extra = 30000 if seat_type == "VIP" else 0
                        st_prices = {
                            k: (v + vip_extra if v is not None else None)
                            for k, v in prices.items()
                        }

                        showtimes.append({
                            "_id": f"st-{counter}",
                            "movieId": movie["_id"],
                            "cinemaId": cinema_id,
                            "date": date,
                            "time": time_slot,
                            "format": fmt,
                            "seatType": seat_type,
                            "prices": st_prices,
                        })
                        counter += 1

    return showtimes


async def seed():
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]

    # Clear existing data
    await db.movies.delete_many({})
    await db.cinemas.delete_many({})
    await db.showtimes.delete_many({})

    # Insert data
    await db.movies.insert_many(MOVIES)
    print(f"✅ Inserted {len(MOVIES)} movies")

    await db.cinemas.insert_many(CINEMAS)
    print(f"✅ Inserted {len(CINEMAS)} cinemas")

    showtimes = generate_showtimes()
    await db.showtimes.insert_many(showtimes)
    print(f"✅ Inserted {len(showtimes)} showtimes")

    # Create indexes
    await db.showtimes.create_index([("movieId", 1), ("cinemaId", 1), ("date", 1)])
    print("✅ Created indexes")

    client.close()
    print("🎬 Seed completed!")


if __name__ == "__main__":
    asyncio.run(seed())
