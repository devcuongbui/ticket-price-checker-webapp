from pydantic import BaseModel, Field


class Cinema(BaseModel):
    id: str = Field(alias="_id")
    name: str
    address: str
    chain: str
    city: str = "Hải Phòng"

    class Config:
        populate_by_name = True
