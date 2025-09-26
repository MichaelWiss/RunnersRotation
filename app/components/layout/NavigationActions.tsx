import { Link } from 'react-router';

interface NavigationActionsProps {
  cartCount: number;
  onCartClick?: () => void;
}

export default function NavigationActions({ cartCount, onCartClick }: NavigationActionsProps) {
  return (
    <div className="nav-actions">
      <Link to="/search" className="nav-link">Search</Link>
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