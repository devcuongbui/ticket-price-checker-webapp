"""
In-memory data store. Serves the same mock data that would be in MongoDB.
When MongoDB is available, replace this with database queries.
"""
import random


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

