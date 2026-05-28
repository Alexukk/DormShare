/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type {
  FeedItem,
  ChatDetail,
  ChatMessage,
  ProfileForm,
  ListingCategoryId,
  DormShareNotification,
  NotificationType,
  BeforeInstallPromptEvent,
} from './types'
import { capitalize, getInitials, formatTimestamp } from '../utils'

export type DormShareContextType = {
  items: FeedItem[]
  chats: ChatDetail[]
  currentUserProfile: ProfileForm
  notifications: DormShareNotification[]
  notificationCount: number
  favoriteIds: Set<string>
  typingStates: Record<string, boolean> // chatId -> boolean
  isInstallable: boolean
  triggerInstallPrompt: () => void
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
  name: '',
  username: '',
  bio: '',
  email: '',
  school: '',
}

export function DormShareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<FeedItem[]>([])
  const [chats, setChats] = useState<ChatDetail[]>([])
  const [currentUserProfile, setCurrentUserProfile] = useState<ProfileForm>(initialProfile)
  const [notifications, setNotifications] = useState<DormShareNotification[]>([])
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [typingStates] = useState<Record<string, boolean>>({})

  // PWA Install States
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) {
      return false
    }
    return true // Default to true so the installer card is mock-demonstrable in browser dev environments
  })

  // Derived unread count
  const notificationCount = notifications.filter(n => !n.isRead).length

  // Listen to installation prompts globally
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  async function triggerInstallPrompt() {
    if (!deferredPrompt) {
      // Fallback for simulation in desktop sandbox environments
      alert('PWA simulation: Triggering mobile home screen installation prompt!')
      return
    }

    // Trigger the standard native prompt
    deferredPrompt.prompt()
    await deferredPrompt.userChoice

    // Clear saved event
    setDeferredPrompt(null)
    setIsInstallable(false)
  }

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
      owner_id: 'user-local',
      owner: {
        id: 'user-local',
        name: currentUserProfile.name || 'You',
        initials: getInitials(currentUserProfile.name || 'You'),
        isOnline: true,
      },
      images: draft.images.length > 0 
        ? draft.images.map((img, i) => ({ id: `img-local-${newItemId}-${i}`, photo_url: img, alt: draft.title }))
        : [],
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
        category: capitalize(item.category),
        image: item.images[0],
      },
      dateLabel: 'Today',
      messages: [
        {
          id: `msg-welcome-${newChatId}`,
          sender: 'them',
          content: `Hi! I noticed you are interested in my ${item.title}. Let me know if you have any questions!`,
          timestampLabel: formatTimestamp(),
        }
      ]
    }

    setChats(prev => [newChat, ...prev])
    return newChatId
  }

  function sendMessage(chatId: string, content: string) {
    const timestamp = formatTimestamp()
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

    // Note: In Phase 3, this will be replaced with a WebSocket send.
    // For now, messages are local-only with no simulated replies.
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
        isInstallable,
        triggerInstallPrompt,
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
