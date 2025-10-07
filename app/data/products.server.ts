import type {Storefront} from '@shopify/hydrogen';
import {getStorefront} from '~/lib/shopify';

export type SearchSort = 'RELEVANCE' | 'PRICE' | 'CREATED' | 'TITLE' | 'BEST_SELLING';

export interface SearchParams {
  q: string;
  first?: number;
  after?: string | null;
  sort?: SearchSort;
  reverse?: boolean;
}

export interface SearchItem {
  id: string;
  title: string;
  handle: string;
  description?: string | null;
  imageUrl?: string | null;
  price?: {amount: string; currencyCode: string} | null;
}

export interface SearchResult {
  items: SearchItem[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    endCursor: string | null;
    startCursor: string | null;
  } | null;
  query: string;
}

function buildQuery(q: string) {
  // Enhanced search with case-insensitive matching and multiple field search
  const term = q.trim();
  if (!term) return '';
  
  // Escape quotes and special characters
  const safe = term.replace(/"/g, '\\"').replace(/[()]/g, '');
  const lowerTerm = safe.toLowerCase();
  const upperTerm = safe.toUpperCase();
  const titleCaseTerm = safe.charAt(0).toUpperCase() + safe.slice(1).toLowerCase();
  
  // Build comprehensive search query with case variations and multiple fields
  const titleSearches = [
    `title:*${safe}*`,
    `title:*${lowerTerm}*`,
    `title:*${upperTerm}*`,
    `title:*${titleCaseTerm}*`
  ].join(' OR ');
  
  const tagSearches = [
    `tag:*${safe}*`,
    `tag:*${lowerTerm}*`
  ].join(' OR ');
  
  const bodySearches = [
    `body:*${safe}*`,
    `body:*${lowerTerm}*`
  ].join(' OR ');
  
  const vendorSearches = [
    `vendor:*${safe}*`,
    `vendor:*${lowerTerm}*`
  ].join(' OR ');
  
  return `(${titleSearches}) OR (${tagSearches}) OR (${bodySearches}) OR (${vendorSearches})`;
}

function mapSort(sort?: SearchSort): {sortKey?: string; reverse?: boolean} {
  if (!sort || sort === 'RELEVANCE') return {sortKey: 'RELEVANCE', reverse: false};
  if (sort === 'PRICE') return {sortKey: 'PRICE', reverse: false};
  if (sort === 'CREATED') return {sortKey: 'CREATED', reverse: true}; // newest first
  if (sort === 'TITLE') return {sortKey: 'TITLE', reverse: false};
  if (sort === 'BEST_SELLING') return {sortKey: 'BEST_SELLING', reverse: false};
  return {sortKey: 'RELEVANCE', reverse: false};
}

const PRODUCT_SEARCH_QUERY = `#graphql
  fragment MoneyFragment on MoneyV2 { amount currencyCode }
  query ProductSearch($query: String!, $first: Int!, $after: String, $sortKey: ProductSortKeys, $reverse: Boolean) {
    products(query: $query, first: $first, after: $after, sortKey: $sortKey, reverse: $reverse) {
      edges {
        cursor
        node {
          id
          title
          handle
          description
          featuredImage { url altText }
          variants(first: 1) { nodes { price { ...MoneyFragment } } }
        }
      }
      pageInfo { hasNextPage hasPreviousPage endCursor startCursor }
    }
  }
`;

export async function searchProducts(storefront: Storefront, params: SearchParams): Promise<SearchResult> {
  const q = (params.q || '').trim();
  const minLen = 2;
  if (!q || q.length < minLen) {
    return {
      items: [],
      pageInfo: null,
      query: q,
    };
  }

  const first = Math.max(1, Math.min(24, params.first ?? 12));
  const after = params.after ?? null;
  const sortMap = mapSort(params.sort);
  
  const client = getStorefront({storefront});
  
  // Try primary search with enhanced query
  let query = buildQuery(q);
  
  try {
    const data = await client.query<{
      products: {
        edges: Array<{
          cursor: string;
          node: {
            id: string;
            title: string;
            handle: string;
            description?: string | null;
            featuredImage?: {url: string; altText: string | null} | null;
            variants: {nodes: Array<{price: {amount: string; currencyCode: string}}>} ;
          };
        }>;
        pageInfo: {hasNextPage: boolean; hasPreviousPage: boolean; endCursor: string | null; startCursor: string | null};
      };
    }>(PRODUCT_SEARCH_QUERY, {
      variables: {
        query,
        first,
        after,
        sortKey: sortMap.sortKey,
        reverse: params.reverse ?? sortMap.reverse ?? false,
      },
    });

    const edges = data?.products?.edges || [];
    
    // If no results with comprehensive search, try fallback strategies
    if (edges.length === 0) {
      // Try simple partial match as fallback
      const simpleTerm = q.replace(/"/g, '\\"').replace(/[()]/g, '');
      const fallbackQuery = `title:*${simpleTerm}* OR tag:*${simpleTerm}*`;
      
      try {
        const fallbackData = await client.query(PRODUCT_SEARCH_QUERY, {
          variables: {
            query: fallbackQuery,
            first,
            after,
            sortKey: sortMap.sortKey,
            reverse: params.reverse ?? sortMap.reverse ?? false,
          },
        });
        
        const fallbackEdges = fallbackData?.products?.edges || [];
        if (fallbackEdges.length > 0) {
          // Use fallback results
          const fallbackItems: SearchItem[] = fallbackEdges.map((edge) => {
            const n = edge.node;
            const priceNode = n.variants?.nodes?.[0]?.price || null;
            return {
              id: n.id,
              title: n.title,
              handle: n.handle,
              description: n.description ?? null,
              imageUrl: n.featuredImage?.url ?? null,
              price: priceNode ? {amount: priceNode.amount, currencyCode: priceNode.currencyCode} : null,
            };
          });
          
          return {
            items: fallbackItems,
            pageInfo: fallbackData?.products?.pageInfo || {
              hasNextPage: false,
              hasPreviousPage: false,
              endCursor: null,
              startCursor: null,
            },
            query: q,
          };
        }
      } catch (fallbackError) {
        console.warn('[searchProducts] fallback search failed', fallbackError);
      }
    }
    
    // Return primary search results (may be empty)
    const items: SearchItem[] = edges.map((edge) => {
      const n = edge.node;
      const priceNode = n.variants?.nodes?.[0]?.price || null;
      return {
        id: n.id,
        title: n.title,
        handle: n.handle,
        description: n.description ?? null,
        imageUrl: n.featuredImage?.url ?? null,
        price: priceNode ? {amount: priceNode.amount, currencyCode: priceNode.currencyCode} : null,
      };
    });

    return {
      items,
      pageInfo: data?.products?.pageInfo || {
        hasNextPage: false,
        hasPreviousPage: false,
        endCursor: null,
        startCursor: null,
      },
      query: q,
    };
  } catch (error) {
    console.error('[searchProducts] storefront query failed', error);
    return {items: [], pageInfo: null, query: q};
  }
}
