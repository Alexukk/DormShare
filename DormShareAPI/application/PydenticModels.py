from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import  datetime
from typing import List

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=25)
    email: EmailStr
    password: str = Field(..., min_length=8)
    contact_way: str = Field(...) # Link to a social media


class UserSend(BaseModel):
    id: UUID
    username: str
    email: EmailStr
    contact_way: str
    joined_at: datetime
    role: str
    items: List = []

    model_config = ConfigDict(from_attributes=True)


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)


class ItemCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=75)
    description: str = Field(..., min_length=10)
    trade_type: str = Field(..., min_length=1, max_length=70)
    price: str = Field(..., min_length=1)
    category: str = Field(..., min_length=1)
    is_available: bool = True


class ReviewCreate(BaseModel):
    transaction_id: UUID
    text: str = Field(..., min_length=5, max_length=500)
    stars_amount: int = Field(..., ge=1, le=5, description="Mark from 1 to 5 stars")