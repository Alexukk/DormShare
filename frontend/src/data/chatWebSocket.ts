/**
 * WebSocket manager for real-time chat messaging.
 *
 * Connects to: ws://<API_URL>/chat/ws/{chatId}?token=<jwt>
 * Incoming event types: "history", "message", "transaction_*"
 */

import { API_BASE } from './apiClient'

export type WsChatMessage = {
  id: string
  content: string
  sender_id: string
  timestamp: string
  is_viewed: boolean
  reaction: string | null
}

export type WsHistoryEvent = {
  type: 'history'
  messages: WsChatMessage[]
}

export type WsMessageEvent = {
  type: 'message'
  id: string
  content: string
  sender_id: string
  timestamp: string
  is_viewed: boolean
  reaction: string | null
}

export type WsTransactionEvent = {
  type: 'transaction_created' | 'transaction_active' | 'transaction_completed' | 'transaction_cancelled' | 'transaction_completing'
  transaction_id: string
}

export type WsEvent = WsHistoryEvent | WsMessageEvent | WsTransactionEvent

export type ChatWsCallbacks = {
  onHistory: (messages: WsChatMessage[]) => void
  onMessage: (message: WsChatMessage) => void
  onTransaction?: (event: WsTransactionEvent) => void
  onOpen?: () => void
  onClose?: () => void
  onError?: (error: Event) => void
}

/**
 * Connect to a chat WebSocket. Returns the WebSocket instance.
 * Call ws.close() to disconnect.
 */
export function connectChatWebSocket(
  chatId: string,
  token: string,
  callbacks: ChatWsCallbacks,
): WebSocket {
  // Convert http(s) to ws(s)
  const wsBase = API_BASE.replace(/^http/, 'ws')
  const url = `${wsBase}/chat/ws/${chatId}?token=${token}`

  const ws = new WebSocket(url)

  ws.onopen = () => {
    callbacks.onOpen?.()
  }

  ws.onclose = () => {
    callbacks.onClose?.()
  }

  ws.onerror = (e) => {
    callbacks.onError?.(e)
  }

  ws.onmessage = (event) => {
    try {
      const data: WsEvent = JSON.parse(event.data)

      switch (data.type) {
        case 'history':
          callbacks.onHistory(data.messages)
          break

        case 'message':
          callbacks.onMessage({
            id: data.id,
            content: data.content,
            sender_id: data.sender_id,
            timestamp: data.timestamp,
            is_viewed: data.is_viewed,
            reaction: data.reaction,
          })
          break

        case 'transaction_created':
        case 'transaction_active':
        case 'transaction_completed':
        case 'transaction_cancelled':
        case 'transaction_completing':
          callbacks.onTransaction?.(data)
          break
      }
    } catch {
      // ignore malformed messages
    }
  }

  return ws
}

/** Send a chat message over an open WebSocket */
export function sendWsChatMessage(ws: WebSocket, content: string): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ content }))
  }
}
