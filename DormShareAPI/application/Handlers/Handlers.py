
from fastapi import Depends, HTTPException, status
from sqlmodel import Session, select
from DormShareAPI.application.Data.DataBase import get_session
from DormShareAPI.application.Data.models import User
from DormShareAPI.application.PydenticModels import UserSend



async def getUserById(user_id, session):
    try:
        user = session.get(User, user_id)

        if not user:
            raise HTTPException(status_code=404, detail=f"No user found by id: {user_id}")

        return user


    except Exception as e:
        raise HTTPException(status_code=500, detail="Some shit happened")



async def getAllUsers(session):
    try:
        users = session.exec(select(User)).all()
        return users
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Something went wrong {e}")