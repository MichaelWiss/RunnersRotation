import {LinksFunction} from 'react-router';
import homepageStyles from '~/styles/homepage.css?url';

export const links: LinksFunction = () => [
  {rel: 'stylesheet', href: homepageStyles},
];

export default function Blog() {
  return (
    <section className="section">
      <div className="home-products-header">
        <div className="home-products-kicker">Stories</div>
        <h2 className="home-products-title">Blog</h2>
        <p className="home-products-subtitle">Training tips and news. Replace with real content.</p>
      </div>
    </section>
  );
}
