import {LinksFunction, useNavigate} from 'react-router';
import {useEffect} from 'react';
import productStyles from '~/styles/product.css?url';
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import ProductGallery from '~/components/ProductGallery';
import PurchaseCard from '~/components/PurchaseCard';

export const links: LinksFunction = () => [
  {rel: 'stylesheet', href: productStyles},
];

export default function DemoProduct() {
  const navigate = useNavigate();

  // Product component interactions (same as product page)
  useEffect(() => {
    const onPill = (e: MouseEvent) => {
      const pill = (e.target as HTMLElement).closest('.pill') as HTMLElement | null;
      if (!pill) return;
      const group = pill.parentElement;
      if (!group) return;
      group.querySelectorAll('.pill').forEach((x) => x.classList.remove('active'));
      pill.classList.add('active');
    };
    const onQty = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest('.qty button') as HTMLButtonElement | null;
      if (!btn) return;
      const input = btn.parentElement?.querySelector('input') as HTMLInputElement | null;
      if (!input) return;
      let val = parseInt(input.value || '1', 10);
      if (btn.textContent?.trim() === '−') val = Math.max(1, val - 1);
      else val = val + 1;
      input.value = String(val);
    };
    const onThumb = (e: MouseEvent) => {
      const thumb = (e.target as HTMLElement).closest('.thumb') as HTMLElement | null;
      if (!thumb) return;
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
    };
    const onNav = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest('.nav-links a') as HTMLAnchorElement | null;
      if (!link) return;
      const text = link.textContent?.trim().toLowerCase();
      if (!text) return;
      e.preventDefault();
      if (text.includes('trail')) return navigate('/trail-running');
      if (text.includes('road')) return navigate('/road-running');
      if (text.includes('ultra')) return navigate('/ultralight');
      if (text.includes('racing')) return navigate('/racing');
      if (text.includes('account')) return navigate('/account');
      if (text.includes('cart')) return; // TODO: cart sidebar
    };
    document.addEventListener('click', onPill);
    document.addEventListener('click', onQty);
    document.addEventListener('click', onThumb);
    document.addEventListener('click', onNav);
    return () => {
      document.removeEventListener('click', onPill);
      document.removeEventListener('click', onQty);
      document.removeEventListener('click', onThumb);
      document.removeEventListener('click', onNav);
    };
  }, [navigate]);

  return (
    <>
      <Header cartCount={0} />
      <div className="container">
        <main>
          <ProductGallery />
          <div className="divider"></div>
        </main>
        <PurchaseCard />
      </div>
      <Footer />
    </>
  );
}