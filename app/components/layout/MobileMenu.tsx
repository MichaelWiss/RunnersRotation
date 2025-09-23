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
      <div className="mobile-nav-section">
        <h4>Account</h4>
        <Link to="/search" onClick={onClose}>Search</Link>
        <Link to="/account" onClick={onClose}>My Account</Link>
        <Link to="/cart" onClick={onClose}>Cart ({cartCount})</Link>
      </div>
      <div className="mobile-nav-section">
        <h4>Quick Links</h4>
        <Link to="/faqs" onClick={onClose}>FAQ's</Link>
        <Link to="/careers" onClick={onClose}>Careers</Link>
        <Link to="/run-club" onClick={onClose}>Run Club</Link>
        <Link to="/blog" onClick={onClose}>Blog</Link>
        <Link to="/sustainability" onClick={onClose}>Sustainability</Link>
      </div>
    </>
  );
}