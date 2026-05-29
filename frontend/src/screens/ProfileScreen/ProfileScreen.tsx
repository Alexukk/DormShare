import { useState, useMemo } from 'react'
import type { BottomNavItem } from '../../components/BottomNav/BottomNav'
import BottomNav from '../../components/BottomNav/BottomNav'
import { useDormShare } from '../../data/DormShareContext'
import type { ProfileForm } from '../../data/types'
import { getInitials } from '../../utils'
import './ProfileScreen.css'

type ProfileScreenProps = {
  onNavigate?: (item: BottomNavItem) => void
}

const listingTabs = [
  { id: 'all', label: 'All', icon: 'grid_view' },
  { id: 'rented', label: 'Rented', icon: 'schedule' },
]

function ProfileScreen({ onNavigate }: ProfileScreenProps) {
  const { items, currentUserProfile, updateProfile, isInstallable, triggerInstallPrompt, currentUserId } = useDormShare()
  const [mode, setMode] = useState<'profile' | 'edit'>('profile')
  const [selectedTab, setSelectedTab] = useState('all')

  // Find items owned by the current logged-in user (Andrew)
  const myItems = useMemo(() => {
    return items.filter((item) => item.owner_id === currentUserId)
  }, [items, currentUserId])

  // Filter listings based on tabs (Mock support: rented is empty for now)
  const visibleMyItems = useMemo(() => {
    if (selectedTab === 'rented') {
      return [] // Pre-loaded rented mock list is empty initially
    }
    return myItems
  }, [myItems, selectedTab])

  if (mode === 'edit') {
    return (
      <EditProfileView
        initialProfile={currentUserProfile}
        onSave={(updatedProfile) => {
          updateProfile(updatedProfile)
          setMode('profile')
        }}
        onBack={() => setMode('profile')}
        onNavigate={onNavigate}
      />
    )
  }

  return (
    <main className="profile-screen" aria-label="Profile">
      <header className="profile-screen__header">
        <h1>Profile</h1>
      </header>

      <section className="profile-screen__summary" aria-label="Profile summary">
        <ProfileAvatar size="large" initials={getInitials(currentUserProfile.name)} />
        <div>
          <h2>{currentUserProfile.name}</h2>
          <p>{myItems.length} {myItems.length === 1 ? 'Listing' : 'Listings'}</p>
        </div>
      </section>

      <button
        type="button"
        className="profile-row profile-row--edit"
        onClick={() => setMode('edit')}
      >
        <span className="profile-row__icon">
          <span className="material-symbols-rounded" aria-hidden="true">
            person
          </span>
        </span>
        <span>Edit profile</span>
        <span className="material-symbols-rounded" aria-hidden="true">
          chevron_right
        </span>
      </button>

      <section className="profile-screen__listings" aria-label="My listings">
        <h2>My Listings</h2>
        <div className="profile-screen__tabs" role="tablist" aria-label="Listing filters">
          {listingTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selectedTab === tab.id}
              onClick={() => setSelectedTab(tab.id)}
            >
              <span className="material-symbols-rounded" aria-hidden="true">
                {tab.icon}
              </span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {visibleMyItems.length > 0 ? (
          <div className="profile-screen__grid">
            {visibleMyItems.map((item) => (
              <div 
                key={item.id} 
                className="profile-item-card"
                onClick={() => {
                  const clickEvent = new CustomEvent('open-listing-details', { detail: item.id })
                  window.dispatchEvent(clickEvent)
                }}
              >
                <img 
                  src={item.images[0]?.photo_url} 
                  alt={item.title} 
                />
                <div className="profile-item-card__copy">
                  <h3>{item.title}</h3>
                  <strong>{item.price}</strong>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="profile-screen__empty">
            <span className="profile-screen__empty-icon">
              <span className="material-symbols-rounded" aria-hidden="true">
                shopping_bag
              </span>
            </span>
            <h3>No listings yet</h3>
            <p>Items you post will appear here.</p>
          </div>
        )}
      </section>

      {isInstallable && (
        <button
          type="button"
          className="profile-row profile-row--install"
          onClick={triggerInstallPrompt}
        >
          <span className="profile-row__icon">
            <span className="material-symbols-rounded" aria-hidden="true">
              download_for_offline
            </span>
          </span>
          <span className="profile-row__install-content">
            <strong>Install DormShare App</strong>
            <small>Add to home screen for native access</small>
          </span>
          <span className="material-symbols-rounded" aria-hidden="true">
            chevron_right
          </span>
        </button>
      )}

      <BottomNav activeItem="profile" onSelect={onNavigate} />
    </main>
  )
}

type EditProfileViewProps = {
  initialProfile: ProfileForm
  onSave: (profile: ProfileForm) => void
  onBack: () => void
  onNavigate?: (item: BottomNavItem) => void
}

function EditProfileView({
  initialProfile,
  onSave,
  onBack,
  onNavigate,
}: EditProfileViewProps) {
  const [profile, setProfile] = useState<ProfileForm>(initialProfile)
  const { logout } = useDormShare()

  function updateField(field: keyof ProfileForm, value: string) {
    setProfile((current) => ({ ...current, [field]: value }))
  }

  function handleSave() {
    onSave(profile)
  }

  return (
    <main className="profile-screen profile-screen--edit" aria-label="Edit profile">
      <header className="profile-screen__edit-topbar">
        <button type="button" onClick={onBack} aria-label="Back to profile">
          <span className="material-symbols-rounded" aria-hidden="true">
            arrow_back
          </span>
        </button>
        <button type="button" className="profile-screen__save" onClick={handleSave}>
          Save
        </button>
      </header>

      <h1>Edit profile</h1>

      <section className="profile-screen__photo-editor" aria-label="Profile photo">
        <div className="profile-screen__photo-wrap">
          <ProfileAvatar size="edit" initials={getInitials(profile.name)} />
        </div>
      </section>

      <section className="profile-screen__form" aria-label="Profile fields">
        <EditField
          icon="person"
          label="Name"
          value={profile.name}
          onChange={(value) => updateField('name', value)}
        />
        <EditField
          icon="mail"
          label="Email"
          value={profile.email}
          onChange={(value) => updateField('email', value)}
        />
        <EditField
          icon="school"
          label="School (Optional)"
          value={profile.school}
          onChange={(value) => updateField('school', value)}
        />
      </section>

      <section className="profile-screen__account" aria-label="Account">
        <h2>Account</h2>
        <AccountRow
          icon="delete"
          title="Delete account"
          body="Permanently delete your account"
          onClick={() => {
            if (confirm("Are you sure you want to permanently delete your student account? This action is non-reversible.")) {
              alert("Simulation: Student account successfully marked for termination.")
            }
          }}
          danger
        />
        <AccountRow
          icon="logout"
          title="Sign out"
          body="Log out of your DormShare account"
          onClick={() => logout()}
        />
      </section>

      <BottomNav activeItem="profile" onSelect={onNavigate} />
    </main>
  )
}

type ProfileAvatarProps = {
  size: 'large' | 'edit'
  initials: string
}

function ProfileAvatar({ size, initials }: ProfileAvatarProps) {
  return (
    <div className={`profile-avatar profile-avatar--${size}`} aria-hidden="true">
      <span>{initials}</span>
    </div>
  )
}

type EditFieldProps = {
  icon: string
  label: string
  value: string
  placeholder?: string
  maxLength?: number
  onChange: (value: string) => void
}

function EditField({
  icon,
  label,
  value,
  placeholder,
  maxLength,
  onChange,
}: EditFieldProps) {
  return (
    <label className="profile-edit-field">
      <span className="profile-edit-field__icon">
        <span className="material-symbols-rounded" aria-hidden="true">
          {icon}
        </span>
      </span>
      <span className="profile-edit-field__control">
        <span>{label}</span>
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          maxLength={maxLength}
          onChange={(event) => onChange(event.target.value)}
        />
      </span>
      {maxLength ? (
        <span className="profile-edit-field__count">
          {value.length}/{maxLength}
        </span>
      ) : null}
    </label>
  )
}

type AccountRowProps = {
  icon: string
  title: string
  body: string
  onClick?: () => void
  danger?: boolean
}

function AccountRow({ icon, title, body, onClick, danger = false }: AccountRowProps) {
  return (
    <button
      type="button"
      className={`profile-row profile-row--account ${
        danger ? 'profile-row--danger' : ''
      }`}
      onClick={onClick}
    >
      <span className="profile-row__icon">
        <span className="material-symbols-rounded" aria-hidden="true">
          {icon}
        </span>
      </span>
      <span>
        <strong>{title}</strong>
        <small>{body}</small>
      </span>
      <span className="material-symbols-rounded" aria-hidden="true">
        chevron_right
      </span>
    </button>
  )
}

export default ProfileScreen
