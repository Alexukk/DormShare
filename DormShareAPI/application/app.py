from fastapi import FastAPI
from DormShareAPI.application.Data.DataBase import init_db
from DormShareAPI.application.Routers import UsersRouter, AuthRouter, ItemsRouter, ImagesRouter, ChatsRouter, TransactionsRouter, ReviewsRouter
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

@app.on_event("startup")
def on_startup():
    print("🚀 Подключаемся к Neon и создаем таблицы...")
    init_db()
    print("✅ Все таблицы успешно созданы!")


origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "https://dorm-share-phi.vercel.app",
    "https://lovable.dev",
    "https://lovable.app",
    "https://lovable.project",
    "https://dorm-share-marketplace.lovable.app"
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.lovable\.(dev|app|project|com|dev\.app)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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


