import { useState, useEffect, useMemo } from 'react'
import { apiGet } from '../../data/apiClient'
import { apiUserToUiUser, adaptApiItemToFeedItem } from '../../data/apiAdapters'
import type { ApiUser, FeedItem } from '../../data/types'
import { getInitials } from '../../utils'
import ListingCard from '../../components/ListingCard/ListingCard'
import './UserProfileScreen.css'

type UserProfileScreenProps = {
  userId: string
  onBack: () => void
  onOpenListing: (id: string) => void
}

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
    return cleaned.slice(0, 33) + '...'
  }
  return cleaned
}

function UserProfileScreen({ userId, onBack, onOpenListing }: UserProfileScreenProps) {
  const [profile, setProfile] = useState<ApiUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'listings' | 'about'>('listings')

  useEffect(() => {
    let active = true
    const fetchUserProfile = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await apiGet<ApiUser>(`/users/get/${userId}`)
        if (active) {
          setProfile(data)
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load user profile.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    fetchUserProfile()
    return () => {
      active = false
    }
  }, [userId])

  // Adapt user items to feed items for listing card
  const listings = useMemo((): FeedItem[] => {
    if (!profile) return []
    const uiUser = apiUserToUiUser(profile)
    return profile.items.map((apiItem) => adaptApiItemToFeedItem(apiItem, uiUser))
  }, [profile])

  const reviews = useMemo(() => {
    if (!profile) return []
    const allReviews: { review: any; itemTitle: string }[] = []
    profile.items.forEach((item) => {
      if (item.reviews) {
        item.reviews.forEach((review) => {
          allReviews.push({
            review,
            itemTitle: item.title,
          })
        })
      }
    })
    return allReviews
  }, [profile])

  const initials = useMemo(() => {
    if (!profile) return ''
    return getInitials(profile.username)
  }, [profile])

  const formattedDate = useMemo(() => {
    if (!profile?.joined_at) return ''
    try {
      return new Date(profile.joined_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return 'Unknown Date'
    }
  }, [profile])

  return (
    <main className="user-profile-screen" aria-label="User Profile Details">
      {/* Top Header Bar */}
      <header className="user-profile-screen__topbar">
        <button
          type="button"
          className="user-profile-screen__back-btn"
          onClick={onBack}
          aria-label="Back"
        >
          <span className="material-symbols-rounded" aria-hidden="true">
            arrow_back
          </span>
        </button>
        <h1>{loading ? 'Profile' : profile?.username}</h1>
      </header>

      {loading && (
        <div className="user-profile-screen__state-container" role="status" aria-live="polite">
          <div className="user-profile-screen__spinner" />
          <p>Loading profile...</p>
        </div>
      )}

      {error && !loading && (
        <div className="user-profile-screen__state-container" role="alert">
          <span className="material-symbols-rounded user-profile-screen__error-icon" aria-hidden="true">
            error
          </span>
          <p>{error}</p>
          <button type="button" className="user-profile-screen__retry-btn" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && profile && (
        <>
          {/* User Hero Section */}
          <section className="user-profile-screen__hero" aria-label="User summary">
            <div className="user-profile-screen__avatar" aria-hidden="true">
              {initials}
            </div>
            <h2>{profile.username}</h2>
            <div className="user-profile-screen__hero-uni">
              <span className="material-symbols-rounded" aria-hidden="true">
                school
              </span>
              <span>{formatUniversityName(profile.university)}</span>
            </div>
          </section>

          {/* Switcher Tabs */}
          <div className="user-profile-screen__tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'listings'}
              className={`user-profile-screen__tab ${activeTab === 'listings' ? 'user-profile-screen__tab--active' : ''}`}
              onClick={() => setActiveTab('listings')}
            >
              <span className="material-symbols-rounded" aria-hidden="true">
                grid_view
              </span>
              <span>Listings ({listings.length})</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'about'}
              className={`user-profile-screen__tab ${activeTab === 'about' ? 'user-profile-screen__tab--active' : ''}`}
              onClick={() => setActiveTab('about')}
            >
              <span className="material-symbols-rounded" aria-hidden="true">
                person
              </span>
              <span>About</span>
            </button>
          </div>

          {/* Tab Content Panels */}
          <section className="user-profile-screen__content">
            {activeTab === 'listings' ? (
              listings.length > 0 ? (
                <div className="user-profile-screen__grid">
                  {listings.map((item) => (
                    <ListingCard
                      key={item.id}
                      item={item}
                      onClick={() => onOpenListing(item.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="user-profile-screen__empty">
                  <span className="material-symbols-rounded user-profile-screen__empty-icon" aria-hidden="true">
                    inventory_2
                  </span>
                  <h3>No Active Listings</h3>
                  <p>This user hasn't posted any marketplace listings yet.</p>
                </div>
              )
            ) : (
              <div className="user-profile-screen__about-list">
                <div className="user-profile-screen__about-row">
                  <span className="material-symbols-rounded user-profile-screen__about-icon" aria-hidden="true">
                    school
                  </span>
                  <div className="user-profile-screen__about-body">
                    <span className="user-profile-screen__about-label">University</span>
                    <span className="user-profile-screen__about-val">{profile.university}</span>
                  </div>
                </div>

                <div className="user-profile-screen__about-row">
                  <span className="material-symbols-rounded user-profile-screen__about-icon" aria-hidden="true">
                    alternate_email
                  </span>
                  <div className="user-profile-screen__about-body">
                    <span className="user-profile-screen__about-label">Campus Email</span>
                    <a href={`mailto:${profile.email}`} className="user-profile-screen__about-val user-profile-screen__email-link">
                      {profile.email}
                    </a>
                  </div>
                </div>

                <div className="user-profile-screen__about-row">
                  <span className="material-symbols-rounded user-profile-screen__about-icon" aria-hidden="true">
                    calendar_month
                  </span>
                  <div className="user-profile-screen__about-body">
                    <span className="user-profile-screen__about-label">Member Since</span>
                    <span className="user-profile-screen__about-val">{formattedDate}</span>
                  </div>
                </div>

                <div className="user-profile-screen__about-row">
                  <span className="material-symbols-rounded user-profile-screen__about-icon" aria-hidden="true">
                    verified_user
                  </span>
                  <div className="user-profile-screen__about-body">
                    <span className="user-profile-screen__about-label">Account Level</span>
                    <span className="user-profile-screen__about-val user-profile-screen__about-val--capitalize">
                      {profile.role || 'Student'}
                    </span>
                  </div>
                </div>

                {/* Dynamic Trade Reviews Sub-Section */}
                <div className="user-profile-screen__reviews-section">
                  <h3>Trade Reviews ({reviews.length})</h3>
                  {reviews.length > 0 ? (
                    <div className="user-profile-screen__reviews-list">
                      {reviews.map(({ review, itemTitle }) => (
                        <div key={review.id} className="user-profile-screen__review-card">
                          <div className="user-profile-screen__review-header">
                            <div className="user-profile-screen__review-stars">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span
                                  key={i}
                                  className="material-symbols-rounded"
                                  style={{
                                    fontSize: '16px',
                                    fontVariationSettings: "'FILL' 1",
                                    color: i < review.stars_amount ? 'hsla(45, 100%, 55%, 1)' : '#d1d5db'
                                  }}
                                  aria-hidden="true"
                                >
                                  star
                                </span>
                              ))}
                            </div>
                            <span className="user-profile-screen__review-item">for {itemTitle}</span>
                          </div>
                          {review.text && (
                            <p className="user-profile-screen__review-text">&ldquo;{review.text}&rdquo;</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="user-profile-screen__no-reviews">
                      <span className="material-symbols-rounded" aria-hidden="true">
                        rate_review
                      </span>
                      <p>No trade reviews yet.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  )
}

export default UserProfileScreen
