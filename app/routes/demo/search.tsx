import {type LinksFunction} from 'react-router';
import demoStyles from '~/styles/search-demo.css?url';
import homepageStyles from '~/styles/homepage.css?url';

export const links: LinksFunction = () => [
  {rel: 'stylesheet', href: homepageStyles},
  {rel: 'stylesheet', href: demoStyles},
];

export default function DemoSearch() {
  return (
    <section className="section">
      <div className="collection-container">
        <div className="demo-page-header">
          <div className="section-kicker">UI Demo</div>
          <h2 className="section-title">Expanding Search Control</h2>
          <p className="section-subtitle">Inspired by the CodePen, adapted to the site’s styling and using “Search” text</p>
        </div>

        <div className="demo-search-container">
          <form method="get" action="/search" className="demo-search-wrap" role="search">
            <input
              id="demo-q"
              name="q"
              type="search"
              className="demo-search-input"
              placeholder="Type to search..."
              aria-label="Search products"
            />
            <button type="submit" className="nav-link demo-search-button">Search</button>
          </form>
        </div>

        <div className="demo-note">
          Click “Search” to focus and expand the field. Type a term and press Enter to go to /search.
        </div>
      </div>
    </section>
  );
}
