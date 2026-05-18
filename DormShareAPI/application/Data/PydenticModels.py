from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import  datetime
from typing import List

from sqlmodel import SQLModel


class ImageRead(SQLModel):
    id: UUID
    photo_url: str


class ItemReadWithImages(SQLModel):
    id: UUID
    title: str
    description: str
    price: str
    trade_type: str
    category: str
    is_available: bool
    created_at: datetime
    owner_id: UUID

    images: list[ImageRead] = []

    model_config = ConfigDict(from_attributes=True)

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
    items: List[ItemReadWithImages] = []

    model_config = ConfigDict(from_attributes=True)


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)

class CurrentUser(BaseModel):
    jwt_token: str


class ItemCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=75)
    description: str = Field(..., min_length=1)
    trade_type: str = Field(..., min_length=1, max_length=70)
    price: str = Field(..., min_length=1)
    category: str = Field(..., min_length=1)
    is_available: bool = True

class ItemUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[str] = None
    category: Optional[str] = None


class ChatCreate(BaseModel):
    lender_id: UUID
    item_id: UUID