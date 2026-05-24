export type CategoryId =
  | 'all'
  | 'electronics'
  | 'books'
  | 'furniture'
  | 'appliances'
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

export type CurrentUser = {
  id: string
  firstName: string
  notificationCount: number
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

export type NotificationType = 'like' | 'message' | 'system' | 'offer'

export type DormShareNotification = {
  id: string
  type: NotificationType
  title: string
  body: string
  timestamp: string
  isRead: boolean
  targetId?: string
  senderName?: string
  senderInitials?: string
}


