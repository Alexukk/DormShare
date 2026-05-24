import type { FeedItem } from '../../data/dormshareApi'
import './ListingCard.css'

type ListingCardProps = {
  item: FeedItem
  isFavorite: boolean
  onFavoriteToggle: (itemId: string) => void
  onClick?: () => void
}

function ListingCard({
  item,
  isFavorite,
  onFavoriteToggle,
  onClick,
}: ListingCardProps) {
  const image = item.images[0]

  return (
    <article 
      className="listing-card" 
      onClick={onClick} 
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="listing-card__media">
        <img src={image.photo_url} alt={image.alt} className="listing-card__image" />
        {item.isNew ? <span className="listing-card__flag">NEW</span> : null}
        <button
          type="button"
          className="listing-card__favorite"
          aria-label={
            isFavorite
              ? `Remove ${item.title} from favorites`
              : `Add ${item.title} to favorites`
          }
          aria-pressed={isFavorite}
          onClick={(e) => {
            e.stopPropagation()
            onFavoriteToggle(item.id)
          }}
        >
          <span className="material-symbols-rounded listing-card__favorite-icon">
            favorite
          </span>
        </button>
      </div>

      <div className="listing-card__body">
        <h2 className="listing-card__title">{item.title}</h2>
        <p className="listing-card__price">{item.price}</p>

        <div className="listing-card__seller">
          <span className="listing-card__avatar" aria-hidden="true">
            {item.owner.initials}
          </span>
          <span className="listing-card__seller-name">{item.owner.name}</span>
          <span
            className="listing-card__status-dot"
            aria-label={item.owner.isOnline ? 'Online' : 'Offline'}
            role="img"
          />
          <span className="listing-card__status-text">
            {item.owner.isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>
    </article>
  )
}

export default ListingCard
