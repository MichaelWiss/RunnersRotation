import {useEffect, useMemo, useRef, useState, type CSSProperties} from 'react';
import type {ChangeEvent} from 'react';
import {
  type LinksFunction,
  type LoaderFunctionArgs,
  useFetcher,
  useLoaderData,
  useLocation,
  useNavigate,
  useNavigation,
} from 'react-router';
import type {ProductCollectionSortKeys, ProductFilter} from '@shopify/hydrogen/storefront-api-types';
import homepageStyles from '~/styles/homepage.css?url';
import collectionFiltersStyles from '~/styles/collection-filters.css?url';
import ProductCard from '~/components/ProductCard';
import ViewModeIcon from '~/components/ViewModeIcon';
import {
  SORT_LABELS,
  clearFilterParams,
  decodeFilterParam,
  encodeFilterParam,
  parseFilterParams,
  parseSortParam,
  parseViewModeParam,
  setSortParam,
  setViewModeParam,
  SORT_PARAM_VALUES,
  toggleFilterParam,
  type SortState,
  type SortParam,
  type ViewMode,
  normalizeFilterInputValue,
  normalizeFilterInputList,
} from '~/utils/collectionFilters';

const VIEW_MODE_STORAGE_KEY = 'collection:view-mode';
const SIDEBAR_ID = 'collection-filters-sidebar';

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

type SortOption = {
  param: SortParam;
  label: string;
};

type LoaderData = {
  title: string;
  handle: string;
  products: ProductSummary[];
  filters: Filter[];
  productsCount: number;
  selectedFilterInputs: string[];
  selectedFilters: ProductFilter[];
  sort: SortState;
  sortOptions: SortOption[];
  viewMode: ViewMode;
};

export type CollectionLoaderData = LoaderData;

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

export async function loader({params, context, request}: LoaderFunctionArgs) {
  const {handle} = params;
  const {storefront, env} = context;

  if (!handle) {
    throw new Error('Expected collection handle to be defined');
  }

  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const {filterInputs: selectedFilterInputs, filters: selectedFilters} = parseFilterParams(searchParams);
  const viewMode = parseViewModeParam(searchParams.get('view'));
  const sortState = parseSortParam(searchParams.get('sort'));
  const sortOptions: SortOption[] = SORT_PARAM_VALUES.map((param) => ({
    param,
    label: SORT_LABELS[param] ?? param,
  }));

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
    }
    fragment FilterFields on Filter {
      id
      label
      type
      values {
        ...FilterValueFields
      }
    }
    query CollectionByHandle(
      $handle: String!
      $count: Int!
      $filters: [ProductFilter!]
      $sortKey: ProductCollectionSortKeys
      $reverse: Boolean
    ) {
      collection(handle: $handle) {
        id
        title
        description
        products(first: $count, filters: $filters, sortKey: $sortKey, reverse: $reverse) {
          nodes { ...ProductCardFields }
          filters {
            ...FilterFields
          }
        }
      }
    }
  `;

  const count = Number(env?.COLLECTION_PAGE_COUNT || 24);
  const variables: {
    handle: string;
    count: number;
    filters?: ProductFilter[];
    sortKey?: ProductCollectionSortKeys;
    reverse?: boolean;
  } = {
    handle,
    count,
  };
  if (selectedFilters.length > 0) {
    variables.filters = selectedFilters;
  }
  const shouldApplySort = sortState.param !== 'collection-default';
  if (shouldApplySort) {
    variables.sortKey = sortState.sortKey;
    variables.reverse = sortState.reverse;
  }

  try {
    const data = await storefront.query<{
      collection: {
        id: string;
        title: string | null;
        description: string | null;
        products: {
          nodes: RawProduct[];
          filters?: RawFilter[] | null;
        };
      } | null;
    }>(query, {variables, cache: storefront.CacheNone()});

    const raw = data?.collection?.products?.nodes || [];

    const inferredProductsCount = raw.length;

    if (process.env.NODE_ENV !== 'production') {
      console.log('[collections.loader]', {
        handle,
        selectedFilterCount: selectedFilters.length,
        productNodes: raw.length,
        productsCount: inferredProductsCount,
      });
      console.log('[collections.loader] rawNodes', raw);
    }

    const title = data?.collection?.title || handle.replace(/-/g, ' ').replace(/\b\w/g, (m: string) => m.toUpperCase());

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
        if (!value?.input) return innerAcc;
        const valueKey = value.id || value.input;
        innerAcc.push({
          id: valueKey,
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
      productsCount: inferredProductsCount,
      selectedFilterInputs,
      selectedFilters,
      sort: sortState,
      sortOptions,
      viewMode,
    };

    return loaderData;
  } catch (e) {
    // If the collection isn't found, return a 404
    throw new Response(null, {status: 404});
  }
}

export default function CollectionRoute() {
  const loaderData = useLoaderData<typeof loader>() as CollectionLoaderData;
  const fetcher = useFetcher<CollectionLoaderData>();
  const location = useLocation();
  const navigate = useNavigate();
  const navigation = useNavigation();

  const fetcherData = fetcher.data as CollectionLoaderData | undefined;
  const data = fetcherData && fetcherData.handle === loaderData.handle ? fetcherData : loaderData;

  const {
    title,
    handle,
    products,
    filters,
    productsCount,
    sort,
    sortOptions,
    viewMode: initialViewMode,
    selectedFilterInputs,
  } = data;
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);
  const toolbarRef = useRef<HTMLElement | null>(null);
  const initialToolbarTopRef = useRef<number | null>(null);
  const navOffsetRef = useRef(0);
  const [toolbarHeight, setToolbarHeight] = useState(0);
  const [navOffset, setNavOffset] = useState(0);
  const [toolbarStuck, setToolbarStuck] = useState(false);
  const [localFilterInputs, setLocalFilterInputs] = useState<string[]>(() =>
    normalizeFilterInputList(selectedFilterInputs),
  );
  const localFilterInputSet = useMemo(() => new Set(localFilterInputs), [localFilterInputs]);
  const activeFilters = localFilterInputs.length;
  const filterToggleRef = useRef<HTMLButtonElement | null>(null);
  const sidebarRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const prevFiltersOpenRef = useRef(filtersOpen);
  const [accordionState, setAccordionState] = useState<Record<string, boolean>>({});
  const isNavigationLoading = navigation.state !== 'idle';
  const isFetcherLoading = fetcher.state !== 'idle';
  const isLoading = isNavigationLoading || isFetcherLoading;
  const layoutClassName = `collection-filters__layout${isLoading ? ' is-loading' : ''}`;
  const filterMetadata = useMemo(() => {
    const map = new Map<string, {label: string; groupLabel: string}>();
    filters.forEach((group) => {
      group.values.forEach((value) => {
        const meta = {label: value.label, groupLabel: group.label};
        map.set(value.input, meta);
        map.set(normalizeFilterInputValue(value.input), meta);
      });
    });
    return map;
  }, [filters]);
  const activeChips = useMemo(() => {
    const seen = new Set<string>();
    const chips: Array<{input: string; label: string; groupLabel: string}> = [];
    localFilterInputs.forEach((input) => {
      if (seen.has(input)) return;
      seen.add(input);
      const meta = filterMetadata.get(input);
      if (meta) {
        chips.push({input, label: meta.label, groupLabel: meta.groupLabel});
      }
    });
    return chips;
  }, [filterMetadata, localFilterInputs]);
  const hasActiveChips = activeChips.length > 0;

  const submitSearchParams = (params: URLSearchParams) => {
    const search = params.toString();
    const currentSearch = location.search.startsWith('?') ? location.search.slice(1) : location.search;
    if (search === currentSearch) return;
    const href = `${location.pathname}${search ? `?${search}` : ''}`;
    fetcher.load(href);
    navigate(href);
  };

  const handleFilterToggle = (rawInput: string) => {
    const parsed = decodeFilterParam(rawInput);
    if (!parsed) return;
    const nextParams = toggleFilterParam(new URLSearchParams(location.search), parsed);
    setLocalFilterInputs(normalizeFilterInputList(nextParams.getAll('filter')));
    submitSearchParams(nextParams);
  };

  const toggleAccordion = (filterId: string) => {
    setAccordionState((prev) => {
      const previous = prev[filterId];
      const nextValue = previous === undefined ? false : !previous;
      return {...prev, [filterId]: nextValue};
    });
  };

  const handleClearFilters = () => {
    if (localFilterInputs.length === 0) return;
    const nextParams = clearFilterParams(new URLSearchParams(location.search));
    setLocalFilterInputs([]);
    submitSearchParams(nextParams);
  };

  const handleSortChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextParam = event.target.value as SortParam;
    if (nextParam === sort.param) return;
    const nextParams = setSortParam(new URLSearchParams(location.search), nextParam);
    submitSearchParams(nextParams);
  };

  const handleViewModeChange = (mode: ViewMode) => {
    if (mode === viewMode) return;
    setViewMode(mode);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
      } catch {
        // Ignore storage write failures (private mode, etc.)
      }
    }
    const nextParams = setViewModeParam(new URLSearchParams(location.search), mode);
    submitSearchParams(nextParams);
  };

  useEffect(() => {
    setViewMode(initialViewMode);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, initialViewMode);
      } catch {
        // Ignore storage persistence errors
      }
    }
  }, [initialViewMode]);

  useEffect(() => {
    setLocalFilterInputs(normalizeFilterInputList(selectedFilterInputs));
  }, [selectedFilterInputs]);

  const getFocusableElements = () => {
    const sidebar = sidebarRef.current;
    if (!sidebar) return [] as HTMLElement[];
    const selectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');
    return Array.from(sidebar.querySelectorAll<HTMLElement>(selectors)).filter((element) => {
      if (element.hasAttribute('data-ignore-focus-trap')) return false;
      return element.offsetParent !== null || element.getClientRects().length > 0;
    });
  };

  useEffect(() => {
    if (!filtersOpen) return;

    previousActiveElementRef.current = document.activeElement as HTMLElement | null;

    const focusFirstElement = () => {
      const focusable = getFocusableElements();
      const preferred = closeButtonRef.current || focusable[0];
      preferred?.focus({preventScroll: true});
    };

    focusFirstElement();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        const focusable = getFocusableElements();
        if (focusable.length === 0) {
          event.preventDefault();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (event.shiftKey) {
          if (!active || active === first) {
            event.preventDefault();
            last.focus({preventScroll: true});
          }
        } else if (active === last) {
          event.preventDefault();
          first.focus({preventScroll: true});
        }
      } else if (event.key === 'Escape') {
        event.preventDefault();
        setFiltersOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
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

  useEffect(() => {
    if (prevFiltersOpenRef.current && !filtersOpen) {
      const target = previousActiveElementRef.current || filterToggleRef.current;
      target?.focus({preventScroll: true});
      previousActiveElementRef.current = null;
    }
    prevFiltersOpenRef.current = filtersOpen;
  }, [filtersOpen]);

  useEffect(() => {
    setAccordionState((prev) => {
      const next: Record<string, boolean> = {};
      filters.forEach((filter) => {
        next[filter.id] = prev[filter.id] ?? true;
      });
      return next;
    });
  }, [filters]);

  const toggleFilters = () => setFiltersOpen((prev) => !prev);
  const closeFilters = () => setFiltersOpen(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const computeNavOffset = () => {
      const styles = getComputedStyle(document.documentElement);
      const headerH = parseFloat(styles.getPropertyValue('--header-h')) || 0;
      const announcementH = parseFloat(styles.getPropertyValue('--announcement-h')) || 0;
      const total = headerH + announcementH;
      if (Math.abs(navOffsetRef.current - total) > 0.5) {
        navOffsetRef.current = total;
        setNavOffset(total);
      } else {
        navOffsetRef.current = total;
      }
    };

    const updateToolbarMetrics = () => {
      const toolbar = toolbarRef.current;
      if (!toolbar) return;
      initialToolbarTopRef.current = toolbar.getBoundingClientRect().top + window.scrollY;
      setToolbarHeight(toolbar.offsetHeight);
    };

    const handleScroll = () => {
      if (initialToolbarTopRef.current == null) return;
      const offset = navOffsetRef.current;
      const shouldStick = window.scrollY + offset >= initialToolbarTopRef.current;
      setToolbarStuck((prev) => (prev !== shouldStick ? shouldStick : prev));
    };

    const handleResize = () => {
      computeNavOffset();
      updateToolbarMetrics();
      handleScroll();
    };

    let rafId: number | null = null;

    const initialize = () => {
      if (!toolbarRef.current) {
        rafId = window.requestAnimationFrame(initialize);
        return;
      }
      computeNavOffset();
      updateToolbarMetrics();
      handleScroll();
      window.addEventListener('scroll', handleScroll, {passive: true});
      window.addEventListener('resize', handleResize);
    };

    initialize();

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const toolbar = toolbarRef.current;
    if (!toolbar) return;
    setToolbarHeight(toolbar.offsetHeight);

    if (!toolbarStuck) {
      initialToolbarTopRef.current = toolbar.getBoundingClientRect().top + window.scrollY;
      if (initialToolbarTopRef.current != null) {
        const offset = navOffsetRef.current;
        const shouldStick = window.scrollY + offset >= initialToolbarTopRef.current;
        setToolbarStuck((prev) => (prev !== shouldStick ? shouldStick : prev));
      }
    }
  }, [filtersOpen, viewMode, toolbarStuck]);

  const rootClassName = `collection-filters${filtersOpen ? ' collection-filters--filters-open' : ''}`;
  const gridModeClass = GRID_CLASS_BY_MODE[viewMode];
  const gridClassName = `products-grid collection-filters__grid ${gridModeClass}`;
  const toolbarStyle: CSSProperties | undefined = toolbarStuck ? {top: `${navOffset}px`} : undefined;
  const sectionStyle = useMemo(
    () =>
      ({
        '--collection-toolbar-height': `${toolbarHeight}px`,
        '--collection-nav-offset': `${navOffset}px`,
      }) as CSSProperties,
    [toolbarHeight, navOffset],
  );

  return (
    <section className={`collection-section ${rootClassName}`} style={sectionStyle}>
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
            aria-controls={SIDEBAR_ID}
            ref={filterToggleRef}
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
            <button
              className="collection-filters__clear-button"
              type="button"
              onClick={handleClearFilters}
              disabled={localFilterInputs.length === 0 || isLoading}
            >
              Clear filters
            </button>
            <div className="collection-filters__sort">
              <label className="collection-filters__sort-label" htmlFor="collection-sort">
                Sort
              </label>
              <select
                id="collection-sort"
                className="collection-filters__sort-select"
                value={sort.param}
                onChange={handleSortChange}
                disabled={isLoading}
              >
                {sortOptions.map((option) => (
                  <option key={option.param} value={option.param}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="collection-filters__view-toggle-group" role="group" aria-label="Change grid density">
              {VIEW_MODES.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  className={`collection-filters__view-toggle${viewMode === mode.id ? ' is-active' : ''}`}
                  onClick={() => handleViewModeChange(mode.id)}
                  aria-pressed={viewMode === mode.id}
                  title={`${mode.columns} column${mode.columns > 1 ? 's' : ''}`}
                >
                  <ViewModeIcon mode={mode.id} />
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

      <div className={layoutClassName}>
        <div className="collection-filters__overlay" aria-hidden={!filtersOpen} onClick={closeFilters} />

        <aside
          className="collection-filters__sidebar"
          role="dialog"
          aria-modal="true"
          aria-label="Filter products"
          hidden={!filtersOpen}
          id={SIDEBAR_ID}
          ref={sidebarRef}
          aria-labelledby="collection-filters-heading"
        >
          <div className="collection-filters__sidebar-header">
            <h2 id="collection-filters-heading">Filters</h2>
            <button
              className="collection-filters__sidebar-close"
              type="button"
              onClick={closeFilters}
              aria-label="Close filters"
              ref={closeButtonRef}
            >
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24">
                <line x1="5" y1="5" x2="19" y2="19" />
                <line x1="19" y1="5" x2="5" y2="19" />
              </svg>
            </button>
          </div>

          <fetcher.Form method="get" action={location.pathname} className="collection-filters__form" onSubmit={(event) => event.preventDefault()}>
            <div className="collection-filters__sidebar-scroller">
              {filters.length === 0 ? (
                <p className="collection-filters__empty">
                  No filters are configured for this collection. Enable storefront filters in Shopify&apos;s Search &amp;
                  Discovery app to populate this drawer.
                </p>
              ) : (
                filters.map((filter) => {
                  const expanded = accordionState[filter.id] ?? true;
                  const panelId = `collection-filter-panel-${filter.id}`;
                  const buttonId = `collection-filter-toggle-${filter.id}`;
                  return (
                    <div
                      className={`collection-filters__filter-group${expanded ? '' : ' is-collapsed'}`}
                      key={filter.id}
                    >
                      <button
                        id={buttonId}
                        className="collection-filters__filter-heading"
                        type="button"
                        aria-expanded={expanded}
                        aria-controls={panelId}
                        onClick={() => toggleAccordion(filter.id)}
                      >
                        <span>{filter.label}</span>
                        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24">
                          <polyline points="9 6 15 12 9 18" fill="none" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      </button>
                      <div
                        id={panelId}
                        className="collection-filters__filter-body"
                        aria-live="polite"
                        role="region"
                        aria-labelledby={buttonId}
                        hidden={!expanded}
                      >
                        {filter.values.length === 0 ? (
                          <span className="collection-filters__filter-value">No options</span>
                        ) : (
                          filter.values.map((value) => {
                            const normalizedValue = normalizeFilterInputValue(value.input);
                            const isChecked = value.active || localFilterInputSet.has(normalizedValue);
                            return (
                              <div className="collection-filters__filter-value" key={value.id}>
                                <label>
                                  <input
                                    type="checkbox"
                                    name="filter"
                                    value={value.input}
                                    checked={isChecked}
                                    onChange={() => handleFilterToggle(value.input)}
                                  />
                                  <span>{value.label}</span>
                                </label>
                                <span className="collection-filters__filter-count">{value.count}</span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="collection-filters__form-footer">
              <button
                className="collection-filters__clear"
                type="button"
                onClick={handleClearFilters}
                disabled={localFilterInputs.length === 0 || isLoading}
              >
                Clear all filters
              </button>
            </div>
          </fetcher.Form>
        </aside>

        <main className="collection-filters__main" aria-hidden={filtersOpen}>
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
              {isLoading ? (
                <>
                  <span>&middot;</span>
                  <span>Updating results&hellip;</span>
                </>
              ) : null}
            </div>
            {hasActiveChips ? (
              <div className="collection-filters__chips">
                {activeChips.map((chip) => (
                  <button
                    key={chip.input}
                    type="button"
                    className="collection-filters__chip"
                    onClick={() => handleFilterToggle(chip.input)}
                    disabled={isLoading}
                    aria-label={`Remove ${chip.groupLabel} ${chip.label} filter`}
                  >
                    <span className="collection-filters__chip-label">
                      <span className="collection-filters__chip-group">{chip.groupLabel}</span>
                      <span>:</span>
                      <span>{chip.label}</span>
                    </span>
                    <svg aria-hidden="true" viewBox="0 0 24 24">
                      <line x1="6" y1="6" x2="18" y2="18" />
                      <line x1="18" y1="6" x2="6" y2="18" />
                    </svg>
                  </button>
                ))}
                <button
                  type="button"
                  className="collection-filters__chip collection-filters__chip--clear"
                  onClick={handleClearFilters}
                  disabled={isLoading}
                >
                  Clear all
                </button>
              </div>
            ) : null}

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
