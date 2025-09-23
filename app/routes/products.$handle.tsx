import {type LinksFunction, type LoaderFunctionArgs, useLoaderData, useNavigate} from 'react-router';
import {useEffect} from 'react';
import productStyles from '~/styles/product.css?url';
import homepageStyles from '~/styles/homepage.css?url';
import Layout from '~/components/layout/Layout';
import ProductGallery from '~/components/ProductGallery';
import PurchaseCard from '~/components/PurchaseCard';

export async function loader({params, context}: LoaderFunctionArgs) {
  const {handle} = params;
  const {storefront, env} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  let product: {
    id: string;
    title: string;
    handle: string;
    description: string | null;
    descriptionHtml: string | null;
    featuredImage: {url: string; altText: string | null} | null;
    images: {nodes: Array<{url: string; altText: string | null}>};
    variants: {nodes: Array<{id: string; title: string; availableForSale: boolean; price: {amount: string; currencyCode: string}}>};
  } | null = null;

  try {
    const result = await storefront.query<{
    product: {
      id: string;
      title: string;
      handle: string;
      description: string | null;
      descriptionHtml: string | null;
      featuredImage: {url: string; altText: string | null} | null;
      images: {nodes: Array<{url: string; altText: string | null}>};
      variants: {nodes: Array<{id: string; title: string; availableForSale: boolean; price: {amount: string; currencyCode: string}}>};
    } | null;
    }>(
      `#graphql
    query ProductByHandle($handle: String!) {
      product(handle: $handle) {
        id
        title
        handle
        description
        descriptionHtml
        featuredImage { url altText }
        images(first: 10) { nodes { url altText } }
        variants(first: 10) { nodes { id title availableForSale price { amount currencyCode } } }
      }
    }`,
      {variables: {handle}},
    );
    product = result.product;
  } catch (e) {
    // swallow and handle below with mock/404 so we don't throw an internal error
    product = null;
  }

  if (!product?.id) {
    // Optional dev-only fallback: allows testing without Admin products
    if (env.DEV_MOCK_PRODUCTS === '1' && process.env.NODE_ENV === 'development') {
      const mock = {
        id: 'gid://shopify/Product/0',
        title: 'Trail Runner Pro (Mock)',
        handle: handle,
        description: 'Engineered for those who seek paths less traveled, this shoe delivers uncompromising performance on any terrain.',
        descriptionHtml:
          '<p>Engineered for those who seek paths less traveled, this shoe delivers uncompromising performance on any terrain.</p>',
        featuredImage: {url: 'https://placehold.co/1200x1200/png', altText: 'Mock Image'},
        images: {nodes: [
          {url: 'https://placehold.co/1200x1200/png?text=Main', altText: 'Main'},
          {url: 'https://placehold.co/300x300/png?text=Thumb+1', altText: 'Thumb 1'},
          {url: 'https://placehold.co/300x300/png?text=Thumb+2', altText: 'Thumb 2'}
        ]},
        variants: {nodes: [
          {id: 'gid://shopify/ProductVariant/0', title: 'Default', availableForSale: true, price: {amount: '185.00', currencyCode: 'GBP'}},
        ]},
      } as const;

      const firstVariant = mock.variants.nodes[0];
      return {
        product: {
          id: mock.id,
          title: mock.title,
          handle: mock.handle,
          description: mock.description,
          descriptionHtml: mock.descriptionHtml,
          featuredImage: mock.featuredImage,
          images: mock.images.nodes,
          price: firstVariant.price,
          available: firstVariant.availableForSale,
        },
      };
    }
    throw new Response(null, {status: 404});
  }

  // Derive a minimal shape for props without changing component structure
  const firstVariant = product.variants.nodes[0];
  const price = firstVariant?.price ?? null;
  const available = firstVariant?.availableForSale ?? false;
  const images = product.images.nodes;

  return {
    product: {
      id: product.id,
      title: product.title,
      handle: product.handle,
      description: product.description ?? undefined,
      descriptionHtml: product.descriptionHtml ?? undefined,
      featuredImage: product.featuredImage,
      images,
      price,
      available,
    },
  };
}

export const links: LinksFunction = () => [
  // Include shared header/footer/announcement styles
  {rel: 'stylesheet', href: homepageStyles},
  // Then product-specific styles to override page visuals as needed
  {rel: 'stylesheet', href: productStyles},
];

export default function Product() {
  const navigate = useNavigate();
  const {product} = useLoaderData<typeof loader>();

  // Scroll-driven blend value for header/background sync
  useEffect(() => {
    const updateScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = Math.min(documentHeight > 0 ? scrollTop / documentHeight : 0, 1);
      document.documentElement.style.setProperty('--scroll-percentage', String(scrollProgress));
    };
    updateScroll();
    window.addEventListener('scroll', updateScroll, {passive: true});
    return () => window.removeEventListener('scroll', updateScroll);
  }, []);

  // Interactions: pills toggle, qty +/- and thumbnails update main-img
  useEffect(() => {
    const onPill = (e: MouseEvent) => {
      const pill = (e.target as HTMLElement).closest('.pill') as HTMLElement | null;
      if (!pill) return;
      const group = pill.parentElement;
      if (!group) return;
      group.querySelectorAll('.pill').forEach((x) => x.classList.remove('active'));
      pill.classList.add('active');
    };
    const onQty = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest('.qty button') as HTMLButtonElement | null;
      if (!btn) return;
      const input = btn.parentElement?.querySelector('input') as HTMLInputElement | null;
      if (!input) return;
      let val = parseInt(input.value || '1', 10);
      if (btn.textContent?.trim() === '−') val = Math.max(1, val - 1);
      else val = val + 1;
      input.value = String(val);
    };
    const onThumb = (e: MouseEvent) => {
      const thumb = (e.target as HTMLElement).closest('.thumb') as HTMLElement | null;
      if (!thumb) return;
      const mainImg = document.querySelector('.main-img') as HTMLElement | null;
      if (!mainImg) return;
      const thumbs = Array.from(thumb.parentElement?.querySelectorAll('.thumb') || []);
      const index = thumbs.indexOf(thumb);
      const colors = [
        'linear-gradient(135deg, var(--panel), var(--accent))',
        'linear-gradient(135deg, var(--accent), var(--cta-hover))',
        'linear-gradient(135deg, var(--muted), var(--panel))',
      ];
      const names = ['MIDNIGHT/ORANGE', 'FOREST/LIME', 'CHARCOAL/RED'];
      mainImg.style.background = colors[index] || colors[0];
      mainImg.textContent = `TRAIL RUNNER PRO\n${names[index] || names[0]}`;
    };
    const onNav = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest('.nav-links a') as HTMLAnchorElement | null;
      if (!link) return;
      const text = link.textContent?.trim().toLowerCase();
      if (!text) return;
      e.preventDefault();
      if (text.includes('trail')) return navigate('/trail-running');
      if (text.includes('road')) return navigate('/road-running');
      if (text.includes('ultra')) return navigate('/ultralight');
      if (text.includes('racing')) return navigate('/racing');
      if (text.includes('account')) return navigate('/account');
      if (text.includes('cart')) return; // TODO: cart sidebar
    };
    document.addEventListener('click', onPill);
    document.addEventListener('click', onQty);
    document.addEventListener('click', onThumb);
    document.addEventListener('click', onNav);
    return () => {
      document.removeEventListener('click', onPill);
      document.removeEventListener('click', onQty);
      document.removeEventListener('click', onThumb);
      document.removeEventListener('click', onNav);
    };
  }, [navigate]);

  return (
    <Layout cartCount={0}>
      <div className="container">
        <main>
          <ProductGallery
            title={product.title}
            subtitle={product.description ? product.description.slice(0, 120) : undefined}
            description={product.description || undefined}
            images={product.images}
          />
          <div className="divider"></div>
        </main>
        <PurchaseCard
          price={product.price ? {amount: product.price.amount, currencyCode: product.price.currencyCode} : undefined}
          available={product.available}
        />
      </div>
    </Layout>
  );
}
