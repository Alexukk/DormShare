export type CategoryId =
  | 'all'
  | 'electronics'
  | 'furniture'
  | 'books'
  | 'appliances'
  | 'food'
  | 'sports'
  | 'clothing'
  | 'other'

export type ListingCategoryId = Exclude<CategoryId, 'all'>

export type FeedCategory = {
  id: CategoryId
  label: string
  icon: string
}

export type DormShareUser = {
  id: string
  name: string
  initials: string
  isOnline: boolean
  university?: string
}

export type ListingImage = {
  id: string
  photo_url: string
  alt: string
}

export type FeedItem = {
  id: string
  title: string
  description: string
  price: string
  trade_type: string
  category: ListingCategoryId
  is_available: boolean
  created_at: string
  owner_id: string
  owner: DormShareUser
  images: ListingImage[]
  isNew?: boolean
}

export type ChatTabId = 'all' | 'unread' | 'archived'

export type ChatSummary = {
  id: string
  participant: DormShareUser
  lastMessage: string
  timestampLabel: string
  unreadCount: number
  isArchived: boolean
}

export type ChatMessage = {
  id: string
  sender: 'me' | 'them'
  content: string
  timestampLabel: string
  status?: 'sent' | 'read'
}

export type ChatListingSummary = {
  id: string
  title: string
  price: string
  category: string
  image: ListingImage
}

export type ChatDetail = {
  id: string
  participant: DormShareUser
  listing: ChatListingSummary
  dateLabel: string
  messages: ChatMessage[]
}

export type ProfileForm = {
  name: string
  username: string
  bio: string
  email: string
  school: string
}

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

// ── Backend API response types ───────────────────────

/** Matches ImageRead from PydenticModels.py */
export type ApiImage = {
  id: string
  photo_url: string
}

/** Matches ReviewRead from PydenticModels.py */
export type ApiReview = {
  id: string
  borrower_id: string
  transaction_id: string
  text: string
  stars_amount: number
}

/** Matches ItemReadWithImages from PydenticModels.py */
export type ApiItem = {
  id: string
  title: string
  description: string
  price: string
  trade_type: string
  category: string
  is_available: boolean
  created_at: string
  owner_id: string
  images: ApiImage[]
  reviews: ApiReview[]
  owner_username?: string
}

/** Matches UserSend from PydenticModels.py */
export type ApiUser = {
  id: string
  username: string
  email: string
  joined_at: string
  role: string
  university: string
  items: ApiItem[]
}

/** Matches MessageResponse from PydenticModels.py */
export type ApiMessage = {
  id: string
  content: string
  sender_id: string
  timestamp: string
  is_viewed: boolean
  reaction: string | null
}

/** Matches ChatResponse from PydenticModels.py */
export type ApiChat = {
  id: string
  status: string
  created_at: string
  lender_id: string
  borrower_id: string
  item_id: string
  messages: ApiMessage[]
}
