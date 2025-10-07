import { Link } from 'react-router';

interface NavigationActionsProps {
  cartCount: number;
  onCartClick?: () => void;
}

export default function NavigationActions({ cartCount, onCartClick }: NavigationActionsProps) {
  return (
    <div className="nav-actions">
      <form method="get" action="/search" className="nav-search-wrap" role="search">
        <label htmlFor="nav-q" className="visually-hidden">Search</label>
        <input
          id="nav-q"
          name="q"
          type="search"
          className="nav-search-input"
          placeholder="Search products..."
          aria-label="Search products"
        />
        <button
          type="submit"
          className="nav-link nav-search-button"
          onClick={(e) => {
            const form = (e.currentTarget as HTMLButtonElement).closest('form');
            const input = form?.querySelector('#nav-q') as HTMLInputElement | null;
            if (input && !input.value.trim()) {
              // If empty, focus to expand instead of navigating
              e.preventDefault();
              input.focus();
            }
          }}
        >
          Search
        </button>
      </form>
      <Link to="/account" className="nav-link">Account</Link>
      <button 
        onClick={onCartClick} 
        className="nav-link"
        style={{ background: 'transparent' }}
      >
        Cart ({cartCount})
      </button>
    </div>
  );
}
