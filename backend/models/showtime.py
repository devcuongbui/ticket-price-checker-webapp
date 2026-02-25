from pydantic import BaseModel, Field
from typing import Optional


class Prices(BaseModel):
    momo: Optional[int] = None
    zalopay: Optional[int] = None
    vnpay: Optional[int] = None


class Showtime(BaseModel):
    id: str = Field(alias="_id")
    movieId: str
    cinemaId: str
    date: str
    time: str
    format: str = "2D"
    seatType: str = "Thường"
    prices: Prices

    class Config:
        populate_by_name = True
