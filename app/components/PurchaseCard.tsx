import { useState } from 'react';
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

export default function PurchaseCard({
  price,
  available = true,
  variants = [],
  sizeOptions,
  widthOptions,
  colorOptions,
  shippingNote,
  benefits,
}: PurchaseCardProps) {
  const { addToCart, isLoading } = useCart();
  const [quantity, setQuantity] = useState(1);

  // Use first variant as default, or create a fallback
  const selectedVariant = variants[0] || {
    id: 'mock-variant-id',
    title: 'Default',
    price: price || {amount: '185.00', currencyCode: 'USD'},
    availableForSale: available
  };

  const sizes = sizeOptions && sizeOptions.length ? sizeOptions : DEFAULT_SIZE_OPTIONS;
  const widths = widthOptions && widthOptions.length ? widthOptions : DEFAULT_WIDTH_OPTIONS;
  const colors = colorOptions && colorOptions.length ? colorOptions : DEFAULT_COLOR_OPTIONS;
  const shippingNoteText = shippingNote || 'Free U.S. shipping over $150 • 30-day trail guarantee • Expert fit support';
  const benefitsList = benefits && benefits.length ? benefits : DEFAULT_BENEFITS;

  const handleAddToCart = () => {
    if (selectedVariant.id === 'mock-variant-id') {
      return;
    }
    addToCart(selectedVariant.id, quantity);
  };

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(Math.max(1, newQuantity));
  };
  return (
    <aside className="card" aria-labelledby="purchase">
      <div className="price-row">
        <div>
          <div className="old">Regular price</div>
          <div className="price">
            {price
              ? new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: price.currencyCode,
                }).format(Number(price.amount))
              : '$185.00'}
          </div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontSize:13,color:'var(--muted)',fontWeight:700}}>Unit price</div>
          <div style={{fontSize:13,color:'var(--muted)'}}>per pair</div>
        </div>
      </div>

      <div className="selectors">
        <div style={{fontSize:13,color:'var(--muted)',fontWeight:700}}>Size (US)</div>
        <div className="select" role="list">
          {sizes.map((size, index) => (
            <button className={`pill${index === 0 ? ' active' : ''}`} role="listitem" key={`size-${size}`}>
              {size}
            </button>
          ))}
        </div>

        <div style={{fontSize:13,color:'var(--muted)',fontWeight:700}}>Width</div>
        <div className="select">
          {widths.map((width, index) => (
            <button className={`pill${index === 0 ? ' active' : ''}`} key={`width-${width}`}>
              {width}
            </button>
          ))}
        </div>

        <div style={{fontSize:13,color:'var(--muted)',fontWeight:700}}>Color</div>
        <div className="select">
          {colors.map((color, index) => (
            <button className={`pill${index === 0 ? ' active' : ''}`} key={`color-${color}`}>
              {color}
            </button>
          ))}
        </div>

        <div className="qty">
          <div style={{fontSize:13,color:'var(--muted)',fontWeight:700}}>Quantity</div>
          <div style={{flex:1}}></div>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
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
      </div>

      <div className="divider"></div>

      <div style={{fontSize:13,color:'var(--muted)'}}>{benefitsList.join(' • ')}</div>
    </aside>
  );
}
