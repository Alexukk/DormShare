from uuid import UUID
from sqlmodel import Session
from DormShareAPI.application.Data.models import User
from DormShareAPI.application.Data.DataBase import get_session
from DormShareAPI.application.Handlers.TransactionsHandler import InitializeTransaction, ApproveTransaction, GetTransaction
from DormShareAPI.application.Data.PydenticModels import TransactionInitialize
from fastapi import APIRouter, Depends

from DormShareAPI.application.Services.Auth import get_current_user

router = APIRouter(
    tags=["Transactions"],
    prefix="/transaction"
)




@router.post("/create")
async def Initialize_transaction(data: TransactionInitialize, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    return await InitializeTransaction(data, session, current_user)


@router.patch("/approve/{transaction_id}")
async def Approve_transaction(transaction_id: UUID, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    return await ApproveTransaction(transaction_id, session, current_user)



@router.get("/get/{transaction_id}")
async def Order_Transaction(transaction_id: UUID, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    return await GetTransaction(transaction_id, session, current_user)