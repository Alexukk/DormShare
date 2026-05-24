from fastapi import HTTPException
from DormShareAPI.application.Data.models import Review, Transaction, User
from sqlmodel import select
from DormShareAPI.application.Data.PydenticModels import CreateReview



async def createReview(transaction_id, data: CreateReview, session, current_user):
    try:
        transaction = session.get(Transaction, transaction_id)

        if transaction is None:
            raise HTTPException(status_code=404, detail="transaction not found")
        if current_user.id != transaction.borrower_id:
            raise HTTPException(status_code=403, detail="can't leave a review to a product you never borrowed")
        if transaction.review_id:
            raise HTTPException(status_code=400, detail="review already exists")
        if transaction.status != "completed":
            raise HTTPException(status_code=400, detail="can't leave a review to a pending transaction")
        if not 1 <= data.stars_amount <= 5:
            raise HTTPException(status_code=400, detail="stars_amount must be between 1 and 5")

        new_review = Review(
            item_id=transaction.item_id,
            transaction_id=transaction_id,
            borrower_id=transaction.borrower_id,
            stars_amount=data.stars_amount,
            text=data.text
        )

        session.add(new_review)
        session.flush()
        transaction.review_id = new_review.id
        session.commit()
        session.refresh(new_review)

        return new_review

    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"something went wrong while posting the review: {e}")


async def getReview(review_id, session):
    try:
        review = session.get(Review, review_id)

        if not review:
            raise HTTPException(status_code=404, detail="review not found")

        return review

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"something went wrong: {e}")