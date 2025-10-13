import {memo, useMemo} from 'react';

type ImageNode = {url: string; altText: string | null};

interface ProductGalleryProps {
  title?: string;
  subtitle?: string;
  description?: string;
  images?: ImageNode[];
}

const ProductGallery = memo(function ProductGallery({title, subtitle, description, images}: ProductGalleryProps) {
  // Memoize expensive calculations
  const main = useMemo(() => {
    return images && images.length > 0 ? images[0] : undefined;
  }, [images]);

  const thumbList = useMemo(() => {
    return [
      images?.[0],
      images?.[1], 
      images?.[2],
    ].filter(Boolean) as ImageNode[];
  }, [images]);

  const fallbackLabel = 'TRAIL RUNNER PRO';

  // Memoize gradient styles
  const gradients = useMemo(() => [
    'linear-gradient(135deg, var(--panel), var(--accent))',
    'linear-gradient(135deg, var(--accent), var(--cta-hover))',
    'linear-gradient(135deg, var(--muted), var(--panel))',
  ], []);
  return (
    <section className="gallery" aria-labelledby="product-title">
      <div className="images">
        <div className={`main-img${main ? '' : ' main-img--fallback'}`} data-fallback-label={fallbackLabel}>
          {main ? <img src={main.url} alt={main.altText ?? 'Product image'} loading="eager" width="1200" height="1500" /> : null}
          <span className="main-img__label">{main ? '' : fallbackLabel}</span>
        </div>
        <div className="thumb-row">
          {[0, 1, 2].map((index) => {
            const thumb = thumbList[index];
            return (
              <div
                key={index}
                className="thumb"
                data-image-src={thumb?.url ?? ''}
                data-image-alt={thumb?.altText ?? ''}
                style={!thumb ? {background: gradients[index] || gradients[0]} : undefined}
              >
                {thumb ? <img src={thumb.url} alt={thumb.altText ?? ''} loading="lazy" width="400" height="500" /> : null}
              </div>
            );
          })}
        </div>
      </div>
      <aside className="meta">
        <div>
          <div className="kicker">{title ?? 'Trail Runner Pro'}</div>
          <h1 id="product-title">Bold, grippy & ultra-responsive</h1>
          {subtitle ? (
            <div className="subtitle">{subtitle}</div>
          ) : null}
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
          <div className="review-count">89 reviews</div>
          <div className="muted-note">94% positive – trusted by elite ultrarunners worldwide</div>
        </div>
      </aside>
    </section>
  );
});

export default ProductGallery;
