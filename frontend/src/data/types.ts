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
