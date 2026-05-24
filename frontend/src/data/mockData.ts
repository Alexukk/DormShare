import deskChairImage from '../assets/listings/desk-chair.svg'
import headphonesImage from '../assets/listings/headphones.svg'
import lampImage from '../assets/listings/lamp.svg'
import microwaveImage from '../assets/listings/microwave.svg'
import miniFridgeImage from '../assets/listings/mini-fridge.svg'
import textbooksImage from '../assets/listings/textbooks.svg'
import type {
  ChatDetail,
  ChatSummary,
  CurrentUser,
  FeedCategory,
  FeedItem,
} from './types'

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

export const mockChatSummaries: ChatSummary[] = [
  {
    id: 'chat-emily-chen',
    participant: {
      id: 'user-emily',
      name: 'Emily Chen',
      initials: 'EC',
      isOnline: true,
    },
    lastMessage: 'Yes that works! Where should we meet?',
    timestampLabel: '10:39 AM',
    unreadCount: 2,
    isArchived: false,
  },
  {
    id: 'chat-alex-rivera',
    participant: {
      id: 'user-alex',
      name: 'Alex Rivera',
      initials: 'AR',
      isOnline: false,
    },
    lastMessage: "Perfect, I'll grab it then. Thanks!",
    timestampLabel: 'Yesterday',
    unreadCount: 1,
    isArchived: false,
  },
  {
    id: 'chat-sophie-kim',
    participant: {
      id: 'user-sophie-kim',
      name: 'Sophie Kim',
      initials: 'SK',
      isOnline: false,
    },
    lastMessage: 'Is it still available?',
    timestampLabel: 'Yesterday',
    unreadCount: 0,
    isArchived: false,
  },
  {
    id: 'chat-jordan-lee',
    participant: {
      id: 'user-jordan',
      name: 'Jordan Lee',
      initials: 'JL',
      isOnline: false,
    },
    lastMessage: 'Sounds good, see you tomorrow!',
    timestampLabel: 'Sun',
    unreadCount: 0,
    isArchived: false,
  },
  {
    id: 'chat-maya-patel',
    participant: {
      id: 'user-maya-patel',
      name: 'Maya Patel',
      initials: 'MP',
      isOnline: false,
    },
    lastMessage: 'Okay, no problem!',
    timestampLabel: 'Sat',
    unreadCount: 0,
    isArchived: false,
  },
  {
    id: 'chat-chris-wu',
    participant: {
      id: 'user-chris',
      name: 'Chris Wu',
      initials: 'CW',
      isOnline: false,
    },
    lastMessage: 'Thanks again!',
    timestampLabel: 'Fri',
    unreadCount: 0,
    isArchived: true,
  },
  {
    id: 'chat-noah-thompson',
    participant: {
      id: 'user-noah-thompson',
      name: 'Noah Thompson',
      initials: 'NT',
      isOnline: false,
    },
    lastMessage: 'Do you have any more photos?',
    timestampLabel: 'Fri',
    unreadCount: 1,
    isArchived: false,
  },
  {
    id: 'chat-hannah-brown',
    participant: {
      id: 'user-hannah-brown',
      name: 'Hannah Brown',
      initials: 'HB',
      isOnline: false,
    },
    lastMessage: "Thanks! I'll let you know.",
    timestampLabel: 'Thu',
    unreadCount: 0,
    isArchived: true,
  },
]

export const mockChatDetails: ChatDetail[] = [
  {
    id: 'chat-emily-chen',
    participant: {
      id: 'user-emily',
      name: 'Emily Chen',
      initials: 'EC',
      isOnline: true,
    },
    listing: {
      id: 'item-desk-chair',
      title: 'IKEA Desk + Chair',
      price: '$120',
      category: 'Furniture',
      image: {
        id: 'image-desk-chair',
        photo_url: deskChairImage,
        alt: 'Wooden dorm desk with chair by a bright window',
      },
    },
    dateLabel: 'Today',
    messages: [
      {
        id: 'message-1',
        sender: 'them',
        content: 'Hi! Is this desk and chair still available?',
        timestampLabel: '10:32 AM',
      },
      {
        id: 'message-2',
        sender: 'me',
        content: "Hi Emily! Yes, it's still available.",
        timestampLabel: '10:33 AM',
        status: 'read',
      },
      {
        id: 'message-3',
        sender: 'them',
        content: 'Great! Could you tell me the dimensions of the desk?',
        timestampLabel: '10:35 AM',
      },
      {
        id: 'message-4',
        sender: 'me',
        content:
          'Of course! The desk is 47" wide, 23 5/8" deep, and 29 1/8" tall.',
        timestampLabel: '10:36 AM',
        status: 'read',
      },
      {
        id: 'message-5',
        sender: 'them',
        content: 'Thanks! Would you be available tomorrow afternoon to meet?',
        timestampLabel: '10:37 AM',
      },
      {
        id: 'message-6',
        sender: 'me',
        content: "Yes, I'm free after 2pm tomorrow. Does that work for you?",
        timestampLabel: '10:38 AM',
        status: 'read',
      },
      {
        id: 'message-7',
        sender: 'them',
        content: 'Yes that works! Where should we meet?',
        timestampLabel: '10:39 AM',
      },
      {
        id: 'message-8',
        sender: 'me',
        content: 'How about the student union lobby at 2:15pm?',
        timestampLabel: '10:40 AM',
        status: 'read',
      },
    ],
  },
]
