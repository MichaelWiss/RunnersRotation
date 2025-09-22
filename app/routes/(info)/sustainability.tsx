import {LinksFunction} from 'react-router';
import homepageStyles from '~/styles/homepage.css?url';

export const links: LinksFunction = () => [
  {rel: 'stylesheet', href: homepageStyles},
];

export default function Sustainability() {
  return (
    <section className="section">
      <div className="home-products-header">
        <div className="home-products-kicker">Impact</div>
        <h2 className="home-products-title">Sustainability</h2>
        <p className="home-products-subtitle">Our commitment to the planet. Replace with real content.</p>
      </div>
    </section>
  );
}
