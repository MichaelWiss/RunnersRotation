import {
  type LinksFunction,
  type LoaderFunctionArgs,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from 'react-router';
import type {Cart, Shop} from '@shopify/hydrogen/storefront-api-types';
import appStylesheet from './styles/app.css?url';
import homepageStylesheet from './styles/homepage.css?url';
import {useNonce} from '@shopify/hydrogen';
import {hydrationGuardSnippet} from './scripts/hydration-guard';
import { CartProvider } from '~/context/CartContext';

/**
 * The main and reset stylesheets are added in the Layout component
 * to prevent a bug in development HMR updates.
 *
 * This avoids the "failed to execute 'insertBefore' on 'Node'" error
 * that occurs after editing and navigating to another page.
 *
 * It's a temporary fix until the issue is resolved.
 * https://github.com/remix-run/remix/issues/9242
 */
export const links: LinksFunction = () => [
  {rel: 'preconnect', href: 'https://cdn.shopify.com'},
  {rel: 'preconnect', href: 'https://shop.app'},
  {rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg'},
  // Preload homepage bundle for faster first paint (optional; harmless if duplicated by browser)
  {rel: 'preload', as: 'style', href: homepageStylesheet},
  {rel: 'stylesheet', href: appStylesheet},
  {rel: 'stylesheet', href: homepageStylesheet},
];

export async function loader({context}: LoaderFunctionArgs) {
  const [customerAccessToken, cartId] = await Promise.all([
    context.session.get('customerAccessToken'),
    context.session.get('cartId'),
  ]);

  try {
    const [cart, layout] = await Promise.all([
      cartId
        ? (
            await context.storefront.query<{cart: Cart}>(CART_QUERY, {
              variables: {
                cartId,
                country: context.storefront.i18n?.country,
                language: context.storefront.i18n?.language,
              },
              cache: context.storefront.CacheNone(),
            })
          ).cart
        : null,
      await context.storefront.query<{shop: Shop}>(LAYOUT_QUERY),
    ]);

    return {
      isLoggedIn: Boolean(customerAccessToken),
      cart,
      layout,
    };
  } catch (e) {
    const err = e instanceof Error ? e : new Error(typeof e === 'string' ? e : 'Unknown error');
    const msg = String(err.message || '');
    const cause = (err && 'cause' in err && err.cause) ? String(err.cause) : '';
    const accessDenied = msg.includes('ACCESS_DENIED') || cause.includes('ACCESS_DENIED') || msg.includes('403');
    if (accessDenied) {
      // Fail open so the shell renders and we can surface configuration issues instead of a blank 500
      console.error('[root.loader] ACCESS_DENIED from Storefront API – returning minimal fallback layout');
      return {
        isLoggedIn: false,
        cart: null,
        layout: {shop: {name: 'Storefront Unavailable', description: ''}},
        storefrontAccessError: 'ACCESS_DENIED',
      };
    }
    throw e; // rethrow unknown errors
  }
}

export function Layout({children}: {children?: React.ReactNode}) {
  const data = useRouteLoaderData<typeof loader>('root');
  const nonce = useNonce();

  const shop = data?.layout.shop;

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
  {/* Inline critical design tokens so custom properties exist before external CSS arrives */}
        <style
          // Apply CSP nonce explicitly; Hydrogen adds nonce to <Scripts/> & friends but we need it here for inline tokens.
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `:root { --bg:#f7efe6;--panel:#0b2545;--accent:#e94c26;--accent-dark:#c83b1a;--accent-light:#ff7a4a;--panel-light:#a33a25;--panel-dark:#4a140e;--muted:#8b3a2a;--card:#fff3e8;--line:#f1d7c7;--cta-hover:#c83b1a;--glass:rgba(11,37,69,0.06);--warm-gradient:linear-gradient(180deg,#f7efe6,#f6e9df 60%);--card-gradient:linear-gradient(180deg,#fff3e8,#ffece0);--accent-gradient:linear-gradient(90deg,#e94c26,#ff7a4a);--radius:0px;--shadow-soft:0 8px 30px rgba(11,37,69,0.06);--shadow-strong:0 18px 50px rgba(11,37,69,0.08);--scroll-percentage:0;--scroll-pct:calc(var(--scroll-percentage,0)*100%);--surface:#f7efe6;--band-surface:#f7efe6;--header-h:160px;--announcement-h:40px; } body{background:var(--warm-gradient);color:var(--panel);} `,
          }}
        />
  {/* Stylesheets now provided via links() + <Links /> for canonical asset manifest handling */}
        <Meta />
        <Links />
      </head>
      <body className="page-container">
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: hydrationGuardSnippet,
          }}
        />
        {children}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
        {/* Runtime CSS readiness diagnostic (development / debug only) */}
        {process.env.DEBUG_INSTRUMENTATION === '1' ? (
          <script
            nonce={nonce}
            dangerouslySetInnerHTML={{
              __html: `(() => { try { const rs = getComputedStyle(document.documentElement); const ok = rs.getPropertyValue('--accent').trim(); if(!ok){ console.warn('[css] token --accent missing before hydration'); } else { console.log('[css] tokens ready'); } } catch(e) { console.warn('[css] readiness check failed', e); } })();`,
            }}
          />
        ) : null}
      </body>
    </html>
  );
}

export default function App() {
  const data = useRouteLoaderData<typeof loader>('root');

  return (
    <CartProvider initialCart={data?.cart || null}>
      <Layout>
        <Outlet />
      </Layout>
    </CartProvider>
  );
}

const CART_QUERY = `#graphql
  query CartQuery($cartId: ID!) {
    cart(id: $cartId) {
      ...CartFragment
    }
  }

  fragment CartFragment on Cart {
    id
    checkoutUrl
    totalQuantity
    buyerIdentity {
      countryCode
      customer {
        id
        email
        firstName
        lastName
        displayName
      }
      email
      phone
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          attributes {
            key
            value
          }
          cost {
            totalAmount {
              amount
              currencyCode
            }
            amountPerQuantity {
              amount
              currencyCode
            }
            compareAtAmountPerQuantity {
              amount
              currencyCode
            }
          }
          merchandise {
            ... on ProductVariant {
              id
              availableForSale
              compareAtPrice {
                ...MoneyFragment
              }
              price {
                ...MoneyFragment
              }
              requiresShipping
              title
              image {
                ...ImageFragment
              }
              product {
                handle
                title
                id
              }
              selectedOptions {
                name
                value
              }
            }
          }
        }
      }
    }
    cost {
      subtotalAmount {
        ...MoneyFragment
      }
      totalAmount {
        ...MoneyFragment
      }
      totalDutyAmount {
        ...MoneyFragment
      }
      totalTaxAmount {
        ...MoneyFragment
      }
    }
    note
    attributes {
      key
      value
    }
    discountCodes {
      code
    }
  }

  fragment MoneyFragment on MoneyV2 {
    currencyCode
    amount
  }

  fragment ImageFragment on Image {
    id
    url
    altText
    width
    height
  }
`;

const LAYOUT_QUERY = `#graphql
  query layout {
    shop {
      name
      description
    }
  }
`;
