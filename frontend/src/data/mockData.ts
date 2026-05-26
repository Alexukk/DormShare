import deskChairImage from '../assets/listings/desk-chair.svg'
import headphonesImage from '../assets/listings/headphones.svg'
import lampImage from '../assets/listings/lamp.svg'
import microwaveImage from '../assets/listings/microwave.svg'
import miniFridgeImage from '../assets/listings/mini-fridge.svg'
import textbooksImage from '../assets/listings/textbooks.svg'
import type { CurrentUser, FeedCategory, FeedItem } from './types'

export const mockCurrentUser: CurrentUser = {
  id: 'user-andrew',
  firstName: 'Andrew',
  notificationCount: 3,
}

export const mockCategories: FeedCategory[] = [
  { id: 'all', label: 'All', icon: 'grid_view' },
  { id: 'electronics', label: 'Electronics', icon: 'desktop_windows' },
  { id: 'books', label: 'Books', icon: 'menu_book' },
  { id: 'furniture', label: 'Furniture', icon: 'chair' },
  { id: 'appliances', label: 'Appliances', icon: 'kitchen' },
  { id: 'other', label: 'More', icon: 'expand_more' },
]

export const mockFeedItems: FeedItem[] = [
  {
    id: 'item-desk-chair',
    title: 'IKEA Desk + Chair',
    description:
      'Well-maintained IKEA desk and ergonomic chair. Great for small dorm rooms.',
    price: '$120',
    trade_type: 'Negotiable',
    category: 'furniture',
    is_available: true,
    created_at: '2026-05-21T08:30:00.000Z',
    owner_id: 'user-jake',
    owner: {
      id: 'user-jake',
      name: 'Jake M.',
      initials: 'JM',
      isOnline: true,
    },
    images: [
      {
        id: 'image-desk-chair',
        photo_url: deskChairImage,
        alt: 'Wooden dorm desk with chair by a bright window',
      },
    ],
    isNew: true,
  },
  {
    id: 'item-headphones',
    title: 'Sony WH-1000XM5 Headphones',
    description: 'Noise-canceling headphones in excellent condition.',
    price: '$180',
    trade_type: 'Cash',
    category: 'electronics',
    is_available: true,
    created_at: '2026-05-20T19:15:00.000Z',
    owner_id: 'user-sophie',
    owner: {
      id: 'user-sophie',
      name: 'Sophie L.',
      initials: 'SL',
      isOnline: true,
    },
    images: [
      {
        id: 'image-headphones',
        photo_url: headphonesImage,
        alt: 'Black over-ear headphones on a clean desk',
      },
    ],
  },
  {
    id: 'item-textbooks',
    title: 'NYU Textbook Bundle',
    description: 'Calculus, economics, chemistry, and psychology textbooks.',
    price: '$60',
    trade_type: 'Cash',
    category: 'books',
    is_available: true,
    created_at: '2026-05-20T12:45:00.000Z',
    owner_id: 'user-ethan',
    owner: {
      id: 'user-ethan',
      name: 'Ethan W.',
      initials: 'EW',
      isOnline: true,
    },
    images: [
      {
        id: 'image-textbooks',
        photo_url: textbooksImage,
        alt: 'Stack of college textbooks on a dorm desk',
      },
    ],
  },
  {
    id: 'item-mini-fridge',
    title: 'Mini Fridge - Great Condition',
    description: 'Compact mini fridge, perfect for drinks and snacks.',
    price: '$90',
    trade_type: 'Negotiable',
    category: 'appliances',
    is_available: true,
    created_at: '2026-05-19T16:10:00.000Z',
    owner_id: 'user-maya',
    owner: {
      id: 'user-maya',
      name: 'Maya K.',
      initials: 'MK',
      isOnline: true,
    },
    images: [
      {
        id: 'image-mini-fridge',
        photo_url: miniFridgeImage,
        alt: 'Black mini fridge in a dorm room',
      },
    ],
  },
  {
    id: 'item-microwave',
    title: 'Dorm Microwave',
    description: 'Clean microwave with simple controls and plenty of space.',
    price: '$45',
    trade_type: 'Cash',
    category: 'appliances',
    is_available: true,
    created_at: '2026-05-18T14:25:00.000Z',
    owner_id: 'user-noah',
    owner: {
      id: 'user-noah',
      name: 'Noah T.',
      initials: 'NT',
      isOnline: false,
    },
    images: [
      {
        id: 'image-microwave',
        photo_url: microwaveImage,
        alt: 'White microwave on a dorm shelf',
      },
    ],
  },
  {
    id: 'item-lamp',
    title: 'Blue Desk Lamp',
    description: 'Adjustable lamp with a bright reading light.',
    price: '$25',
    trade_type: 'Cash',
    category: 'other',
    is_available: true,
    created_at: '2026-05-18T09:00:00.000Z',
    owner_id: 'user-hannah',
    owner: {
      id: 'user-hannah',
      name: 'Hannah B.',
      initials: 'HB',
      isOnline: true,
    },
    images: [
      {
        id: 'image-lamp',
        photo_url: lampImage,
        alt: 'Blue adjustable desk lamp on a tidy desk',
      },
    ],
  },
]
