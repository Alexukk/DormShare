from sqlalchemy import select

from DormShareAPI.application.Auth import get_current_user
from DormShareAPI.application.Data.DataBase import get_session
from DormShareAPI.application.Data.models import User, Item, Chat, Message, UserRole
from DormShareAPI.application.PydenticModels import ChatCreate
from fastapi import Depends, HTTPException
from sqlmodel import Session





async def CreateChat(data: ChatCreate, session: Session = Depends(get_session),
                     current_user: User = Depends(get_current_user)):

    if current_user.id == data.lender_id:
        raise HTTPException(status_code=400, detail=f"can't start chat with yourself!")

    statement = select(Chat).where(
                       Chat.lender_id == data.lender_id,
                                   Chat.borrower_id == current_user.id,
                                   Chat.item_id == data.item_id)

    existing_chat = session.exec(statement).scalars().first()

    if existing_chat is not None:
        return {"status": "success",
                "chat_id": existing_chat.id}

    try:
        new_chat = Chat(
            lender_id=data.lender_id,
            borrower_id=current_user.id,
            item_id=data.item_id,
            status="default"
        )
        session.add(new_chat)
        session.commit()
        session.refresh(new_chat)
        return {"status": "success",
                "chat_id": new_chat.id}

    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Can't create a chat, error log: {e}")



async def getChatById(chat_id, session, current_user):
    try:
        chat = session.get(Chat, chat_id)

        if not chat:
            raise HTTPException(status_code=404, detail="item not foundgit ")

        if chat.lender_id != current_user.id and chat.borrower_id != current_user.id and current_user.role != UserRole.ADMIN:
            raise HTTPException(status_code=403, detail="Can't access not related chat")

        return chat

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Something went wrong: {e}")