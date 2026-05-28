import { useState } from 'react'
import { useDormShare } from '../../data/DormShareContext'
import { capitalize } from '../../utils'
import './ListingDetailScreen.css'

type ListingDetailScreenProps = {
  listingId: string
  onBack: () => void
  onOpenChat: (chatId: string) => void
}

function ListingDetailScreen({
  listingId,
  onBack,
  onOpenChat,
}: ListingDetailScreenProps) {
  const { items, favoriteIds, toggleFavorite, startOrOpenChat } = useDormShare()
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  const item = items.find((i) => i.id === listingId)

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

  const isFavorite = favoriteIds.has(item.id)

  function handleStartChat() {
    if (item) {
      const chatId = startOrOpenChat(item)
      onOpenChat(chatId)
    }
  }

  return (
    <main className="listing-detail-screen" aria-label={`Details for ${item.title}`}>
      {/* 1. Hero Image Slider */}
      <section className="listing-detail-screen__hero" aria-label="Product images">
        <div className="listing-detail-screen__carousel">
          <img
            src={item.images[activeImageIndex]?.photo_url}
            alt={`${item.title} - View ${activeImageIndex + 1}`}
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
          <button
            type="button"
            className={`listing-detail-screen__circle-btn ${
              isFavorite ? 'listing-detail-screen__circle-btn--active' : ''
            }`}
            onClick={() => toggleFavorite(item.id)}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <span className="material-symbols-rounded" aria-hidden="true">
              favorite
            </span>
          </button>
        </header>

        {/* Pagination indicator */}
        {item.images.length > 1 ? (
          <div className="listing-detail-screen__dots" aria-hidden="true">
            {item.images.map((_, index) => (
              <span
                key={index}
                className={`listing-detail-screen__dot ${
                  index === activeImageIndex ? 'listing-detail-screen__dot--active' : ''
                }`}
                onClick={() => setActiveImageIndex(index)}
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
            {item.owner.initials}
            {item.owner.isOnline ? (
              <span className="listing-detail-screen__online-dot" />
            ) : null}
          </div>
          <div className="listing-detail-screen__seller-info">
            <h2>{item.owner.name}</h2>
            <p>{item.owner.isOnline ? 'Online now' : 'Active today'}</p>
          </div>
          <div className="listing-detail-screen__seller-meta">
            <span className="material-symbols-rounded" aria-hidden="true">
              school
            </span>
            <span>U of M</span>
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
            <strong>North Campus Union</strong>
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
