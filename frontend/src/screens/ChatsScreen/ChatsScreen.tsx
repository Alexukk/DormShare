import { useMemo, useState } from 'react'
import BottomNav, {
  type BottomNavItem,
} from '../../components/BottomNav/BottomNav'
import NotificationButton from '../../components/NotificationButton/NotificationButton'
import SearchFilterBar from '../../components/SearchFilterBar/SearchFilterBar'
import { useDormShare } from '../../data/DormShareContext'
import type { ChatTabId, ChatSummary } from '../../data/types'
import './ChatsScreen.css'

type ChatsScreenProps = {
  onNavigate?: (item: BottomNavItem) => void
  onOpenChat?: (chatId: string) => void
}

const chatTabs: Array<{ id: ChatTabId; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'archived', label: 'Archived' },
]

const avatarColorClasses = [
  'chats-screen__avatar--purple',
  'chats-screen__avatar--green',
  'chats-screen__avatar--yellow',
  'chats-screen__avatar--blue',
  'chats-screen__avatar--pink',
  'chats-screen__avatar--violet',
  'chats-screen__avatar--cyan',
  'chats-screen__avatar--orange',
]

function ChatsScreen({ onNavigate, onOpenChat }: ChatsScreenProps) {
  const { chats, notificationCount } = useDormShare()
  const [selectedTab, setSelectedTab] = useState<ChatTabId>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Map detail conversations to summary list items in real time
  const chatSummaries = useMemo<ChatSummary[]>(() => {
    return chats.map((chat) => {
      const lastMsgObj = chat.messages[chat.messages.length - 1]
      
      // Calculate real unread counts based on message status
      const unreads = chat.messages.filter(
        (m) => m.sender === 'them' && m.status !== 'read'
      ).length

      return {
        id: chat.id,
        participant: chat.participant,
        lastMessage: lastMsgObj ? lastMsgObj.content : 'No messages yet',
        timestampLabel: lastMsgObj ? lastMsgObj.timestampLabel : 'Just now',
        unreadCount: unreads,
        isArchived: false,
      }
    })
  }, [chats])

  const totalUnreadCount = useMemo(
    () => chatSummaries.reduce((total, chat) => total + (chat.unreadCount || 0), 0),
    [chatSummaries],
  )

  const visibleChats = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    return chatSummaries.filter((chat) => {
      const matchesTab =
        selectedTab === 'all' ||
        (selectedTab === 'unread' && chat.unreadCount > 0) ||
        (selectedTab === 'archived' && chat.isArchived)

      const matchesQuery =
        !normalizedQuery ||
        [chat.participant.name, chat.lastMessage]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)

      // Archives should be hidden on "All" tab unless selected "Archived" specifically
      const filterArchive = selectedTab === 'archived' ? chat.isArchived : !chat.isArchived

      return matchesTab && matchesQuery && filterArchive
    })
  }, [chatSummaries, searchQuery, selectedTab])

  return (
    <main className="chats-screen" aria-label="DormShare chats">
      <header className="chats-screen__header">
        <h1>Chats</h1>
        <NotificationButton count={notificationCount} />
      </header>

      <SearchFilterBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search chats"
        label="Search chats"
      />

      <div className="chats-screen__tabs" role="tablist" aria-label="Chat filters">
        {chatTabs.map((tab) => {
          const isSelected = tab.id === selectedTab
          const showUnreadBadge = tab.id === 'unread' && totalUnreadCount > 0

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              className="chats-screen__tab"
              onClick={() => setSelectedTab(tab.id)}
            >
              <span>{tab.label}</span>
              {showUnreadBadge ? (
                <span className="chats-screen__tab-badge">{totalUnreadCount}</span>
              ) : null}
            </button>
          )
        })}
      </div>

      <section className="chats-screen__list" aria-label="Conversation list">
        {visibleChats.length > 0 ? (
          visibleChats.map((chat, index) => (
            <button
              key={chat.id}
              type="button"
              className="chats-screen__row"
              onClick={() => onOpenChat?.(chat.id)}
              aria-label={`Open chat with ${chat.participant.name}`}
            >
              <div
                className={`chats-screen__avatar ${
                  avatarColorClasses[index % avatarColorClasses.length]
                }`}
                aria-hidden="true"
              >
                {chat.participant.initials}
                {chat.participant.isOnline ? (
                  <span className="chats-screen__online-dot" />
                ) : null}
              </div>

              <div className="chats-screen__content">
                <span className="chats-screen__name">
                  {chat.participant.name}
                </span>
                <span className="chats-screen__preview">{chat.lastMessage}</span>
              </div>

              <div className="chats-screen__meta">
                <time>{chat.timestampLabel}</time>
                {chat.unreadCount > 0 ? (
                  <span
                    className="chats-screen__unread-badge"
                    aria-label={`${chat.unreadCount} unread messages`}
                  >
                    {chat.unreadCount}
                  </span>
                ) : null}
              </div>
            </button>
          ))
        ) : (
          <p className="chats-screen__empty">No chats match your search.</p>
        )}
      </section>

      <BottomNav activeItem="chats" onSelect={onNavigate} />
    </main>
  )
}

export default ChatsScreen
