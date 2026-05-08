from fastapi import Depends, HTTPException, status
from sqlmodel import Session, select
from DormShareAPI.application.Data.DataBase import get_session
from DormShareAPI.application.Data.models import User
from DormShareAPI.application.PydenticModels import UserCreate # Твои схемы
from DormShareAPI.application.Auth import get_password_hash
from DormShareAPI.application.Mapping.UserMapping import CreateUserEntity


async def registration(user_data: UserCreate, session: Session = Depends(get_session)):
    existing_user = session.exec(select(User).where(User.email == user_data.email)).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists!")

    try:
        new_user = CreateUserEntity(user_data, get_password_hash)

        session.add(new_user)
        session.commit()
        session.refresh(new_user)

        return {
            "status": "success",
            "message": "Created successfully!",
            "user_id": new_user.id
        }

    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Something went wrong: {e}")


