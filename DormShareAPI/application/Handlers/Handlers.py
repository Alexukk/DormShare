
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select
from DormShareAPI.application.Data.DataBase import get_session
from DormShareAPI.application.Data.models import User, Item
from DormShareAPI.application.PydenticModels import UserSend



async def getUserById(user_id, session):
    try:
        statement = (
            select(User)
            .where(User.id == user_id)
            .options(
                selectinload(User.items)
                .selectinload(Item.images)
            )
        )
        user_data = session.exec(statement).first()

        if user_data is None:
            raise HTTPException(status_code=404, detail="User not found")

        return user_data
    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(status_code=500, detail="Problem occurred while ordering user")



async def getAllUsers(session):
    try:
        users = session.exec(select(User)).all()
        return users
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Something went wrong {e}")