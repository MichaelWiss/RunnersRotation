import { Link } from 'react-router';

interface NavigationActionsProps {
  cartCount: number;
  isLoggedIn?: boolean;
  viewerName?: string | null;
  onCartClick?: () => void;
}

export default function NavigationActions({ cartCount, isLoggedIn, viewerName, onCartClick }: NavigationActionsProps) {
  const trimmedName = viewerName?.trim();
  const firstName = trimmedName ? trimmedName.split(/\s+/)[0] : null;
  const authLabel = isLoggedIn ? (firstName ? `Hi, ${firstName}` : 'Account') : 'Sign In';
  const authHref = isLoggedIn ? '/account' : '/account/login';

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
      <Link to={authHref} className="nav-link">{authLabel}</Link>
      {!isLoggedIn ? (
        <Link to="/account/register" className="nav-link">Join</Link>
      ) : null}
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
