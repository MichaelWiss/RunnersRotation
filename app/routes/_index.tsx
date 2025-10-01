import {LinksFunction, type LoaderFunctionArgs, useLoaderData} from 'react-router';
import {useMemo} from 'react';
import homepageStyles from '~/styles/homepage.css?url';
import productStyles from '~/styles/product.css?url';
import Layout from '~/components/layout/Layout';
import ProductGallery from '~/components/ProductGallery';
import PurchaseCard from '~/components/PurchaseCard';
import ProductCard from '~/components/ProductCard';

// Each bundle included via links() keeps the homepage visually consistent
// while still reusing the product detail components for the showcase.

export const links: LinksFunction = () => [
  {rel: 'stylesheet', href: homepageStyles},
  {rel: 'stylesheet', href: productStyles},
];

// Minimal product shape for grid + footer cards.
type ProductLite = {
  id: string;
  title: string;
  handle: string;
  description?: string | null;
  imageUrl?: string | null;
  price?: {amount: string; currencyCode: string} | null;
};

// Rich product shape for the hero showcase, including variants and gallery.
type ShowcaseProduct = {
  id: string;
  title: string;
  handle: string;
  description?: string | null;
  descriptionHtml?: string | null;
  imageUrl?: string | null;
  gallery: Array<{url: string; altText: string | null}>;
  price?: {amount: string; currencyCode: string} | null;
  available?: boolean;
  options: Array<{name: string; values: string[]}>;
  selectedOptions: Array<{name: string; value: string}>;
  variants: Array<{
    id: string;
    title: string;
    availableForSale: boolean;
    price: {amount: string; currencyCode: string};
  }>;
};

// Loader pulls homepage data from Shopify collections:
//   - grid collection for the main product list
//   - showcase collection (first product) for the hero card
//   - fallback query ensures we always have products to show
export async function loader({context}: LoaderFunctionArgs) {
  const {storefront, env} = context as unknown as {
    storefront: any;
    env?: Record<string, string | undefined>;
  };
  const collectionHandle = env?.HOMEPAGE_COLLECTION_HANDLE || 'frontpage';
  const showcaseHandle = env?.HOMEPAGE_SHOWCASE_COLLECTION_HANDLE || 'product-showcase';
  try {
    const data = await storefront.query(`#graphql
      query HomeProducts(
        $gridHandle: String!
        $showcaseHandle: String!
        $gridCount: Int!
        $galleryCount: Int!
      ) {
        grid: collection(handle: $gridHandle) {
          id
          title
          products(first: $gridCount) {
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
        showcase: collection(handle: $showcaseHandle) {
          id
          title
          products(first: 1) {
            nodes {
              id
              title
              handle
              description
              descriptionHtml
              featuredImage { url altText }
              images(first: $galleryCount) { nodes { url altText } }
              options { name values }
              variants(first: 10) {
                nodes {
                  id
                  title
                  availableForSale
                  price { amount currencyCode }
                  selectedOptions { name value }
                }
              }
            }
          }
        }
        fallback: products(first: $gridCount) {
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
    `, {
      variables: {
        gridHandle: collectionHandle,
        showcaseHandle,
        gridCount: 6,
        galleryCount: 4,
      },
    });

    const gridProducts = ((data as any)?.grid?.products?.nodes || []) as any[];
    const fallbackProducts = ((data as any)?.fallback?.nodes || []) as any[];

    const seen = new Set<string>();
    const merged = [...gridProducts, ...fallbackProducts].filter((p) => {
      const key = p?.id || p?.handle;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const showcaseNode = ((data as any)?.showcase?.products?.nodes || [])[0] as any | undefined;
    const showcaseProductId = showcaseNode?.id ?? null;
    const showcaseHandleId = showcaseNode?.handle ?? null;

    // Grid products exclude the item featured in the showcase
    const items: ProductLite[] = merged
      .filter((p: any) => {
        const id = p?.id;
        const handle = p?.handle;
        if (showcaseProductId && id === showcaseProductId) return false;
        if (showcaseHandleId && handle === showcaseHandleId) return false;
        return true;
      })
      .slice(0, 6)
      .map((p: any) => ({
        id: p.id,
        title: p.title,
        handle: p.handle,
        description: p.description,
        imageUrl: p.images?.nodes?.[0]?.url ?? null,
        price: p.variants?.nodes?.[0]?.price ?? null,
      }));

    const showcaseProduct: ShowcaseProduct | null = showcaseNode
      ? {
          id: showcaseNode.id,
          title: showcaseNode.title,
          handle: showcaseNode.handle,
          description: showcaseNode.description,
          descriptionHtml: showcaseNode.descriptionHtml,
          imageUrl: showcaseNode.featuredImage?.url ?? showcaseNode.images?.nodes?.[0]?.url ?? null,
          gallery: (showcaseNode.images?.nodes || []).map((img: any) => ({
            url: img?.url,
            altText: img?.altText ?? null,
          })),
          price: showcaseNode.variants?.nodes?.[0]?.price ?? null,
          available: showcaseNode.variants?.nodes?.[0]?.availableForSale ?? false,
          options: (showcaseNode.options || []).map((opt: any) => ({
            name: opt?.name,
            values: Array.isArray(opt?.values) ? opt.values : [],
          })),
          selectedOptions: (showcaseNode.variants?.nodes?.[0]?.selectedOptions || []).map((opt: any) => ({
            name: opt?.name,
            value: opt?.value,
          })),
          variants: ((showcaseNode.variants?.nodes || [])
            .map((variant: any) => {
              const price = variant?.price;
              if (!variant?.id || !price) return null;
              return {
                id: variant.id,
                title: variant.title,
                availableForSale: Boolean(variant?.availableForSale),
                price,
              };
            })
            .filter(Boolean)) as ShowcaseProduct['variants'],
        }
      : null;

    return {
      products: items,
      collectionHandle,
      showcaseHandle,
      showcaseCollectionTitle: (data as any)?.showcase?.title ?? null,
      productShowcase: showcaseProduct,
    };
  } catch {
    return {
      products: [] as ProductLite[],
      collectionHandle,
      showcaseHandle,
      showcaseCollectionTitle: null,
      productShowcase: null,
    };
  }
}

// Home route renders the layout, hero CTA, showcase, grid, and footer collection.
export default function Index() {
  const data = useLoaderData<typeof loader>();
  const products = data?.products ?? [];
  const collectionHandle = data?.collectionHandle;
  const showcase = data?.productShowcase ?? null;
  const showcaseHandle = data?.showcaseHandle;
  const showcaseCollectionTitle = data?.showcaseCollectionTitle;

  // Metafield-driven subtitle fallback if Shopify has no options.
  const showcaseSubtitle = useMemo(() => {
    if (!showcase?.selectedOptions?.length) {
      return 'Engineered for those who seek paths less traveled, delivering uncompromising performance.';
    }
    return showcase.selectedOptions
      .filter((opt) => opt?.name && opt?.value)
      .map((opt) => `${opt.name}: ${opt.value}`)
      .join(' • ');
  }, [showcase]);

  // Keep the showcase product out of the grid so it doesn't repeat.
  const gridProducts = useMemo(
    () => (showcase ? products.filter((p) => p?.id !== showcase.id && p?.handle !== showcase.handle) : products),
    [products, showcase],
  );

  // Footer tiles reuse the first three grid products.
  const footerCards = useMemo(() => gridProducts.slice(0, 3), [gridProducts]);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="hero-section full-width">
        <div className="hero-card">
          <div className="hero-content">
            <div className="hero-badge">Handcrafted Performance</div>
            <h1 className="hero-title">Run Beyond Limits</h1>
            {/* <p className="hero-subtitle">Premium running shoes crafted for the passionate runner</p> */}
            <a href="#product-showcase" className="hero-cta">Explore Collection</a>
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
                subtitle={showcaseSubtitle}
                description={showcase.description || undefined}
                images={showcase.gallery}
              />
            </div>
            <div className="purchase-card">
              <PurchaseCard
                price={showcase.price || undefined}
                available={showcase.available}
                variants={showcase.variants}
              />
            </div>
          </div>
        ) : (
          <div className="home-products-empty">
            Add a product to the {showcaseHandle ? `"${showcaseHandle}"` : 'showcase'} collection in Shopify to populate this feature.
          </div>
        )}
      </section>

      {/* Collection Section */}
      <section className="featured-section" id="featured">
        <div className="collection-container">
          <h2 className="collection-title">The Complete Runner's Arsenal</h2>
          <div className="products-grid">
            {[0, 1, 2].map((idx) => (
              <ProductCard
                key={`footer-${idx}`}
                variant="footer"
                title={footerCards[idx]?.title}
                description={footerCards[idx]?.description?.slice(0, 120) || undefined}
                imageUrl={footerCards[idx]?.imageUrl || undefined}
                price={footerCards[idx]?.price || null}
                handle={footerCards[idx]?.handle}
                fallbackLabel={['ROAD RACER', 'ULTRA LIGHT', 'TRAIL MASTER'][idx]}
              />
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
