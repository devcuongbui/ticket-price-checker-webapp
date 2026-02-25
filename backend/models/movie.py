from pydantic import BaseModel, Field
from typing import Optional


class Movie(BaseModel):
    id: str = Field(alias="_id")
    title: str
    genre: str
    duration: int
    poster: str
    rating: str
    status: str = "now_showing"

    class Config:
        populate_by_name = True
