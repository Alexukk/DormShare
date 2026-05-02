from fastapi import FastAPI, HTTPException
app = FastAPI()





@app.get("/")
async def index():
    return "Hello world!"


@app.get("/post/feed")
async def feed(data: str):
    pass

@app.get("/post/details/{postId}")
async def postDetails(postId: str):
    pass

@app.get("/post/category/{category}")
async def categorizedFeed(category: str):
    pass

@app.post("/item/post")
async def postItem():
    pass

@app.patch("/item/update/{postId}")
async def UpdateItem(postId: str):
    pass


@app.delete("/post/delete")
async def postDelete(postId: int):
    pass
