import {LinksFunction, type LoaderFunctionArgs, useLoaderData} from 'react-router';
import homepageStyles from '~/styles/homepage.css?url';
import productStyles from '~/styles/product.css?url';
import ProductGallery from '~/components/ProductGallery';
import PurchaseCard from '~/components/PurchaseCard';
import ProductCard from '~/components/ProductCard';
import {loadHomepageData, type HomepageData} from '~/data/homepage.server';

// Each bundle included via links() keeps the homepage visually consistent
// while still reusing the product detail components for the showcase.

export const links: LinksFunction = () => [
  {rel: 'stylesheet', href: homepageStyles},
  {rel: 'stylesheet', href: productStyles},
];

// Loader pulls homepage data from Shopify via consolidated data helpers.
export async function loader({context}: LoaderFunctionArgs) {
  const {storefront, env} = context as unknown as {
    storefront: any;
    env?: Record<string, string | undefined>;
  };

  const collectionHandle = env?.HOMEPAGE_COLLECTION_HANDLE || 'frontpage';
  const showcaseHandle = env?.HOMEPAGE_SHOWCASE_COLLECTION_HANDLE || 'product-showcase';
  const featuredHandle = env?.HOMEPAGE_FEATURED_COLLECTION_HANDLE || 'featured-section';

  return loadHomepageData(storefront, {
    gridHandle: collectionHandle,
    showcaseHandle,
    featuredHandle,
  });
}

// Home route renders the layout, hero CTA, showcase, grid, and footer collection.
export default function Index() {
  const data = useLoaderData<HomepageData>();
  const products = data?.products ?? [];
  const collectionHandle = data?.collectionHandle;
  const showcase = data?.productShowcase ?? null;
  const showcaseHandle = data?.showcaseHandle;
  const showcaseCollectionTitle = data?.showcaseCollectionTitle;
  const featuredProducts = data?.featuredProducts ?? [];
  const featuredCollectionTitle = data?.featuredCollectionTitle;
  const featuredHandle = data?.featuredHandle;

  // Hero subtitle disabled (no computation, no admin-driven subtitle)

  const gridProducts = products;

  const heroBackgroundStyle = showcase?.heroBackgroundUrl
    ? {
        backgroundImage: `url(${showcase.heroBackgroundUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }
    : undefined;

  const heroCtaLabel = showcase?.heroCta?.label?.trim() || 'Explore Collection';
  const defaultHeroHref = showcase ? `/products/${showcase.handle}` : '#product-showcase';
  const heroCtaHref = showcase?.heroCta?.href?.trim() || defaultHeroHref;
  const heroCtaIsExternal = /^https?:/i.test(heroCtaHref) && !heroCtaHref.startsWith('/');
  const heroCtaTarget = heroCtaIsExternal ? '_blank' : undefined;
  const heroCtaRel = heroCtaIsExternal ? 'noopener noreferrer' : undefined;

  return (
    <>
      {/* Hero Section */}
      <section className="hero-section full-width">
        <div className="hero-card">
          <div className="hero-content" style={heroBackgroundStyle}>
            {/* Preload hero image aggressively, even when set as CSS background */}
            <img
              src={showcase?.heroBackgroundUrl || '/images/runners-feet.jpg'}
              alt=""
              aria-hidden="true"
              decoding="async"
              fetchPriority="high"
              style={{position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none'}}
            />
            <div className="hero-badge">Handcrafted Performance</div>
            <h1 className="hero-title">Run Beyond Limits</h1>
            <a
              href={heroCtaHref}
              className="hero-cta"
              target={heroCtaTarget}
              rel={heroCtaRel}
            >
              {heroCtaLabel}
            </a>
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
          {gridProducts.length === 0 ? (
            <div className="home-products-empty">
              Add products to the {collectionHandle ? `"${collectionHandle}"` : 'featured'} collection in Shopify to populate this section.
            </div>
          ) : (
            gridProducts.slice(0, 6).map((p, i) => (
              <ProductCard
                key={p?.id || i}
                variant="home"
                title={p?.title}
                description={p?.description?.slice(0, 140) || undefined}
                handle={p?.handle}
                imageUrl={p?.imageUrl || undefined}
                price={p?.price || null}
                fallbackLabel={p?.title || `Featured product ${i + 1}`}
              />
            ))
          )}
        </div>
      </section>

      {/* Product Showcase Section */}
      <section className="section" id="product-showcase">
        <div className="section-header">
          <div className="section-kicker">{showcaseCollectionTitle || 'Product Showcase'}</div>
          <h2 className="section-title">{showcase?.title || 'Bold, grippy & ultra-responsive'}</h2>
          <p className="section-subtitle">
            {showcase?.description
              ? showcase.description.slice(0, 160)
              : 'Choose a featured product in Shopify to highlight it here.'}
          </p>
        </div>

        {showcase ? (
          <div className="product-showcase grid-container">
            <div className="product-gallery">
              <ProductGallery
                title={showcaseCollectionTitle || 'Featured Product'}
                description={showcase.description || undefined}
                images={showcase.gallery}
              />
            </div>
            <div className="purchase-card">
              <PurchaseCard
                price={showcase.price || undefined}
                available={showcase.available}
                variants={showcase.variants}
                sizeOptions={showcase.sizeOptions}
                widthOptions={showcase.widthOptions}
                colorOptions={showcase.colorOptions}
                shippingNote={showcase.shippingNote}
                benefits={showcase.benefits}
              />
            </div>
          </div>
        ) : (
          <div className="home-products-empty">
            Add a product to the {showcaseHandle ? `"${showcaseHandle}"` : 'showcase'} collection in Shopify to populate this feature.
          </div>
        )}
      </section>

      {/* Featured Section (separate collection) */}
      <section className="featured-section" id="featured">
        <div className="collection-container">
          <h2 className="collection-title">{featuredCollectionTitle || "The Complete Runner's Arsenal"}</h2>
          <div className="products-grid">
            {featuredProducts.length === 0 ? (
              <div className="home-products-empty">
                Add products to the {featuredHandle ? `"${featuredHandle}"` : 'featured-section'} collection in Shopify to populate this section.
              </div>
            ) : (
              featuredProducts.slice(0, 3).map((p, idx) => (
                <ProductCard
                  key={`featured-${p?.id || idx}`}
                  variant="footer"
                  title={p?.title}
                  description={p?.description?.slice(0, 120) || undefined}
                  imageUrl={p?.imageUrl || undefined}
                  price={p?.price || null}
                  handle={p?.handle}
                  fallbackLabel={['ROAD RACER', 'ULTRA LIGHT', 'TRAIL MASTER'][idx]}
                />
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
}
