import { useState, useRef, useCallback, useEffect } from 'react'
import { useDormShare } from '../../data/DormShareContext'
import { capitalize } from '../../utils'
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

function ListingDetailScreen({
  listingId,
  onBack,
  onOpenChat,
}: ListingDetailScreenProps) {
  const { items, startOrOpenChat } = useDormShare()
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [seller, setSeller] = useState<DormShareUser | null>(null)

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
          onClick={() => setLightboxOpen(true)}
          role="button"
          tabIndex={0}
          aria-label="Tap to view full screen"
        >
          <img
            src={item.images[activeImageIndex]?.photo_url}
            alt={`${item.title} - View ${activeImageIndex + 1}`}
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
          </div>
          <h1>{item.title}</h1>
          <div className="listing-detail-screen__price-row">
            <strong className="listing-detail-screen__price">{item.price}</strong>
            <span className="listing-detail-screen__trade-type">{item.trade_type}</span>
          </div>
        </div>

        {/* 3. Seller Profile Card */}
        <section className="listing-detail-screen__seller" aria-label="Seller details">
          <div className="listing-detail-screen__seller-avatar" aria-hidden="true">
            {resolvedOwner.initials}
            {resolvedOwner.isOnline ? (
              <span className="listing-detail-screen__online-dot" />
            ) : null}
          </div>
          <div className="listing-detail-screen__seller-info">
            <h2>{resolvedOwner.name}</h2>
            <p>{resolvedOwner.isOnline ? 'Online now' : 'Active today'}</p>
          </div>
          <div className="listing-detail-screen__seller-meta">
            <span className="material-symbols-rounded" aria-hidden="true">
              school
            </span>
            <span>{resolvedOwner.university || 'U of M'}</span>
          </div>
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
            <strong>{resolvedOwner.university || 'North Campus Union'}</strong>
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
      </section>

      {/* 6. Floating Action Bottom Drawer */}
      <footer className="listing-detail-screen__action-bar">
        <button
          type="button"
          className="listing-detail-screen__chat-btn"
          onClick={handleStartChat}
        >
          <span className="material-symbols-rounded" aria-hidden="true">
            chat_bubble
          </span>
          <span>Chat with Seller</span>
        </button>
      </footer>
    </main>
  )
}

export default ListingDetailScreen
