import {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router';

interface HeaderProps {
  cartCount?: number;
}

export default function Header({cartCount = 0}: HeaderProps) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
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

  // Navigation click handler
  useEffect(() => {
    const clickHandler = (e: MouseEvent) => {
      const navLink = (e.target as HTMLElement).closest('.nav-menu a') as HTMLAnchorElement | null;
      const mobileSectionLink = (e.target as HTMLElement).closest('.mobile-nav-section a') as HTMLAnchorElement | null;
      
      if (navLink) {
        const text = navLink.textContent?.trim().toLowerCase();
        if (!text) return;
        e.preventDefault();
        if (text.includes('trail')) return navigate('/trail-running');
        if (text.includes('road')) return navigate('/road-running');
        if (text.includes('ultra')) return navigate('/ultralight');
        if (text.includes('racing')) return navigate('/racing');
        if (text.includes('gear')) return navigate('/gear');
      }
      
      if (mobileSectionLink) {
        const text = mobileSectionLink.textContent?.trim().toLowerCase();
        if (!text) return;
        e.preventDefault();
        if (text.includes('search')) return navigate('/search');
        if (text.includes('account')) return navigate('/account');
        if (text.includes('faq')) return navigate('/faqs');
        if (text.includes('career')) return navigate('/careers');
        if (text.includes('run club')) return navigate('/run-club');
        if (text.includes('blog')) return navigate('/blog');
        if (text.includes('sustain')) return navigate('/sustainability');
      }
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  }, [navigate]);

  return (
    <header className="header full-width">
      <div className="announcement-bar full-width">
        Free shipping on orders over £150 | Use code RUNFREE at checkout
      </div>
      <div className="nav-container">
        <div className="nav-top">
          <a href="#" className="nav-circle" id="navCircle">
            <div className="circular-text">VELOCITY</div>
          </a>
          <div className="nav-actions">
            <a href="#" className="nav-link">Search</a>
            <a href="#" className="nav-link">Account</a>
            <a href="#" className="nav-link">Cart ({cartCount})</a>
            <button
              className={`hamburger${mobileOpen ? ' active' : ''}`}
              onClick={() => setMobileOpen((v) => !v)}
              ref={hamburgerRef}
              aria-label="Toggle navigation"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
        <nav className={`nav-main${mobileOpen ? ' active' : ''}`} ref={navMainRef}>
          <ul className="nav-menu">
            <li><a href="#">Trail Running</a></li>
            <li><a href="#">Road Running</a></li>
            <li><a href="#">Ultralight</a></li>
            <li><a href="#">Racing</a></li>
            <li><a href="#">Gear</a></li>
          </ul>
          <div className="mobile-nav-section">
            <h4>Account</h4>
            <a href="#">Search</a>
            <a href="#">My Account</a>
            <a href="#">Cart ({cartCount})</a>
          </div>
          <div className="mobile-nav-section">
            <h4>Quick Links</h4>
            <a href="#">FAQ's</a>
            <a href="#">Careers</a>
            <a href="#">Run Club</a>
            <a href="#">Blog</a>
            <a href="#">Sustainability</a>
          </div>
        </nav>
      </div>
    </header>
  );
}
