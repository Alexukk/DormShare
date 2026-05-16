from fastapi import APIRouter, Depends
from sqlmodel import Session
from DormShareAPI.application.Data.models import User
from DormShareAPI.application.Auth import get_current_user
from DormShareAPI.application.Data.DataBase import get_session
from DormShareAPI.application.Handlers.ChatHandler import CreateChat
from DormShareAPI.application.PydenticModels import ChatCreate



router = APIRouter(prefix="/chat",
                   tags=["Chat"])




@router.post("/create", status_code=201)
async def create_chat(data: ChatCreate, session: Session = Depends(get_session),
                      current_user: User = Depends(get_current_user)):
    return await CreateChat(data, session, current_user)