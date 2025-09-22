import {LinksFunction} from 'react-router';
import homepageStyles from '~/styles/homepage.css?url';

export const links: LinksFunction = () => [
  {rel: 'stylesheet', href: homepageStyles},
];

export default function Careers() {
  return (
    <section className="section">
      <div className="home-products-header">
        <div className="home-products-kicker">Company</div>
        <h2 className="home-products-title">Careers</h2>
        <p className="home-products-subtitle">Join our team. Replace with real content.</p>
      </div>
    </section>
  );
}
