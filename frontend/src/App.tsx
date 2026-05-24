import { useState, useEffect } from 'react'
import { DormShareProvider, useDormShare } from './data/DormShareContext'
import type { BottomNavItem } from './components/BottomNav/BottomNav'
import ChatDetailScreen from './screens/ChatDetailScreen/ChatDetailScreen'
import ChatsScreen from './screens/ChatsScreen/ChatsScreen'
import FeedScreen from './screens/FeedScreen/FeedScreen'
import ProfileScreen from './screens/ProfileScreen/ProfileScreen'
import SellScreen from './screens/SellScreen/SellScreen'
import ListingDetailScreen from './screens/ListingDetailScreen/ListingDetailScreen'
import NotificationDrawer from './components/NotificationDrawer/NotificationDrawer'
import './App.css'

type AppScreen = BottomNavItem | 'chat-detail' | 'listing-detail'

function AppContent() {
  const [activeScreen, setActiveScreen] = useState<AppScreen>('feed')
  const [selectedChatId, setSelectedChatId] = useState('chat-emily-chen')
  const [selectedListingId, setSelectedListingId] = useState('')
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false)
  const { markChatAsRead } = useDormShare()

  useEffect(() => {
    const handleOpenListingEvent = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      if (customEvent.detail) {
        handleOpenListing(customEvent.detail)
      }
    }
    window.addEventListener('open-listing-details', handleOpenListingEvent)
    return () => {
      window.removeEventListener('open-listing-details', handleOpenListingEvent)
    }
  }, [])

  useEffect(() => {
    const handleOpenNotifDrawer = () => {
      setShowNotificationDrawer(true)
    }
    window.addEventListener('open-notification-drawer', handleOpenNotifDrawer)
    return () => {
      window.removeEventListener('open-notification-drawer', handleOpenNotifDrawer)
    }
  }, [])

  function handleNavigate(item: BottomNavItem) {
    setActiveScreen(item)
  }

  function handleOpenChat(chatId: string) {
    setSelectedChatId(chatId)
    markChatAsRead(chatId)
    setActiveScreen('chat-detail')
  }

  function handleOpenListing(listingId: string) {
    setSelectedListingId(listingId)
    setActiveScreen('listing-detail')
  }

  return (
    <>
      {activeScreen === 'listing-detail' && (
        <ListingDetailScreen
          listingId={selectedListingId}
          onBack={() => setActiveScreen('feed')}
          onOpenChat={handleOpenChat}
        />
      )}

      {activeScreen === 'chat-detail' && (
        <ChatDetailScreen
          chatId={selectedChatId}
          onBack={() => setActiveScreen('chats')}
        />
      )}

      {activeScreen === 'chats' && (
        <ChatsScreen onNavigate={handleNavigate} onOpenChat={handleOpenChat} />
      )}

      {activeScreen === 'sell' && (
        <SellScreen onNavigate={handleNavigate} />
      )}

      {activeScreen === 'profile' && (
        <ProfileScreen onNavigate={handleNavigate} />
      )}

      {activeScreen === 'feed' && (
        <FeedScreen onNavigate={handleNavigate} onOpenListing={handleOpenListing} />
      )}

      {/* Slide-in notifications drawer overlay */}
      {showNotificationDrawer && (
        <NotificationDrawer
          onClose={() => setShowNotificationDrawer(false)}
          onOpenListing={handleOpenListing}
          onOpenChat={handleOpenChat}
        />
      )}
    </>
  )
}

function App() {
  return (
    <DormShareProvider>
      <AppContent />
    </DormShareProvider>
  )
}

export default App
