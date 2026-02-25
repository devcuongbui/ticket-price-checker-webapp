"""
In-memory data store. Serves the same mock data that would be in MongoDB.
When MongoDB is available, replace this with database queries.
"""
import random

MOVIES = [
    {
        "id": "movie-1",
        "title": "Lật Mặt 8: Vòng Tay Nắng",
        "genre": "Hành động, Gia đình",
        "duration": 132,
        "poster": "https://placehold.co/300x450/1a1a2e/e94560?text=Lat+Mat+8",
        "rating": "T13",
        "status": "now_showing",
    },
    {
        "id": "movie-2",
        "title": "Đào, Phở và Piano",
        "genre": "Tâm lý, Chiến tranh",
        "duration": 100,
        "poster": "https://placehold.co/300x450/16213e/0f3460?text=Dao+Pho",
        "rating": "T16",
        "status": "now_showing",
    },
    {
        "id": "movie-3",
        "title": "Mai",
        "genre": "Tâm lý, Tình cảm",
        "duration": 131,
        "poster": "https://placehold.co/300x450/1a1a2e/e94560?text=Mai",
        "rating": "T18",
        "status": "now_showing",
    },
    {
        "id": "movie-4",
        "title": "Godzilla x Kong: Đế Chế Mới",
        "genre": "Hành động, Khoa học viễn tưởng",
        "duration": 115,
        "poster": "https://placehold.co/300x450/0f3460/53d8fb?text=Godzilla",
        "rating": "T13",
        "status": "now_showing",
    },
    {
        "id": "movie-5",
        "title": "Kung Fu Panda 4",
        "genre": "Hoạt hình, Hài",
        "duration": 94,
        "poster": "https://placehold.co/300x450/533483/e94560?text=KFP4",
        "rating": "P",
        "status": "now_showing",
    },
]

CINEMAS = [
    {
        "id": "cinema-1",
        "name": "CGV Vincom Hải Phòng",
        "address": "Tầng 5, TTTM Vincom Plaza, Lê Thánh Tông",
        "chain": "CGV",
        "city": "Hải Phòng",
    },
    {
        "id": "cinema-2",
        "name": "Lotte Cinema Hải Phòng",
        "address": "Tầng 4, Lotte Mart, Lê Hồng Phong",
        "chain": "Lotte",
        "city": "Hải Phòng",
    },
    {
        "id": "cinema-3",
        "name": "BHD Star Hải Phòng",
        "address": "Tầng 4, Vincom Center, Lê Thánh Tông",
        "chain": "BHD",
        "city": "Hải Phòng",
    },
    {
        "id": "cinema-4",
        "name": "Galaxy Cinema Hải Phòng",
        "address": "36 Điện Biên Phủ, Hồng Bàng",
        "chain": "Galaxy",
        "city": "Hải Phòng",
    },
]


def _generate_showtimes():
    """Generate all showtimes with varied pricing across 3 platforms."""
    showtimes = []
    counter = 1
    dates = ["2026-02-25", "2026-02-26", "2026-02-27", "2026-02-28", "2026-03-01", "2026-03-02", "2026-03-03"]
    time_slots = ["09:00", "10:30", "13:00", "14:30", "16:00", "18:30", "20:00", "21:30"]
    formats_list = ["2D", "3D"]

    chain_base = {
        "cinema-1": {"momo": 75000, "zalopay": 72000, "vnpay": 78000},
        "cinema-2": {"momo": 70000, "zalopay": 68000, "vnpay": 72000},
        "cinema-3": {"momo": 80000, "zalopay": 77000, "vnpay": 82000},
        "cinema-4": {"momo": 65000, "zalopay": 63000, "vnpay": 67000},
    }

    for movie in MOVIES:
        for cid, base in chain_base.items():
            for date in dates:
                random.seed(hash(f"{movie['id']}-{cid}-{date}"))
                selected = sorted(random.sample(time_slots, random.randint(3, 5)))

                for t in selected:
                    fmt = random.choice(formats_list)
                    extra = 0
                    if fmt == "3D":
                        extra += 20000
                    if date in ("2026-02-28", "2026-03-01", "2026-03-02"):
                        extra += 15000
                    if t >= "18:00":
                        extra += 10000

                    prices = {
                        "momo": base["momo"] + extra + random.randint(-5000, 5000),
                        "zalopay": base["zalopay"] + extra + random.randint(-5000, 5000),
                        "vnpay": base["vnpay"] + extra + random.randint(-5000, 5000),
                    }

                    if random.random() < 0.05:
                        prices[random.choice(["momo", "zalopay", "vnpay"])] = None

                    for seat in ["Thường", "VIP"]:
                        vip = 30000 if seat == "VIP" else 0
                        st_prices = {
                            k: (v + vip if v is not None else None)
                            for k, v in prices.items()
                        }
                        showtimes.append({
                            "id": f"st-{counter}",
                            "movieId": movie["id"],
                            "cinemaId": cid,
                            "date": date,
                            "time": t,
                            "format": fmt,
                            "seatType": seat,
                            "prices": st_prices,
                        })
                        counter += 1
    return showtimes


SHOWTIMES = _generate_showtimes()


def generate_seats(showtime_id: str):
    """Generate a cinema seat map for a given showtime.
    Returns rows of seats with type (regular/vip/couple/sweetbox) and status.
    Seed by showtime_id so the same showtime always gets the same layout.
    """
    random.seed(hash(f"seats-{showtime_id}"))

    # Cinema hall layout: rows A-J, 12 seats per row
    row_labels = list("ABCDEFGHIJ")
    seats_per_row = 12
    aisle_after = [3, 8]  # aisle gaps after seat index 3 and 8

    # Row types
    row_types = {
        "A": "regular", "B": "regular", "C": "regular",
        "D": "regular", "E": "vip", "F": "vip",
        "G": "vip", "H": "vip",
        "I": "couple", "J": "couple",
    }

    # Occupancy: 40-85% of seats are taken
    occupancy_rate = random.uniform(0.40, 0.85)

    rows = []
    for row_label in row_labels:
        seat_type = row_types[row_label]
        is_couple = seat_type == "couple"
        seats = []

        col = 0
        while col < seats_per_row:
            if is_couple:
                # Couple seats take 2 columns
                seat_num = f"{row_label}{col + 1}-{col + 2}"
                status = "booked" if random.random() < occupancy_rate else "available"
                seats.append({
                    "id": f"{showtime_id}-{row_label}{col + 1}",
                    "label": seat_num,
                    "type": seat_type,
                    "status": status,
                    "colspan": 2,
                })
                col += 2
            else:
                seat_num = f"{row_label}{col + 1}"
                status = "booked" if random.random() < occupancy_rate else "available"
                seats.append({
                    "id": f"{showtime_id}-{seat_num}",
                    "label": seat_num,
                    "type": seat_type,
                    "status": status,
                    "colspan": 1,
                })
                col += 1

        rows.append({
            "label": row_label,
            "type": seat_type,
            "seats": seats,
        })

    # Summary counts
    total = sum(len(r["seats"]) for r in rows)
    available = sum(
        1 for r in rows for s in r["seats"] if s["status"] == "available"
    )
    booked = total - available

    return {
        "showtimeId": showtime_id,
        "seatsPerRow": seats_per_row,
        "aisleAfter": aisle_after,
        "rows": rows,
        "summary": {
            "total": total,
            "available": available,
            "booked": booked,
        },
    }

