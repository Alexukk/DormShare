from sqlalchemy import select, or_
from DormShareAPI.application.Services.Auth import get_current_user
from DormShareAPI.application.Data.DataBase import get_session
from DormShareAPI.application.Data.models import User, Chat, UserRole
from DormShareAPI.application.Data.PydenticModels import ChatCreate
from fastapi import Depends, HTTPException
from sqlmodel import Session
from sqlalchemy.orm import selectinload
from sqlalchemy import select as sa_select



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
        statement = sa_select(Chat).where(Chat.id == chat_id).options(selectinload(Chat.messages))
        chat = session.execute(statement).scalar_one_or_none()

        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")

        if chat.lender_id != current_user.id and chat.borrower_id != current_user.id and current_user.role != UserRole.ADMIN:
            raise HTTPException(status_code=403, detail="Can't access not related chat")

        return chat

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Something went wrong: {e}")


async def getUserChats(session, current_user) -> list[Chat]:
    try:
        statement = sa_select(Chat).where(
            or_(Chat.lender_id == current_user.id, Chat.borrower_id == current_user.id)
        ).options(selectinload(Chat.messages))

        chats = session.execute(statement).scalars().all()
        return chats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't get chats: {e}")



async def chatDelete(chat_id, session, current_user):
    try:
        chat = session.get(Chat, chat_id)

        if chat is None:
            return {"status": "success"}

        if chat.lender_id != current_user.id and chat.borrower_id != current_user.id and current_user.role != UserRole.ADMIN:
            raise HTTPException(status_code=403, detail="not enough permissions")

        session.delete(chat)
        session.commit()

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"can't delete chat: {e}")

