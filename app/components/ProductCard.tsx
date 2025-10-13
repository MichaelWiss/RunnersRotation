import {Link} from 'react-router';

export type ProductCardVariant = 'home' | 'footer';

export interface ProductCardProps {
  variant?: ProductCardVariant;
  title?: string | null;
  description?: string | null;
  handle?: string | null;
  imageUrl?: string | null;
  price?: {amount: string; currencyCode: string} | null;
  fallbackLabel?: string;
}

function formatPrice(price?: {amount: string; currencyCode: string} | null) {
  if (!price) return null;
  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: price.currencyCode,
    }).format(Number(price.amount));
  } catch {
    return `${price.currencyCode} ${price.amount}`;
  }
}

export default function ProductCard({
  variant = 'home',
  title,
  description,
  handle,
  imageUrl,
  price,
  fallbackLabel,
}: ProductCardProps) {
  const formattedPrice = formatPrice(price);
  if (variant === 'footer') {
    const content = (
      <div className="product-card">
        <div className={`card-image${imageUrl ? '' : ' card-image--placeholder'}`}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title ?? ''}
              loading="lazy"
              className="card-image-media"
            />
          ) : (
            <span>{fallbackLabel || title || 'Featured Product'}</span>
          )}
        </div>
        <div className="card-content">
          <h3 className="card-title">{title || 'Featured Product'}</h3>
          <p className="card-description">{description || 'Curated from your featured collection in Shopify.'}</p>
          <div className="card-price">{formattedPrice || 'View details'}</div>
        </div>
      </div>
    );
    return handle ? <Link to={`/products/${handle}`}>{content}</Link> : content;
  }

  const card = (
    <div className="home-product-card">
      <div className="home-product-image">
        {imageUrl ? (
          <img src={imageUrl} alt={title ?? ''} loading="lazy" />
        ) : (
          fallbackLabel || title || 'Featured Product'
        )}
      </div>
      <div className="home-product-content">
        <h3>{title || 'Featured Product'}</h3>
        <p>{description || 'Curated from your featured collection in Shopify.'}</p>
        <div className="home-product-price">{formattedPrice || 'View details'}</div>
        <div className="home-product-cta">Shop Now</div>
      </div>
    </div>
  );

  return handle ? (
    <Link to={`/products/${handle}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      {card}
    </Link>
  ) : (
    card
  );
}
