import {useEffect, useMemo, useState} from 'react';
import type {LinksFunction} from 'react-router';
import {useLoaderData} from 'react-router';

import {loader as collectionLoader} from './collections.$handle';
export {loader} from './collections.$handle';
import type {CollectionLoaderData} from './collections.$handle';
import ProductCard from '~/components/ProductCard';
import homepageStyles from '~/styles/homepage.css?url';
import filtersStyles from '~/styles/collection-filters.css?url';

export const links: LinksFunction = () => [
  {rel: 'stylesheet', href: homepageStyles},
  {rel: 'stylesheet', href: filtersStyles},
];

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

const FALLBACK_PRODUCTS: CollectionLoaderData['products'] = [
  {
    id: 'demo-1',
    title: '21oz Selvedge Denim modified Type III Jacket- Indigo IH-526PJ',
    handle: 'demo-product-1',
    description:
      'Iconic Type III jacket silhouette in 21oz indigo selvedge denim with signature iron heart detailing.',
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop',
    price: {amount: '455.00', currencyCode: 'USD'},
  },
  {
    id: 'demo-2',
    title: '21oz Selvedge Denim Slim Cut Jeans - Superblack (Fades To Grey) IH-555S-SBG',
    handle: 'demo-product-2',
    description: 'Superblack selvedge denim that softens into a charcoal patina with wear.',
    imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop',
    price: {amount: '405.00', currencyCode: 'USD'},
  },
  {
    id: 'demo-3',
    title: 'RJ-1 Riders Jacket Waxed Canvas- Tobacco',
    handle: 'demo-product-3',
    description: 'Waxed canvas riders jacket built to patina beautifully through the seasons.',
    imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=500&fit=crop',
    price: {amount: '495.00', currencyCode: 'USD'},
  },
  {
    id: 'demo-4',
    title: 'Vintage Style T-Shirt - Sand',
    handle: 'demo-product-4',
    description: 'Soft, garment-dyed tee with a vintage wash and relaxed drape.',
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop',
    price: {amount: '85.00', currencyCode: 'USD'},
  },
  {
    id: 'demo-5',
    title: 'Work Shirt Jacket - Brown Duck',
    handle: 'demo-product-5',
    description: 'Durable duck canvas overshirt with utility pockets and triple-needle stitching.',
    imageUrl: 'https://images.unsplash.com/photo-1594938291221-94f18cbb5660?w=400&h=500&fit=crop',
    price: {amount: '285.00', currencyCode: 'USD'},
  },
  {
    id: 'demo-6',
    title: 'Western Shirt - Natural Herringbone',
    handle: 'demo-product-6',
    description: 'Heritage western shirt cut from mid-weight herringbone twill.',
    imageUrl: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&h=500&fit=crop',
    price: {amount: '295.00', currencyCode: 'USD'},
  },
  {
    id: 'demo-7',
    title: 'Heavy Flannel Shirt - Red Check',
    handle: 'demo-product-7',
    description: 'Brushed Japanese flannel in a bold red check with brushed interior.',
    imageUrl: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=400&h=500&fit=crop',
    price: {amount: '245.00', currencyCode: 'USD'},
  },
  {
    id: 'demo-8',
    title: 'Tapered Chino Pants - Olive',
    handle: 'demo-product-8',
    description: 'Tapered chinos cut from enzyme-washed twill with a hint of stretch.',
    imageUrl: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=400&h=500&fit=crop',
    price: {amount: '185.00', currencyCode: 'USD'},
  },
];

const FALLBACK_FILTERS: CollectionLoaderData['filters'] = [
  {
    id: 'demo-filter-product-type',
    label: 'Product Type',
    type: 'LIST',
    values: [
      {id: 'demo-filter-product-type-1', label: 'Jackets', count: 12, input: 'demo.product_type=jacket', active: false},
      {id: 'demo-filter-product-type-2', label: 'Shirts', count: 18, input: 'demo.product_type=shirt', active: false},
      {id: 'demo-filter-product-type-3', label: 'Pants', count: 9, input: 'demo.product_type=pants', active: false},
    ],
  },
  {
    id: 'demo-filter-availability',
    label: 'Availability',
    type: 'LIST',
    values: [
      {
        id: 'demo-filter-availability-1',
        label: 'In stock',
        count: 36,
        input: 'demo.availability=in-stock',
        active: false,
      },
      {
        id: 'demo-filter-availability-2',
        label: 'Preorder',
        count: 4,
        input: 'demo.availability=preorder',
        active: false,
      },
    ],
  },
  {
    id: 'demo-filter-color',
    label: 'Color',
    type: 'LIST',
    values: [
      {id: 'demo-filter-color-1', label: 'Indigo', count: 8, input: 'demo.color=indigo', active: false},
      {id: 'demo-filter-color-2', label: 'Black', count: 6, input: 'demo.color=black', active: false},
      {id: 'demo-filter-color-3', label: 'Earth', count: 11, input: 'demo.color=earth', active: false},
    ],
  },
  {
    id: 'demo-filter-size',
    label: 'Size',
    type: 'LIST',
    values: [
      {id: 'demo-filter-size-1', label: 'Small', count: 10, input: 'demo.size=small', active: false},
      {id: 'demo-filter-size-2', label: 'Medium', count: 14, input: 'demo.size=medium', active: false},
      {id: 'demo-filter-size-3', label: 'Large', count: 12, input: 'demo.size=large', active: false},
    ],
  },
];

export default function CollectionFiltersDemoRoute() {
  const {title, handle, products, filters, productsCount} = useLoaderData<typeof collectionLoader>() as CollectionLoaderData;
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('medium');

  const hasProducts = products.length > 0;
  const hasFilters = filters.length > 0;

  const displayProducts = hasProducts ? products : FALLBACK_PRODUCTS;
  const displayFilters = hasFilters ? filters : FALLBACK_FILTERS;
  const displayCount = hasProducts ? productsCount : displayProducts.length;

  const activeFilters = useMemo(
    () =>
      displayFilters.reduce((sum, group) => {
        return sum + group.values.filter((value) => value.active).length;
      }, 0),
    [displayFilters],
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

  const rootClass = filtersOpen ? 'collection-filters collection-filters--filters-open' : 'collection-filters';
  const gridModeClass = GRID_CLASS_BY_MODE[viewMode];
  const gridClassName = `products-grid collection-filters__grid ${gridModeClass}`;

  return (
    <section className={rootClass}>
      <header className="collection-filters__toolbar">
        <div className="collection-container collection-filters__toolbar-inner">
          <button className="collection-filters__filter-toggle" type="button" onClick={toggleFilters} aria-expanded={filtersOpen}>
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
            <span>
              Filters{activeFilters > 0 ? ` (${activeFilters})` : ''}
            </span>
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
                  title={`${mode.columns} columns`}
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
            {displayFilters.length === 0 ? (
              <p>No filters returned for this collection.</p>
            ) : (
              displayFilters.map((filter) => (
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
                            <input type="checkbox" disabled checked={value.active ?? false} readOnly />
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
          <div className="collection-filters__meta">
            <strong>{title}</strong>
            <span>&middot;</span>
            <span>{displayCount} products</span>
            <span>&middot;</span>
            <span>
              Demo layout &mdash; {hasProducts ? 'filter toggles are read-only' : 'showing sample catalog data'}
            </span>
          </div>

          <div className={gridClassName}>
            {displayProducts.length === 0 ? (
              <div className="home-products-empty">
                Add products to the "{handle}" collection in Shopify to populate this page.
              </div>
            ) : (
              displayProducts.map((product, index) => (
                <ProductCard
                  key={product.id || `demo-${index}`}
                  variant="footer"
                  title={product.title}
                  description={product.description ? product.description.slice(0, 120) : undefined}
                  handle={hasProducts ? product.handle : undefined}
                  imageUrl={product.imageUrl}
                  price={product.price || null}
                  fallbackLabel={product.title}
                />
              ))
            )}
          </div>
        </main>
      </div>
    </section>
  );
}
