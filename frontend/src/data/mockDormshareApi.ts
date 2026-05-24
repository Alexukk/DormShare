import {
  mockCategories,
  mockChatDetails,
  mockChatSummaries,
  mockCurrentUser,
  mockFeedItems,
} from './mockData'
import type {
  CategoryId,
  ChatDetail,
  ChatSummary,
  CurrentUser,
  FeedCategory,
  FeedItem,
} from './types'

const MOCK_DELAY_MS = 120

function delay(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function matchesCategory(item: FeedItem, category: CategoryId) {
  return category === 'all' || item.category === category
}

function matchesQuery(item: FeedItem, query: string) {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) {
    return true
  }

  return [item.title, item.description, item.category, item.owner.name]
    .join(' ')
    .toLowerCase()
    .includes(normalizedQuery)
}

export const mockDormshareApi = {
  async getCurrentUser(): Promise<CurrentUser> {
    await delay()
    return { ...mockCurrentUser }
  },

  async getCategories(): Promise<FeedCategory[]> {
    await delay()
    return mockCategories.map((category) => ({ ...category }))
  },

  async getFeedItems(options?: {
    category?: CategoryId
    query?: string
  }): Promise<FeedItem[]> {
    await delay()

    const category = options?.category ?? 'all'
    const query = options?.query ?? ''

    return mockFeedItems
      .filter((item) => item.is_available)
      .filter((item) => matchesCategory(item, category))
      .filter((item) => matchesQuery(item, query))
      .map((item) => ({
        ...item,
        owner: { ...item.owner },
        images: item.images.map((image) => ({ ...image })),
      }))
  },

  async getChatSummaries(): Promise<ChatSummary[]> {
    await delay()

    return mockChatSummaries.map((chat) => ({
      ...chat,
      participant: { ...chat.participant },
    }))
  },

  async getChatDetail(chatId: string): Promise<ChatDetail | null> {
    await delay()

    const chat = mockChatDetails.find((detail) => detail.id === chatId)

    if (!chat) {
      return null
    }

    return {
      ...chat,
      participant: { ...chat.participant },
      listing: {
        ...chat.listing,
        image: { ...chat.listing.image },
      },
      messages: chat.messages.map((message) => ({ ...message })),
    }
  },
}
