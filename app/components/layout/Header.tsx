import { useEffect, useRef, useState } from 'react';
import type { HeaderProps } from '~/types';
import { useCart } from '~/context/CartContext';
import NavigationCircle from './NavigationCircle';
import NavigationActions from './NavigationActions';
import MainNavigation from './MainNavigation';
import MobileMenu from './MobileMenu';
import CartDrawer from '~/components/cart/CartDrawer';

export default function Header({ collections }: Omit<HeaderProps, 'cartCount'>) {
  const { cartCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement | null>(null);
  const navMainRef = useRef<HTMLElement | null>(null);

  // Click outside to close mobile menu
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        mobileOpen &&
        hamburgerRef.current &&
        navMainRef.current &&
        !hamburgerRef.current.contains(target) &&
        !navMainRef.current.contains(target)
      ) {
        setMobileOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [mobileOpen]);

  const handleMobileToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMobileClose = () => {
    setMobileOpen(false);
  };

  // Convert collections to navigation items format
  const navigationItems = collections?.map(collection => ({
    title: collection.title,
    handle: collection.handle,
    url: `/collections/${collection.handle}`
  }));

  return (
    <header className="header full-width">
      <div className="nav-container">
        <div className="nav-top">
          <NavigationCircle />
          <NavigationActions 
            cartCount={cartCount} 
            onCartClick={() => setCartDrawerOpen(true)} 
          />
          <button
            className={`hamburger${mobileOpen ? ' active' : ''}`}
            id="hamburger"
            onClick={handleMobileToggle}
            ref={hamburgerRef}
            aria-label="Toggle navigation"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
        <nav 
          className={`nav-main${mobileOpen ? ' active' : ''}`} 
          id="nav-main" 
          ref={navMainRef}
        >
          <MainNavigation collections={navigationItems} />
          <MobileMenu 
            isOpen={mobileOpen} 
            cartCount={cartCount} 
            onClose={handleMobileClose} 
          />
        </nav>
      </div>
      
      <CartDrawer 
        isOpen={cartDrawerOpen} 
        onClose={() => setCartDrawerOpen(false)} 
      />
    </header>
  );
}