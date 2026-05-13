from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session

from DormShareAPI.application.Auth import get_current_user
from DormShareAPI.application.Data.DataBase import get_session
from DormShareAPI.application.Data.models import User
from DormShareAPI.application.PydenticModels import ItemCreate
from DormShareAPI.application.Handlers.ItemsHandler import create_item



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
async def postItem(
    item: ItemCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    return await create_item(item, session, current_user)


@router.patch("/update/{postId}")
async def UpdateItem(postId: str):
    pass

@router.delete("/delete")
async def postDelete(postId: int):
    pass
