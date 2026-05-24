/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react'
import {
  mockFeedItems,
  mockChatDetails,
  mockChatSummaries,
} from './mockData'
import type {
  FeedItem,
  ChatDetail,
  ChatMessage,
  ProfileForm,
  ListingCategoryId,
  DormShareNotification,
  NotificationType,
} from './types'

export type DormShareContextType = {
  items: FeedItem[]
  chats: ChatDetail[]
  currentUserProfile: ProfileForm
  notifications: DormShareNotification[]
  notificationCount: number
  favoriteIds: Set<string>
  typingStates: Record<string, boolean> // chatId -> boolean
  toggleFavorite: (itemId: string) => void
  addItem: (draft: {
    title: string
    description: string
    price: string
    priceMode: string
    category: string
    condition: string
    images: string[]
  }) => string // returns new itemId
  sendMessage: (chatId: string, content: string) => void
  startOrOpenChat: (item: FeedItem) => string // returns chatId
  updateProfile: (profile: Partial<ProfileForm>) => void
  markChatAsRead: (chatId: string) => void
  markNotificationAsRead: (id: string) => void
  markAllNotificationsAsRead: () => void
  clearAllNotifications: () => void
  addNotification: (
    type: NotificationType,
    title: string,
    body: string,
    targetId?: string,
    senderName?: string,
    senderInitials?: string
  ) => void
}

const DormShareContext = createContext<DormShareContextType | undefined>(undefined)

const initialProfile: ProfileForm = {
  name: 'Andrew',
  username: 'andrew_campus',
  bio: 'Computer Science sophomore. Mostly selling electronics and textbooks from freshman year.',
  email: 'andrew@university.edu',
  school: 'University of Michigan',
}

const initialNotifications: DormShareNotification[] = [
  {
    id: 'notif-1',
    type: 'like',
    title: 'New Favorite! ❤️',
    body: 'Jake M. favorited your IKEA Desk + Chair listing.',
    timestamp: '12m ago',
    isRead: false,
    targetId: 'item-desk-chair',
    senderName: 'Jake M.',
    senderInitials: 'JM',
  },
  {
    id: 'notif-2',
    type: 'message',
    title: 'New Message 💬',
    body: 'Emily Chen sent you a message about IKEA Desk + Chair.',
    timestamp: '45m ago',
    isRead: false,
    targetId: 'chat-emily-chen',
    senderName: 'Emily Chen',
    senderInitials: 'EC',
  },
  {
    id: 'notif-3',
    type: 'system',
    title: 'Welcome to DormShare! 🎉',
    body: 'Your student account is successfully configured. Ready to buy, sell or loan items!',
    timestamp: '2d ago',
    isRead: true,
  },
]

export function DormShareProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<FeedItem[]>(mockFeedItems)
  const [chats, setChats] = useState<ChatDetail[]>(() => {
    // Build the complete list of chat details from mock data (in case some summaries don't have matching details)
    const initialChats = [...mockChatDetails]
    const detailsMap = new Map(initialChats.map(c => [c.id, c]))
    
    mockChatSummaries.forEach(summary => {
      if (!detailsMap.has(summary.id)) {
        // Create a dummy chat detail based on summary info
        const matchingItem = mockFeedItems.find(item => item.owner.id === summary.participant.id) || mockFeedItems[0]
        
        const newDetail: ChatDetail = {
          id: summary.id,
          participant: summary.participant,
          listing: {
            id: matchingItem.id,
            title: matchingItem.title,
            price: matchingItem.price,
            category: matchingItem.category.charAt(0).toUpperCase() + matchingItem.category.slice(1),
            image: matchingItem.images[0],
          },
          dateLabel: 'Today',
          messages: [
            {
              id: `msg-${summary.id}-init`,
              sender: 'them',
              content: summary.lastMessage,
              timestampLabel: summary.timestampLabel,
            }
          ]
        }
        initialChats.push(newDetail)
      }
    })
    return initialChats
  })
  const [currentUserProfile, setCurrentUserProfile] = useState<ProfileForm>(initialProfile)
  const [notifications, setNotifications] = useState<DormShareNotification[]>(initialNotifications)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set(['item-headphones']))
  const [typingStates, setTypingStates] = useState<Record<string, boolean>>({})

  // Derived unread count
  const notificationCount = notifications.filter(n => !n.isRead).length

  function toggleFavorite(itemId: string) {
    setFavoriteIds((prev) => {
      const next = new Set(prev)
      if (next.has(itemId)) {
        next.delete(itemId)
      } else {
        next.add(itemId)
      }
      return next
    })
  }

  // Action to push new alerts dynamically
  function addNotification(
    type: NotificationType,
    title: string,
    body: string,
    targetId?: string,
    senderName?: string,
    senderInitials?: string
  ) {
    const newNotif: DormShareNotification = {
      id: `notif-local-${Date.now()}`,
      type,
      title,
      body,
      timestamp: 'Just now',
      isRead: false,
      targetId,
      senderName,
      senderInitials,
    }
    setNotifications((prev) => [newNotif, ...prev])
  }

  function markNotificationAsRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )
  }

  function markAllNotificationsAsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  function clearAllNotifications() {
    setNotifications([])
  }

  function addItem(draft: {
    title: string
    description: string
    price: string
    priceMode: string
    category: string
    condition: string
    images: string[]
  }) {
    const newItemId = `item-local-${Date.now()}`
    const newItem: FeedItem = {
      id: newItemId,
      title: draft.title,
      description: draft.description,
      price: `$${draft.price}`,
      trade_type: draft.priceMode.includes('negotiable') ? 'Negotiable' : 'Cash',
      category: draft.category as ListingCategoryId,
      is_available: true,
      created_at: new Date().toISOString(),
      owner_id: 'user-andrew',
      owner: {
        id: 'user-andrew',
        name: currentUserProfile.name,
        initials: currentUserProfile.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'A',
        isOnline: true,
      },
      images: draft.images.length > 0 
        ? draft.images.map((img, i) => ({ id: `img-local-${newItemId}-${i}`, photo_url: img, alt: draft.title }))
        : [{ id: `img-local-${newItemId}-default`, photo_url: mockFeedItems[0].images[0].photo_url, alt: draft.title }],
      isNew: true,
    }

    setItems((prev) => [newItem, ...prev])

    // Dynamic Success Notification
    addNotification(
      'system',
      'Listing Live! 🚀',
      `Awesome! Your listing "${draft.title}" is now visible to other campus students.`,
      newItemId
    )

    return newItemId
  }

  function updateProfile(fields: Partial<ProfileForm>) {
    setCurrentUserProfile((prev) => ({ ...prev, ...fields }))
  }

  function markChatAsRead(chatId: string) {
    setChats(prevChats => 
      prevChats.map(chat => {
        if (chat.id === chatId) {
          // Simply update the local detail messages to all status read
          const updatedMessages = chat.messages.map(msg => 
            msg.sender === 'them' ? { ...msg, status: 'read' as const } : msg
          )
          return { ...chat, messages: updatedMessages }
        }
        return chat
      })
    )
  }

  function startOrOpenChat(item: FeedItem): string {
    const existingChat = chats.find(c => c.listing.id === item.id && c.participant.id === item.owner.id)
    if (existingChat) {
      return existingChat.id
    }

    // Create a new chat conversation
    const newChatId = `chat-local-${Date.now()}`
    const newChat: ChatDetail = {
      id: newChatId,
      participant: item.owner,
      listing: {
        id: item.id,
        title: item.title,
        price: item.price,
        category: item.category.charAt(0).toUpperCase() + item.category.slice(1),
        image: item.images[0],
      },
      dateLabel: 'Today',
      messages: [
        {
          id: `msg-welcome-${newChatId}`,
          sender: 'them',
          content: `Hi! I noticed you are interested in my ${item.title}. Let me know if you have any questions!`,
          timestampLabel: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]
    }

    setChats(prev => [newChat, ...prev])
    return newChatId
  }

  // Preloaded mock reply templates
  const autoReplies = [
    "Awesome! That location works perfectly for me. See you there!",
    "Yes, it is still in pristine condition, barely used since last fall.",
    "Sure! Let me check my schedule. Tomorrow afternoon after 3 PM works best. How about the library lobby?",
    "Sounds great, cash or Venmo both work perfectly for me. Let me know when you arrive!",
    "No major scratches or issues, it works like a charm. Let me know if you want to inspect it first!"
  ]

  function sendMessage(chatId: string, content: string) {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const newMessage: ChatMessage = {
      id: `msg-sent-${Date.now()}`,
      sender: 'me',
      content,
      timestampLabel: timestamp,
      status: 'sent',
    }

    setChats(prevChats => 
      prevChats.map(chat => {
        if (chat.id === chatId) {
          return {
            ...chat,
            messages: [...chat.messages, newMessage]
          }
        }
        return chat
      })
    )

    // Trigger simulated reply after a brief typing duration
    setTypingStates(prev => ({ ...prev, [chatId]: true }))

    setTimeout(() => {
      const chatObj = chats.find(c => c.id === chatId)
      
      // Choose a contextual or random reply
      const randIdx = Math.floor(Math.random() * autoReplies.length)
      const replyText = autoReplies[randIdx]
      const replyMessage: ChatMessage = {
        id: `msg-recv-${Date.now()}`,
        sender: 'them',
        content: replyText,
        timestampLabel: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }

      setTypingStates(prev => ({ ...prev, [chatId]: false }))
      setChats(prevChats => 
        prevChats.map(chat => {
          if (chat.id === chatId) {
            return {
              ...chat,
              messages: [...chat.messages, replyMessage]
            }
          }
          return chat
        })
      )

      // Dynamically dispatch a message notification alert!
      addNotification(
        'message',
        `New Message from ${chatObj?.participant.name || 'Emily Chen'}`,
        replyText,
        chatId,
        chatObj?.participant.name || 'Emily Chen',
        chatObj?.participant.initials || 'EC'
      )
    }, 1800)
  }

  return (
    <DormShareContext.Provider
      value={{
        items,
        chats,
        currentUserProfile,
        notifications,
        notificationCount,
        favoriteIds,
        typingStates,
        toggleFavorite,
        addItem,
        sendMessage,
        startOrOpenChat,
        updateProfile,
        markChatAsRead,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearAllNotifications,
        addNotification,
      }}
    >
      {children}
    </DormShareContext.Provider>
  )
}

export function useDormShare() {
  const context = useContext(DormShareContext)
  if (context === undefined) {
    throw new Error('useDormShare must be used within a DormShareProvider')
  }
  return context
}
