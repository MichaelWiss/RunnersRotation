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

// Cart GraphQL Fragments and Mutations
const CART_FRAGMENT = `#graphql
  fragment CartFragment on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      totalAmount { amount currencyCode }
      subtotalAmount { amount currencyCode }
      totalTaxAmount { amount currencyCode }
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          cost { totalAmount { amount currencyCode } }
          merchandise {
            ... on ProductVariant {
              id
              title
              price { amount currencyCode }
              product { title handle }
              image { url altText }
            }
          }
        }
      }
    }
  }
`;

export const CART_CREATE_MUTATION = `#graphql
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart { ...CartFragment }
      userErrors { field message }
    }
  }
  ${CART_FRAGMENT}
`;

export const CART_ADD_MUTATION = `#graphql  
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { ...CartFragment }
      userErrors { field message }
    }
  }
  ${CART_FRAGMENT}
`;

export const CART_REMOVE_MUTATION = `#graphql
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { ...CartFragment }  
      userErrors { field message }
    }
  }
  ${CART_FRAGMENT}
`;

export const CART_UPDATE_MUTATION = `#graphql
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { ...CartFragment }
      userErrors { field message }
    }
  }
  ${CART_FRAGMENT}
`;
