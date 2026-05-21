from fastapi import HTTPException
from DormShareAPI.application.Data.PydenticModels import TransactionInitialize
from sqlmodel import Session, select
from DormShareAPI.application.Data.models import User, Transaction, Item, UserRole
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



async def ApproveTransaction(transaction_id, session, current_user):
    try:
        transaction = session.get(Transaction, transaction_id)

        if transaction is None:
            raise HTTPException(status_code=404, detail="transaction not found")

        if transaction.lender_id != current_user.id:
            raise HTTPException(status_code=403, detail="method forbidden for borrower")


        if not transaction.status == "pending":
            raise HTTPException(status_code=400, detail="transaction already approved or canceled")

        transaction.status = "active"

        item = session.get(Item, transaction.item_id)

        if item is None:
            raise HTTPException(status_code=404, detail="item not found transaction is invalid")

        item.is_available = False

        session.commit()

        await manager.broadcast_to_chat(str(transaction.chat_id), {
            "type" : "transaction_active",
            "transaction_id": str(transaction.id)
        })

        return {"status": "success", "transaction_id": transaction.id}
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"something went wrong while approving transaction: {e}")


async def GetTransaction(transaction_id, session, current_user):

    try:
        transaction = session.get(Transaction, transaction_id)

        if not transaction:
            raise HTTPException(status_code=404, detail="transaction not found")

        if current_user.id not in (transaction.lender_id, transaction.borrower_id) and current_user.role != UserRole.ADMIN:
            raise HTTPException(status_code=403, detail="can't get non-related transaction")

        return {
            "status" : "success",
            "transaction" : transaction
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"an error occurred while ordering transaction: {e}")