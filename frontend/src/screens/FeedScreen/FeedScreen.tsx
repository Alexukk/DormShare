import { useEffect, useMemo, useState } from 'react'
import BottomNav from '../../components/BottomNav/BottomNav'
import CategoryChips from '../../components/CategoryChips/CategoryChips'
import ListingCard from '../../components/ListingCard/ListingCard'
import NotificationButton from '../../components/NotificationButton/NotificationButton'
import SearchFilterBar from '../../components/SearchFilterBar/SearchFilterBar'
import {
  dormshareApi,
  type CategoryId,
  type CurrentUser,
  type FeedCategory,
  type FeedItem,
} from '../../data/dormshareApi'
import './FeedScreen.css'

function FeedScreen() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [categories, setCategories] = useState<FeedCategory[]>([])
  const [items, setItems] = useState<FeedItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => new Set())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadFeed() {
      setIsLoading(true)

      const [loadedUser, loadedCategories, loadedItems] = await Promise.all([
        dormshareApi.getCurrentUser(),
        dormshareApi.getCategories(),
        dormshareApi.getFeedItems(),
      ])

      if (!isMounted) {
        return
      }

      setCurrentUser(loadedUser)
      setCategories(loadedCategories)
      setItems(loadedItems)
      setIsLoading(false)
    }

    loadFeed()

    return () => {
      isMounted = false
    }
  }, [])

  const visibleItems = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    return items.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory

      const matchesQuery =
        !normalizedQuery ||
        [item.title, item.description, item.category, item.owner.name]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)

      return matchesCategory && matchesQuery
    })
  }, [items, searchQuery, selectedCategory])

  function handleFavoriteToggle(itemId: string) {
    setFavoriteIds((currentFavorites) => {
      const nextFavorites = new Set(currentFavorites)

      if (nextFavorites.has(itemId)) {
        nextFavorites.delete(itemId)
      } else {
        nextFavorites.add(itemId)
      }

      return nextFavorites
    })
  }

  return (
    <main className="feed-screen" aria-label="DormShare marketplace feed">
      <header className="feed-screen__header">
        <div>
          <h1>Hey, {currentUser?.firstName ?? 'Andrew'}! <span aria-hidden="true">👋</span></h1>
          <p>Buy, sell and find great deals on campus</p>
        </div>
        <NotificationButton count={currentUser?.notificationCount ?? 3} />
      </header>

      <SearchFilterBar value={searchQuery} onChange={setSearchQuery} />

      <CategoryChips
        categories={categories}
        selectedCategory={selectedCategory}
        onSelect={setSelectedCategory}
      />

      <section className="feed-screen__listings" aria-labelledby="latest-listings">
        <div className="feed-screen__section-header">
          <h2 id="latest-listings">Latest Listings</h2>
          <button type="button" className="feed-screen__see-all">
            <span>See all</span>
            <span className="material-symbols-rounded feed-screen__see-all-icon">
              arrow_forward
            </span>
          </button>
        </div>

        {isLoading ? (
          <p className="feed-screen__empty">Loading listings...</p>
        ) : visibleItems.length > 0 ? (
          <div className="feed-screen__grid">
            {visibleItems.map((item) => (
              <ListingCard
                key={item.id}
                item={item}
                isFavorite={favoriteIds.has(item.id)}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </div>
        ) : (
          <p className="feed-screen__empty">No listings match your search.</p>
        )}
      </section>

      <BottomNav activeItem="feed" />
    </main>
  )
}

export default FeedScreen
