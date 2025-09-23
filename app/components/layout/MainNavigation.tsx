import { Link } from 'react-router';
import type { NavigationItem } from '~/types';

interface MainNavigationProps {
  collections?: NavigationItem[];
}

const defaultNavItems: NavigationItem[] = [
  { title: 'Trail Running', handle: 'trail-running', url: '/trail-running' },
  { title: 'Road Running', handle: 'road-running', url: '/road-running' },
  { title: 'Ultralight', handle: 'ultralight', url: '/ultralight' },
  { title: 'Racing', handle: 'racing', url: '/racing' },
  { title: 'Gear', handle: 'gear', url: '/gear' },
];

export default function MainNavigation({ collections }: MainNavigationProps) {
  const navItems = collections && collections.length > 0 ? collections : defaultNavItems;

  return (
    <ul className="nav-menu">
      {navItems.map((item) => (
        <li key={item.handle}>
          <Link to={item.url}>{item.title}</Link>
        </li>
      ))}
    </ul>
  );
}