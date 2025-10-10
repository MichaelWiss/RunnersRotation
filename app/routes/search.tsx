import {type LoaderFunctionArgs, type LinksFunction} from 'react-router';
import {useLoaderData, useSearchParams, Link} from 'react-router';
import ProductCard from '~/components/ProductCard';
import homepageStyles from '~/styles/homepage.css?url';
import type {SearchItem} from '~/data/products.server';

export const links: LinksFunction = () => [
  {rel: 'stylesheet', href: homepageStyles},
];

const PRODUCT_SEARCH_QUERY = `#graphql
  fragment MoneyFragment on MoneyV2 { amount currencyCode }
  query ProductSearch($query: String!, $first: Int!, $after: String) {
    products(query: $query, first: $first, after: $after) {
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

// Helper function to build multiple search patterns for fallback strategy
function buildSearchQueries(searchTerm: string): string[] {
  const term = searchTerm.trim();
  if (!term) return [];
  
  // Escape quotes and special characters
  const safeTerm = term.replace(/"/g, '\\"').replace(/[()]/g, '');
  const lowerTerm = safeTerm.toLowerCase();
  const upperTerm = safeTerm.toUpperCase();
  const titleCaseTerm = safeTerm.charAt(0).toUpperCase() + safeTerm.slice(1).toLowerCase();
  
  const queries = [];
  
  // Step 1: Case-insensitive searches with multiple patterns
  // Primary search - exact match in title with different cases
  queries.push(`title:"${safeTerm}"`);
  queries.push(`title:"${lowerTerm}"`);
  queries.push(`title:"${upperTerm}"`);
  queries.push(`title:"${titleCaseTerm}"`);
  
  // Secondary search - partial match in title with different cases
  queries.push(`title:*${safeTerm}*`);
  queries.push(`title:*${lowerTerm}*`);
  queries.push(`title:*${upperTerm}*`);
  queries.push(`title:*${titleCaseTerm}*`);
  
  // Step 3: Fallback searches in other fields
  // Search in description
  queries.push(`body:*${safeTerm}*`);
  queries.push(`body:*${lowerTerm}*`);
  
  // Search in product tags
  queries.push(`tag:*${safeTerm}*`);
  queries.push(`tag:*${lowerTerm}*`);
  
  // Search in vendor/brand
  queries.push(`vendor:*${safeTerm}*`);
  queries.push(`vendor:*${lowerTerm}*`);
  
  // Combined broader search
  queries.push(`(title:*${safeTerm}* OR body:*${safeTerm}* OR tag:*${safeTerm}*)`);
  queries.push(`(title:*${lowerTerm}* OR body:*${lowerTerm}* OR tag:*${lowerTerm}*)`);
  
  return queries;
}

// Helper function to execute search with fallback strategy
async function executeSearchWithFallback(context: any, searchTerm: string, after: string | null) {
  const queries = buildSearchQueries(searchTerm);
  
  for (const searchQuery of queries) {
    try {
      const data = await context.storefront.query(PRODUCT_SEARCH_QUERY, {
        variables: {
          query: searchQuery,
          first: 12,
          after,
        },
      });
      
      const edges = data?.products?.edges || [];
      if (edges.length > 0) {
        // Found results with this query pattern
        return {
          data,
          queryUsed: searchQuery
        };
      }
    } catch (error) {
      console.warn(`Search query failed: ${searchQuery}`, error);
      continue; // Try next query
    }
  }
  
  // If all specific searches fail, try a very broad search
  try {
    const broadQuery = '*'; // This will return all products as a last resort
    const data = await context.storefront.query(PRODUCT_SEARCH_QUERY, {
      variables: {
        query: broadQuery,
        first: 12,
        after,
      },
    });
    
    return {
      data,
      queryUsed: broadQuery,
      isFallback: true
    };
  } catch (error) {
    console.error('Even fallback search failed:', error);
    return {
      data: null,
      queryUsed: null,
      isFallback: true
    };
  }
}

export async function loader({request, context}: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q') || '';
  const after = url.searchParams.get('after') || null;
  
  // If no query, return empty results
  if (!q || q.length < 2) {
    return {
      searchResult: {
        items: [],
        pageInfo: null,
        query: q,
      },
      query: q,
      searchInfo: {
        queryUsed: null,
        isFallback: false
      }
    };
  }
  
  try {
    const searchResult = await executeSearchWithFallback(context, q, after);
    const {data, queryUsed, isFallback} = searchResult;
    
    if (!data) {
      return {
        searchResult: {
          items: [],
          pageInfo: null,
          query: q,
        },
        query: q,
        searchInfo: {
          queryUsed,
          isFallback: Boolean(isFallback)
        }
      };
    }
    
    const edges = data?.products?.edges || [];
    const items = edges.map((edge: any) => {
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
    
    const finalSearchResult = {
      items,
      pageInfo: data?.products?.pageInfo || {
        hasNextPage: false,
        hasPreviousPage: false,
        endCursor: null,
        startCursor: null,
      },
      query: q,
    };
    
    return {
      searchResult: finalSearchResult,
      query: q,
      searchInfo: {
        queryUsed,
        isFallback: Boolean(isFallback)
      }
    };
  } catch (error) {
    console.error('Search failed:', error);
    return {
      searchResult: {
        items: [],
        pageInfo: null,
        query: q,
      },
      query: q,
      searchInfo: {
        queryUsed: null,
        isFallback: false
      }
    };
  }
}

export default function Search() {
  const {searchResult, query, searchInfo} = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  
  return (
    <section className="home-products-section section">
      <div className="home-products-header">
        <div className="home-products-kicker">Explore</div>
        <h2 className="home-products-title">Search Results</h2>
        <p className="home-products-subtitle">
          {query ? `Results for \"${query}\"` : 'Enter a search term to find products'}
        </p>
        <form method="get" action="/search" role="search" className="search-page-search-wrap">
          <label htmlFor="page-q" className="visually-hidden">Search</label>
          <input
            id="page-q"
            name="q"
            type="search"
            className="nav-search-input"
            placeholder="Search products..."
            aria-label="Search products"
            defaultValue={query}
          />
          <button type="submit" className="nav-link nav-search-button">Search</button>
        </form>
      </div>
      
      
      {/* Search Results */}
      {query && (
        <div className="search-results">
          <div className="search-meta" style={{marginBottom: '1rem'}}>
            <p>{searchResult.items.length} results found</p>
            {searchInfo?.isFallback && (
              <p style={{color: '#ff6b35', fontSize: '0.9rem', marginTop: '0.5rem'}}>
                <strong>Showing all products</strong> - No specific matches found for "{query}"
              </p>
            )}
            {searchInfo?.queryUsed && !searchInfo.isFallback && (
              <p style={{color: '#666', fontSize: '0.8rem', marginTop: '0.25rem'}}>
                Search enhanced with case-insensitive matching
              </p>
            )}
          </div>
          
          {searchResult.items.length > 0 ? (
            <div className="home-products-grid grid-container">
              {searchResult.items.map((item: SearchItem) => (
                <ProductCard
                  key={item.id}
                  variant="home"
                  title={item.title}
                  description={item.description?.slice(0, 140) || undefined}
                  handle={item.handle}
                  imageUrl={item.imageUrl || undefined}
                  price={item.price || null}
                  fallbackLabel={item.title || 'Product'}
                />
              ))}
            </div>
          ) : (
            <div className="no-results" style={{
              textAlign: 'center',
              padding: '2rem',
              color: '#666'
            }}>
              <p style={{marginBottom: '1rem'}}>No products found matching "{query}".</p>
              <div style={{marginBottom: '1.5rem'}}>
                <p style={{fontSize: '0.9rem', color: '#888', marginBottom: '1rem'}}>Try:</p>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  fontSize: '0.9rem',
                  color: '#666'
                }}>
                  <li>• Different keywords or synonyms</li>
                  <li>• Checking your spelling</li>
                  <li>• Using more general terms</li>
                  <li>• Browsing all products below</li>
                </ul>
              </div>
              <Link
                to="/search?q=%2A"
                style={{
                  display: 'inline-block',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#28a745',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  fontWeight: '500'
                }}
              >
                Browse All Products
              </Link>
            </div>
          )}
          
          {/* Pagination */}
          {searchResult.pageInfo?.hasNextPage && (
            <div className="pagination" style={{textAlign: 'center', marginTop: '2rem'}}>
              <Link
                to={`/search?${new URLSearchParams({
                  ...Object.fromEntries(searchParams),
                  after: searchResult.pageInfo.endCursor || '',
                }).toString()}`}
                style={{
                  display: 'inline-block',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#007bff',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '4px'
                }}
              >
                Load More Results
              </Link>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
