type ImageNode = {url: string; altText: string | null};

interface ProductGalleryProps {
  title?: string;
  subtitle?: string;
  description?: string;
  images?: ImageNode[];
}

export default function ProductGallery({title, subtitle, description, images}: ProductGalleryProps) {
  const main = images && images.length > 0 ? images[0] : undefined;
  const thumbList: ImageNode[] = [
    images?.[0],
    images?.[1],
    images?.[2],
  ].filter(Boolean) as ImageNode[];
  return (
    <section className="gallery" aria-labelledby="product-title">
      <div className="images">
        <div
          className="main-img"
          role="img"
          aria-label={main?.altText ?? 'Trail Runner Pro'}
          style={
            main
              ? {
                  backgroundImage: `url(${main.url})`,
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }
              : undefined
          }
        >
          {main ? '' : 'TRAIL RUNNER PRO'}
        </div>
        <div className="thumb-row">
          <div
            className="thumb"
            style={
              thumbList[0]
                ? {
                    backgroundImage: `url(${thumbList[0].url})`,
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                  }
                : {background: 'linear-gradient(135deg, var(--panel), var(--accent))'}
            }
          ></div>
          <div
            className="thumb"
            style={
              thumbList[1]
                ? {
                    backgroundImage: `url(${thumbList[1].url})`,
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                  }
                : {background: 'linear-gradient(135deg, var(--accent), var(--cta-hover))'}
            }
          ></div>
          <div
            className="thumb"
            style={
              thumbList[2]
                ? {
                    backgroundImage: `url(${thumbList[2].url})`,
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                  }
                : {background: 'linear-gradient(135deg, var(--muted), var(--panel))'}
            }
          ></div>
        </div>
      </div>
      <aside className="meta">
        <div>
          <div className="kicker">{title ?? 'Trail Runner Pro'}</div>
          <h1 id="product-title">Bold, grippy & ultra-responsive</h1>
          <div className="subtitle">{subtitle ?? 'Engineered for those who seek paths less traveled, this shoe delivers uncompromising performance on any terrain.'}</div>
        </div>

        <p className="desc">{description ?? 'A love letter to trail runners and mountain enthusiasts. This design combines three revolutionary technologies giving it the perfect balance of grip, protection, and comfort – the ultimate trail companion developed by our passionate design team.'}</p>

        <div className="info-grid" aria-hidden="false">
          <div><b>Drop</b><span>6mm heel-to-toe</span></div>
          <div><b>Weight</b><span>10.1 oz (Men's US 9)</span></div>
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
