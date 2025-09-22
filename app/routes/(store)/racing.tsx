import {LinksFunction} from 'react-router';
import homepageStyles from '~/styles/homepage.css?url';

export const links: LinksFunction = () => [
  {rel: 'stylesheet', href: homepageStyles},
];

export default function Racing() {
  return (
    <section className="section">
      <div className="home-products-header">
        <div className="home-products-kicker">Category</div>
        <h2 className="home-products-title">Racing</h2>
        <p className="home-products-subtitle">This is a scaffolded category page. Replace with real content.</p>
      </div>
    </section>
  );
}
