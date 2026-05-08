from typing import Optional, List
from datetime import datetime
import uuid
from sqlmodel import Field, SQLModel, Relationship


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    username: str = Field(index=True)
    email: str = Field(index=True, unique=True)
    password_hash: str
    contact_way: Optional[str] = None
    joined_at: datetime = Field(default_factory=datetime.utcnow)

    items: List["Item"] = Relationship(back_populates="owner")


class Item(SQLModel, table=True):
    __tablename__ = "items"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    title: str = Field(index=True)
    description: str
    is_available: bool = Field(default=True)
    trade_type: str
    price: str
    category: str = Field(index=True)

    owner_id: uuid.UUID = Field(foreign_key="users.id", index=True)

    owner: User = Relationship(back_populates="items")
    images: List["Image"] = Relationship(back_populates="item")


class Image(SQLModel, table=True):
    __tablename__ = "images"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    item_id: uuid.UUID = Field(foreign_key="items.id", index=True)
    photo_url: str

    item: "Item" = Relationship(back_populates="images")


class Transaction(SQLModel, table=True):
    __tablename__ = "transactions"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    item_id: uuid.UUID = Field(foreign_key="items.id", index=True)
    borrower_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    review_id: Optional[uuid.UUID] = Field(default=None, foreign_key="reviews.id")
    date: datetime = Field(default_factory=datetime.utcnow)


class Review(SQLModel, table=True):
    __tablename__ = "reviews"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    item_id: uuid.UUID = Field(foreign_key="items.id")
    borrower_id: uuid.UUID = Field(foreign_key="users.id")
    transaction_id: uuid.UUID = Field(foreign_key="transactions.id")
    text: str
    stars_amount: int