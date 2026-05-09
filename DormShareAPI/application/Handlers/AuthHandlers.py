from fastapi import Depends, HTTPException, status
from sqlmodel import Session, select
from DormShareAPI.application.Data.DataBase import get_session
from DormShareAPI.application.Data.models import User
from DormShareAPI.application.PydenticModels import UserCreate, UserLogin
from DormShareAPI.application.Auth import get_password_hash, create_access_token, verify_password
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

        token = create_access_token(data={"sub" : new_user.email, "role" : new_user.role})

        return {
                "status" : "success",
                "access_token" : token,
                "token_type" : "bearer"
                }


    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Something went wrong: {e}")

async def login(user_data: UserLogin, session: Session):
    user = session.exec(select(User).where(User.email == user_data.email)).first()

    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    token = create_access_token(data={"sub": user.id, "role" : user.role})
    return {"access_token" : token, "token_type" : "bearer"}