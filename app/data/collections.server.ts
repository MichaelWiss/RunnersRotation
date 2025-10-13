import type {Storefront} from '@shopify/hydrogen';
import {getStorefront} from '~/lib/shopify';
import type {NavigationItem} from '~/types';

interface CollectionNode {
  id: string;
  title: string;
  handle: string;
  description?: string | null;
}

export async function loadCollectionsByHandles(
  storefront: Storefront,
  handles: string[],
): Promise<Map<string, NavigationItem>> {
  const uniqueHandles = Array.from(new Set(handles.map((handle) => handle.trim()).filter(Boolean)));
  if (uniqueHandles.length === 0) return new Map();

  const aliases = uniqueHandles
    .map((handle, index) => `collection_${index}: collection(handle: ${JSON.stringify(handle)}) {
      id
      title
      handle
      description
    }`)
    .join('\n');

  const query = `#graphql
    query CollectionsByHandle {
      ${aliases}
    }
  `;

  try {
    const client = getStorefront({storefront});
    const data = await client.query<Record<string, CollectionNode | null>>(query);
    // Note: Collections are naturally cached by Shopify's CDN

    const map = new Map<string, NavigationItem>();
    uniqueHandles.forEach((handle, index) => {
      const node = data?.[`collection_${index}`];
      if (!node?.id || !node.handle) return;
      map.set(handle, {
        title: node.title ?? handle,
        handle: node.handle,
        url: `/collections/${node.handle}`,
      });
    });

    return map;
  } catch (error) {
    console.error('[collections] failed to load navigation collections', error);
    return new Map();
  }
}
