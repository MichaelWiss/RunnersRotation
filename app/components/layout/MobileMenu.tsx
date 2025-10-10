import { Link } from 'react-router';

interface MobileMenuProps {
  isOpen: boolean;
  cartCount: number;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, cartCount, onClose }: MobileMenuProps) {
  if (!isOpen) return null;

  return (
    <>
      <form
        method="get"
        action="/search"
        className="mobile-search-wrap"
        role="search"
      >
        <label htmlFor="mobile-q" className="visually-hidden">Search</label>
        <input
          id="mobile-q"
          name="q"
          type="search"
          className="nav-link mobile-search-input"
          placeholder="Search products..."
          aria-label="Search products"
        />
        <button type="submit" className="nav-link nav-search-button">Search</button>
      </form>
    </>
  );
}