import {LinksFunction} from 'react-router';
import homepageStyles from '~/styles/homepage.css?url';

export const links: LinksFunction = () => [
  {rel: 'stylesheet', href: homepageStyles},
];

export default function FAQs() {
  return (
    <section className="section">
      <div className="home-products-header">
        <div className="home-products-kicker">Support</div>
        <h2 className="home-products-title">FAQ's</h2>
        <p className="home-products-subtitle">Frequently asked questions. Replace with real content.</p>
      </div>
    </section>
  );
}
