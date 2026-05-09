from fastapi import FastAPI, Depends
from DormShareAPI.application.Data.DataBase import init_db, get_session
from DormShareAPI.application.PydenticModels import UserCreate, UserSend, UserLogin
from DormShareAPI.application.Handlers.AuthHandlers import registration, login
from DormShareAPI.application.Handlers.Handlers import getUserById, getAllUsers
from sqlmodel import Session


app = FastAPI()

@app.on_event("startup")
def on_startup():
    print("🚀 Подключаемся к Neon и создаем таблицы...")
    init_db()
    print("✅ Все таблицы успешно созданы!")


# User AUTH

@app.post("/auth/register", status_code=201)
async def register_user(user_data: UserCreate,
                        session: Session = Depends(get_session)):
    return await registration(user_data, session)


@app.post("/auth/login", status_code=200)
async def login_user(user_data: UserLogin, session: Session =  Depends(get_session)):
    return await login(user_data, session)


@app.get("/user/get/{user_id}", response_model=UserSend)
async def order_user_by_id(user_id,
                      session: Session = Depends(get_session)):
    return await getUserById(user_id, session)


@app.get("/user/get-all", status_code=200, response_model=list[UserSend])
async def order_all_users(session: Session = Depends(get_session)):
    return await getAllUsers(session)


# Other logic


@app.get("/")
async def index():
    return "Hello world!"

# ITEMS AND FEED

@app.get("/post/feed")
async def feed(data: str):
    pass

@app.get("/post/details/{postId}")
async def postDetails(postId: str):
    pass

@app.get("/post/category/{category}")
async def categorizedFeed(category: str):
    pass

# CRUD FOR ITEMS

@app.post("/item/post")
async def postItem():
    pass

@app.patch("/item/update/{postId}")
async def UpdateItem(postId: str):
    pass


@app.delete("/post/delete")
async def postDelete(postId: int):
    pass

# PHOTOS CRUD

@app.post("/post/photo/upload")
async def uploadPhoto():
    pass

@app.delete("/post/photo/remove")
async def removePhoto():
    pass

@app.delete("/post/photo/clear-all/{postId}")
async def clearItemPhotos():
    pass