import type { CategoryId, FeedCategory } from '../../data/dormshareApi'
import './CategoryChips.css'

type CategoryChipsProps = {
  categories: FeedCategory[]
  selectedCategory: CategoryId
  onSelect: (category: CategoryId) => void
}

function CategoryChips({
  categories,
  selectedCategory,
  onSelect,
}: CategoryChipsProps) {
  return (
    <div className="category-chips" aria-label="Listing categories">
      {categories.map((category) => {
        const isSelected = category.id === selectedCategory

        return (
          <button
            key={category.id}
            type="button"
            className="category-chip"
            aria-pressed={isSelected}
            onClick={() => onSelect(category.id)}
          >
            <span className="material-symbols-rounded category-chip__icon">
              {category.icon}
            </span>
            <span>{category.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default CategoryChips
