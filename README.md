# DormShare Frontend

Mobile-first DormShare marketplace frontend built with React, TypeScript, and Vite.

The current frontend is a reference-driven prototype with fake data isolated behind one adapter boundary. The implemented app screens match the supplied mobile reference set structurally, but screenshot-level visual QA and tuning are still required before calling the UI final.

## Current Status

Implemented screens:

- Feed home
- Chats list
- Chat detail
- Sell flow: Details, Review, Posted
- Profile
- Edit Profile

Implemented foundations:

- Fixed bottom navigation
- Central CSS design-system tokens in `src/styles/design-system.css`
- Mock API boundary in `src/data/dormshareApi.ts`
- Local SVG listing assets in `src/assets/listings`

Still pending:

- Screenshot-level QA against `reference/*.jpg`
- Visual fidelity tuning after screenshot review
- Real backend API integration
- Auth/session state
- Real image upload behavior
- PWA manifest and installable app assets
- Route/deep-link support beyond local app state

## Commands

Install dependencies:

```bash
npm install
```

Start local dev server:

```bash
npm run dev -- --host 127.0.0.1
```

Build:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

## Project Structure

```text
src/
  assets/listings/        Local placeholder listing images
  components/             Reusable UI components
  data/                   Mock data, shared types, and API adapter
  screens/                Feature screens
  styles/design-system.css
```

Important files:

- `src/App.tsx`: local screen composition and navigation state
- `src/data/dormshareApi.ts`: UI-facing API boundary
- `src/data/mockDormshareApi.ts`: temporary fake backend adapter
- `docs/design/dormshare-mobile-ui-reference.md`: extracted visual design system
- `HANDOFF.md`: living frontend implementation status

## Fake Data Strategy

UI code should import from `src/data/dormshareApi.ts`, not directly from `mockData.ts`.

When the backend is ready, replace the implementation behind `dormshareApi` with HTTP calls while preserving the screen-facing method names and return shapes where possible.

Current methods include:

- `getCurrentUser()`
- `getCategories()`
- `getFeedItems()`
- `getChatSummaries()`
- `getChatDetail(chatId)`

## Reference Images

Reference screenshots live in `reference/`:

- `homescreen.jpg`
- `chats_screen.jpg`
- `live_chat.jpg`
- `listing_page1.jpg`
- `listing_page2.jpg`
- `listing_page3.jpg`
- `profile_page.jpg`
- `profile_edit_page.jpg`

Use `docs/design/dormshare-mobile-ui-reference.md` as the design-system source of truth until a formal design file exists.

## QA Notes

Build and lint are passing as of the latest handoff. Screenshot comparison has not been run yet.

Before claiming exact visual fidelity:

1. Start the dev server on `127.0.0.1`.
2. Capture mobile screenshots at the reference viewport.
3. Compare rendered screens against `reference/*.jpg`.
4. Tune spacing, typography, layout, and interaction states.
5. Update `HANDOFF.md` with QA evidence and remaining mismatches.
