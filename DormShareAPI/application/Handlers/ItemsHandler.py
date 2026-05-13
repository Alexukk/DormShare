from tkinter.tix import Select

from fastapi import HTTPException, Depends
from sqlmodel import Session, select

from DormShareAPI.application.Auth import get_current_user
from DormShareAPI.application.Data.DataBase import get_session
from DormShareAPI.application.Data.models import Item, User
from DormShareAPI.application.PydenticModels import ItemCreate




async def create_item(item_data: ItemCreate, session: Session = Depends(get_session),
                      current_user: User = Depends(get_current_user)):
   try:
       db_item = Item(
           **item_data.model_dump(),
           owner_id=current_user.id
       )


       session.add(db_item)
       session.commit()
       session.refresh(db_item)

       return {
           "status" : "success",
           "item_id" : db_item.id
       }


   except Exception as e:
       session.rollback()
       print(f"Error: {e}")
       raise  HTTPException(status_code=500, detail="Can't save item to db")



async def get_items(session):
    try:
        items = session.exec(select(Item)).all()
        return items
    except Exception as e:
        print(f"Error occured {e}")
        raise HTTPException(status_code=500, detail=f"Something went wrong {e}")



async def get_item_by_id(item_id, session):
    try:
        item = session.get(Item, item_id)

        if not item:
            raise HTTPException(status_code=404, detail=f"No item found by id: {item_id}")

        return item

    except Exception as e:
        raise HTTPException(status_code=500, detail="Problem occurred while ordering user by id")