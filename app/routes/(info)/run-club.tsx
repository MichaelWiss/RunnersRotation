import {LinksFunction} from 'react-router';
import homepageStyles from '~/styles/homepage.css?url';

export const links: LinksFunction = () => [
  {rel: 'stylesheet', href: homepageStyles},
];

export default function RunClub() {
  return (
    <section className="section">
      <div className="home-products-header">
        <div className="home-products-kicker">Community</div>
        <h2 className="home-products-title">Run Club</h2>
        <p className="home-products-subtitle">Group runs and events. Replace with real content.</p>
      </div>
    </section>
  );
}
