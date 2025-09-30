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
import tokensStylesheet from './styles/tokens.css?url';
import {useNonce} from '@shopify/hydrogen';
import hydrationGuardScriptUrl from './scripts/hydration-guard.global.js?url';
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
  {rel: 'preconnect', href: 'https://fonts.googleapis.com'},
  {rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous'},
  {rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg'},
  // Preload homepage bundle for faster first paint (optional; harmless if duplicated by browser)
  {rel: 'preload', as: 'style', href: homepageStylesheet},
  {rel: 'preload', as: 'script', href: hydrationGuardScriptUrl},
  {rel: 'stylesheet', href: tokensStylesheet},
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap',
  },
  {rel: 'stylesheet', href: appStylesheet},
  {rel: 'stylesheet', href: homepageStylesheet},
];

export async function loader({context}: LoaderFunctionArgs) {
  const [customerAccessToken, cartId] = await Promise.all([
    context.session.get('customerAccessToken'),
    context.session.get('cartId'),
  ]);

  const layoutPromise = context.storefront
    .query<{shop: Shop}>(LAYOUT_QUERY, {
      cache: context.storefront.CacheShort(),
    })
    .catch((error) => {
      console.error('[root.loader] layout query failed', error);
      return {shop: {name: 'Storefront Unavailable', description: ''}} satisfies {shop: Shop};
    });

  const cartPromise = cartId
    ? context.storefront
        .query<{cart: Cart}>(CART_QUERY, {
          variables: {
            cartId,
            country: context.storefront.i18n?.country,
            language: context.storefront.i18n?.language,
          },
          cache: context.storefront.CacheNone(),
        })
        .then((result) => result.cart ?? null)
        .catch((error) => {
          const err = error instanceof Error ? error : new Error(String(error));
          const msg = err.message ?? '';
          const cause = (err as {cause?: unknown})?.cause;
          const causeMsg = typeof cause === 'string' ? cause : '';
          const accessDenied = msg.includes('ACCESS_DENIED') || causeMsg.includes('ACCESS_DENIED') || msg.includes('403');
          if (accessDenied) {
            console.error('[root.loader] ACCESS_DENIED from Storefront API – returning empty cart');
            return null;
          }
          throw err;
        })
    : Promise.resolve(null);

  try {
    const [cart, layout] = await Promise.all([cartPromise, layoutPromise]);

    return {
      isLoggedIn: Boolean(customerAccessToken),
      cart,
      layout,
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(typeof error === 'string' ? error : 'Unknown error');
    console.error('[root.loader] unexpected error', err);
    throw err;
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
        <Meta />
        <Links />
      </head>
      <body>
        <script nonce={nonce} src={hydrationGuardScriptUrl} defer />
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
  query CartQuery($cartId: ID!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
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
