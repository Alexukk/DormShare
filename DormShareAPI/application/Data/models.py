from typing import Optional, List
from datetime import datetime
import uuid
from sqlmodel import Field, SQLModel, Relationship
from enum import Enum


class UserRole(str, Enum):
    USER = "user",
    ADMIN = "admin",
    MODERATOR = "moderator",
    USER_PLUS = "user_plus",
    BANNED = "banned"


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    username: str = Field(index=True)
    email: str = Field(index=True, unique=True)
    password_hash: str
    contact_way: Optional[str] = None
    joined_at: datetime = Field(default_factory=datetime.utcnow)
    role: UserRole = Field(default=UserRole.USER)
    university: str = Field(index=True)

    items: List["Item"] = Relationship(back_populates="owner",
                                       cascade_delete=True)



class Item(SQLModel, table=True):
    __tablename__ = "items"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    title: str = Field(index=True)
    description: str
    is_available: bool = Field(default=True)
    trade_type: str
    price: str
    category: str = Field(index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    owner_id: uuid.UUID = Field(foreign_key="users.id", index=True)


    owner: User = Relationship(back_populates="items")
    images: list["Image"] = Relationship(back_populates="item",
                                         cascade_delete = True)
    reviews: list["Review"] = Relationship(back_populates="item")

class Image(SQLModel, table=True):
    __tablename__ = "images"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    external_id: str
    item_id: uuid.UUID = Field(foreign_key="items.id", index=True)
    photo_url: str

    item: "Item" = Relationship(back_populates="images")


class Transaction(SQLModel, table=True):
    __tablename__ = "transactions"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    chat_id: uuid.UUID = Field(foreign_key="chats.id", index=True)
    item_id: uuid.UUID = Field(foreign_key="items.id", index=True)
    lender_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    borrower_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    lender_confirmation: bool = Field(default=False)
    borrower_confirmation: bool = Field(default=False)
    status: str = Field(default="pending")  # pending | active | completing | completed | canceled
    review_id: Optional[uuid.UUID] = Field(default=None, foreign_key="reviews.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = Field(default=None)


class Review(SQLModel, table=True):
    __tablename__ = "reviews"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    item_id: uuid.UUID = Field(foreign_key="items.id")
    borrower_id: uuid.UUID = Field(foreign_key="users.id")
    transaction_id: uuid.UUID = Field(foreign_key="transactions.id")
    text: str
    stars_amount: int
    item: Optional["Item"] = Relationship(back_populates="reviews")

class Message(SQLModel, table=True):
    __tablename__ = "messages"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    content: str
    is_viewed: bool = Field(default=False)
    reaction: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    sender_id: uuid.UUID = Field(foreign_key="users.id")
    chat_id: uuid.UUID = Field(foreign_key="chats.id", index=True)

    chat: "Chat" = Relationship(back_populates="messages")


class Chat(SQLModel, table=True):
    __tablename__ = "chats"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    status: str = Field(default="default")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    lender_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    borrower_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    item_id: uuid.UUID = Field(foreign_key="items.id", index=True)

    messages: List[Message] = Relationship(
        back_populates="chat",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )