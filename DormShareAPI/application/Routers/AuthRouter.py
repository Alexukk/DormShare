from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from DormShareAPI.application.Services.Auth import create_access_token
from DormShareAPI.application.Data.DataBase import get_session
from DormShareAPI.application.Handlers.AuthHandlers import registration, login, authenticate_user
from DormShareAPI.application.Data.PydenticModels import UserCreate, UserLogin

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


from fastapi.security import OAuth2PasswordRequestForm


@router.post("/login-swagger", include_in_schema=False)
async def login_for_swagger(
        form_data: OAuth2PasswordRequestForm = Depends(),
        session: Session = Depends(get_session)
):
    # form_data.username здесь — это email, который ты вводишь в окошко
    user = await authenticate_user(form_data.username, form_data.password, session)

    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    # Возвращаем токен в формате, который понимает Swagger
    return {
        "access_token": create_access_token(data={"sub": str(user.id)}),
        "token_type": "bearer"
    }