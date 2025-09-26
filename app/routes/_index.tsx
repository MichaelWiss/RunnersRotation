import {LinksFunction, type LoaderFunctionArgs, useLoaderData, Link} from 'react-router';
import homepageStyles from '~/styles/homepage.css?url';
import {useEffect} from 'react';
import Layout from '~/components/layout/Layout';

export const links: LinksFunction = () => [
  {rel: 'stylesheet', href: homepageStyles},
];

type ProductLite = {
  id: string;
  title: string;
  handle: string;
  description?: string | null;
  imageUrl?: string | null;
  price?: {amount: string; currencyCode: string} | null;
};

export async function loader({context}: LoaderFunctionArgs) {
  const {storefront} = context as {storefront: any};
  try {
    const data = await storefront.query(`#graphql
      query HomeProducts {
        products(first: 3) {
          nodes {
            id
            title
            handle
            description
            images(first: 1) { nodes { url } }
            variants(first: 1) { nodes { price { amount currencyCode } } }
          }
        }
      }
    `);
    const items: ProductLite[] = ((data as any)?.products?.nodes || []).map((p: any) => ({
      id: p.id,
      title: p.title,
      handle: p.handle,
      description: p.description,
      imageUrl: p.images?.nodes?.[0]?.url ?? null,
      price: p.variants?.nodes?.[0]?.price ?? null,
    }));
    return {products: items};
  } catch {
    return {products: [] as ProductLite[]};
  }
}

export default function Index() {
  const data = useLoaderData<typeof loader>();
  const products = data?.products ?? [];
  // Rotation/blend is now handled globally in Layout for consistent behavior

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

  return (
    <Layout>
      {/* Hero Section */}
      <section className="hero-section full-width">
        <div className="hero-card">
          <div className="hero-content">
            <div className="hero-badge">Handcrafted Performance</div>
            <h1 className="hero-title">Run Beyond Limits</h1>
            <p className="hero-subtitle">Premium running shoes crafted for the passionate runner</p>
            <a href="#featured" className="hero-cta">Explore Collection</a>
          </div>
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
          {[...Array(6)].map((_, i) => {
            const p = products[i];
            const title = p?.title || (
              [
                'Trail Master Pro',
                'Carbon Road Racer',
                'Daily Comfort Max',
                'Tempo Elite',
                'Recovery Max',
                'Track Spike Elite',
              ][i]
            );
            const blurb = (
              [
                'Ultimate trail protection with Vibram MegaGrip sole and rock plate. Engineered for technical terrain and ultra-distance adventures.',
                'Competition-grade racing flat with carbon fiber plate. Designed for personal bests and podium finishes on road and track.',
                'Perfect everyday trainer with responsive cushioning and breathable upper. Ideal for daily miles and recovery runs.',
                'Lightweight tempo trainer for speed workouts and threshold sessions. Responsive foam and propulsive geometry.',
                'Maximum cushioning for recovery runs and long easy miles. Cloud-like comfort with superior energy return.',
                'Professional track spikes for competition. Aggressive traction and lightweight construction for maximum speed.',
              ][i]
            );
            const label = (
              [
                'TRAIL MASTER',
                'ROAD RACER',
                'DAILY TRAINER',
                'TEMPO ELITE',
                'RECOVERY MAX',
                'SPIKE ELITE',
              ][i]
            );
            const priceStr = p?.price
              ? new Intl.NumberFormat('en-GB', {style: 'currency', currency: p.price.currencyCode}).format(Number(p.price.amount))
              : (
                  ['£185.00', '£220.00', '£145.00', '£175.00', '£165.00', '£195.00'][i]
                );
            const href = p?.handle ? `/products/${p.handle}` : '#';
            return (
              <div className="home-product-card" key={i}>
                <div
                  className="home-product-image"
                  style={p?.imageUrl ? {
                    backgroundImage: `url(${p.imageUrl})`,
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                  } : undefined}
                >
                  {!p?.imageUrl ? label : null}
                </div>
                <div className="home-product-content">
                  <h3>{title}</h3>
                  <p>{p?.description || blurb}</p>
                  <div className="home-product-price">{priceStr}</div>
                  {p?.handle ? (
                    <Link to={href} className="home-product-cta">Shop Now</Link>
                  ) : (
                    <a href="#" className="home-product-cta">Shop Now</a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Runner Section - Exact HTML Structure */}
      <section className="section">
        <div className="section-header">
          <div className="section-kicker">Featured Runner</div>
          <h2 className="section-title">Bold, grippy & ultra-responsive</h2>
          <p className="section-subtitle">Our signature trail shoe, engineered for those who demand excellence</p>
        </div>

        <div className="product-showcase grid-container">
          <div className="product-gallery">
            <div className="gallery-images">
              <div className="main-image"></div>
              <div className="thumbnail-row">
                <div className="thumbnail"></div>
                <div className="thumbnail"></div>
                <div className="thumbnail"></div>
              </div>
            </div>

            <div className="product-meta">
              <div>
                <div className="product-kicker">Trail Runner Pro</div>
                <h1 className="product-title">Bold, grippy & ultra-responsive</h1>
                <div className="product-subtitle">Engineered for those who seek paths less traveled, delivering uncompromising performance.</div>
              </div>

              <p className="product-description">
                A love letter to trail runners and mountain enthusiasts. This design combines three revolutionary technologies giving it the perfect balance of grip, protection, and comfort – the ultimate trail companion developed by our passionate design team.
              </p>

              <div className="info-grid">
                <div className="info-item"><b>Drop</b><span>6mm heel-to-toe</span></div>
                <div className="info-item"><b>Weight</b><span>285g (UK 9)</span></div>
                <div className="info-item"><b>Sole</b><span>Vibram MegaGrip</span></div>
                <div className="info-item"><b>Best for</b><span>Technical trails & ultras</span></div>
              </div>
            </div>
          </div>

          <div className="purchase-card">
            <div className="price-section">
              <div className="price">£185.00</div>
              <div className="unit-price">
                <div className="unit-price-label">Unit price</div>
                <div className="unit-price-value">per pair</div>
              </div>
            </div>

            <div className="selectors">
              <div>
                <div className="selector-label">Size (UK)</div>
                <div className="selector-options">
                  <button className="pill active">8</button>
                  <button className="pill">8.5</button>
                  <button className="pill">9</button>
                  <button className="pill">9.5</button>
                  <button className="pill">10</button>
                </div>
              </div>

              <div>
                <div className="selector-label">Width</div>
                <div className="selector-options">
                  <button className="pill active">Regular</button>
                  <button className="pill">Wide</button>
                </div>
              </div>

              <div className="quantity-selector">
                <div className="selector-label">Quantity</div>
                <div className="quantity-controls">
                  <button className="qty-btn">−</button>
                  <input className="qty-input" defaultValue="1" />
                  <button className="qty-btn">+</button>
                </div>
              </div>
            </div>

            <button className="add-to-cart">Add to cart</button>
            <div className="shipping-note">Free UK shipping over £150 • Orders dispatched within 1–3 working days</div>
          </div>
        </div>
      </section>

      {/* Collection Section */}
      <section className="featured-section" id="featured">
        <div className="collection-container">
          <h2 className="collection-title">The Complete Runner's Arsenal</h2>
          <div className="products-grid">
            <div className="product-card">
              <div className="card-image">ROAD RACER</div>
              <div className="card-content">
                <h3 className="card-title">Carbon Road Racer</h3>
                <p className="card-description">Ultra-lightweight racing shoe with carbon fiber plate. Built for speed and personal records.</p>
                <div className="card-price">£220.00</div>
              </div>
            </div>
            <div className="product-card">
              <div className="card-image">ULTRA LIGHT</div>
              <div className="card-content">
                <h3 className="card-title">Ultralight Trainer</h3>
                <p className="card-description">Minimalist design for natural running. Perfect for daily training and ground feel.</p>
                <div className="card-price">£145.00</div>
              </div>
            </div>
            <div className="product-card">
              <div className="card-image">TRAIL MASTER</div>
              <div className="card-content">
                <h3 className="card-title">Trail Master Pro</h3>
                <p className="card-description">Ultimate trail protection with Vibram sole. Engineered for technical terrain.</p>
                <div className="card-price">£185.00</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

