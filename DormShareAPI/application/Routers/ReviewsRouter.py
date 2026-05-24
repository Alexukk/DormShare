from fastapi import APIRouter, Depends
from DormShareAPI.application.Handlers.ReviewsHandler import createReview
from DormShareAPI.application.Data.DataBase import get_session
from DormShareAPI.application.Data.models import Review, User
from DormShareAPI.application.Data.PydenticModels import CreateReview
from sqlmodel import Session
from uuid import UUID

from DormShareAPI.application.Services.Auth import get_current_user

router = APIRouter(tags=["Reviews"],
                   prefix="/review")


@router.post("/post/{transaction_id}", status_code=201, response_model=Review)
async def Create_review(transaction_id: UUID, data: CreateReview,
                        session: Session = Depends(get_session),
                        current_user: User = Depends(get_current_user)):

    return await createReview(transaction_id, data, session, current_user)