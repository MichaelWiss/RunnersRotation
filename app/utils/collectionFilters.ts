import type {ProductCollectionSortKeys, ProductFilter} from '@shopify/hydrogen/storefront-api-types';

export type ViewMode = 'large' | 'medium' | 'small';

export const VIEW_MODE_VALUES: ViewMode[] = ['large', 'medium', 'small'];
const VIEW_MODE_SET = new Set<ViewMode>(VIEW_MODE_VALUES);
export const DEFAULT_VIEW_MODE: ViewMode = 'medium';

export type SortParam =
  | 'collection-default'
  | 'best-selling'
  | 'price-asc'
  | 'price-desc'
  | 'created-desc'
  | 'created-asc'
  | 'title-asc'
  | 'title-desc';

export type SortState = {
  param: SortParam;
  rawParam: string | null;
  sortKey: ProductCollectionSortKeys;
  reverse: boolean;
};

const SORT_PARAM_MAP: Record<SortParam, {sortKey: ProductCollectionSortKeys; reverse: boolean}> = {
  'collection-default': {sortKey: 'COLLECTION_DEFAULT', reverse: false},
  'best-selling': {sortKey: 'BEST_SELLING', reverse: false},
  'price-asc': {sortKey: 'PRICE', reverse: false},
  'price-desc': {sortKey: 'PRICE', reverse: true},
  'created-desc': {sortKey: 'CREATED', reverse: true},
  'created-asc': {sortKey: 'CREATED', reverse: false},
  'title-asc': {sortKey: 'TITLE', reverse: false},
  'title-desc': {sortKey: 'TITLE', reverse: true},
};

export const SORT_PARAM_VALUES: SortParam[] = Object.keys(SORT_PARAM_MAP) as SortParam[];

export const DEFAULT_SORT_PARAM: SortParam = 'collection-default';

export const SORT_LABELS: Record<SortParam, string> = {
  'collection-default': 'Featured',
  'best-selling': 'Best Selling',
  'price-asc': 'Price: Low to High',
  'price-desc': 'Price: High to Low',
  'created-desc': 'Newest First',
  'created-asc': 'Oldest First',
  'title-asc': 'Alphabetical (A–Z)',
  'title-desc': 'Alphabetical (Z–A)',
};

function stableSerialize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => stableSerialize(entry));
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, val]) => val !== undefined)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB));
    const result: Record<string, unknown> = {};
    for (const [key, val] of entries) {
      result[key] = stableSerialize(val);
    }
    return result;
  }
  return value;
}

export function encodeFilterParam(filter: ProductFilter): string {
  return JSON.stringify(stableSerialize(filter));
}

export function decodeFilterParam(value: string): ProductFilter | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as unknown;
    if (parsed && typeof parsed === 'object') {
      return parsed as ProductFilter;
    }
  } catch {
    // ignore parse failures
  }
  return null;
}

export function parseFilterParams(searchParams: URLSearchParams) {
  const rawInputs = searchParams.getAll('filter').filter(Boolean);
  const uniqueInputs = Array.from(new Set(rawInputs));
  const filters = uniqueInputs.reduce<ProductFilter[]>((acc, raw) => {
    const parsed = decodeFilterParam(raw);
    if (parsed) acc.push(parsed);
    return acc;
  }, []);
  return {filterInputs: uniqueInputs, filters};
}

export function parseViewModeParam(value: string | null): ViewMode {
  if (!value) return DEFAULT_VIEW_MODE;
  const normalized = value.toLowerCase() as ViewMode;
  return VIEW_MODE_SET.has(normalized) ? normalized : DEFAULT_VIEW_MODE;
}

export function parseSortParam(value: string | null): SortState {
  if (!value) {
    const defaults = SORT_PARAM_MAP[DEFAULT_SORT_PARAM];
    return {
      param: DEFAULT_SORT_PARAM,
      rawParam: null,
      sortKey: defaults.sortKey,
      reverse: defaults.reverse,
    };
  }
  const normalized = value.toLowerCase() as SortParam;
  const match = SORT_PARAM_MAP[normalized];
  if (match) {
    return {
      param: normalized,
      rawParam: value,
      sortKey: match.sortKey,
      reverse: match.reverse,
    };
  }
  const defaults = SORT_PARAM_MAP[DEFAULT_SORT_PARAM];
  return {
    param: DEFAULT_SORT_PARAM,
    rawParam: value,
    sortKey: defaults.sortKey,
    reverse: defaults.reverse,
  };
}

function resetPaginationParams(params: URLSearchParams) {
  params.delete('cursor');
  params.delete('page');
}

export function toggleFilterParam(searchParams: URLSearchParams, filter: ProductFilter): URLSearchParams {
  const next = new URLSearchParams(searchParams);
  const serialized = encodeFilterParam(filter);
  const existing = next.getAll('filter');
  const hasFilter = existing.includes(serialized);

  next.delete('filter');
  const updated = hasFilter ? existing.filter((value) => value !== serialized) : [...existing, serialized];
  updated.forEach((value) => next.append('filter', value));

  resetPaginationParams(next);
  return next;
}

export function clearFilterParams(searchParams: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams(searchParams);
  next.delete('filter');
  resetPaginationParams(next);
  return next;
}

export function setSortParam(searchParams: URLSearchParams, sortParam: SortParam): URLSearchParams {
  const next = new URLSearchParams(searchParams);
  if (sortParam === DEFAULT_SORT_PARAM) {
    next.delete('sort');
  } else {
    next.set('sort', sortParam);
  }
  resetPaginationParams(next);
  return next;
}

export function setViewModeParam(searchParams: URLSearchParams, viewMode: ViewMode): URLSearchParams {
  const next = new URLSearchParams(searchParams);
  if (viewMode === DEFAULT_VIEW_MODE) {
    next.delete('view');
  } else {
    next.set('view', viewMode);
  }
  return next;
}

export function normalizeFilterInputValue(input: string): string {
  const parsed = decodeFilterParam(input);
  return parsed ? encodeFilterParam(parsed) : input;
}

export function normalizeFilterInputList(inputs: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  inputs.forEach((input) => {
    const normalized = normalizeFilterInputValue(input);
    if (!seen.has(normalized)) {
      seen.add(normalized);
      result.push(normalized);
    }
  });
  return result;
}
