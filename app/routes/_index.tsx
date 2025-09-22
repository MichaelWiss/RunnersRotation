import {LinksFunction, useNavigate} from 'react-router';
import homepageStyles from '~/styles/homepage.css?url';
import productStyles from '~/styles/product.css?url';
import {useEffect, useRef, useState} from 'react';
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import ProductGallery from '~/components/ProductGallery';
import PurchaseCard from '~/components/PurchaseCard';

export const links: LinksFunction = () => [
  {rel: 'stylesheet', href: homepageStyles},
  {rel: 'stylesheet', href: productStyles},
];

export default function Index() {
  const navigate = useNavigate();
  // Mobile nav state
  const [mobileOpen, setMobileOpen] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement | null>(null);
  const navMainRef = useRef<HTMLElement | null>(null);

  // Scroll-driven rotation
  useEffect(() => {
    const updateScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = Math.min(documentHeight > 0 ? scrollTop / documentHeight : 0, 1);
      document.documentElement.style.setProperty('--scroll-percentage', String(scrollProgress));
    };
    updateScroll();
    window.addEventListener('scroll', updateScroll, {passive: true});
    return () => window.removeEventListener('scroll', updateScroll);
  }, []);

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

  // Quantity +/- handlers (delegated for demo)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest('.qty-btn') as HTMLButtonElement | null;
      if (!btn) return;
      const input = btn.parentElement?.querySelector<HTMLInputElement>('.qty-input');
      if (!input) return;
      let val = parseInt(input.value || '1', 10);
      if (btn.textContent?.trim() === '−') val = Math.max(1, val - 1);
      else val = val + 1;
      input.value = String(val);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  // Pill toggle active within group
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const pill = (e.target as HTMLElement).closest('.pill') as HTMLElement | null;
      if (!pill) return;
      const group = pill.parentElement;
      if (!group) return;
      group.querySelectorAll('.pill').forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  // Wire "Shop" CTAs and static nav/footer links to routes without changing markup
  useEffect(() => {
    const clickHandler = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      const shopAnchor = el.closest('a.home-product-cta') as HTMLAnchorElement | null;
      const addToCart = el.closest('button.add-to-cart') as HTMLButtonElement | null;
      const navLink = el.closest('.nav-menu a') as HTMLAnchorElement | null;
      const footerLink = el.closest('.footer-links a') as HTMLAnchorElement | null;
      const mobileSectionLink = el.closest('.mobile-nav-section a') as HTMLAnchorElement | null;
      if (shopAnchor) {
        e.preventDefault();
        // Demo route for testing product page functionality
        navigate('/demo');
        return;
      }
      if (addToCart) {
        e.preventDefault();
        navigate('/demo');
        return;
      }

      // Primary nav mapping (text-based matching, preserves exact markup)
      if (navLink) {
        const text = navLink.textContent?.trim().toLowerCase();
        if (!text) return;
        e.preventDefault();
        if (text.includes('trail')) return navigate('/trail-running');
        if (text.includes('road')) return navigate('/road-running');
        if (text.includes('ultra')) return navigate('/ultralight');
        if (text.includes('racing')) return navigate('/racing');
        if (text.includes('gear')) return navigate('/gear');
        return;
      }

      // Footer quick links
      if (footerLink) {
        const text = footerLink.textContent?.trim().toLowerCase();
        if (!text) return;
        e.preventDefault();
        if (text.includes('faq')) return navigate('/faqs');
        if (text.includes('career')) return navigate('/careers');
        if (text.includes('run club')) return navigate('/run-club');
        if (text.includes('blog')) return navigate('/blog');
        if (text.includes('sustain')) return navigate('/sustainability');
        return;
      }

      // Account/Search links in mobile section
      if (mobileSectionLink) {
        const text = mobileSectionLink.textContent?.trim().toLowerCase();
        if (!text) return;
        e.preventDefault();
        if (text.includes('search')) return navigate('/search');
        if (text.includes('account')) return navigate('/account');
        if (text.includes('cart')) return; // cart not implemented here
        if (text.includes('faq')) return navigate('/faqs');
        if (text.includes('career')) return navigate('/careers');
        if (text.includes('run club')) return navigate('/run-club');
        if (text.includes('blog')) return navigate('/blog');
        if (text.includes('sustain')) return navigate('/sustainability');
        return;
      }

      // Product component interactions (for featured runner section)
      const pill = el.closest('.pill') as HTMLElement | null;
      if (pill) {
        const group = pill.parentElement;
        if (!group) return;
        group.querySelectorAll('.pill').forEach((x) => x.classList.remove('active'));
        pill.classList.add('active');
        return;
      }

      const qtyBtn = el.closest('.qty button') as HTMLButtonElement | null;
      if (qtyBtn) {
        const input = qtyBtn.parentElement?.querySelector('input') as HTMLInputElement | null;
        if (!input) return;
        let val = parseInt(input.value || '1', 10);
        if (qtyBtn.textContent?.trim() === '−') val = Math.max(1, val - 1);
        else val = val + 1;
        input.value = String(val);
        return;
      }

      const thumb = el.closest('.thumb') as HTMLElement | null;
      if (thumb) {
        const mainImg = document.querySelector('.main-img') as HTMLElement | null;
        if (!mainImg) return;
        const thumbs = Array.from(thumb.parentElement?.querySelectorAll('.thumb') || []);
        const index = thumbs.indexOf(thumb);
        const colors = [
          'linear-gradient(135deg, var(--panel), var(--accent))',
          'linear-gradient(135deg, var(--accent), var(--cta-hover))',
          'linear-gradient(135deg, var(--muted), var(--panel))',
        ];
        const names = ['MIDNIGHT/ORANGE', 'FOREST/LIME', 'CHARCOAL/RED'];
        mainImg.style.background = colors[index] || colors[0];
        mainImg.textContent = `TRAIL RUNNER PRO\n${names[index] || names[0]}`;
        return;
      }
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  }, [navigate]);

  return (
    <>
      <Header cartCount={0} />

      {/* Hero Section */}
      <section className="hero-section section full-width">
        <div className="hero-card grid-container">
          <div className="hero-badge">Handcrafted Performance</div>
          <h1 className="hero-title">Run Beyond Limits</h1>
          <p className="hero-subtitle">Premium running shoes crafted for the passionate runner</p>
          <a href="#featured" className="hero-cta">Explore Collection</a>
        </div>
      </section>

      {/* Home Products Section */}
      <section className="home-products-section section">
        <div className="home-products-header">
          <div className="home-products-kicker">Premium Collection</div>
          <h2 className="home-products-title">Engineered for Excellence</h2>
          <p className="home-products-subtitle">Discover our most popular running shoes, crafted for serious athletes</p>
        </div>

        <div className="home-products-grid grid-container">
          {[
            {label: 'TRAIL MASTER', title: 'Trail Master Pro', price: '£185.00', cta: 'Shop Trail Master'},
            {label: 'ROAD RACER', title: 'Carbon Road Racer', price: '£220.00', cta: 'Shop Road Racer'},
            {label: 'DAILY TRAINER', title: 'Daily Comfort Max', price: '£145.00', cta: 'Shop Daily Trainer'},
            {label: 'TEMPO ELITE', title: 'Tempo Elite', price: '£175.00', cta: 'Shop Tempo Elite'},
            {label: 'RECOVERY MAX', title: 'Recovery Max', price: '£165.00', cta: 'Shop Recovery Max'},
            {label: 'SPIKE ELITE', title: 'Track Spike Elite', price: '£195.00', cta: 'Shop Track Spikes'},
          ].map((p) => (
            <div className="home-product-card" key={p.title}>
              <div className="home-product-image">{p.label}</div>
              <div className="home-product-content">
                <h3>{p.title}</h3>
                <p></p>
                <div className="home-product-price">{p.price}</div>
                <a href="#" className="home-product-cta">{p.cta}</a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Product Showcase Section */}
      <section className="showcase-section section full-width">
        <div className="showcase-content">
          <div className="showcase-text">
            <div className="showcase-kicker">Performance Focus</div>
            <h2 className="showcase-title">Built for Every Mile</h2>
            <p className="showcase-description">
              From early morning trail runs to race day performance, our shoes are engineered
              to support your running journey at every step.
            </p>
            <a href="#" className="showcase-cta">Discover Our Technology</a>
          </div>
          <div className="showcase-visual">
            <div className="showcase-image">PERFORMANCE SHOWCASE</div>
          </div>
        </div>
      </section>

      {/* Featured Runner Section - Using Product Page Components */}
      <section className="featured-section section">
        <div className="featured-header">
          <div className="featured-kicker">Featured Runner</div>
          <h2 className="featured-title">Trail Runner Pro</h2>
          <p className="featured-subtitle">Experience our most advanced trail running technology</p>
        </div>
        
        <div className="container">
          <main>
            <ProductGallery />
            <div className="divider"></div>
          </main>
          <PurchaseCard />
        </div>
      </section>

      <Footer />
    </>
  );
}

