from fastapi import FastAPI
from DormShareAPI.application.Data.DataBase import init_db
from DormShareAPI.application.Routers import UsersRouter, AuthRouter, ItemsRouter, ImagesRouter, ChatsRouter, TransactionsRouter, ReviewsRouter
app = FastAPI()

@app.on_event("startup")
def on_startup():
    print("🚀 Подключаемся к Neon и создаем таблицы...")
    init_db()
    print("✅ Все таблицы успешно созданы!")

    for route in app.routes:
        print(route.path)

# All app's routes from DormShareAPI.application.Routers

app.include_router(AuthRouter.router)
app.include_router(UsersRouter.router)
app.include_router(ItemsRouter.router)
app.include_router(ImagesRouter.router)
app.include_router(ChatsRouter.router)
app.include_router(TransactionsRouter.router)
app.include_router(ReviewsRouter.router)
@app.get("/")
async def index():
    return "App is running!"


