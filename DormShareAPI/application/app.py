from fastapi import FastAPI, Depends
from DormShareAPI.application.Data.DataBase import init_db, get_session
from DormShareAPI.application.PydenticModels import UserCreate, UserSend, UserLogin
from DormShareAPI.application.Handlers.AuthHandlers import registration, login, getCurrentUserData
from DormShareAPI.application.Handlers.Handlers import getUserById, getAllUsers
from sqlmodel import Session

from DormShareAPI.application.Routers import UsersRouter, AuthRouter, ItemsRouter, PhotosRouter

app = FastAPI()

@app.on_event("startup")
def on_startup():
    print("🚀 Подключаемся к Neon и создаем таблицы...")
    init_db()
    print("✅ Все таблицы успешно созданы!")


# All app's routes from DormShareAPI.application.Routers

app.include_router(AuthRouter.router)
app.include_router(UsersRouter.router)
app.include_router(ItemsRouter.router)
app.include_router(PhotosRouter.router)



@app.get("/")
async def index():
    return "App is running!"


