interface Product {
  title: string;
  handle: string;
  featuredImage?: {
    url: string;
    altText: string | null;
  } | null;
  variants: {
    nodes: Array<{
      price: {
        amount: string;
        currencyCode: string;
      };
    }>;
  };
  description?: string;
}

interface ProductCardProps {
  product: Product;
  loading?: 'eager' | 'lazy';
}

export default function ProductCard({ product, loading = 'lazy' }: ProductCardProps) {
  const variant = product.variants.nodes[0];
  const price = variant?.price;

  return (
    <article className="home-product-card">
      <div className="home-product-image">
        {product.featuredImage ? (
          <img 
            src={product.featuredImage.url}
            alt={product.featuredImage.altText || product.title}
            loading={loading}
          />
        ) : (
          <div className="home-product-placeholder">
            {product.title}
          </div>
        )}
      </div>
      <div className="home-product-content">
        <h3>{product.title}</h3>
        {product.description && (
          <p>{product.description.slice(0, 120)}...</p>
        )}
        {price && (
          <div className="home-product-price">
            £{price.amount}
          </div>
        )}
        <a href="#" className="home-product-cta">Shop {product.title}</a>
      </div>
    </article>
  );
}