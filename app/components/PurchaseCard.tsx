export default function PurchaseCard() {
  return (
    <aside className="card" aria-labelledby="purchase">
      <div className="price-row">
        <div>
          <div className="old">Regular price</div>
          <div className="price">£185.00</div>
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
            <button aria-label="Decrease">−</button>
            <input aria-label="Quantity" defaultValue={1} />
            <button aria-label="Increase">+</button>
          </div>
        </div>
      </div>

      <div className="cta">
        <button className="add-to-cart">Add to cart</button>
        <div className="muted-note">Free UK shipping over £150 • 30-day trail guarantee • Expert fitting available</div>
      </div>

      <div className="divider"></div>

      <div style={{fontSize:13,color:'var(--muted)'}}>Sustainable materials • Recycled packaging • Carbon neutral shipping</div>
    </aside>
  );
}
