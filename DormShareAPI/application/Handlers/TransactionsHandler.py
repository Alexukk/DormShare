from fastapi import HTTPException
from sqlmodel import Session, select
from DormShareAPI.application.Data.models import Transaction, Item, UserRole, Chat
from DormShareAPI.application.Services.ConnectionManager import manager
from datetime import datetime


async def InitializeTransaction(chat_id, session, current_user):

    chat = session.get(Chat, chat_id)
    if not chat:
        raise HTTPException(status_code=404, detail="chat not found")

    item = session.get(Item, chat.item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if item.owner_id == current_user.id:
        raise HTTPException(status_code=400, detail="can't start transaction with yourself")
    if not item.is_available:
        raise HTTPException(status_code=400, detail="Item is not available")

    try:
        statement = select(Transaction).where(Transaction.chat_id == chat.id)

        transaction = session.exec(statement).first()

        if transaction:
            raise HTTPException(status_code=403, detail="can't start another transaction while one is active")


        new_transaction = Transaction(
            lender_id=chat.lender_id,
            chat_id=chat.id,
            item_id=chat.item_id,
            borrower_id=current_user.id
        )


        session.add(new_transaction)
        session.commit()
        session.refresh(new_transaction)
        await manager.broadcast_to_chat(str(chat.id), {
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
        raise HTTPException(status_code=500, detail=f"an error occurred while ordering a transaction: {e}")


async def DeclineTransaction(transaction_id, session, current_user):
    try:
        transaction = session.get(Transaction, transaction_id)

        if not transaction:
            raise HTTPException(status_code=404, detail="transaction not found")

        if transaction.status != 'pending':
            raise HTTPException(status_code=400, detail="can't cancel active transaction")

        if current_user.id != transaction.lender_id:
            raise HTTPException(status_code=403, detail="only lender can decline transaction")

        session.delete(transaction)
        session.commit()

        await manager.broadcast_to_chat(str(transaction.chat_id), {
                                            "type" : "transaction_cancelled",
                                            "transaction_id": str(transaction.id)})

        return {"status" : "success"}

    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"something went wrong while cancelling a transaction: {e}")


async def ConfirmTransaction(transaction_id, session, current_user):
    try:
        transaction = session.get(Transaction, transaction_id)

        if not transaction:
            raise HTTPException(status_code=404, detail="transaction not found")

        if transaction.status in ('pending', "canceled", "completed"):
            raise HTTPException(status_code=400, detail="transaction is already ower or is not yet confirmed")

        if current_user.id not in (transaction.lender_id, transaction.borrower_id):
            raise HTTPException(status_code=403, detail="not a participant of this transaction")

        if transaction.lender_id == current_user.id:
            transaction.lender_confirmation = True
        elif transaction.borrower_id == current_user.id:
            transaction.borrower_confirmation = True

        if transaction.borrower_confirmation and transaction.lender_confirmation:
            transaction.status = "completed"
            transaction.completed_at = datetime.utcnow()
            item = session.get(Item, transaction.item_id)
            item.is_available = True
            broadcast_type = "transaction_completed"
        else:
            broadcast_type = "transaction_completing"

        session.commit()
        await manager.broadcast_to_chat(str(transaction.chat_id), {
            "type": broadcast_type,
            "transaction_id": str(transaction.id)
        })

        return {"status": "success"}

    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"something went wrong while confirming transaction: {e}")


async def GetTransactionByChat(chat_id, session, current_user):
    try:
        statement = select(Transaction).where(Transaction.chat_id == chat_id)
        transaction = session.exec(statement).first()

        if not transaction:
            raise HTTPException(status_code=404, detail="transaction not found")

        if current_user.id not in (transaction.lender_id, transaction.borrower_id):
            raise HTTPException(status_code=403, detail="not a participant of this transaction")

        return {
            "status": "success",
            "transaction": transaction
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"an error occurred while ordering a transaction: {e}")