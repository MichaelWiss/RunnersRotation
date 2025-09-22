import {LinksFunction} from 'react-router';
import homepageStyles from '~/styles/homepage.css?url';

export const links: LinksFunction = () => [
  {rel: 'stylesheet', href: homepageStyles},
];

export default function Search() {
  return (
    <section className="section">
      <div className="home-products-header">
        <div className="home-products-kicker">Explore</div>
        <h2 className="home-products-title">Search</h2>
        <p className="home-products-subtitle">Find products across the store. Replace with real content.</p>
      </div>
    </section>
  );
}
