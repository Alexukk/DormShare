import { useState, useRef, useEffect } from 'react'
import type { FormEvent } from 'react'
import { useDormShare } from '../../data/DormShareContext'
import { apiGet, apiPost } from '../../data/apiClient'
import { adaptWsMessageToChatMessage } from '../../data/apiAdapters'
import type { ApiChat } from '../../data/types'
import './ChatDetailScreen.css'

const POLL_INTERVAL_MS = 3000

type ChatDetailScreenProps = {
  chatId: string
  onBack: () => void
}

function ChatDetailScreen({ chatId, onBack }: ChatDetailScreenProps) {
  const { chats, currentUserId, replaceChatMessages, addChatMessages } = useDormShare()
  const [draft, setDraft] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const lastPollTimestampRef = useRef<string | null>(null)

  // Stable refs so effects don't re-trigger on every render
  const replaceChatMessagesRef = useRef(replaceChatMessages)
  replaceChatMessagesRef.current = replaceChatMessages
  const addChatMessagesRef = useRef(addChatMessages)
  addChatMessagesRef.current = addChatMessages
  const currentUserIdRef = useRef(currentUserId)
  currentUserIdRef.current = currentUserId

  const chat = chats.find((c) => c.id === chatId)
  const messages = chat?.messages ?? []

  // ── Load full chat history on mount ─────────────────
  useEffect(() => {
    if (!chatId) return

    let cancelled = false

    async function loadHistory() {
      try {
        const apiChat = await apiGet<ApiChat>(`/chat/get/${chatId}`)
        if (cancelled) return

        const adapted = apiChat.messages.map(m =>
          adaptWsMessageToChatMessage(m, currentUserIdRef.current)
        )
        replaceChatMessagesRef.current(chatId, adapted)

        // Set the last timestamp for polling
        if (apiChat.messages.length > 0) {
          lastPollTimestampRef.current = apiChat.messages[apiChat.messages.length - 1].timestamp
        } else {
          lastPollTimestampRef.current = new Date().toISOString()
        }
      } catch {
        // Chat might not exist or user is unauthorized
      }
    }

    loadHistory()
    return () => { cancelled = true }
  }, [chatId])

  // ── Poll for new messages ─────────────────
  useEffect(() => {
    if (!chatId) return

    const intervalId = setInterval(async () => {
      if (!lastPollTimestampRef.current) return

      try {
        const afterParam = encodeURIComponent(lastPollTimestampRef.current)
        const res = await apiGet<{ messages: Array<{ id: string; content: string; sender_id: string; timestamp: string; is_viewed: boolean; reaction: string | null }> }>(
          `/chat/messages/${chatId}?after=${afterParam}`
        )

        if (res.messages && res.messages.length > 0) {
          const adapted = res.messages.map(m =>
            adaptWsMessageToChatMessage(m, currentUserIdRef.current)
          )
          addChatMessagesRef.current(chatId, adapted)

          // Update last timestamp
          lastPollTimestampRef.current = res.messages[res.messages.length - 1].timestamp
        }
      } catch {
        // Silently ignore poll errors
      }
    }, POLL_INTERVAL_MS)

    return () => clearInterval(intervalId)
  }, [chatId])

  // Auto-scroll messages to bottom
  const totalMessagesCount = messages.length
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [totalMessagesCount])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextMessage = draft.trim()
    if (!nextMessage || !chat || isSending) return

    setDraft('')
    setIsSending(true)

    try {
      // Send via REST API
      const res = await apiPost<{ id: string; content: string; sender_id: string; timestamp: string; is_viewed: boolean; reaction: string | null }>(
        `/chat/messages/${chatId}`,
        { content: nextMessage }
      )

      // Add the confirmed message to chat
      const adapted = adaptWsMessageToChatMessage(res, currentUserId)
      addChatMessages(chatId, [adapted])

      // Update poll timestamp so we don't re-fetch this message
      if (res.timestamp) {
        lastPollTimestampRef.current = res.timestamp
      }
    } catch {
      // If send fails, show the message as unsent
      // For now just silently fail — user can retype
    } finally {
      setIsSending(false)
    }
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
            <span className="chat-detail__online-dot" />
          </div>
          <div>
            <h1>{chat.participant.name}</h1>
            <p>Online</p>
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
        <button
          type="submit"
          className="chat-detail__send"
          aria-label="Send message"
          disabled={isSending}
        >
          <span className="material-symbols-rounded" aria-hidden="true">
            send
          </span>
        </button>
      </form>
    </main>
  )
}

export default ChatDetailScreen
