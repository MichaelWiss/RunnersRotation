import {type LinksFunction, type LoaderFunctionArgs, useLoaderData} from 'react-router';
import homepageStyles from '~/styles/homepage.css?url';
import ProductCard from '~/components/ProductCard';

export const links: LinksFunction = () => [
  {rel: 'stylesheet', href: homepageStyles},
];

export async function loader({params, context}: LoaderFunctionArgs) {
  const {handle} = params;
  const {storefront, env} = context;

  if (!handle) {
    throw new Error('Expected collection handle to be defined');
  }

  type Money = {amount: string; currencyCode: string};
  type RawImage = {url: string | null; altText: string | null} | null;
  type RawProduct = {
    id?: string | null;
    title?: string | null;
    handle?: string | null;
    description?: string | null;
    images?: {nodes?: Array<RawImage> | null} | null;
    variants?: {nodes?: Array<{price?: Money | null} | null> | null} | null;
  } | null;

  const query = `#graphql
    fragment MoneyFragment on MoneyV2 { amount currencyCode }
    fragment ImageFragment on Image { 
      url(transform: {maxWidth: 800}) 
      altText 
    }
    fragment ProductCardFields on Product {
      id
      title
      handle
      description
      images(first: 1) { nodes { ...ImageFragment } }
      variants(first: 1) { nodes { price { ...MoneyFragment } } }
    }
    query CollectionByHandle($handle: String!, $count: Int!) {
      collection(handle: $handle) {
        id
        title
        description
        products(first: $count) {
          nodes { ...ProductCardFields }
        }
      }
    }
  `;

  const count = Number(env?.COLLECTION_PAGE_COUNT || 24);

  try {
    const data = await storefront.query<{
      collection: {
        id: string;
        title: string | null;
        description: string | null;
        products: {nodes: RawProduct[]};
      } | null;
    }>(query, {variables: {handle, count}});

    const title = data?.collection?.title || handle.replace(/-/g, ' ').replace(/\b\w/g, (m: string) => m.toUpperCase());
    const raw = data?.collection?.products?.nodes || [];

    const products = raw
      .map((node: RawProduct) => {
        if (!node?.id || !node.handle) return null;
        const imageUrl = node.images?.nodes?.[0]?.url || null;
        const price = node.variants?.nodes?.[0]?.price || null;
        return {
          id: node.id,
          title: node.title ?? 'Untitled Product',
          handle: node.handle,
          description: node.description ?? null,
          imageUrl,
          price,
        };
      })
      .filter(Boolean);

    return {title, handle, products};
  } catch (e) {
    // If the collection isn't found, return a 404
    throw new Response(null, {status: 404});
  }
}

export default function CollectionRoute() {
  const {title, handle, products} = useLoaderData<typeof loader>() as {
    title: string;
    handle: string;
    products: Array<{
      id: string;
      title: string;
      handle: string;
      description?: string | null;
      imageUrl?: string | null;
      price?: {amount: string; currencyCode: string} | null;
    }>;
  };

  return (
    <section className="collection-section">
      <div className="collection-container">
        <h1 className="collection-title">{title}</h1>
        <div className="products-grid">
          {products.length === 0 ? (
            <div className="home-products-empty">
              Add products to the "{handle}" collection in Shopify to populate this page.
            </div>
          ) : (
            products.map((p, i) => (
              <ProductCard
                key={p.id || i}
                variant="footer"
                title={p.title}
                description={p.description ? p.description.slice(0, 120) : undefined}
                handle={p.handle}
                imageUrl={p.imageUrl || undefined}
                price={p.price || null}
                fallbackLabel={p.title}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}