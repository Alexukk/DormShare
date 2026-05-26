# DormShare — Transaction & Chat Flow

## Overview

Every rental deal happens inside a **Chat**. A chat is created between a Borrower and a Lender for a specific Item. The transaction lifecycle lives inside that chat.

---

## Roles

- **Lender** — the person who owns the item  
- **Borrower** — the person who wants to rent the item

---

## Transaction Lifecycle

pending → active → completing → completed

              ↓

          cancelled (only during pending)

### 1\. `pending`

- Borrower clicks **"Request to Borrow"** inside the chat  
- A `Transaction` is created in the DB with `status: pending`  
- WebSocket broadcasts `transaction_created` to the chat  
- **Lender sees:** a card with two buttons — **Accept** / **Decline**  
- **Borrower sees:** "Waiting for lender confirmation..."

### 2\. `active`

- Lender clicks **Accept**  
- `Transaction.status` → `active`  
- `Item.is_available` → `false`  
- WebSocket broadcasts `transaction_active` to the chat  
- **Both sides see:** a button **"Confirm End of Rental"**

### 3\. `completing`

- Either side clicks **"Confirm End of Rental"**  
- Their confirmation flag is set to `true` (`lender_confirmation` or `borrower_confirmation`)  
- WebSocket broadcasts `transaction_completing` to the chat  
- **The other side sees:** "Your partner wants to end the rental. Confirm?"

### 4\. `completed`

- Both confirmations are `true`  
- `Transaction.status` → `completed`  
- `Transaction.completed_at` → current timestamp  
- `Item.is_available` → `true`  
- WebSocket broadcasts `transaction_completed` to the chat  
- **Borrower sees:** a button **"Leave a Review"**  
- **Lender sees:** deal closed message

### Cancellation (only during `pending`)

- Lender clicks **Decline**  
- Transaction is deleted from DB  
- WebSocket broadcasts `transaction_cancelled` to the chat  
- Both sides return to normal chat view

---

## WebSocket Message Types

All transaction-related events are sent through the chat WebSocket alongside regular messages.

| type | triggered by | who acts |
| :---- | :---- | :---- |
| `transaction_created` | Borrower creates transaction | Lender sees Accept/Decline |
| `transaction_active` | Lender accepts | Both see "Confirm End" button |
| `transaction_completing` | One side confirms end | Other side sees confirmation request |
| `transaction_completed` | Both confirmed | Borrower sees "Leave Review" button |
| `transaction_cancelled` | Lender declines | Both return to normal chat |

---

## Review

- Only **Borrower** can leave a review  
- Only allowed when `Transaction.status == completed`  
- Strictly tied to `transaction_id` — one review per transaction  
- Contains: `stars_amount` (1–5) and `text`

---

## API Endpoints

POST /transaction/create              \# Borrower initiates, status: pending

POST /transaction/{id}/approve        \# Lender accepts, status: active

POST /transaction/{id}/confirm-end    \# Either side confirms end

POST /transaction/{id}/cancel         \# Lender declines, deletes transaction

GET  /transaction/{id}                \# Get transaction details

POST /review/create                   \# Borrower only, completed transactions only

---

## Key Rules

- Only **one active transaction per chat** at a time  
- `Item.is_available` is automatically managed by transaction status  
- A review can only be submitted **once** per transaction  
- Lender cannot decline after status is `active`

