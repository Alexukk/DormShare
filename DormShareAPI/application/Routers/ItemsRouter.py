from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session

from DormShareAPI.application.Auth import get_current_user
from DormShareAPI.application.Data.DataBase import get_session
from DormShareAPI.application.Data.models import User, Item
from DormShareAPI.application.PydenticModels import ItemCreate, ItemUpdate, ItemReadWithImages
from DormShareAPI.application.Handlers.ItemsHandler import (create_item, get_items,
                                                            get_item_by_id, get_items_by_category, change_item_status,
                                                            delete_item, update_item)



router = APIRouter(
    prefix="/item",
    tags=["Items"]
)


@router.get("/feed", status_code=200, response_model=list[ItemReadWithImages])
async def feed(session: Session = Depends(get_session)):
    return await get_items(session)

@router.get("/details/{itemId}", status_code=200, response_model=ItemReadWithImages)
async def post_Details(item_id: str, session : Session = Depends(get_session)):
    return await get_item_by_id(item_id, session)

@router.get("/category/{category}", status_code=200, response_model=list[ItemReadWithImages])
async def categorized_Feed(category: str, session: Session = Depends(get_session)):
    return await get_items_by_category(category, session)



@router.post("/post", status_code=201)
async def post_Item(
    item: ItemCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    return await create_item(item, session, current_user)


@router.patch("/status/update/{itemId}", status_code=200, response_model=ItemReadWithImages)
async def Update_ItemStatus(itemId: str, session: Session = Depends(get_session),
                          current_user: User = Depends(get_current_user)):

    return await change_item_status(itemId, session, current_user)

@router.patch("/update/{itemId}", status_code=200, response_model=ItemReadWithImages)
async def update_Item(itemId: str, item_data: ItemUpdate,
                     session: Session = Depends(get_session),
                     current_user: User = Depends(get_current_user)):

    return await update_item(itemId, item_data, session, current_user)



@router.delete("/delete", status_code=204)
async def post_Delete(itemId: str, session: Session = Depends(get_session),
                        current_user: User = Depends(get_current_user)):

    return await delete_item(itemId, session, current_user)
