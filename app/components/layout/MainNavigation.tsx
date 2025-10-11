import { Link } from 'react-router';
import type { NavigationItem } from '~/types';

interface MainNavigationProps {
  collections?: NavigationItem[];
}

const defaultNavItems: NavigationItem[] = [
  {title: 'Trail Running', handle: 'trail-running', url: '/collections/trail-running'},
  {title: 'Road Running', handle: 'road-running', url: '/collections/road-running'},
  {title: 'Ultralight', handle: 'ultralight', url: '/collections/ultralight'},
  {title: 'Run Club', handle: 'run-club', url: '/run-club'},
  {title: 'Blog', handle: 'blog', url: '/blog'},
];

export default function MainNavigation({ collections }: MainNavigationProps) {
  const navItems = collections && collections.length > 0 ? collections : defaultNavItems;

  return (
    <ul className="nav-menu">
      {navItems.map((item) => {
        const key = item.handle || item.url || item.title;
        return (
          <li key={key} data-handle={item.handle}>
            <Link to={item.url}>{item.title}</Link>
          </li>
        );
      })}
    </ul>
  );
}
