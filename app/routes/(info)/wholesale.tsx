import {LinksFunction} from 'react-router';
import homepageStyles from '~/styles/homepage.css?url';

export const links: LinksFunction = () => [
  {rel: 'stylesheet', href: homepageStyles},
];

export default function Wholesale() {
  return (
    <section className="section">
      <div className="home-products-header">
        <div className="home-products-kicker">Partner</div>
        <h2 className="home-products-title">Wholesale enquiry form</h2>
        <p className="home-products-subtitle">Let’s work together. Replace with real content.</p>
      </div>
    </section>
  );
}
