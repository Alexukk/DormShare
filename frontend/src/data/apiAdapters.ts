/**
 * Adapters — transform backend API responses into frontend UI types.
 *
 * The backend returns raw UUIDs for owners/participants; the frontend UI
 * types embed full user objects. These adapters bridge the gap.
 */
import type {
  ApiItem,
  ApiChat,
  ApiUser,
  FeedItem,
  ChatDetail,
  ChatMessage,
  DormShareUser,
  ListingImage,
  ListingCategoryId,
  ProfileForm,
} from './types'
import { getInitials, formatTimestamp } from '../utils'

// ── User helpers ─────────────────────────────

/** Build a DormShareUser from an ApiUser */
export function apiUserToUiUser(u: ApiUser): DormShareUser {
  return {
    id: u.id,
    name: u.username,
    initials: getInitials(u.username),
    isOnline: false, // no online-status API yet
    university: u.university,
  }
}

/** Placeholder user when we only have an owner_id */
export function placeholderUser(ownerId: string): DormShareUser {
  return {
    id: ownerId,
    name: 'Seller',
    initials: 'S',
    isOnline: false,
    university: 'DormShare University',
  }
}

// ── Item adapters ─────────────────────────────

export function adaptApiItemToFeedItem(
  apiItem: ApiItem,
  ownerUser?: DormShareUser,
): FeedItem {
  // Resolve owner: explicit param > API owner_username > placeholder
  const resolvedOwner = ownerUser
    ?? (apiItem.owner_username
      ? {
          id: apiItem.owner_id,
          name: apiItem.owner_username,
          initials: getInitials(apiItem.owner_username),
          isOnline: false,
        }
      : placeholderUser(apiItem.owner_id))

  return {
    id: apiItem.id,
    title: apiItem.title,
    description: apiItem.description,
    price: apiItem.price.startsWith('$') ? apiItem.price : `$${apiItem.price}`,
    trade_type: apiItem.trade_type,
    category: apiItem.category as ListingCategoryId,
    is_available: apiItem.is_available,
    created_at: apiItem.created_at,
    owner_id: apiItem.owner_id,
    owner: resolvedOwner,
    images: (apiItem.images || []).map((img): ListingImage => ({
      id: img.id,
      photo_url: img.photo_url,
      alt: apiItem.title,
    })),
    isNew: false,
  }
}

// ── Chat adapters ─────────────────────────────

export function adaptApiChatToChatDetail(
  apiChat: ApiChat,
  currentUserId: string,
  otherUser: DormShareUser,
  itemSummary: { id: string; title: string; price: string; category: string; image: ListingImage },
): ChatDetail {
  const messages: ChatMessage[] = apiChat.messages.map((m) => ({
    id: m.id,
    sender: m.sender_id === currentUserId ? 'me' : 'them',
    content: m.content,
    timestampLabel: new Date(m.timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
    status: m.is_viewed ? 'read' as const : 'sent' as const,
  }))

  // Date label from first message or chat creation
  const firstTimestamp = apiChat.messages[0]?.timestamp ?? apiChat.created_at
  const dateLabel = new Date(firstTimestamp).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  })

  return {
    id: apiChat.id,
    participant: otherUser,
    listing: itemSummary,
    dateLabel,
    messages,
  }
}

// ── Profile adapter ─────────────────────────────

export function adaptApiUserToProfileForm(u: ApiUser): ProfileForm {
  return {
    name: u.username,
    username: u.username,
    bio: '', // API has no bio field
    email: u.email,
    school: u.university,
  }
}

// ── WebSocket message adapter ─────────────────

export function adaptWsMessageToChatMessage(
  wsMsg: { id: string; content: string; sender_id: string; timestamp: string; is_viewed: boolean },
  currentUserId: string,
): ChatMessage {
  return {
    id: wsMsg.id,
    sender: wsMsg.sender_id === currentUserId ? 'me' : 'them',
    content: wsMsg.content,
    timestampLabel: new Date(wsMsg.timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
    status: wsMsg.is_viewed ? 'read' : 'sent',
  }
}

// re-export formatTimestamp for use in context
export { formatTimestamp }
