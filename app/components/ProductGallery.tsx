export default function ProductGallery() {
  return (
    <section className="gallery" aria-labelledby="product-title">
      <div className="images">
        <div className="main-img" role="img" aria-label="Trail Runner Pro">TRAIL RUNNER PRO</div>
        <div className="thumb-row">
          <div className="thumb" style={{background: 'linear-gradient(135deg, var(--panel), var(--accent))'}}></div>
          <div className="thumb" style={{background: 'linear-gradient(135deg, var(--accent), var(--cta-hover))'}}></div>
          <div className="thumb" style={{background: 'linear-gradient(135deg, var(--muted), var(--panel))'}}></div>
        </div>
      </div>
      <aside className="meta">
        <div>
          <div className="kicker">Trail Runner Pro</div>
          <h1 id="product-title">Bold, grippy & ultra-responsive</h1>
          <div className="subtitle">Engineered for those who seek paths less traveled, this shoe delivers uncompromising performance on any terrain.</div>
        </div>

        <p className="desc">A love letter to trail runners and mountain enthusiasts. This design combines three revolutionary technologies giving it the perfect balance of grip, protection, and comfort – the ultimate trail companion developed by our passionate design team.</p>

        <div className="info-grid" aria-hidden="false">
          <div><b>Drop</b><span>6mm heel-to-toe</span></div>
          <div><b>Weight</b><span>285g (UK 9)</span></div>
          <div><b>Sole</b><span>Vibram MegaGrip</span></div>
          <div><b>Upper</b><span>Ripstop mesh &amp; TPU</span></div>
          <div><b>Protection</b><span>Rock plate &amp; toe guard</span></div>
          <div><b>Best for</b><span>Technical trails &amp; ultras</span></div>
        </div>

        <div className="reviews">
          <div className="stars">★★★★★</div>
          <div style={{fontWeight:700, marginTop:8}}>89 reviews</div>
          <div className="muted-note">94% positive – trusted by elite ultrarunners worldwide</div>
        </div>
      </aside>
    </section>
  );
}
