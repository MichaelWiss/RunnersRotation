import type {LoaderFunctionArgs, LinksFunction} from 'react-router';
import {useLoaderData, Outlet} from 'react-router';
import {getStorefront} from '~/lib/shopify';
import homepageStyles from '~/styles/homepage.css?url';
import demoStyles from '~/styles/search-demo.css?url';

export async function loader({context}: LoaderFunctionArgs) {
  const sf = getStorefront(context);
  // No specific handle; just return shop name via root loader already in place or a placeholder
  // We will simply ensure the client can call a trivial shop query
  const result = await context.storefront.query<{shop: {name: string}}>(
    `#graphql
    query ShopName { shop { name } }
  `,
  );
  return {ok: true, shop: result.shop.name};
}

export const links: LinksFunction = () => [
  {rel: 'stylesheet', href: homepageStyles},
  {rel: 'stylesheet', href: demoStyles},
];

export default function Demo() {
  const data = useLoaderData<typeof loader>();
  return (
    <section className="section">
      <div className="collection-container">
        <div className="demo-page-header">
          <div className="section-kicker">Diagnostics</div>
          <h2 className="section-title">Demo & Search UI</h2>
          <p className="section-subtitle">Server connectivity plus an expanding search control demo</p>
        </div>

        <pre aria-label="demo-out" style={{margin:"0 auto", maxWidth: 640, background: 'var(--glass)', padding: 12, border: '1px solid var(--line)'}}>{JSON.stringify(data, null, 2)}</pre>

        <div className="demo-search-container" style={{marginTop: 20}}>
          <form method="get" action="/search" className="demo-search-wrap" role="search">
            <input
              id="demo-q"
              name="q"
              type="search"
              className="demo-search-input"
              placeholder="Type to search..."
              aria-label="Search products"
            />
            <button
              type="submit"
              className="nav-link demo-search-button"
              onClick={(e) => {
                const form = (e.currentTarget as HTMLButtonElement).closest('form');
                const input = form?.querySelector('#demo-q') as HTMLInputElement | null;
                if (input && !input.value.trim()) {
                  e.preventDefault();
                  input.focus();
                }
              }}
            >
              Search
            </button>
          </form>
        </div>

        {/* Render nested demos if present */}
        <Outlet />
      </div>
    </section>
  );
}
