import { useState } from 'react'
import { useDormShare } from '../../data/DormShareContext'
import './ReviewModal.css'

type ReviewModalProps = {
  transactionId: string
  onClose: () => void
}

function ReviewModal({ transactionId, onClose }: ReviewModalProps) {
  const { submitReview } = useDormShare()
  const [rating, setRating] = useState<number>(0)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0 || isSubmitting) return

    setIsSubmitting(true)
    try {
      await submitReview(transactionId, rating, comment.trim())
      setIsSuccess(true)
    } catch {
      alert('Failed to submit review. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="review-modal" role="dialog" aria-modal="true">
        <div className="review-modal__card review-modal__card--success">
          <div className="review-modal__success-circle">
            <span className="material-symbols-rounded" aria-hidden="true">
              check_circle
            </span>
          </div>
          <h2>Thank You!</h2>
          <p>Your peer rating and review has been submitted successfully.</p>
          <button
            type="button"
            className="review-modal__btn review-modal__btn--primary"
            onClick={onClose}
          >
            Close Window
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="review-modal" role="dialog" aria-modal="true" aria-labelledby="review-modal-title">
      <div className="review-modal__card">
        <button
          type="button"
          className="review-modal__close"
          onClick={onClose}
          aria-label="Close modal"
        >
          <span className="material-symbols-rounded" aria-hidden="true">
            close
          </span>
        </button>

        <h2 id="review-modal-title">Rate Your Trade Partner</h2>
        <p className="review-modal__subtitle">Share your feedback to help keep the DormShare community trustworthy.</p>

        <form onSubmit={handleSubmit} className="review-modal__form">
          <div className="review-modal__stars-container">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = hoverRating ? star <= hoverRating : star <= rating

              return (
                <button
                  key={star}
                  type="button"
                  className={`review-modal__star-btn ${active ? 'review-modal__star-btn--active' : ''}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                >
                  <span className="material-symbols-rounded" aria-hidden="true">
                    star
                  </span>
                </button>
              )
            })}
          </div>

          <label className="review-modal__comment-label">
            <span>Write a Review (Optional)</span>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was your experience trading with this user? Was the item as described?..."
              maxLength={200}
            />
            <span className="review-modal__char-count">{comment.length} / 200</span>
          </label>

          <button
            type="submit"
            className="review-modal__btn review-modal__btn--primary"
            disabled={rating === 0 || isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ReviewModal
