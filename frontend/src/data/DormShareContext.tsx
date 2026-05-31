/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type {
  FeedItem,
  ChatDetail,
  ChatMessage,
  ProfileForm,
  BeforeInstallPromptEvent,
  ApiItem,
  ApiUser,
  ApiChat,
} from './types'
import {
  adaptApiItemToFeedItem,
  adaptApiChatToChatDetail,
  adaptApiUserToProfileForm,
  apiUserToUiUser,
  placeholderUser,
} from './apiAdapters'
import { apiGet, apiPost, apiPostFormData, apiDelete, ApiError } from './apiClient'
import { login as authLogin, register as authRegister, logout as authLogout, isAuthenticated as checkAuth } from './authService'
import { capitalize, formatTimestamp } from '../utils'

export type DormShareContextType = {
  // Auth state
  isAuthenticated: boolean
  isLoading: boolean
  authError: string
  currentUserId: string
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string, university: string) => Promise<void>
  logout: () => void

  // Data
  items: FeedItem[]
  chats: ChatDetail[]
  currentUserProfile: ProfileForm
  typingStates: Record<string, boolean>
  isInstallable: boolean

  // Actions
  triggerInstallPrompt: () => void
  addItem: (draft: {
    title: string
    description: string
    price: string
    priceMode: string
    category: string
    images: string[]
  }) => Promise<string>
  deleteItem: (itemId: string) => Promise<void>
  sendMessage: (chatId: string, content: string) => void
  startOrOpenChat: (item: FeedItem) => Promise<string>
  updateProfile: (profile: Partial<ProfileForm>) => void
  markChatAsRead: (chatId: string) => void
  refreshFeed: () => Promise<void>
  refreshChats: () => Promise<void>
  addChatMessages: (chatId: string, messages: ChatMessage[]) => void
  replaceChatMessages: (chatId: string, messages: ChatMessage[]) => void
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
  const [isAuthenticated, setIsAuthenticated] = useState(checkAuth())
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState('')
  const [currentUserId, setCurrentUserId] = useState('')

  const [items, setItems] = useState<FeedItem[]>([])
  const [chats, setChats] = useState<ChatDetail[]>([])
  const [currentUserProfile, setCurrentUserProfile] = useState<ProfileForm>(initialProfile)
  const [typingStates] = useState<Record<string, boolean>>({})

  // PWA Install States
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) {
      return false
    }
    return true
  })

  // ── PWA Install ─────────────────────────────
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
      alert('PWA simulation: Triggering mobile home screen installation prompt!')
      return
    }
    deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setIsInstallable(false)
  }

  // ── Data Loading ─────────────────────────────

  const loadProfile = useCallback(async (): Promise<ApiUser | null> => {
    try {
      const user = await apiGet<ApiUser>('/users/me')
      setCurrentUserId(user.id)
      setCurrentUserProfile(adaptApiUserToProfileForm(user))
      return user
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        authLogout()
        setIsAuthenticated(false)
      }
      return null
    }
  }, [])

  const refreshFeed = useCallback(async () => {
    try {
      const apiItems = await apiGet<ApiItem[]>('/item/feed')
      const feedItems = apiItems.map(item => adaptApiItemToFeedItem(item))
      setItems(feedItems)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        authLogout()
        setIsAuthenticated(false)
      }
    }
  }, [])

  const refreshChats = useCallback(async () => {
    try {
      const apiChats = await apiGet<ApiChat[]>('/chat/mine')

      // Build item+user lookup for each chat
      const chatDetails: ChatDetail[] = []

      for (const apiChat of apiChats) {
        // Determine who the "other" user is
        const otherUserId = apiChat.lender_id === currentUserId
          ? apiChat.borrower_id
          : apiChat.lender_id

        // Try to fetch the other user's profile
        let otherUser = placeholderUser(otherUserId)
        try {
          const u = await apiGet<ApiUser>(`/users/get/${otherUserId}`)
          otherUser = apiUserToUiUser(u)
        } catch {
          // keep placeholder
        }

        // Try to get item info for the listing summary
        let itemSummary = {
          id: apiChat.item_id,
          title: 'Item',
          price: '',
          category: '',
          image: { id: '', photo_url: '', alt: '' },
        }
        try {
          const item = await apiGet<ApiItem>(`/item/details/${apiChat.item_id}`)
          itemSummary = {
            id: item.id,
            title: item.title,
            price: item.price.startsWith('$') ? item.price : `$${item.price}`,
            category: capitalize(item.category),
            image: item.images[0]
              ? { id: item.images[0].id, photo_url: item.images[0].photo_url, alt: item.title }
              : { id: '', photo_url: '', alt: item.title },
          }
        } catch {
          // keep placeholder
        }

        chatDetails.push(adaptApiChatToChatDetail(apiChat, currentUserId, otherUser, itemSummary))
      }

      setChats(chatDetails)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        authLogout()
        setIsAuthenticated(false)
      }
    }
  }, [currentUserId])

  // Load initial data when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false)
      return
    }

    let cancelled = false

    async function loadAll() {
      setIsLoading(true)
      const user = await loadProfile()
      if (!cancelled && user) {
        await refreshFeed()
        // refreshChats depends on currentUserId, which is set by loadProfile
        // We'll trigger it after the state is set
      }
      if (!cancelled) {
        setIsLoading(false)
      }
    }

    loadAll()
    return () => { cancelled = true }
  }, [isAuthenticated, loadProfile, refreshFeed])

  // Load chats once currentUserId is available
  useEffect(() => {
    if (currentUserId && isAuthenticated) {
      refreshChats()
    }
  }, [currentUserId, isAuthenticated, refreshChats])

  // ── Auth Actions ─────────────────────────────

  async function login(email: string, password: string) {
    setAuthError('')
    try {
      await authLogin(email, password)
      setIsAuthenticated(true)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Login failed'
      setAuthError(message)
      throw err
    }
  }

  async function register(username: string, email: string, password: string, university: string) {
    setAuthError('')
    try {
      await authRegister(username, email, password, university)
      setIsAuthenticated(true)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Registration failed'
      setAuthError(message)
      throw err
    }
  }

  function logout() {
    authLogout()
    setIsAuthenticated(false)
    setCurrentUserId('')
    setItems([])
    setChats([])
    setCurrentUserProfile(initialProfile)
  }

  // ── Item Actions ─────────────────────────────

  async function addItem(draft: {
    title: string
    description: string
    price: string
    priceMode: string
    category: string
    images: string[]
  }): Promise<string> {
    // 1. Create item via API
    const res = await apiPost<{ status: string; item_id: string }>('/item/post', {
      title: draft.title,
      description: draft.description,
      price: draft.price,
      trade_type: draft.priceMode,
      category: draft.category,
      is_available: true,
    })

    const newItemId = res.item_id

    // 2. Upload each image
    for (const imageUrl of draft.images) {
      try {
        // Convert blob URL to File
        const blob = await fetch(imageUrl).then(r => r.blob())
        const file = new File([blob], `${Date.now()}.jpg`, { type: blob.type || 'image/jpeg' })
        const formData = new FormData()
        formData.append('file', file)
        // item_id is a query parameter, not form data
        await apiPostFormData(`/images/post?item_id=${newItemId}`, formData)
      } catch {
        // Continue with other images if one fails
      }
    }

    // 3. Refresh feed to get the new item with its uploaded images
    await refreshFeed()

    return newItemId
  }

  async function deleteItem(itemId: string): Promise<void> {
    await apiDelete(`/item/delete?itemId=${itemId}`)
    setItems(prev => prev.filter(i => i.id !== itemId))
  }

  // ── Profile Actions ─────────────────────────

  function updateProfile(fields: Partial<ProfileForm>) {
    // Local-only for now — no PATCH /users/update endpoint
    setCurrentUserProfile((prev) => ({ ...prev, ...fields }))
  }

  // ── Chat Actions ─────────────────────────────

  function markChatAsRead(chatId: string) {
    setChats(prevChats =>
      prevChats.map(chat => {
        if (chat.id === chatId) {
          const updatedMessages = chat.messages.map(msg =>
            msg.sender === 'them' ? { ...msg, status: 'read' as const } : msg
          )
          return { ...chat, messages: updatedMessages }
        }
        return chat
      })
    )
  }

  async function startOrOpenChat(item: FeedItem): Promise<string> {
    // Call API to create or get existing chat
    const res = await apiPost<{ status: string; chat_id: string }>(`/chat/create/${item.id}`)
    const chatId = res.chat_id

    // Check if we already have this chat locally
    const existingChat = chats.find(c => c.id === chatId)
    if (existingChat) {
      return chatId
    }

    // Fetch the chat detail and add to local state
    try {
      const apiChat = await apiGet<ApiChat>(`/chat/get/${chatId}`)
      const otherUser = item.owner

      const itemSummary = {
        id: item.id,
        title: item.title,
        price: item.price,
        category: capitalize(item.category),
        image: item.images[0] || { id: '', photo_url: '', alt: item.title },
      }

      const chatDetail = adaptApiChatToChatDetail(apiChat, currentUserId, otherUser, itemSummary)
      setChats(prev => [chatDetail, ...prev])
    } catch {
      // If fetch fails, create a minimal local chat
      const newChat: ChatDetail = {
        id: chatId,
        participant: item.owner,
        listing: {
          id: item.id,
          title: item.title,
          price: item.price,
          category: capitalize(item.category),
          image: item.images[0] || { id: '', photo_url: '', alt: item.title },
        },
        dateLabel: 'Today',
        messages: [],
      }
      setChats(prev => [newChat, ...prev])
    }

    return chatId
  }

  async function sendMessage(chatId: string, content: string) {
    // Optimistic local update for instant UI feedback
    const timestamp = formatTimestamp()
    const newMessage: ChatMessage = {
      id: `msg-optimistic-${Date.now()}`,
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

    // Send via REST API
    try {
      await apiPost(`/chat/messages/${chatId}`, { content })
    } catch {
      // If API fails, the optimistic message stays visible
      // A future improvement could mark it as "failed"
    }
  }

  /** Replace all messages for a chat (used when WebSocket sends history) */
  function replaceChatMessages(chatId: string, messages: ChatMessage[]) {
    setChats(prevChats =>
      prevChats.map(chat => {
        if (chat.id === chatId) {
          return { ...chat, messages }
        }
        return chat
      })
    )
  }

  /** Append messages to a chat (used when WebSocket receives new messages) */
  function addChatMessages(chatId: string, newMessages: ChatMessage[]) {
    setChats(prevChats =>
      prevChats.map(chat => {
        if (chat.id === chatId) {
          // Deduplicate by id
          const existingIds = new Set(chat.messages.map(m => m.id))
          const unique = newMessages.filter(m => !existingIds.has(m.id))
          return { ...chat, messages: [...chat.messages, ...unique] }
        }
        return chat
      })
    )
  }

  return (
    <DormShareContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        authError,
        currentUserId,
        login,
        register,
        logout,
        items,
        chats,
        currentUserProfile,
        typingStates,
        isInstallable,
        triggerInstallPrompt,
        addItem,
        deleteItem,
        sendMessage,
        startOrOpenChat,
        updateProfile,
        markChatAsRead,
        refreshFeed,
        refreshChats,
        addChatMessages,
        replaceChatMessages,
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
