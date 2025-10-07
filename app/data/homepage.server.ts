import type {Storefront} from '@shopify/hydrogen';
import {getStorefront} from '~/lib/shopify';

const MONEY_FRAGMENT = `#graphql
  fragment MoneyFragment on MoneyV2 {
    amount
    currencyCode
  }
`;

const IMAGE_FRAGMENT = `#graphql
  fragment ImageFragment on Image {
    url
    altText
  }
`;

const PRODUCT_CARD_FRAGMENT = `#graphql
  fragment ProductCardFields on Product {
    id
    title
    handle
    description
    images(first: 1) {
      nodes {
        ...ImageFragment
      }
    }
    variants(first: 1) {
      nodes {
        price {
          ...MoneyFragment
        }
      }
    }
  }
`;

const SHOWCASE_METAFIELD_IDENTIFIERS = [
  {namespace: 'homepage', key: 'hero_cta_text'},
  {namespace: 'homepage', key: 'hero_cta_link'},
  {namespace: 'homepage', key: 'hero_subtitle'},
  {namespace: 'homepage', key: 'hero_background'},
  {namespace: 'homepage', key: 'size_options'},
  {namespace: 'homepage', key: 'width_options'},
  {namespace: 'homepage', key: 'color_options'},
  {namespace: 'homepage', key: 'shipping_note'},
  {namespace: 'homepage', key: 'benefit_list'},
] as const;

const SHOWCASE_PRODUCT_FRAGMENT = `#graphql
  fragment ShowcaseProductFields on Product {
    id
    title
    handle
    description
    descriptionHtml
    featuredImage {
      ...ImageFragment
    }
    images(first: $galleryCount) {
      nodes {
        ...ImageFragment
      }
    }
    options {
      name
      values
    }
    variants(first: 10) {
      nodes {
        id
        title
        availableForSale
        price {
          ...MoneyFragment
        }
        selectedOptions {
          name
          value
        }
      }
    }
    metafields(identifiers: $metafieldIdentifiers) {
      namespace
      key
      value
      type
    }
  }
`;

const HOMEPAGE_QUERY = `#graphql
  ${MONEY_FRAGMENT}
  ${IMAGE_FRAGMENT}
  ${PRODUCT_CARD_FRAGMENT}
  ${SHOWCASE_PRODUCT_FRAGMENT}
  query HomepageData(
    $gridHandle: String!
    $showcaseHandle: String!
    $featuredHandle: String!
    $gridCount: Int!
    $featuredCount: Int!
    $galleryCount: Int!
    $metafieldIdentifiers: [HasMetafieldsIdentifier!]!
  ) {
    grid: collection(handle: $gridHandle) {
      id
      title
      products(first: $gridCount) {
        nodes {
          ...ProductCardFields
        }
      }
    }
    showcase: collection(handle: $showcaseHandle) {
      id
      title
      products(first: 1) {
        nodes {
          ...ShowcaseProductFields
        }
      }
    }
    featured: collection(handle: $featuredHandle) {
      id
      title
      products(first: $featuredCount) {
        nodes {
          ...ProductCardFields
        }
      }
    }
    fallback: products(first: $gridCount) {
      nodes {
        ...ProductCardFields
      }
    }
  }
`;

type Money = {amount: string; currencyCode: string};

type RawImage = {url: string | null; altText: string | null};

type RawMetafield = {
  namespace?: string | null;
  key?: string | null;
  value?: string | null;
  type?: string | null;
};

type RawProductCard = {
  id?: string | null;
  title?: string | null;
  handle?: string | null;
  description?: string | null;
  images?: {nodes?: Array<RawImage | null> | null} | null;
  variants?: {nodes?: Array<{price?: Money | null} | null> | null} | null;
};

type RawVariant = {
  id?: string | null;
  title?: string | null;
  availableForSale?: boolean | null;
  price?: Money | null;
  selectedOptions?: Array<{name?: string | null; value?: string | null} | null> | null;
};

type RawShowcaseProduct = RawProductCard & {
  descriptionHtml?: string | null;
  featuredImage?: RawImage | null;
  images?: {nodes?: Array<RawImage | null> | null} | null;
  options?: Array<{name?: string | null; values?: Array<string | null> | null} | null> | null;
  variants?: {nodes?: Array<RawVariant | null> | null} | null;
  metafields?: Array<RawMetafield | null> | null;
};

type HomepageQuery = {
  grid?: {
    title?: string | null;
    products?: {nodes?: Array<RawProductCard | null> | null} | null;
  } | null;
  showcase?: {
    title?: string | null;
    products?: {nodes?: Array<RawShowcaseProduct | null> | null} | null;
  } | null;
  featured?: {
    title?: string | null;
    products?: {nodes?: Array<RawProductCard | null> | null} | null;
  } | null;
  fallback?: {nodes?: Array<RawProductCard | null> | null} | null;
};

export interface ProductLite {
  id: string;
  title: string;
  handle: string;
  description?: string | null;
  imageUrl?: string | null;
  price?: Money | null;
}

export interface ShowcaseProduct {
  id: string;
  title: string;
  handle: string;
  description?: string | null;
  descriptionHtml?: string | null;
  imageUrl?: string | null;
  gallery: Array<{url: string; altText: string | null}>;
  price?: Money | null;
  available?: boolean;
  options: Array<{name: string; values: string[]}>;
  selectedOptions: Array<{name: string; value: string}>;
  variants: Array<{
    id: string;
    title: string;
    availableForSale: boolean;
    price: Money;
  }>;
  heroSubtitle?: string | null;
  heroBackgroundUrl?: string | null;
  heroCta?: {label: string; href?: string | null} | null;
  sizeOptions: string[];
  widthOptions: string[];
  colorOptions: string[];
  shippingNote?: string | null;
  benefits: string[];
}

export interface HomepageData {
  products: ProductLite[];
  productShowcase: ShowcaseProduct | null;
  showcaseCollectionTitle: string | null;
  collectionHandle: string;
  showcaseHandle: string;
  featuredProducts: ProductLite[];
  featuredCollectionTitle: string | null;
  featuredHandle: string;
}

const cleanString = (value: string | null | undefined) => {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

const parseList = (value: string | null | undefined): string[] => {
  const cleaned = cleanString(value);
  if (!cleaned) return [];
  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => (typeof item === 'string' ? item.trim() : ''))
        .filter(Boolean);
    }
  } catch {
    // fall through to delimiter split
  }
  return cleaned
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
};

function normalizeImage(image: RawImage | null | undefined): {url: string; altText: string | null} | null {
  if (!image?.url) return null;
  return {url: image.url, altText: image.altText ?? null};
}

function normalizeProductLite(node: RawProductCard | null | undefined): ProductLite | null {
  if (!node?.id || !node.handle) return null;
  const image = normalizeImage(node.images?.nodes?.[0] ?? null);
  const price = node.variants?.nodes?.[0]?.price ?? null;
  return {
    id: node.id,
    title: node.title ?? 'Untitled Product',
    handle: node.handle,
    description: node.description ?? null,
    imageUrl: image?.url ?? null,
    price: price ?? undefined,
  };
}

function normalizeVariant(variant: RawVariant | null | undefined): ShowcaseProduct['variants'][number] | null {
  if (!variant?.id || !variant.price) return null;
  return {
    id: variant.id,
    title: variant.title ?? 'Default',
    availableForSale: Boolean(variant.availableForSale),
    price: variant.price,
  };
}

function normalizeOptions(options: RawShowcaseProduct['options']): ShowcaseProduct['options'] {
  if (!Array.isArray(options)) return [];
  return options
    .map((opt) => {
      const name = cleanString(opt?.name);
      if (!name) return null;
      const values = Array.isArray(opt?.values)
        ? (opt?.values.map((value) => (value ? value.trim() : '')).filter(Boolean) as string[])
        : [];
      return {name, values};
    })
    .filter(Boolean) as ShowcaseProduct['options'];
}

function normalizeSelectedOptions(variants?: {nodes?: Array<RawVariant | null> | null} | null): ShowcaseProduct['selectedOptions'] {
  const first = variants?.nodes?.[0];
  if (!first?.selectedOptions) return [];
  return first.selectedOptions
    .map((opt) => {
      const name = cleanString(opt?.name);
      const value = cleanString(opt?.value);
      return name && value ? {name, value} : null;
    })
    .filter(Boolean) as ShowcaseProduct['selectedOptions'];
}

function normalizeShowcaseProduct(node: RawShowcaseProduct | null | undefined): ShowcaseProduct | null {
  if (!node?.id || !node.handle) return null;
  const gallery = (node.images?.nodes || [])
    .map((img) => normalizeImage(img ?? null))
    .filter(Boolean) as Array<{url: string; altText: string | null}>;

  const featured = normalizeImage(node.featuredImage ?? null);
  const variants = (node.variants?.nodes || [])
    .map((variant) => normalizeVariant(variant))
    .filter(Boolean) as ShowcaseProduct['variants'];

  const metafieldMap = new Map<string, string | null>();
  (node.metafields || []).forEach((meta) => {
    if (!meta?.namespace || !meta.key) return;
    metafieldMap.set(`${meta.namespace}:${meta.key}`, meta.value ?? null);
  });

  const getMeta = (namespace: string, key: string) => metafieldMap.get(`${namespace}:${key}`) ?? null;

  const heroSubtitle = cleanString(getMeta('homepage', 'hero_subtitle'));
  const heroBackgroundUrl = cleanString(getMeta('homepage', 'hero_background'));
  const heroCtaText = cleanString(getMeta('homepage', 'hero_cta_text'));
  const heroCtaLink = cleanString(getMeta('homepage', 'hero_cta_link'));
  const sizeOptions = parseList(getMeta('homepage', 'size_options'));
  const widthOptions = parseList(getMeta('homepage', 'width_options'));
  const colorOptions = parseList(getMeta('homepage', 'color_options'));
  const shippingNote = cleanString(getMeta('homepage', 'shipping_note'));
  const benefits = parseList(getMeta('homepage', 'benefit_list'));

  const heroCta = heroCtaText || heroCtaLink
    ? {
        label: heroCtaText ?? 'Explore Collection',
        href: heroCtaLink ?? undefined,
      }
    : null;

  return {
    id: node.id,
    title: node.title ?? 'Featured Product',
    handle: node.handle,
    description: node.description ?? null,
    descriptionHtml: node.descriptionHtml ?? null,
    imageUrl: featured?.url ?? gallery[0]?.url ?? null,
    gallery,
    price: node.variants?.nodes?.[0]?.price ?? undefined,
    available: node.variants?.nodes?.[0]?.availableForSale ?? undefined,
    options: normalizeOptions(node.options),
    selectedOptions: normalizeSelectedOptions(node.variants),
    variants,
    heroSubtitle,
    heroBackgroundUrl,
    heroCta,
    sizeOptions,
    widthOptions,
    colorOptions,
    shippingNote,
    benefits,
  };
}

export async function loadHomepageData(
  storefront: Storefront,
  {
    gridHandle,
    showcaseHandle,
    featuredHandle,
    gridCount = 6,
    featuredCount = 3,
    galleryCount = 4,
  }: {
    gridHandle: string;
    showcaseHandle: string;
    featuredHandle: string;
    gridCount?: number;
    featuredCount?: number;
    galleryCount?: number;
  },
): Promise<HomepageData> {
  const client = getStorefront({storefront});

  try {
    const data = await client.query<HomepageQuery>(HOMEPAGE_QUERY, {
      variables: {
        gridHandle,
        showcaseHandle,
        featuredHandle,
        gridCount,
        featuredCount,
        galleryCount,
        metafieldIdentifiers: SHOWCASE_METAFIELD_IDENTIFIERS.map(({namespace, key}) => ({namespace, key})),
      },
    });

    const rawGrid = data?.grid?.products?.nodes ?? [];
    const rawFallback = data?.fallback?.nodes ?? [];

    const seen = new Set<string>();
    const dedupedProducts: ProductLite[] = [...rawGrid, ...rawFallback]
      .map((node) => normalizeProductLite(node))
      .filter((product): product is ProductLite => {
        if (!product) return false;
        if (seen.has(product.id)) return false;
        seen.add(product.id);
        return true;
      })
      .slice(0, gridCount);

    const showcaseNode = data?.showcase?.products?.nodes?.[0] ?? null;
    const productShowcase = normalizeShowcaseProduct(showcaseNode);

    const products = productShowcase
      ? dedupedProducts.filter(
          (product) => product.id !== productShowcase.id && product.handle !== productShowcase.handle,
        )
      : dedupedProducts;

    const featuredRaw = data?.featured?.products?.nodes ?? [];
    const featuredProducts = featuredRaw
      .map((node) => normalizeProductLite(node))
      .filter((p): p is ProductLite => Boolean(p))
      .slice(0, featuredCount);

    return {
      products,
      productShowcase,
      showcaseCollectionTitle: data?.showcase?.title ?? null,
      collectionHandle: gridHandle,
      showcaseHandle,
      featuredProducts,
      featuredCollectionTitle: data?.featured?.title ?? null,
      featuredHandle,
    };
  } catch (error) {
    console.error('[homepage] failed to load data', error);
    return {
      products: [],
      productShowcase: null,
      showcaseCollectionTitle: null,
      collectionHandle: gridHandle,
      showcaseHandle,
      featuredProducts: [],
      featuredCollectionTitle: null,
      featuredHandle,
    };
  }
}
