import { useState, useRef, useEffect } from 'react'
import type { FormEvent } from 'react'
import { useDormShare } from '../../data/DormShareContext'
import { apiGet, apiPost } from '../../data/apiClient'
import { adaptWsMessageToChatMessage } from '../../data/apiAdapters'
import type { ApiChat, ApiTransaction } from '../../data/types'
import ReviewModal from '../../components/ReviewModal/ReviewModal'
import './ChatDetailScreen.css'

const POLL_INTERVAL_MS = 3000

type ChatDetailScreenProps = {
  chatId: string
  onBack: () => void
}

function ChatDetailScreen({ chatId, onBack }: ChatDetailScreenProps) {
  const { 
    chats, 
    currentUserId, 
    replaceChatMessages, 
    addChatMessages, 
    deleteChat, 
    markChatAsRead,
    createTransaction,
    getTransactionByChat,
    approveTransaction,
    confirmTransaction,
    cancelTransaction,
  } = useDormShare()
  const [draft, setDraft] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [apiChatData, setApiChatData] = useState<ApiChat | null>(null)
  const [transaction, setTransaction] = useState<ApiTransaction | null>(null)
  const [isLoadingTransaction, setIsLoadingTransaction] = useState(false)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const lastPollTimestampRef = useRef<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Stable refs so effects don't re-trigger on every render
  const replaceChatMessagesRef = useRef(replaceChatMessages)
  replaceChatMessagesRef.current = replaceChatMessages
  const addChatMessagesRef = useRef(addChatMessages)
  addChatMessagesRef.current = addChatMessages
  const currentUserIdRef = useRef(currentUserId)
  currentUserIdRef.current = currentUserId
  const markChatAsReadRef = useRef(markChatAsRead)
  markChatAsReadRef.current = markChatAsRead

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  async function handleDeleteChat() {
    if (!chatId) return
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this chat? This will remove all messages from your inbox.'
    )
    if (!confirmDelete) return

    try {
      await deleteChat(chatId)
      onBack()
    } catch {
      alert('Failed to delete chat. Please try again.')
    }
  }

  const chat = chats.find((c) => c.id === chatId)
  const messages = chat?.messages ?? []
  const isSeller = transaction?.lender_id && currentUserId
    ? transaction.lender_id.toLowerCase() === currentUserId.toLowerCase()
    : apiChatData?.lender_id && currentUserId
    ? apiChatData.lender_id.toLowerCase() === currentUserId.toLowerCase()
    : false

  const isBorrower = transaction?.borrower_id && currentUserId
    ? transaction.borrower_id.toLowerCase() === currentUserId.toLowerCase()
    : apiChatData?.borrower_id && currentUserId
    ? apiChatData.borrower_id.toLowerCase() === currentUserId.toLowerCase()
    : false

  // ── Load full chat history on mount ─────────────────
  useEffect(() => {
    if (!chatId) return

    let cancelled = false

    async function loadHistory() {
      try {
        const apiChat = await apiGet<ApiChat>(`/chat/get/${chatId}`)
        if (cancelled) return
        setApiChatData(apiChat)

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

  // ── Load and sync Transaction progress ───────────────
  const getTransactionByChatRef = useRef(getTransactionByChat)
  getTransactionByChatRef.current = getTransactionByChat

  useEffect(() => {
    if (!chatId) return
    let active = true

    async function loadTransaction() {
      setIsLoadingTransaction(true)
      const tx = await getTransactionByChatRef.current(chatId)
      if (active) {
        setTransaction(tx)
        setIsLoadingTransaction(false)
      }
    }

    loadTransaction()
    return () => { active = false }
  }, [chatId])

  async function handleCreateTransaction() {
    setIsLoadingTransaction(true)
    try {
      const tx = await createTransaction(chatId)
      setTransaction(tx)
    } catch {
      alert('Failed to initiate transaction request. Please try again.')
    } finally {
      setIsLoadingTransaction(false)
    }
  }

  async function handleApproveTransaction() {
    if (!transaction) return
    setIsLoadingTransaction(true)
    try {
      const tx = await approveTransaction(transaction.id)
      setTransaction(tx)
    } catch {
      alert('Failed to approve transaction request.')
    } finally {
      setIsLoadingTransaction(false)
    }
  }

  async function handleConfirmTransaction() {
    if (!transaction) return
    setIsLoadingTransaction(true)
    try {
      const tx = await confirmTransaction(transaction.id)
      setTransaction(tx)
    } catch {
      alert('Failed to confirm delivery.')
    } finally {
      setIsLoadingTransaction(false)
    }
  }

  async function handleCancelTransaction() {
    if (!transaction) return
    const confirmCancel = window.confirm('Are you sure you want to cancel this transaction request?')
    if (!confirmCancel) return
    setIsLoadingTransaction(true)
    try {
      const tx = await cancelTransaction(transaction.id)
      setTransaction(tx)
    } catch {
      alert('Failed to cancel transaction.')
    } finally {
      setIsLoadingTransaction(false)
    }
  }

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
          markChatAsReadRef.current(chatId) // Keep last read timestamp current since user is actively viewing this screen!

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
          </div>
          <div>
            <h1>{chat.participant.name}</h1>
          </div>
        </div>

        <div className="chat-detail__menu-container" ref={menuRef}>
          <button
            type="button"
            className="chat-detail__menu"
            aria-label="Conversation actions"
            onClick={() => setIsMenuOpen(prev => !prev)}
          >
            <span className="material-symbols-rounded" aria-hidden="true">
              more_horiz
            </span>
          </button>
          {isMenuOpen && (
            <div className="chat-detail__dropdown">
              <button
                type="button"
                className="chat-detail__dropdown-item chat-detail__dropdown-item--danger"
                onClick={handleDeleteChat}
              >
                <span className="material-symbols-rounded" aria-hidden="true">
                  delete
                </span>
                Delete Chat
              </button>
            </div>
          )}
        </div>
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

      {/* ── Transaction Status Banner ───────────────── */}
      <section className="chat-detail__tx-banner" aria-label="Transaction progress">
        <div className="chat-detail__tx-content">
          <span className="material-symbols-rounded chat-detail__tx-icon" aria-hidden="true">
            {!transaction
              ? 'shopping_cart'
              : transaction.status === 'pending'
              ? 'hourglass_empty'
              : transaction.status === 'active'
              ? 'check_circle'
              : transaction.status === 'completed'
              ? 'celebration'
              : 'cancel'}
          </span>
          <div className="chat-detail__tx-text">
            {!transaction ? (
              <>
                <h3>Barter/Purchase Option</h3>
                <p>Ready to finalize the deal? Propose a transaction request.</p>
              </>
            ) : transaction.status === 'pending' ? (
              <>
                <h3>Pending Approval</h3>
                <p>{isSeller ? 'A buyer wants to trade for this item. Review below:' : 'Waiting for seller to approve your request.'}</p>
              </>
            ) : transaction.status === 'active' ? (
              <>
                <h3>Deal Active!</h3>
                <p>{isSeller
                  ? (transaction.lender_confirmation ? 'You confirmed! Waiting for buyer to confirm receipt.' : 'Sale approved! Waiting for buyer to receive item and confirm.')
                  : (transaction.borrower_confirmation ? 'You confirmed! Waiting for seller to confirm.' : 'Deal approved! Confirm once you have received the item.')
                }</p>
              </>
            ) : transaction.status === 'completed' ? (
              <>
                <h3>Transaction Completed!</h3>
                <p>Deal successfully completed. Leave a review to share your feedback!</p>
              </>
            ) : (
              <>
                <h3>Transaction Cancelled</h3>
                <p>This deal has been cancelled.</p>
              </>
            )}
          </div>
        </div>

        <div className="chat-detail__tx-actions">
          {!transaction ? (
            !isSeller && (
              <button
                type="button"
                className="chat-detail__tx-btn chat-detail__tx-btn--primary"
                onClick={handleCreateTransaction}
                disabled={isLoadingTransaction}
              >
                Propose Deal
              </button>
            )
          ) : transaction.status === 'pending' ? (
            isSeller ? (
              <>
                <button
                  type="button"
                  className="chat-detail__tx-btn chat-detail__tx-btn--success"
                  onClick={handleApproveTransaction}
                  disabled={isLoadingTransaction}
                >
                  Approve Deal
                </button>
                <button
                  type="button"
                  className="chat-detail__tx-btn chat-detail__tx-btn--danger"
                  onClick={handleCancelTransaction}
                  disabled={isLoadingTransaction}
                >
                  Decline
                </button>
              </>
            ) : (
              <p className="chat-detail__tx-hint">Waiting for seller&apos;s response…</p>
            )
          ) : transaction.status === 'active' ? (
            <>
              {!isSeller && (
                <button
                  type="button"
                  className="chat-detail__tx-btn chat-detail__tx-btn--success"
                  onClick={handleConfirmTransaction}
                  disabled={isLoadingTransaction || transaction.borrower_confirmation}
                >
                  {transaction.borrower_confirmation ? 'Confirmed ✓' : 'Confirm Received'}
                </button>
              )}
              {isSeller && (
                <button
                  type="button"
                  className="chat-detail__tx-btn chat-detail__tx-btn--success"
                  onClick={handleConfirmTransaction}
                  disabled={isLoadingTransaction || transaction.lender_confirmation}
                >
                  {transaction.lender_confirmation ? 'Confirmed ✓' : 'Confirm Handover'}
                </button>
              )}
            </>
          ) : transaction.status === 'completed' ? (
            isBorrower ? (
              <button
                type="button"
                className="chat-detail__tx-btn chat-detail__tx-btn--primary"
                onClick={() => setIsReviewModalOpen(true)}
              >
                Rate &amp; Review
              </button>
            ) : (
              <p className="chat-detail__tx-hint">Transaction complete!</p>
            )
          ) : null}
        </div>
      </section>

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

      {isReviewModalOpen && transaction && (
        <ReviewModal
          transactionId={transaction.id}
          onClose={() => setIsReviewModalOpen(false)}
        />
      )}
    </main>
  )
}

export default ChatDetailScreen
