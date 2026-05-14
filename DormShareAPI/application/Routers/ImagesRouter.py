import uuid
from fastapi import APIRouter, UploadFile, File
from fastapi.params import Depends
from sqlmodel import Session
from DormShareAPI.application.Auth import get_current_user
from DormShareAPI.application.Data.DataBase import get_session
from DormShareAPI.application.Data.models import User
from DormShareAPI.application.Handlers.ImagesHandler import upload_photo

router = APIRouter(
    prefix="/images",
    tags=["Images"]
)



@router.post("/post", status_code=201)
async def upload_image(item_id: uuid.UUID, file: UploadFile = File(...),
                       session: Session = Depends(get_session),
                       current_user: User = Depends(get_current_user)):

    return await upload_photo(item_id, file, session, current_user)