import type {LoaderFunctionArgs} from 'react-router';
import {useLoaderData} from 'react-router';
import {getStorefront} from '~/lib/shopify';

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

export default function Demo() {
  const data = useLoaderData<typeof loader>();
  return <pre aria-label="demo-out">{JSON.stringify(data, null, 2)}</pre>;
}