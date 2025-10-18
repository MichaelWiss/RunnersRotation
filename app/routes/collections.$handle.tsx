import {useEffect, useMemo, useRef, useState, type CSSProperties} from 'react';
import {type LinksFunction, type LoaderFunctionArgs, useLoaderData} from 'react-router';
import homepageStyles from '~/styles/homepage.css?url';
import collectionFiltersStyles from '~/styles/collection-filters.css?url';
import ProductCard from '~/components/ProductCard';

type ProductSummary = {
  id: string;
  title: string;
  handle: string;
  description?: string | null;
  imageUrl?: string;
  price?: {amount: string; currencyCode: string} | null;
};

type FilterValue = {
  id: string;
  label: string;
  count: number;
  input: string;
  active: boolean;
};

type Filter = {
  id: string;
  label: string;
  type: string;
  values: FilterValue[];
};

type LoaderData = {
  title: string;
  handle: string;
  products: ProductSummary[];
  filters: Filter[];
  productsCount: number;
};

export type CollectionLoaderData = LoaderData;

type ViewMode = 'large' | 'medium' | 'small';

const VIEW_MODES: Array<{id: ViewMode; label: string; columns: number}> = [
  {id: 'large', label: 'Large Grid', columns: 2},
  {id: 'medium', label: 'Standard Grid', columns: 3},
  {id: 'small', label: 'Compact Grid', columns: 4},
];

const GRID_CLASS_BY_MODE: Record<ViewMode, string> = {
  large: 'collection-filters__grid--large',
  medium: 'collection-filters__grid--medium',
  small: 'collection-filters__grid--small',
};

export const links: LinksFunction = () => [
  {rel: 'stylesheet', href: homepageStyles},
  {rel: 'stylesheet', href: collectionFiltersStyles},
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
  type RawFilterValue = {
    id?: string | null;
    label?: string | null;
    count?: number | null;
    input?: string | null;
    active?: boolean | null;
  } | null;
  type RawFilter = {
    id?: string | null;
    label?: string | null;
    type?: string | null;
    values?: Array<RawFilterValue> | null;
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
    fragment FilterValueFields on FilterValue {
      id
      label
      count
      input
      active
    }
    fragment FilterFields on Filter {
      id
      label
      type
      values {
        ...FilterValueFields
      }
    }
    query CollectionByHandle($handle: String!, $count: Int!) {
      collection(handle: $handle) {
        id
        title
        description
        productsCount
        products(first: $count) {
          nodes { ...ProductCardFields }
          filters {
            ...FilterFields
          }
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
        productsCount?: number | null;
        products: {
          nodes: RawProduct[];
          filters?: RawFilter[] | null;
        };
      } | null;
    }>(query, {variables: {handle, count}});

    const title = data?.collection?.title || handle.replace(/-/g, ' ').replace(/\b\w/g, (m: string) => m.toUpperCase());
    const raw = data?.collection?.products?.nodes || [];

    const products = raw.reduce<ProductSummary[]>((acc, node) => {
      if (!node?.id || !node.handle) return acc;
      const imageUrl = node.images?.nodes?.[0]?.url ?? undefined;
      const price = node.variants?.nodes?.[0]?.price ?? null;
      acc.push({
        id: node.id,
        title: node.title ?? 'Untitled Product',
        handle: node.handle,
        description: node.description ?? null,
        imageUrl,
        price,
      });
      return acc;
    }, []);

    const rawFilters = data?.collection?.products?.filters ?? [];
    const filters = rawFilters.reduce<Filter[]>((acc, filter) => {
      if (!filter?.id) return acc;
      const values = (filter.values ?? []).reduce<FilterValue[]>((innerAcc, value) => {
        if (!value?.id || !value.input) return innerAcc;
        innerAcc.push({
          id: value.id,
          label: value.label ?? '',
          count: value.count ?? 0,
          input: value.input,
          active: Boolean(value.active),
        });
        return innerAcc;
      }, []);

      acc.push({
        id: filter.id,
        label: filter.label ?? '',
        type: filter.type ?? 'UNKNOWN',
        values,
      });
      return acc;
    }, []);

    const loaderData: LoaderData = {
      title,
      handle,
      products,
      filters,
      productsCount: data?.collection?.productsCount ?? products.length,
    };

    return loaderData;
  } catch (e) {
    // If the collection isn't found, return a 404
    throw new Response(null, {status: 404});
  }
}

export default function CollectionRoute() {
  const {title, handle, products, filters, productsCount} = useLoaderData<typeof loader>() as CollectionLoaderData;
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('medium');
  const toolbarRef = useRef<HTMLElement | null>(null);
  const initialToolbarTopRef = useRef<number | null>(null);
  const [toolbarHeight, setToolbarHeight] = useState(0);
  const [stickyOffset, setStickyOffset] = useState(0);
  const [toolbarStuck, setToolbarStuck] = useState(false);

  const activeFilters = useMemo(
    () =>
      filters.reduce((sum, group) => {
        return sum + group.values.filter((value) => value.active).length;
      }, 0),
    [filters],
  );

  useEffect(() => {
    if (!filtersOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setFiltersOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [filtersOpen]);

  useEffect(() => {
    if (filtersOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
    return;
  }, [filtersOpen]);

  const toggleFilters = () => setFiltersOpen((prev) => !prev);
  const closeFilters = () => setFiltersOpen(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const computeHeaderOffset = () => {
      const styles = getComputedStyle(document.documentElement);
      const headerH = parseFloat(styles.getPropertyValue('--header-h')) || 0;
      const announcementH = parseFloat(styles.getPropertyValue('--announcement-h')) || 0;
      return headerH + announcementH;
    };

    const updateMetrics = () => {
      const toolbar = toolbarRef.current;
      if (!toolbar) return;
      const rect = toolbar.getBoundingClientRect();
      initialToolbarTopRef.current = rect.top + window.scrollY;
      setToolbarHeight(toolbar.offsetHeight);
      setStickyOffset(computeHeaderOffset());
    };

    const handleScroll = () => {
      const toolbar = toolbarRef.current;
      if (!toolbar) return;
      const offset = computeHeaderOffset();
      setStickyOffset((prev) => (Math.abs(prev - offset) > 0.5 ? offset : prev));
      const initialTop =
        initialToolbarTopRef.current ?? toolbar.getBoundingClientRect().top + window.scrollY;
      setToolbarStuck(window.scrollY + offset >= initialTop);
    };

    const handleResize = () => {
      updateMetrics();
      handleScroll();
    };

    updateMetrics();
    handleScroll();

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, {passive: true});

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const rootClassName = `collection-filters${filtersOpen ? ' collection-filters--filters-open' : ''}`;
  const gridModeClass = GRID_CLASS_BY_MODE[viewMode];
  const gridClassName = `products-grid collection-filters__grid ${gridModeClass}`;
  const toolbarStyle: CSSProperties | undefined = toolbarStuck ? {top: `${stickyOffset}px`} : undefined;

  return (
    <section className={`collection-section ${rootClassName}`}>
      <header
        ref={toolbarRef}
        className={`collection-filters__toolbar${toolbarStuck ? ' collection-filters__toolbar--fixed' : ''}`}
        style={toolbarStyle}
      >
        <div className="collection-container collection-filters__toolbar-inner">
          <button
            className="collection-filters__filter-toggle"
            type="button"
            onClick={toggleFilters}
            aria-expanded={filtersOpen}
          >
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24">
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" />
              <line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
            <span>{filtersOpen ? 'Hide Filters' : 'Show Filters'}</span>
            {activeFilters > 0 ? <span className="collection-filters__active-count">{activeFilters}</span> : null}
          </button>

          <div className="collection-filters__toolbar-right">
            <button className="collection-filters__sort-button" type="button">
              Best Selling
            </button>
            <div className="collection-filters__view-toggle-group" role="group" aria-label="Change grid density">
              {VIEW_MODES.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  className={`collection-filters__view-toggle${viewMode === mode.id ? ' is-active' : ''}`}
                  onClick={() => setViewMode(mode.id)}
                  aria-pressed={viewMode === mode.id}
                  title={`${mode.columns} column${mode.columns > 1 ? 's' : ''}`}
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24">
                    <rect x="3" y="5" width="4" height="4" />
                    <rect x="3" y="11" width="4" height="4" />
                    <rect x="3" y="17" width="4" height="4" />
                    <rect x="10" y="5" width="4" height="4" />
                    <rect x="10" y="11" width="4" height="4" />
                    <rect x="10" y="17" width="4" height="4" />
                    <rect x="17" y="5" width="4" height="4" />
                    <rect x="17" y="11" width="4" height="4" />
                    <rect x="17" y="17" width="4" height="4" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>
      <div
        className="collection-filters__toolbar-spacer"
        aria-hidden="true"
        style={{height: toolbarStuck ? toolbarHeight : 0}}
      />

      <div className="collection-filters__layout">
        <div className="collection-filters__overlay" aria-hidden={!filtersOpen} onClick={closeFilters} />

        <aside
          className="collection-filters__sidebar"
          role="dialog"
          aria-modal="true"
          aria-label="Filter products"
          hidden={!filtersOpen}
        >
          <div className="collection-filters__sidebar-header">
            <h2>Filters</h2>
            <button className="collection-filters__sidebar-close" type="button" onClick={closeFilters} aria-label="Close filters">
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24">
                <line x1="5" y1="5" x2="19" y2="19" />
                <line x1="19" y1="5" x2="5" y2="19" />
              </svg>
            </button>
          </div>

          <div className="collection-filters__sidebar-scroller">
            {filters.length === 0 ? (
              <p>No filters available for this collection.</p>
            ) : (
              filters.map((filter) => (
                <div className="collection-filters__filter-group" key={filter.id}>
                  <button className="collection-filters__filter-heading" type="button">
                    <span>{filter.label}</span>
                    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24">
                      <polyline points="9 6 15 12 9 18" fill="none" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </button>
                  <div className="collection-filters__filter-body" aria-live="polite">
                    {filter.values.length === 0 ? (
                      <span className="collection-filters__filter-value">No options</span>
                    ) : (
                      filter.values.map((value) => (
                        <div className="collection-filters__filter-value" key={value.id}>
                          <label>
                            <input type="checkbox" disabled checked={Boolean(value.active)} readOnly />
                            <span>{value.label}</span>
                          </label>
                          <span className="collection-filters__filter-count">{value.count}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        <main className="collection-filters__main">
          <div className="collection-container">
            <div className="collection-filters__meta">
              <strong>{title}</strong>
              <span>&middot;</span>
              <span>{productsCount} products</span>
              {activeFilters > 0 ? (
                <>
                  <span>&middot;</span>
                  <span>{activeFilters} filter{activeFilters === 1 ? '' : 's'} applied</span>
                </>
              ) : null}
              <span>&middot;</span>
              <span>Toolbar layout demo &mdash; filtering not yet interactive</span>
            </div>

            <div className={gridClassName}>
              {products.length === 0 ? (
                <div className="home-products-empty">
                  Add products to the "{handle}" collection in Shopify to populate this page.
                </div>
              ) : (
                products.map((product) => (
                  <ProductCard
                    key={product.id}
                    variant="footer"
                    title={product.title}
                    description={product.description ? product.description.slice(0, 120) : undefined}
                    handle={product.handle}
                    imageUrl={product.imageUrl || undefined}
                    price={product.price || null}
                    fallbackLabel={product.title}
                  />
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </section>
  );
}
