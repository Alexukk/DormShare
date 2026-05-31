import { useState, useEffect } from 'react'
import { DormShareProvider, useDormShare } from './data/DormShareContext'
import type { BottomNavItem } from './components/BottomNav/BottomNav'
import AuthScreen from './screens/AuthScreen/AuthScreen'
import ChatDetailScreen from './screens/ChatDetailScreen/ChatDetailScreen'
import ChatsScreen from './screens/ChatsScreen/ChatsScreen'
import FeedScreen from './screens/FeedScreen/FeedScreen'
import ProfileScreen from './screens/ProfileScreen/ProfileScreen'
import SellScreen from './screens/SellScreen/SellScreen'
import ListingDetailScreen from './screens/ListingDetailScreen/ListingDetailScreen'
type AppScreen = BottomNavItem | 'chat-detail' | 'listing-detail'

function LoadingScreen() {
  return (
    <main className="loading-screen" aria-label="Loading DormShare">
      <div className="loading-screen__content">
        <div className="loading-screen__logo">
          <img src="/logo.png?v=3" alt="DormShare logo" className="loading-screen__logo-img" />
        </div>
        <h1>DormShare</h1>
        <div className="loading-screen__spinner" />
      </div>
    </main>
  )
}

function AppContent() {
  const { isAuthenticated, isLoading } = useDormShare()

  if (!isAuthenticated) {
    return <AuthScreen />
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  return <AppShell />
}

function AppShell() {
  const [activeScreen, setActiveScreen] = useState<AppScreen>('feed')
  const [selectedChatId, setSelectedChatId] = useState('')
  const [selectedListingId, setSelectedListingId] = useState('')
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
