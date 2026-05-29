import { useState, useRef, useEffect } from 'react'
import type { FormEvent } from 'react'
import { useDormShare } from '../../data/DormShareContext'
import { connectChatWebSocket, sendWsChatMessage } from '../../data/chatWebSocket'
import { adaptWsMessageToChatMessage } from '../../data/apiAdapters'
import { getStoredToken } from '../../data/apiClient'
import './ChatDetailScreen.css'

type ChatDetailScreenProps = {
  chatId: string
  onBack: () => void
}

function ChatDetailScreen({ chatId, onBack }: ChatDetailScreenProps) {
  const { chats, currentUserId, replaceChatMessages, addChatMessages } = useDormShare()
  const [draft, setDraft] = useState('')
  const [wsConnected, setWsConnected] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WebSocket | null>(null)

  const chat = chats.find((c) => c.id === chatId)
  const messages = chat?.messages ?? []

  // ── WebSocket connection ─────────────────
  useEffect(() => {
    const token = getStoredToken()
    if (!token || !chatId) return

    const ws = connectChatWebSocket(chatId, token, {
      onHistory: (historyMessages) => {
        const adapted = historyMessages.map(m =>
          adaptWsMessageToChatMessage(m, currentUserId)
        )
        replaceChatMessages(chatId, adapted)
      },
      onMessage: (msg) => {
        const adapted = adaptWsMessageToChatMessage(msg, currentUserId)
        addChatMessages(chatId, [adapted])
      },
      onOpen: () => setWsConnected(true),
      onClose: () => setWsConnected(false),
    })

    wsRef.current = ws

    return () => {
      ws.close()
      wsRef.current = null
    }
  }, [chatId, currentUserId, replaceChatMessages, addChatMessages])

  // Auto-scroll messages to bottom
  const totalMessagesCount = messages.length
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [totalMessagesCount])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextMessage = draft.trim()
    if (!nextMessage || !chat) return

    // Send via WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      sendWsChatMessage(wsRef.current, nextMessage)
    }

    setDraft('')
  }

  function handleOpenListing() {
    if (chat) {
      onBack()
      setTimeout(() => {
        const clickEvent = new CustomEvent('open-listing-details', { detail: chat.listing.id })
        window.dispatchEvent(clickEvent)
      }, 100)
    }
  }

  if (!chat) {
    return (
      <main className="chat-detail" aria-label="Conversation not found">
        <button
          type="button"
          className="chat-detail__back chat-detail__back--state"
          onClick={onBack}
          aria-label="Back to chats"
        >
          <span className="material-symbols-rounded" aria-hidden="true">
            arrow_back_ios_new
          </span>
        </button>
        <p className="chat-detail__state">Chat not found.</p>
      </main>
    )
  }

  return (
    <main className="chat-detail" aria-label={`Chat with ${chat.participant.name}`}>
      <header className="chat-detail__header">
        <button
          type="button"
          className="chat-detail__back"
          onClick={onBack}
          aria-label="Back to chats"
        >
          <span className="material-symbols-rounded" aria-hidden="true">
            arrow_back_ios_new
          </span>
        </button>

        <div className="chat-detail__identity">
          <div className="chat-detail__avatar" aria-hidden="true">
            {chat.participant.initials}
            {wsConnected ? (
              <span className="chat-detail__online-dot" />
            ) : null}
          </div>
          <div>
            <h1>{chat.participant.name}</h1>
            <p>{wsConnected ? 'Connected' : 'Connecting...'}</p>
          </div>
        </div>

        <button
          type="button"
          className="chat-detail__menu"
          aria-label="Conversation actions"
        >
          <span className="material-symbols-rounded" aria-hidden="true">
            more_horiz
          </span>
        </button>
      </header>

      {chat.listing.image.photo_url && (
        <section className="chat-detail__listing" aria-label="Listing summary">
          <img src={chat.listing.image.photo_url} alt={chat.listing.image.alt} />
          <div className="chat-detail__listing-copy">
            <h2>{chat.listing.title}</h2>
            <strong>{chat.listing.price}</strong>
            <span>{chat.listing.category}</span>
          </div>
          <button type="button" onClick={handleOpenListing}>View listing</button>
        </section>
      )}

      <div className="chat-detail__date">{chat.dateLabel}</div>

      <section className="chat-detail__messages" aria-label="Message history">
        {messages.map((message) => {
          const isMine = message.sender === 'me'

          return (
            <article
              key={message.id}
              className={`chat-detail__message ${
                isMine
                  ? 'chat-detail__message--mine'
                  : 'chat-detail__message--theirs'
              }`}
            >
              {!isMine ? (
                <div className="chat-detail__message-avatar" aria-hidden="true">
                  {chat.participant.initials}
                </div>
              ) : null}

              <div className="chat-detail__message-stack">
                <p>{message.content}</p>
                <span className="chat-detail__timestamp">
                  {message.timestampLabel}
                  {isMine ? (
                    <span
                      className="material-symbols-rounded chat-detail__receipt"
                      aria-hidden="true"
                    >
                      {message.status === 'read' ? 'done_all' : 'done'}
                    </span>
                  ) : null}
                </span>
              </div>
            </article>
          )
        })}

        <div ref={messagesEndRef} />
      </section>

      <form className="chat-detail__composer" onSubmit={handleSubmit}>
        <label className="chat-detail__input">
          <span className="sr-only">Type a message</span>
          <input
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Type a message..."
          />
        </label>
        <button type="submit" className="chat-detail__send" aria-label="Send message">
          <span className="material-symbols-rounded" aria-hidden="true">
            send
          </span>
        </button>
      </form>
    </main>
  )
}

export default ChatDetailScreen
