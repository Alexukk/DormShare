from fastapi import APIRouter, Depends
from sqlmodel import Session

from DormShareAPI.application.Data.DataBase import get_session
from DormShareAPI.application.Handlers.AuthHandlers import getCurrentUserData
from DormShareAPI.application.Handlers.Handlers import getAllUsers, getUserById
from DormShareAPI.application.PydenticModels import UserSend

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)



@router.get("/me", status_code=200, response_model=UserSend)
async def current_user_data(token, session: Session = Depends(get_session)):
    return await getCurrentUserData(token, session)


@router.get("/get-all", status_code=200, response_model=list[UserSend])
async def order_all_users(session: Session = Depends(get_session)):
    return await getAllUsers(session)



@router.get("/get/{user_id}", response_model=UserSend)
async def order_user_by_id(user_id,
                      session: Session = Depends(get_session)):
    return await getUserById(user_id, session)

