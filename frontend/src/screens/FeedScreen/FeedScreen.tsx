import { useMemo, useState } from 'react'
import BottomNav, {
  type BottomNavItem,
} from '../../components/BottomNav/BottomNav'
import CategoryChips from '../../components/CategoryChips/CategoryChips'
import ListingCard from '../../components/ListingCard/ListingCard'
import SearchFilterBar from '../../components/SearchFilterBar/SearchFilterBar'
import { useDormShare } from '../../data/DormShareContext'
import type { CategoryId, FeedCategory } from '../../data/types'
import './FeedScreen.css'

const FEED_CATEGORIES: FeedCategory[] = [
  { id: 'all', label: 'All', icon: 'grid_view' },
  { id: 'electronics', label: 'Electronics', icon: 'desktop_windows' },
  { id: 'furniture', label: 'Furniture', icon: 'chair' },
  { id: 'books', label: 'Books', icon: 'menu_book' },
  { id: 'appliances', label: 'Appliances', icon: 'kitchen' },
  { id: 'food', label: 'Food', icon: 'restaurant' },
  { id: 'sports', label: 'Sports', icon: 'sports_soccer' },
  { id: 'clothing', label: 'Clothing', icon: 'checkroom' },
  { id: 'other', label: 'Other', icon: 'more_horiz' },
]

type FeedScreenProps = {
  onNavigate?: (item: BottomNavItem) => void
  onOpenListing?: (listingId: string) => void
}

function FeedScreen({ onNavigate, onOpenListing }: FeedScreenProps) {
  const { items, currentUserProfile, refreshFeed } = useDormShare()
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const visibleItems = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    return items.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory

      const matchesQuery =
        !normalizedQuery ||
        [item.title, item.description, item.category, item.owner?.name ?? '']
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)

      return matchesCategory && matchesQuery && item.is_available
    })
  }, [items, searchQuery, selectedCategory])

  return (
    <main className="feed-screen" aria-label="DormShare marketplace feed">
      <header className="feed-screen__header">
        <div>
          <h1>Hey, {currentUserProfile.name.split(' ')[0]}! <span aria-hidden="true">👋</span></h1>
          <p>Buy, sell and find great deals on campus</p>
        </div>
      </header>

      <SearchFilterBar value={searchQuery} onChange={setSearchQuery} />

      <CategoryChips
        categories={FEED_CATEGORIES}
        selectedCategory={selectedCategory}
        onSelect={setSelectedCategory}
      />

      <section className="feed-screen__listings" aria-labelledby="latest-listings">
        <div className="feed-screen__section-header">
          <h2 id="latest-listings">Latest Listings</h2>
          <button type="button" className="feed-screen__see-all" onClick={() => refreshFeed()}>
            <span>Refresh</span>
            <span className="material-symbols-rounded feed-screen__see-all-icon">
              refresh
            </span>
          </button>
        </div>

        {visibleItems.length > 0 ? (
          <div className="feed-screen__grid">
            {visibleItems.map((item) => (
              <ListingCard
                key={item.id}
                item={item}
                onClick={() => onOpenListing?.(item.id)}
              />
            ))}
          </div>
        ) : (
          <div className="feed-screen__empty">
            <span className="feed-screen__empty-icon">
              <span className="material-symbols-rounded" aria-hidden="true">
                search_off
              </span>
            </span>
            <h3>No Listings Found</h3>
            <p>
              {items.length === 0 ? 'No listings available at your university yet. Be the first to post!' : 'No listings match your search.'}
            </p>
          </div>
        )}
      </section>

      <BottomNav activeItem="feed" onSelect={onNavigate} />
    </main>
  )
}

export default FeedScreen
