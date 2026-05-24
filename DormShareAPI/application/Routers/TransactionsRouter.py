from uuid import UUID
from sqlmodel import Session
from DormShareAPI.application.Data.models import User
from DormShareAPI.application.Data.DataBase import get_session
from DormShareAPI.application.Handlers.TransactionsHandler import InitializeTransaction, ApproveTransaction, GetTransaction, DeclineTransaction, ConfirmTransaction, GetTransactionByChat
from fastapi import APIRouter, Depends

from DormShareAPI.application.Services.Auth import get_current_user

router = APIRouter(
    tags=["Transactions"],
    prefix="/transaction"
)




@router.post("/create", status_code=201)
async def Initialize_transaction(chat_id: UUID, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    return await InitializeTransaction(chat_id, session, current_user)


@router.patch("/approve/{transaction_id}")
async def Approve_transaction(transaction_id: UUID, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    return await ApproveTransaction(transaction_id, session, current_user)



@router.get("/get/{transaction_id}")
async def Order_Transaction(transaction_id: UUID, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    return await GetTransaction(transaction_id, session, current_user)


@router.patch("/cancel/{transaction_id}", status_code=200)
async def Cancel_transaction(transaction_id: UUID, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    return await DeclineTransaction(transaction_id, session, current_user)


@router.patch("/confirm/{transaction_id}", status_code=200)
async def Confirm_transaction(transaction_id: UUID, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    return await ConfirmTransaction(transaction_id, session, current_user)




@router.get("/by-chat/{chat_id}", status_code=200)
async def Get_transaction_by_chat(chat_id: UUID, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    return await GetTransactionByChat(chat_id, session, current_user)