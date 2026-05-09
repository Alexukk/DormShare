from fastapi import APIRouter, Depends
from sqlmodel import Session

from DormShareAPI.application.Data.DataBase import get_session
from DormShareAPI.application.Handlers.AuthHandlers import registration, login
from DormShareAPI.application.PydenticModels import UserCreate, UserLogin

router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)


@router.post("/register", status_code=201)
async def register_user(user_data: UserCreate,
                        session: Session = Depends(get_session)):
    return await registration(user_data, session)


@router.post("/login", status_code=200)
async def login_user(user_data: UserLogin, session: Session =  Depends(get_session)):
    return await login(user_data, session)


