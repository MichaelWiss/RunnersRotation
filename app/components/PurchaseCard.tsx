import { useState } from 'react';
import { useCart } from '~/context/CartContext';

interface Variant {
  id: string;
  title: string;
  price: {amount: string; currencyCode: string};
  availableForSale: boolean;
}

interface PurchaseCardProps {
  price?: {amount: string; currencyCode: string};
  available?: boolean;
  variants?: Variant[];
}

export default function PurchaseCard({price, available = true, variants = []}: PurchaseCardProps) {
  const { addToCart, isLoading } = useCart();
  const [quantity, setQuantity] = useState(1);
  
  // Use first variant as default, or create a fallback
  const selectedVariant = variants[0] || {
    id: 'mock-variant-id',
    title: 'Default',
    price: price || {amount: '185.00', currencyCode: 'GBP'},
    availableForSale: available
  };
  
  const handleAddToCart = () => {
    console.log('Adding to cart:', selectedVariant.id, quantity);
    if (selectedVariant.id === 'mock-variant-id') {
      console.warn('Cannot add mock variant to cart - need real Shopify variant ID');
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
            {price ? `${new Intl.NumberFormat('en-GB', {style: 'currency', currency: price.currencyCode}).format(Number(price.amount))}` : '£185.00'}
          </div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontSize:13,color:'var(--muted)',fontWeight:700}}>Unit price</div>
          <div style={{fontSize:13,color:'var(--muted)'}}>per pair</div>
        </div>
      </div>

      <div className="selectors">
        <div style={{fontSize:13,color:'var(--muted)',fontWeight:700}}>Size (UK)</div>
        <div className="select" role="list">
          <button className="pill" role="listitem">7</button>
          <button className="pill" role="listitem">7.5</button>
          <button className="pill" role="listitem">8</button>
          <button className="pill active" role="listitem">8.5</button>
          <button className="pill" role="listitem">9</button>
          <button className="pill" role="listitem">9.5</button>
          <button className="pill" role="listitem">10</button>
          <button className="pill" role="listitem">10.5</button>
          <button className="pill" role="listitem">11</button>
          <button className="pill" role="listitem">11.5</button>
          <button className="pill" role="listitem">12</button>
        </div>

        <div style={{fontSize:13,color:'var(--muted)',fontWeight:700}}>Width</div>
        <div className="select">
          <button className="pill active">Regular</button>
          <button className="pill">Wide</button>
          <button className="pill">Extra Wide</button>
        </div>

        <div style={{fontSize:13,color:'var(--muted)',fontWeight:700}}>Color</div>
        <div className="select">
          <button className="pill active">Midnight/Orange</button>
          <button className="pill">Forest/Lime</button>
          <button className="pill">Charcoal/Red</button>
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
        <div className="muted-note">Free UK shipping over £150 • 30-day trail guarantee • Expert fitting available</div>
      </div>

      <div className="divider"></div>

      <div style={{fontSize:13,color:'var(--muted)'}}>Sustainable materials • Recycled packaging • Carbon neutral shipping</div>
    </aside>
  );
}
