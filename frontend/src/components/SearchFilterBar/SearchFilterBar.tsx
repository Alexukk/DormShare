import './SearchFilterBar.css'

type SearchFilterBarProps = {
  value: string
  onChange: (value: string) => void
}

function SearchFilterBar({ value, onChange }: SearchFilterBarProps) {
  return (
    <div className="search-filter" role="search">
      <label className="search-filter__field">
        <span className="material-symbols-rounded search-filter__icon">
          search
        </span>
        <span className="search-filter__label">Search listings</span>
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search items, books..."
          className="search-filter__input"
        />
      </label>

      <button type="button" className="search-filter__button" aria-label="Open filters">
        <span className="material-symbols-rounded search-filter__button-icon">
          tune
        </span>
      </button>
    </div>
  )
}

export default SearchFilterBar
