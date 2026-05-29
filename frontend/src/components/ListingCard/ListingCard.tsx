import type { FeedItem } from '../../data/dormshareApi'
import { PLACEHOLDER_IMAGE } from '../../utils'
import './ListingCard.css'

type ListingCardProps = {
  item: FeedItem
  onClick?: () => void
}

function ListingCard({
  item,
  onClick,
}: ListingCardProps) {
  const photoUrl = item.images[0]?.photo_url || PLACEHOLDER_IMAGE
  const altText = item.images[0]?.alt || item.title

  return (
    <article 
      className="listing-card" 
      onClick={onClick} 
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="listing-card__media">
        <img src={photoUrl} alt={altText} className="listing-card__image" />
        {item.isNew ? <span className="listing-card__flag">NEW</span> : null}
      </div>

      <div className="listing-card__body">
        <h2 className="listing-card__title">{item.title}</h2>
        <p className="listing-card__price">{item.price}</p>

        <div className="listing-card__seller">
          <span className="listing-card__avatar" aria-hidden="true">
            {item.owner.initials}
          </span>
          <span className="listing-card__seller-name">{item.owner.name}</span>
        </div>
      </div>
    </article>
  )
}

export default ListingCard
