// Core TypeScript interfaces for components
export interface Money {
  amount: string;
  currencyCode: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  price: Money;
  availableForSale: boolean;
  sku?: string;
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  description?: string;
  images: Array<{ src: string; alt?: string }>;
  variants: ProductVariant[];
  price: Money;
  compareAtPrice?: Money;
  tags?: string[];
  metafields?: Record<string, any>;
}

export interface NavigationItem {
  title: string;
  handle: string;
  url: string;
}

export interface Collection {
  id: string;
  title: string;
  handle: string;
  description?: string;
}

export interface HeaderProps {
  cartCount?: number;
  collections?: NavigationItem[];
}

export interface Shop {
  name?: string;
  description?: string;
}

export interface ShopPolicy {
  id: string;
  title: string;
  url: string;
}

export interface FooterProps {
  shopInfo?: Shop;
  policies?: ShopPolicy[];
}
