import { useState, useMemo, memo, useCallback } from 'react';
import { useCart } from '~/context/CartContext';

interface Variant {
  id: string;
  title: string;
  price: {amount: string; currencyCode: string};
  availableForSale: boolean;
}

const DEFAULT_SIZE_OPTIONS = ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12'];
const DEFAULT_WIDTH_OPTIONS = ['Regular', 'Wide', 'Extra Wide'];
const DEFAULT_COLOR_OPTIONS = ['Midnight/Orange', 'Forest/Lime', 'Charcoal/Red'];
const DEFAULT_BENEFITS = ['Sustainable materials', 'Recycled packaging', 'Carbon-neutral shipping'];

interface PurchaseCardProps {
  price?: {amount: string; currencyCode: string};
  available?: boolean;
  variants?: Variant[];
  sizeOptions?: string[];
  widthOptions?: string[];
  colorOptions?: string[];
  shippingNote?: string | null;
  benefits?: string[];
}

const PurchaseCard = memo(function PurchaseCard({
  price,
  available = true,
  variants = [],
  sizeOptions,
  widthOptions,
  colorOptions,
  shippingNote,
  benefits,
}: PurchaseCardProps) {
  const { addToCart, isLoading, error } = useCart();
  const [quantity, setQuantity] = useState(1);

  // Memoize expensive calculations
  const selectedVariant = useMemo(() => {
    return variants[0] || {
      id: 'mock-variant-id',
      title: 'Default',
      price: price || {amount: '185.00', currencyCode: 'USD'},
      availableForSale: available
    };
  }, [variants, price, available]);

  const sizes = useMemo(() => {
    return sizeOptions && sizeOptions.length ? sizeOptions : DEFAULT_SIZE_OPTIONS;
  }, [sizeOptions]);

  const widths = useMemo(() => {
    return widthOptions && widthOptions.length ? widthOptions : DEFAULT_WIDTH_OPTIONS;
  }, [widthOptions]);

  const colors = useMemo(() => {
    return colorOptions && colorOptions.length ? colorOptions : DEFAULT_COLOR_OPTIONS;
  }, [colorOptions]);

  const shippingNoteText = useMemo(() => {
    return shippingNote || 'Free U.S. shipping over $150 • 30-day trail guarantee • Expert fit support';
  }, [shippingNote]);

  const benefitsList = useMemo(() => {
    return benefits && benefits.length ? benefits : DEFAULT_BENEFITS;
  }, [benefits]);

  // Memoize formatted price
  const formattedPrice = useMemo(() => {
    if (!price) return '$185.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: price.currencyCode,
    }).format(Number(price.amount));
  }, [price]);

  // Memoize benefits text
  const benefitsText = useMemo(() => {
    return benefitsList.join(' • ');
  }, [benefitsList]);

  const handleAddToCart = useCallback(() => {
    if (selectedVariant.id === 'mock-variant-id') {
      return;
    }
    addToCart(selectedVariant.id, quantity);
  }, [selectedVariant.id, quantity, addToCart]);

  const handleQuantityChange = useCallback((newQuantity: number) => {
    setQuantity(Math.max(1, newQuantity));
  }, []);
  return (
    <aside className="card" aria-labelledby="purchase">
      <div className="price-row">
        <div>
          <div className="old">Regular price</div>
          <div className="price">
            {formattedPrice}
          </div>
        </div>
        <div className="unit-price">
          <div className="unit-price-label">Unit price</div>
          <div className="unit-price-unit">per pair</div>
        </div>
      </div>

      <div className="selectors">
        <div className="selector-label">Size (US)</div>
        <div className="select" role="list">
          {sizes.map((size, index) => (
            <button className={`pill${index === 0 ? ' active' : ''}`} role="listitem" key={`size-${size}`}>
              {size}
            </button>
          ))}
        </div>

        <div className="selector-label">Width</div>
        <div className="select">
          {widths.map((width, index) => (
            <button className={`pill${index === 0 ? ' active' : ''}`} key={`width-${width}`}>
              {width}
            </button>
          ))}
        </div>

        <div className="selector-label">Color</div>
        <div className="select">
          {colors.map((color, index) => (
            <button className={`pill${index === 0 ? ' active' : ''}`} key={`color-${color}`}>
              {color}
            </button>
          ))}
        </div>

        <div className="qty">
          <div className="selector-label">Quantity</div>
          <div className="qty-spacer"></div>
          <div className="qty-controls">
            <button 
              aria-label="Decrease" 
              onClick={() => handleQuantityChange(quantity - 1)}
            >
              −
            </button>
            <input 
              aria-label="Quantity" 
              value={quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
              min="1"
              type="number"
            />
            <button 
              aria-label="Increase"
              onClick={() => handleQuantityChange(quantity + 1)}
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="cta">
        <button 
          className="add-to-cart" 
          disabled={!selectedVariant.availableForSale || isLoading} 
          onClick={handleAddToCart}
          aria-disabled={!selectedVariant.availableForSale || isLoading}
        >
          {isLoading ? 'Adding...' : selectedVariant.availableForSale ? 'Add to cart' : 'Sold out'}
        </button>
        <div className="muted-note">{shippingNoteText}</div>
        {error ? (
          <p
            role="alert"
            aria-live="assertive"
            style={{ color: 'var(--accent)', marginTop: '12px', fontSize: '14px' }}
          >
            {error}
          </p>
        ) : null}
      </div>

      <div className="divider"></div>

      <div className="benefits-text">{benefitsText}</div>
    </aside>
  );
});

export default PurchaseCard;
