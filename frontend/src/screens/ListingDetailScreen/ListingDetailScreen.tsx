import { useState, useRef, useCallback, useEffect } from 'react'
import { useDormShare } from '../../data/DormShareContext'
import { capitalize, PLACEHOLDER_IMAGE } from '../../utils'
import { apiGet } from '../../data/apiClient'
import { apiUserToUiUser } from '../../data/apiAdapters'
import type { ApiUser, DormShareUser } from '../../data/types'
import './ListingDetailScreen.css'

type ListingDetailScreenProps = {
  listingId: string
  onBack: () => void
  onOpenChat: (chatId: string) => void
}

/* ── Shared swipe hook ────────────────────────── */

function useSwipe(
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
  threshold = 50,
) {
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)
  const isSwiping = useRef(false)
  const deltaRef = useRef(0)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchEndX.current = e.touches[0].clientX
    isSwiping.current = true
    deltaRef.current = 0
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSwiping.current) return
    touchEndX.current = e.touches[0].clientX
    deltaRef.current = touchEndX.current - touchStartX.current
  }, [])

  const onTouchEnd = useCallback(() => {
    if (!isSwiping.current) return
    isSwiping.current = false
    const delta = deltaRef.current
    if (Math.abs(delta) >= threshold) {
      if (delta < 0) onSwipeLeft()
      else onSwipeRight()
    }
    deltaRef.current = 0
  }, [onSwipeLeft, onSwipeRight, threshold])

  return { onTouchStart, onTouchMove, onTouchEnd }
}

/* ── Fullscreen Lightbox ────────────────────────── */

type LightboxProps = {
  images: Array<{ photo_url: string; alt: string }>
  startIndex: number
  onClose: () => void
}

function ImageLightbox({ images, startIndex, onClose }: LightboxProps) {
  const [index, setIndex] = useState(startIndex)

  const goNext = useCallback(() => {
    setIndex((i) => (i < images.length - 1 ? i + 1 : i))
  }, [images.length])

  const goPrev = useCallback(() => {
    setIndex((i) => (i > 0 ? i - 1 : i))
  }, [])

  const swipeHandlers = useSwipe(goNext, goPrev, 40)

  // Close on escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') goNext()
      else if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', handleKey)
    // Prevent body scroll while lightbox is open
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose, goNext, goPrev])

  return (
    <div
      className="lightbox-overlay"
      role="dialog"
      aria-label="Full screen image viewer"
      aria-modal="true"
    >
      {/* Close button */}
      <button
        type="button"
        className="lightbox-overlay__close"
        onClick={onClose}
        aria-label="Close full screen"
      >
        <span className="material-symbols-rounded" aria-hidden="true">
          close
        </span>
      </button>

      {/* Image + swipe area */}
      <div
        className="lightbox-overlay__image-wrap"
        {...swipeHandlers}
      >
        <img
          src={images[index].photo_url}
          alt={images[index].alt}
          draggable={false}
        />
      </div>

      {/* Navigation arrows (desktop) */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            className={`lightbox-overlay__arrow lightbox-overlay__arrow--left ${index === 0 ? 'lightbox-overlay__arrow--disabled' : ''}`}
            onClick={goPrev}
            aria-label="Previous image"
            disabled={index === 0}
          >
            <span className="material-symbols-rounded" aria-hidden="true">
              chevron_left
            </span>
          </button>
          <button
            type="button"
            className={`lightbox-overlay__arrow lightbox-overlay__arrow--right ${index === images.length - 1 ? 'lightbox-overlay__arrow--disabled' : ''}`}
            onClick={goNext}
            aria-label="Next image"
            disabled={index === images.length - 1}
          >
            <span className="material-symbols-rounded" aria-hidden="true">
              chevron_right
            </span>
          </button>
        </>
      )}

      {/* Dots */}
      {images.length > 1 && (
        <div className="lightbox-overlay__dots" aria-hidden="true">
          {images.map((_, i) => (
            <span
              key={i}
              className={`lightbox-overlay__dot ${i === index ? 'lightbox-overlay__dot--active' : ''}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      )}

      {/* Counter */}
      <span className="lightbox-overlay__counter" aria-live="polite">
        {index + 1} / {images.length}
      </span>
    </div>
  )
}

/* ── Main Screen ────────────────────────── */

const formatUniversityName = (name?: string): string => {
  if (!name) return 'North Campus'
  
  // Strip parentheses and Cyrillic/translation text inside
  let cleaned = name.split('(')[0].trim()
  
  // Simplify common long academic titles
  cleaned = cleaned.replace(/National University of Science and Technology/gi, 'NUST')
  cleaned = cleaned.replace(/National University of/gi, 'National Uni of')
  cleaned = cleaned.replace(/State University of/gi, 'State Uni of')
  cleaned = cleaned.replace(/University of Michigan/gi, 'U of Michigan')
  
  if (cleaned.length > 36) {
    return cleaned.substring(0, 33) + '...'
  }
  return cleaned
}

function ListingDetailScreen({
  listingId,
  onBack,
  onOpenChat,
}: ListingDetailScreenProps) {
  const { items, startOrOpenChat, currentUserId, deleteItem, updateItemDetails, toggleItemStatus, deleteListingImage } = useDormShare()
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [seller, setSeller] = useState<DormShareUser | null>(null)

  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editErrors, setEditErrors] = useState<Record<string, boolean>>({})

  const item = items.find((i) => i.id === listingId)

  useEffect(() => {
    if (!item) return
    let isMounted = true
    apiGet<ApiUser>(`/users/get/${item.owner_id}`)
      .then((user) => {
        if (isMounted) {
          setSeller(apiUserToUiUser(user))
        }
      })
      .catch((err) => {
        console.error('Failed to fetch seller details:', err)
      })
    return () => {
      isMounted = false
    }
  }, [item])

  const goNextImage = useCallback(() => {
    if (!item) return
    setActiveImageIndex((i) => (i < item.images.length - 1 ? i + 1 : i))
  }, [item])

  const goPrevImage = useCallback(() => {
    setActiveImageIndex((i) => (i > 0 ? i - 1 : i))
  }, [])

  const heroSwipe = useSwipe(goNextImage, goPrevImage, 40)

  if (!item) {
    return (
      <main className="listing-detail-screen listing-detail-screen--empty" aria-label="Listing not found">
        <header className="listing-detail-screen__nav">
          <button
            type="button"
            className="listing-detail-screen__back-btn"
            onClick={onBack}
            aria-label="Back to feed"
          >
            <span className="material-symbols-rounded" aria-hidden="true">
              arrow_back
            </span>
          </button>
        </header>
        <p className="listing-detail-screen__message">Listing not found.</p>
      </main>
    )
  }

  const resolvedOwner = seller || item.owner

  const imageEntries = item.images.map((img, idx) => ({
    photo_url: img.photo_url,
    alt: `${item.title} - View ${idx + 1}`,
  }))

  async function handleStartChat() {
    if (item) {
      try {
        const chatId = await startOrOpenChat({ ...item, owner: resolvedOwner })
        onOpenChat(chatId)
      } catch {
        alert('Failed to start chat. Please try again.')
      }
    }
  }

  function handleStartEditing() {
    if (!item) return
    setEditTitle(item.title)
    setEditDescription(item.description)
    setEditPrice(item.price.replace('$', ''))
    setEditCategory(item.category)
    setEditErrors({})
    setIsEditing(true)
  }

  async function handleSaveChanges() {
    if (!item) return
    const nextErrors: Record<string, boolean> = {}
    if (!editTitle.trim()) nextErrors.title = true
    if (!editDescription.trim()) nextErrors.description = true
    if (!editPrice.trim()) nextErrors.price = true

    if (Object.keys(nextErrors).length > 0) {
      setEditErrors(nextErrors)
      return
    }

    try {
      await updateItemDetails(item.id, {
        title: editTitle,
        description: editDescription,
        price: editPrice,
        category: editCategory as any,
      })
      setIsEditing(false)
    } catch {
      alert('Failed to save changes. Please try again.')
    }
  }

  async function handleToggleStatus() {
    if (!item) return
    try {
      await toggleItemStatus(item.id)
    } catch {
      alert('Failed to update status. Please try again.')
    }
  }

  async function handleDelete() {
    if (!item) return
    const confirmDelete = window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')
    if (!confirmDelete) return
    try {
      await deleteItem(item.id)
      onBack()
    } catch {
      alert('Failed to delete listing. Please try again.')
    }
  }

  async function handleDeletePhoto(imageId: string) {
    const confirmDelete = window.confirm('Are you sure you want to delete this photo from the listing?')
    if (!confirmDelete) return

    try {
      await deleteListingImage(imageId)
    } catch {
      alert('Failed to delete photo. Please try again.')
    }
  }

  if (isEditing) {
    return (
      <main className="listing-detail-screen listing-detail-screen--editing" aria-label={`Editing ${item.title}`}>
        <header className="listing-detail-screen__edit-header">
          <button
            type="button"
            className="listing-detail-screen__circle-btn"
            onClick={() => setIsEditing(false)}
            aria-label="Cancel editing"
          >
            <span className="material-symbols-rounded" aria-hidden="true">
              close
            </span>
          </button>
          <h1>Edit Listing</h1>
        </header>

        <section className="listing-detail-screen__edit-form">
          <label className={`sell-field ${editErrors.title ? 'sell-field--error' : ''}`}>
            <span className="material-symbols-rounded" aria-hidden="true">
              sell
            </span>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => {
                setEditTitle(e.target.value)
                setEditErrors(prev => ({ ...prev, title: false }))
              }}
              maxLength={60}
              placeholder="Item title *"
            />
          </label>
          {editErrors.title && (
            <span className="sell-screen__error-text">Title is required.</span>
          )}

          <label className={`sell-field sell-field--textarea ${editErrors.description ? 'sell-field--error' : ''}`}>
            <span className="material-symbols-rounded" aria-hidden="true">
              article
            </span>
            <textarea
              value={editDescription}
              onChange={(e) => {
                setEditDescription(e.target.value)
                setEditErrors(prev => ({ ...prev, description: false }))
              }}
              maxLength={300}
              placeholder="Description *"
            />
          </label>
          {editErrors.description && (
            <span className="sell-screen__error-text">Description is required.</span>
          )}

          <label className={`sell-field ${editErrors.price ? 'sell-field--error' : ''}`}>
            <span className="material-symbols-rounded" aria-hidden="true">
              attach_money
            </span>
            <input
              type="number"
              min="0"
              value={editPrice}
              onChange={(e) => {
                setEditPrice(e.target.value)
                setEditErrors(prev => ({ ...prev, price: false }))
              }}
              placeholder="Price *"
            />
          </label>
          {editErrors.price && (
            <span className="sell-screen__error-text">Price is required.</span>
          )}

          {item && (
            <section className="sell-screen__section-block" aria-label="Images Manager">
              <h2>Images</h2>
              <div className="listing-detail-screen__edit-photos">
                {item.images.map((img) => (
                  <div key={img.id} className="listing-detail-screen__edit-photo-slot">
                    <img src={img.photo_url} alt="Listing thumbnail" />
                    <button
                      type="button"
                      className="listing-detail-screen__photo-delete-btn"
                      onClick={() => handleDeletePhoto(img.id)}
                      aria-label="Delete image"
                    >
                      <span className="material-symbols-rounded" aria-hidden="true">
                        close
                      </span>
                    </button>
                  </div>
                ))}
                {item.images.length === 0 && (
                  <p className="listing-detail-screen__no-photos-text">No images uploaded for this listing.</p>
                )}
              </div>
            </section>
          )}

          <section className="sell-screen__section-block" aria-label="Category">
            <h2>Category</h2>
            <div className="sell-screen__categories">
              {[
                { id: 'electronics', label: 'Electronics', icon: 'desktop_windows' },
                { id: 'furniture', label: 'Furniture', icon: 'chair' },
                { id: 'books', label: 'Books', icon: 'menu_book' },
                { id: 'appliances', label: 'Appliances', icon: 'kitchen' },
                { id: 'food', label: 'Food', icon: 'restaurant' },
                { id: 'sports', label: 'Sports Equipment', icon: 'sports_soccer' },
                { id: 'clothing', label: 'Clothing', icon: 'checkroom' },
                { id: 'other', label: 'Other', icon: 'more_horiz' },
              ].map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className="sell-screen__category-chip"
                  aria-pressed={editCategory === category.id}
                  onClick={() => setEditCategory(category.id)}
                >
                  <span className="material-symbols-rounded" aria-hidden="true">
                    {category.icon}
                  </span>
                  <span>{category.label}</span>
                </button>
              ))}
            </div>
          </section>
        </section>

        <footer className="listing-detail-screen__action-bar listing-detail-screen__action-bar--editing">
          <button
            type="button"
            className="listing-detail-screen__save-btn"
            onClick={handleSaveChanges}
          >
            Save Changes
          </button>
        </footer>
      </main>
    )
  }

  return (
    <main className="listing-detail-screen" aria-label={`Details for ${item.title}`}>
      {/* Fullscreen lightbox */}
      {lightboxOpen && imageEntries.length > 0 && (
        <ImageLightbox
          images={imageEntries}
          startIndex={activeImageIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      {/* 1. Hero Image Slider */}
      <section className="listing-detail-screen__hero" aria-label="Product images">
        <div
          className="listing-detail-screen__carousel"
          {...heroSwipe}
          onClick={() => {
            if (item.images.length > 0) {
              setLightboxOpen(true)
            }
          }}
          role="button"
          tabIndex={0}
          aria-label={item.images.length > 0 ? "Tap to view full screen" : "No images available"}
        >
          <img
            src={item.images[activeImageIndex]?.photo_url || PLACEHOLDER_IMAGE}
            alt={item.images.length > 0 ? `${item.title} - View ${activeImageIndex + 1}` : item.title}
            draggable={false}
          />
        </div>

        {/* Floating actions */}
        <header className="listing-detail-screen__hero-actions">
          <button
            type="button"
            className="listing-detail-screen__circle-btn"
            onClick={onBack}
            aria-label="Back to feed"
          >
            <span className="material-symbols-rounded" aria-hidden="true">
              arrow_back
            </span>
          </button>
        </header>

        {/* Pagination indicator */}
        {item.images.length > 1 ? (
          <div className="listing-detail-screen__dots" aria-hidden="true">
            {item.images.map((_, index) => (
              <span
                key={index}
                className={`listing-detail-screen__dot ${index === activeImageIndex ? 'listing-detail-screen__dot--active' : ''
                  }`}
                onClick={(e) => { e.stopPropagation(); setActiveImageIndex(index) }}
              />
            ))}
          </div>
        ) : null}
      </section>

      {/* 2. Listing Info Card */}
      <section className="listing-detail-screen__content">
        <div className="listing-detail-screen__header-group">
          <div className="listing-detail-screen__meta-row">
            <span className="listing-detail-screen__category">
              {capitalize(item.category)}
            </span>
            {item.isNew ? (
              <span className="listing-detail-screen__badge">NEW</span>
            ) : null}
            {!item.is_available ? (
              <span className="listing-detail-screen__badge listing-detail-screen__badge--sold">SOLD</span>
            ) : null}
          </div>
          <h1>{item.title}</h1>
          <div className="listing-detail-screen__price-row">
            <strong className="listing-detail-screen__price">{item.price}</strong>
            <span className={`listing-detail-screen__trade-badge listing-detail-screen__trade-badge--${item.trade_type.toLowerCase().includes('barter') ? 'barter' : 'standard'}`}>
              <span className="material-symbols-rounded" aria-hidden="true">
                {item.trade_type.toLowerCase().includes('barter') ? 'sync_alt' : 'payments'}
              </span>
              <span>{item.trade_type}</span>
            </span>
          </div>
        </div>

        {/* 3. Seller Profile Card */}
        <section className="listing-detail-screen__seller" aria-label="Seller details">
          <div className="listing-detail-screen__seller-avatar" aria-hidden="true">
            {resolvedOwner.initials}
          </div>
          
          <div className="listing-detail-screen__seller-body">
            <div className="listing-detail-screen__seller-main">
              <h2>{resolvedOwner.name}</h2>
            </div>
            
            <div className="listing-detail-screen__seller-divider" />
            
            <div className="listing-detail-screen__seller-uni">
              <span className="material-symbols-rounded" aria-hidden="true">
                school
              </span>
              <span>{formatUniversityName(resolvedOwner.university)}</span>
            </div>
          </div>
          
          <span className="material-symbols-rounded listing-detail-screen__seller-chevron" aria-hidden="true">
            chevron_right
          </span>
        </section>

        {/* 4. Product Description */}
        <section className="listing-detail-screen__description" aria-label="Description">
          <h3>Description</h3>
          <p>{item.description}</p>
        </section>

        {/* 5. Specific Listing Details Table */}
        <section className="listing-detail-screen__specs" aria-label="Specifications">
          <div className="listing-detail-screen__spec-row">
            <div className="listing-detail-screen__spec-label">
              <span className="material-symbols-rounded" aria-hidden="true">
                location_on
              </span>
              <span>Campus Location</span>
            </div>
            <strong>{formatUniversityName(resolvedOwner.university)}</strong>
          </div>
          <div className="listing-detail-screen__spec-row">
            <div className="listing-detail-screen__spec-label">
              <span className="material-symbols-rounded" aria-hidden="true">
                payments
              </span>
              <span>Preferred Trade</span>
            </div>
            <strong>{item.trade_type} (Cash / Swap)</strong>
          </div>
          <div className="listing-detail-screen__spec-row">
            <div className="listing-detail-screen__spec-label">
              <span className="material-symbols-rounded" aria-hidden="true">
                calendar_month
              </span>
              <span>Listed On</span>
            </div>
            <strong>{new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
          </div>
        </section>

        {/* 5b. Trade/Peer Reviews */}
        <section className="listing-detail-screen__reviews" aria-label="Reviews">
          <h3>Trade Reviews</h3>
          {item.reviews && item.reviews.length > 0 ? (
            <div className="listing-detail-screen__reviews-list">
              {item.reviews.map((review) => (
                <div key={review.id} className="listing-detail-screen__review-card">
                  <div className="listing-detail-screen__review-header">
                    <div className="listing-detail-screen__review-stars">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className="material-symbols-rounded"
                          style={{
                            fontSize: '18px',
                            fontVariationSettings: "'FILL' 1",
                            color: i < review.stars_amount ? 'hsla(45, 100%, 55%, 1)' : '#d1d5db'
                          }}
                          aria-hidden="true"
                        >
                          star
                        </span>
                      ))}
                    </div>
                    <span className="listing-detail-screen__review-author">Verified Buyer</span>
                  </div>
                  {review.text && (
                    <p className="listing-detail-screen__review-text">&ldquo;{review.text}&rdquo;</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="listing-detail-screen__no-reviews">No reviews for this listing yet.</p>
          )}
        </section>
      </section>

      {/* 6. Floating Action Bottom Drawer */}
      <footer className="listing-detail-screen__action-bar">
        {currentUserId === item.owner_id ? (
          <div className="listing-detail-screen__owner-actions">
            <button
              type="button"
              className="listing-detail-screen__owner-btn"
              onClick={handleStartEditing}
            >
              <span className="material-symbols-rounded" aria-hidden="true">
                edit
              </span>
              <span>Edit</span>
            </button>
            <button
              type="button"
              className="listing-detail-screen__owner-btn listing-detail-screen__status-btn"
              onClick={handleToggleStatus}
            >
              <span className="material-symbols-rounded" aria-hidden="true">
                {item.is_available ? 'unpublished' : 'check_circle'}
              </span>
              <span>{item.is_available ? 'Mark Sold' : 'Make Active'}</span>
            </button>
            <button
              type="button"
              className="listing-detail-screen__owner-btn listing-detail-screen__delete-btn"
              onClick={handleDelete}
            >
              <span className="material-symbols-rounded" aria-hidden="true">
                delete
              </span>
              <span>Delete</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="listing-detail-screen__chat-btn"
            onClick={handleStartChat}
            disabled={!item.is_available}
          >
            <span className="material-symbols-rounded" aria-hidden="true">
              chat_bubble
            </span>
            <span>{item.is_available ? 'Chat with Seller' : 'Listing Sold'}</span>
          </button>
        )}
      </footer>
    </main>
  )
}

export default ListingDetailScreen
