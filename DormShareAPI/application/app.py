from fastapi import FastAPI, Depends
from DormShareAPI.application.Data.DataBase import init_db
from DormShareAPI.application.Routers import UsersRouter, AuthRouter, ItemsRouter, ImagesRouter
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
app.include_router(ImagesRouter.router)

@app.get("/")
async def index():
    return "App is running!"


