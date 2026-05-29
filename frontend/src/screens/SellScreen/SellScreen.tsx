import { useMemo, useState, useRef } from 'react'
import type { BottomNavItem } from '../../components/BottomNav/BottomNav'
import BottomNav from '../../components/BottomNav/BottomNav'
import NotificationButton from '../../components/NotificationButton/NotificationButton'
import { useDormShare } from '../../data/DormShareContext'
import './SellScreen.css'

type SellScreenProps = {
  onNavigate?: (item: BottomNavItem) => void
}

type SellStep = 'details' | 'review' | 'posted'

type ListingDraft = {
  title: string
  description: string
  price: string
  priceMode: string
  category: string
  condition: string
  images: string[] // Local object URLs or static SVGs
}

const categoryOptions = [
  { id: 'electronics', label: 'Electronics', icon: 'desktop_windows' },
  { id: 'furniture', label: 'Furniture', icon: 'chair' },
  { id: 'books', label: 'Books', icon: 'menu_book' },
  { id: 'appliances', label: 'Appliances', icon: 'kitchen' },
  { id: 'food', label: 'Food', icon: 'restaurant' },
  { id: 'sports', label: 'Sports Equipment', icon: 'sports_soccer' },
  { id: 'clothing', label: 'Clothing', icon: 'checkroom' },
  { id: 'other', label: 'Other', icon: 'more_horiz' },
]

const conditionOptions = [
  { id: 'New', label: 'Brand New', subLabel: 'Unopened, original packaging' },
  { id: 'Like New', label: 'Like New', subLabel: 'Excellent condition, minimal usage' },
  { id: 'Good', label: 'Good', subLabel: 'Fully functional, minor cosmetic wear' },
  { id: 'Fair', label: 'Fair', subLabel: 'Shows visible wear, but works fine' },
]

const priceModeOptions = [
  { id: 'Price is negotiable', label: 'Negotiable', subLabel: 'Open to reasonable offers' },
  { id: 'Fixed price', label: 'Fixed Price', subLabel: 'Strictly cash, no negotiation' },
  { id: 'Open to barter', label: 'Barter / Trade', subLabel: 'Willing to swap for other items' },
  { id: 'Free / Giveaway', label: 'Free', subLabel: 'Giving away to fellow students' },
]

const initialDraft: ListingDraft = {
  title: '',
  description: '',
  price: '',
  priceMode: 'Price is negotiable',
  category: 'electronics',
  condition: 'Good',
  images: [],
}

const stepItems: Array<{ id: SellStep; label: string; number: number }> = [
  { id: 'details', label: 'Details', number: 1 },
  { id: 'review', label: 'Review', number: 2 },
  { id: 'posted', label: 'Post', number: 3 },
]

function getStepIndex(step: SellStep) {
  return stepItems.findIndex((item) => item.id === step)
}

function SellScreen({ onNavigate }: SellScreenProps) {
  const { addItem, notificationCount } = useDormShare()
  const [step, setStep] = useState<SellStep>('details')
  const [draft, setDraft] = useState<ListingDraft>(initialDraft)
  const [newPostedId, setNewPostedId] = useState('')
  const [isPosting, setIsPosting] = useState(false)

  const [showConditionSheet, setShowConditionSheet] = useState(false)
  const [showPriceModeSheet, setShowPriceModeSheet] = useState(false)

  const currentStepIndex = getStepIndex(step)
  const selectedCategory = useMemo(
    () =>
      categoryOptions.find((category) => category.id === draft.category) ??
      categoryOptions[2],
    [draft.category],
  )

  function updateDraft(field: keyof ListingDraft, value: string | string[]) {
    setDraft((currentDraft) => ({ ...currentDraft, [field]: value }))
  }

  async function handlePost() {
    setIsPosting(true)
    try {
      // Add item to database via API
      const createdId = await addItem(draft)
      setNewPostedId(createdId)
      setStep('posted')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to post listing. Please try again.')
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <main className="sell-screen" aria-label="Sell an item">
      <header className="sell-screen__header">
        <div>
          <h1>Sell an item</h1>
          <p>
            {step === 'details'
              ? 'List your item and reach other students.'
              : step === 'review'
                ? 'Review your listing before posting.'
                : ''}
          </p>
        </div>
        <NotificationButton count={notificationCount} />
      </header>

      <SellProgress currentStepIndex={currentStepIndex} />

      {step === 'details' ? (
        <DetailsStep
          draft={draft}
          onUpdate={updateDraft}
          onContinue={() => setStep('review')}
          onOpenCondition={() => setShowConditionSheet(true)}
          onOpenPriceMode={() => setShowPriceModeSheet(true)}
        />
      ) : null}

      {step === 'review' ? (
        <ReviewStep
          draft={draft}
          categoryLabel={selectedCategory.label}
          onEdit={() => setStep('details')}
          onPost={handlePost}
          isPosting={isPosting}
        />
      ) : null}

      {step === 'posted' ? (
        <PostedStep 
          draft={draft} 
          categoryLabel={selectedCategory.label} 
          onOpenPostedListing={() => {
            if (newPostedId && onNavigate) {
              // Trigger app level navigation by looking up details
              onNavigate('feed')
              // Simulating opening the details for this item
              setTimeout(() => {
                const clickEvent = new CustomEvent('open-listing-details', { detail: newPostedId })
                window.dispatchEvent(clickEvent)
              }, 100)
            }
          }}
        />
      ) : null}

      {/* 7. Bottom sheets overlays */}
      {showConditionSheet && (
        <div className="sell-sheet-backdrop" onClick={() => setShowConditionSheet(false)}>
          <div className="sell-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sell-sheet__header">
              <h3>Select Condition</h3>
              <button className="sell-sheet__close" onClick={() => setShowConditionSheet(false)}>
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>
            <div className="sell-sheet__options">
              {conditionOptions.map((opt) => (
                <button
                  key={opt.id}
                  className={`sell-sheet__option ${draft.condition === opt.id ? 'sell-sheet__option--selected' : ''}`}
                  onClick={() => {
                    updateDraft('condition', opt.id)
                    setShowConditionSheet(false)
                  }}
                >
                  <span className="sell-sheet__option-icon">
                    <span className="material-symbols-rounded">sell</span>
                  </span>
                  <div>
                    <strong>{opt.label}</strong>
                    <small>{opt.subLabel}</small>
                  </div>
                  <span className="material-symbols-rounded sell-sheet__option-check">check_circle</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showPriceModeSheet && (
        <div className="sell-sheet-backdrop" onClick={() => setShowPriceModeSheet(false)}>
          <div className="sell-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sell-sheet__header">
              <h3>Select Trade Mode</h3>
              <button className="sell-sheet__close" onClick={() => setShowPriceModeSheet(false)}>
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>
            <div className="sell-sheet__options">
              {priceModeOptions.map((opt) => (
                <button
                  key={opt.id}
                  className={`sell-sheet__option ${draft.priceMode === opt.id ? 'sell-sheet__option--selected' : ''}`}
                  onClick={() => {
                    updateDraft('priceMode', opt.id)
                    // If trade mode is free, set price to 0 automatically
                    if (opt.id === 'Free / Giveaway') {
                      updateDraft('price', '0')
                    }
                    setShowPriceModeSheet(false)
                  }}
                >
                  <span className="sell-sheet__option-icon">
                    <span className="material-symbols-rounded">attach_money</span>
                  </span>
                  <div>
                    <strong>{opt.label}</strong>
                    <small>{opt.subLabel}</small>
                  </div>
                  <span className="material-symbols-rounded sell-sheet__option-check">check_circle</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <BottomNav activeItem="sell" onSelect={onNavigate} />
    </main>
  )
}

type ProgressProps = {
  currentStepIndex: number
}

function SellProgress({ currentStepIndex }: ProgressProps) {
  return (
    <ol className="sell-screen__progress" aria-label="Listing progress">
      {stepItems.map((item, index) => {
        const isComplete = currentStepIndex === 2 || index < currentStepIndex
        const isCurrent = index === currentStepIndex

        return (
          <li
            key={item.id}
            className={`sell-screen__progress-item ${
              isCurrent ? 'sell-screen__progress-item--current' : ''
            } ${isComplete ? 'sell-screen__progress-item--complete' : ''}`}
          >
            <span className="sell-screen__progress-line" aria-hidden="true" />
            <span className="sell-screen__progress-dot">
              {isComplete ? (
                <span className="material-symbols-rounded" aria-hidden="true">
                  check
                </span>
              ) : (
                item.number
              )}
            </span>
            <span className="sell-screen__progress-label">{item.label}</span>
          </li>
        )
      })}
    </ol>
  )
}

type DetailsStepProps = {
  draft: ListingDraft
  onUpdate: (field: keyof ListingDraft, value: string | string[]) => void
  onContinue: () => void
  onOpenCondition: () => void
  onOpenPriceMode: () => void
}

function DetailsStep({
  draft,
  onUpdate,
  onContinue,
  onOpenCondition,
  onOpenPriceMode,
}: DetailsStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handlePhotoAddClick() {
    fileInputRef.current?.click()
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files
    if (!files) return

    const newImageUrls: string[] = []
    for (let i = 0; i < files.length; i++) {
      const url = URL.createObjectURL(files[i])
      newImageUrls.push(url)
    }

    // Append up to 5 photos max
    const mergedImages = [...draft.images, ...newImageUrls].slice(0, 5)
    onUpdate('images', mergedImages)
  }

  function handlePhotoRemove(index: number) {
    const nextImages = draft.images.filter((_, i) => i !== index)
    onUpdate('images', nextImages)
  }

  return (
    <section className="sell-screen__details" aria-label="Item details">
      <h2>Item details</h2>

      <label className="sell-field">
        <span className="material-symbols-rounded" aria-hidden="true">
          sell
        </span>
        <input
          type="text"
          value={draft.title}
          onChange={(event) => onUpdate('title', event.target.value)}
          maxLength={60}
          placeholder="Item title"
        />
      </label>
      <div className="sell-screen__field-help">
        <span></span>
        <span>{draft.title.length}/60</span>
      </div>

      <label className="sell-field sell-field--textarea">
        <span className="material-symbols-rounded" aria-hidden="true">
          article
        </span>
        <textarea
          value={draft.description}
          onChange={(event) => onUpdate('description', event.target.value)}
          maxLength={300}
          placeholder="Description"
        />
      </label>
      <div className="sell-screen__field-help">
        <span></span>
        <span>{draft.description.length}/300</span>
      </div>

      <div className="sell-screen__price-row">
        <label className="sell-field">
          <span className="material-symbols-rounded" aria-hidden="true">
            attach_money
          </span>
          <input
            type="number"
            min="0"
            disabled={draft.priceMode === 'Free / Giveaway'}
            value={draft.price}
            onChange={(event) => onUpdate('price', event.target.value)}
            placeholder="Price"
          />
        </label>
        <button type="button" className="sell-screen__select-button" onClick={onOpenPriceMode}>
          <span>{draft.priceMode}</span>
          <span className="material-symbols-rounded" aria-hidden="true">
            expand_more
          </span>
        </button>
      </div>

      <section className="sell-screen__section-block" aria-label="Photos">
        <h2>Photos</h2>
        <p>Add up to 5 clear photos</p>
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <div className="sell-screen__photos" aria-label="Photo slots">
          <button type="button" className="sell-screen__photo-add" onClick={handlePhotoAddClick}>
            <span className="material-symbols-rounded" aria-hidden="true">
              photo_camera
            </span>
            <span>Add photo</span>
          </button>
          
          {[0, 1, 2, 3].map((slotIndex) => {
            // draft.images[0] is the main photo (which sits in the preview, but let's list subsequent ones in slots)
            const imageUrl = draft.images[slotIndex + 1]

            return (
              <div key={slotIndex} className="sell-screen__photo-slot">
                {imageUrl ? (
                  <div className="sell-screen__photo-wrap">
                    <img src={imageUrl} alt={`Thumbnail slot ${slotIndex + 1}`} />
                    <button
                      type="button"
                      className="sell-screen__photo-remove"
                      onClick={() => handlePhotoRemove(slotIndex + 1)}
                      aria-label="Remove photo"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  '+'
                )}
              </div>
            )
          })}
        </div>
      </section>

      <section className="sell-screen__section-block" aria-label="Category">
        <h2>Category</h2>
        <p>Choose the best fit for your item</p>
        <div className="sell-screen__categories">
          {categoryOptions.map((category) => (
            <button
              key={category.id}
              type="button"
              className="sell-screen__category-chip"
              aria-pressed={draft.category === category.id}
              onClick={() => onUpdate('category', category.id)}
            >
              <span className="material-symbols-rounded" aria-hidden="true">
                {category.icon}
              </span>
              <span>{category.label}</span>
            </button>
          ))}
        </div>
      </section>

      <button type="button" className="sell-screen__condition" onClick={onOpenCondition}>
        <span className="material-symbols-rounded" aria-hidden="true">
          sell
        </span>
        <span>
          <strong>Condition: {draft.condition}</strong>
          <small>Tap to change condition of your item</small>
        </span>
        <span className="material-symbols-rounded" aria-hidden="true">
          chevron_right
        </span>
      </button>

      <button type="button" className="sell-screen__primary" onClick={onContinue}>
        Continue
      </button>
    </section>
  )
}

type ReviewStepProps = {
  draft: ListingDraft
  categoryLabel: string
  onEdit: () => void
  onPost: () => void
  isPosting: boolean
}

function ReviewStep({ draft, categoryLabel, onEdit, onPost, isPosting }: ReviewStepProps) {
  const mainImage = draft.images[0] || ''
  const thumbs = draft.images.slice(1, 4)

  return (
    <section className="sell-screen__review" aria-label="Review listing">
      <h2>Preview</h2>
      <article className="sell-preview-card">
        <img src={mainImage} alt={draft.title} />
        <div className="sell-preview-card__copy">
          <h3>{draft.title}</h3>
          <strong>${draft.price || '0'}</strong>
          <p>{draft.description}</p>
        </div>
        <div className="sell-preview-card__thumbs" aria-hidden="true">
          {thumbs.map((img, idx) => (
            <img key={idx} src={img} alt="" />
          ))}
          {/* Pad out slots with default main if empty */}
          {thumbs.length === 0 && (
            <>
              <img src={mainImage} alt="" />
              <img src={mainImage} alt="" />
              <img src={mainImage} alt="" />
            </>
          )}
        </div>
      </article>

      <section className="sell-card" aria-label="Listing details">
        <h2>Listing details</h2>
        <DetailRow icon="sell" label="Category" value={categoryLabel} />
        <DetailRow icon="sell" label="Condition" value={draft.condition} />
        <DetailRow
          icon="attach_money"
          label="Price"
          value={`$${draft.price || '0'} (${draft.priceMode})`}
        />
      </section>

      <section className="sell-card sell-card--tips" aria-label="Tips">
        <span className="material-symbols-rounded sell-card__accent" aria-hidden="true">
          auto_awesome
        </span>
        <div>
          <h2>Tips for a great listing</h2>
          <ul>
            <li>Clear photos from multiple angles</li>
            <li>Accurate description and condition</li>
            <li>Respond to messages quickly</li>
          </ul>
        </div>
      </section>

      <section className="sell-screen__next">
        <h2>What's next?</h2>
        <div className="sell-card sell-card--note">
          <span className="material-symbols-rounded" aria-hidden="true">
            near_me
          </span>
          <p>
            Once you post, your listing will be visible to other students. You can
            manage it anytime from your profile.
          </p>
        </div>
      </section>

      <button type="button" className="sell-screen__primary" onClick={onPost} disabled={isPosting}>
        {isPosting ? 'Posting...' : 'Post listing'}
      </button>
      <button type="button" className="sell-screen__text-button" onClick={onEdit}>
        Go back and edit
      </button>
    </section>
  )
}

type PostedStepProps = {
  draft: ListingDraft
  categoryLabel: string
  onOpenPostedListing: () => void
}

function PostedStep({ draft, categoryLabel, onOpenPostedListing }: PostedStepProps) {
  const mainImage = draft.images[0] || ''

  return (
    <section className="sell-screen__posted" aria-label="Listing posted">
      <div className="sell-screen__success" aria-hidden="true">
        <span className="material-symbols-rounded">check</span>
      </div>
      <h2>Your listing is live!</h2>
      <p>
        Your item is now visible to other students. We'll notify you when someone
        messages you.
      </p>

      <article className="sell-live-card">
        <div className="sell-live-card__body">
          <img src={mainImage} alt={draft.title} />
          <div>
            <h3>{draft.title}</h3>
            <strong>${draft.price || '0'}</strong>
            <IconLine icon="sell" text={categoryLabel} />
            <IconLine icon="auto_awesome" text={draft.condition} />
            <IconLine icon="paid" text={draft.priceMode} />
          </div>
        </div>
        <button type="button" onClick={onOpenPostedListing}>View listing</button>
      </article>
    </section>
  )
}

type DetailRowProps = {
  icon: string
  label: string
  value: string
}

function DetailRow({ icon, label, value }: DetailRowProps) {
  return (
    <div className="sell-detail-row">
      <span className="material-symbols-rounded" aria-hidden="true">
        {icon}
      </span>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

type IconLineProps = {
  icon: string
  text: string
}

function IconLine({ icon, text }: IconLineProps) {
  return (
    <span className="sell-icon-line">
      <span className="material-symbols-rounded" aria-hidden="true">
        {icon}
      </span>
      {text}
    </span>
  )
}
export default SellScreen
