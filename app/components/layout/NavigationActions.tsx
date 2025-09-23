import { Link } from 'react-router';

interface NavigationActionsProps {
  cartCount: number;
}

export default function NavigationActions({ cartCount }: NavigationActionsProps) {
  return (
    <div className="nav-actions">
      <Link to="/search" className="nav-link">Search</Link>
      <Link to="/account" className="nav-link">Account</Link>
      <Link to="/cart" className="nav-link">Cart ({cartCount})</Link>
    </div>
  );
}