import type {Storefront} from '@shopify/hydrogen';

export type Variables = Record<string, unknown> | undefined;

export class StorefrontClient {
  constructor(private sf: Storefront) {}

  async query<T>(query: string, options?: {variables?: Variables; cache?: ReturnType<Storefront['CacheNone']>}) {
    try {
      return await this.sf.query<T>(query, {
        variables: options?.variables,
        cache: options?.cache ?? this.sf.CacheNone(),
      });
    } catch (err) {
      throw new Error(`Storefront query failed: ${(err as Error).message}`);
    }
  }
}

export function getStorefront(context: {storefront: Storefront}) {
  return new StorefrontClient(context.storefront);
}

export const PRODUCT_MIN_QUERY = `#graphql
  fragment MoneyFragment on MoneyV2 { amount currencyCode }
  fragment ImageFragment on Image { id url altText width height }
  query ProductMin($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      description
      featuredImage { ...ImageFragment }
      variants(first: 10) {
        nodes { id title availableForSale price { ...MoneyFragment } }
      }
    }
  }
`;
