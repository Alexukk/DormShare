from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Annotated

from DormShareAPI.application.Data.DataBase import init_db



app = FastAPI()

@app.on_event("startup")
def on_startup():
    print("🚀 Подключаемся к Neon и создаем таблицы...")
    init_db()
    print("✅ Все таблицы успешно созданы!")


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