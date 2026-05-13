import os
from dotenv import load_dotenv
from sqlmodel import create_engine, Session, SQLModel


load_dotenv()

DATABASE_URL = os.getenv("DATABASEURL")


if DATABASE_URL and DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)


engine = create_engine(DATABASE_URL, echo=False,
                                    pool_pre_ping=True,
                                    pool_recycle=True)

def get_session():
    with Session(engine) as session:
        yield session


def init_db():
    SQLModel.metadata.create_all(engine)