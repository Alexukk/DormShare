from fastapi import HTTPException
from DormShareAPI.application.Data.PydenticModels import TransactionInitialize
from sqlmodel import Session, select
from DormShareAPI.application.Data.models import User, Transaction, Item
from DormShareAPI.application.Services.ConnectionManager import manager


async def InitializeTransaction(data: TransactionInitialize, session, current_user):

    if data.lender_id == current_user.id:
        raise HTTPException(status_code=400, detail="can't start transaction with yourself")

    item = session.get(Item, data.item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if not item.is_available:
        raise HTTPException(status_code=400, detail="Item is not available")

    try:
        statement = select(Transaction).where(Transaction.chat_id == data.chat_id)

        transaction = session.exec(statement).first()

        if transaction:
            raise HTTPException(status_code=403, detail="can't start another transaction while one is active")


        new_transaction = Transaction(
            lender_id=data.lender_id,
            chat_id=data.chat_id,
            item_id=data.item_id,
            borrower_id=current_user.id
        )


        session.add(new_transaction)
        session.commit()
        session.refresh(new_transaction)
        await manager.broadcast_to_chat(str(data.chat_id), {
            "type": "transaction_created",
            "transaction_id": str(new_transaction.id)
        })
        return {"status": "success", "transaction_id": new_transaction.id}

    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"An error occurred while initializing a transaction: {e}")