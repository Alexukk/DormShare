from fastapi import APIRouter

router = APIRouter(
    prefix="/item",
    tags=["Items"]
)


@router.get("/feed")
async def feed(data: str):
    pass

@router.get("/details/{postId}")
async def postDetails(postId: str):
    pass

@router.get("/category/{category}")
async def categorizedFeed(category: str):
    pass

@router.post("/post")
async def postItem():
    pass

@router.patch("/update/{postId}")
async def UpdateItem(postId: str):
    pass

@router.delete("/delete")
async def postDelete(postId: int):
    pass
