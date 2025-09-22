import {LinksFunction} from 'react-router';
import homepageStyles from '~/styles/homepage.css?url';

export const links: LinksFunction = () => [
  {rel: 'stylesheet', href: homepageStyles},
];

export default function Contact() {
  return (
    <section className="section">
      <div className="home-products-header">
        <div className="home-products-kicker">Support</div>
        <h2 className="home-products-title">Contact</h2>
        <p className="home-products-subtitle">How to reach us. Replace with real content.</p>
      </div>
    </section>
  );
}
