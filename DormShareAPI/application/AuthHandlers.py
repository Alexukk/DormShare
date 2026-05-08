from fastapi import Depends, HTTPException, status
from sqlmodel import Session, select
from DormShareAPI.application.Data.DataBase import get_session
from DormShareAPI.application.Data.models import User
from DormShareAPI.application.PydenticModels import UserCreate # Твои схемы
from DormShareAPI.application.Auth import get_password_hash



async def registration(user_data: UserCreate, session: Session = Depends(get_session)):
    existing_user = session.exec(select(User).where(User.email == user_data.email)).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists!")

