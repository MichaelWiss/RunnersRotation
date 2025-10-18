import {createContext, useContext, useEffect, useLayoutEffect, useState} from 'react';
import {useRouteLoaderData} from 'react-router';
import AnnouncementBar from './AnnouncementBar';
import Header from './Header';
import Footer from './Footer';
import type {NavigationItem} from '~/types';
import type {loader as rootLoader} from '~/root';

interface LayoutProps {
  children: React.ReactNode;
}

type LayoutContextValue = {
  setDisableMainOffset: (value: boolean) => void;
};

const LayoutContext = createContext<LayoutContextValue | null>(null);
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function useLayoutContext() {
  return useContext(LayoutContext);
}

export default function Layout({children}: LayoutProps) {
  const rootData = useRouteLoaderData<typeof rootLoader>('root');
  const navigationLinks = rootData?.navigationLinks as NavigationItem[] | undefined;
  const footerLinks = rootData?.footerLinks as NavigationItem[] | undefined;
  const isLoggedIn = Boolean(rootData?.isLoggedIn);
  const viewerName = rootData?.viewer?.displayName || rootData?.viewer?.email || null;
  const [disableMainOffset, setDisableMainOffset] = useState(false);
  // Dynamically set header/announcement heights so content never overlaps
  useIsomorphicLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    const setHeights = () => {
      const header = document.querySelector('.header') as HTMLElement | null;
      const bar = document.querySelector('.announcement-bar') as HTMLElement | null;
      const headerH = header?.offsetHeight ?? 120;
      const barH = bar?.offsetHeight ?? 40;
      const root = document.documentElement;
      root.style.setProperty('--header-h', `${headerH}px`);
      root.style.setProperty('--announcement-h', `${barH}px`);
    };
    setHeights();
    window.addEventListener('resize', setHeights);
    return () => window.removeEventListener('resize', setHeights);
  }, []);

  // Global scroll-driven rotation/blend value for nav circle/background
  useEffect(() => {
    const updateScroll = () => {
      const el = (document.scrollingElement || document.documentElement) as HTMLElement;
      const scrollTop = el.scrollTop || window.pageYOffset || 0;
      const viewport = window.innerHeight || document.documentElement.clientHeight || 0;
      const htmlH = document.documentElement?.scrollHeight || 0;
      const bodyH = (document.body && document.body.scrollHeight) || 0;
      const scrollH = Math.max(el.scrollHeight || 0, htmlH, bodyH);
      const docHeight = Math.max(0, scrollH - viewport);
      const progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
      const root = document.documentElement;
      root.style.setProperty('--scroll-percentage', String(progress));
    };
    updateScroll();
    window.addEventListener('scroll', updateScroll, {passive: true});
    window.addEventListener('resize', updateScroll);
    return () => {
      window.removeEventListener('scroll', updateScroll);
      window.removeEventListener('resize', updateScroll);
    };
  }, []);

  return (
    <LayoutContext.Provider value={{setDisableMainOffset}}>
      <AnnouncementBar />
      <div className="page-container">
        <Header collections={navigationLinks} isLoggedIn={isLoggedIn} viewerName={viewerName} />
        <main className={disableMainOffset ? 'main-no-offset' : undefined}>{children}</main>
      </div>
      <Footer links={footerLinks} />
    </LayoutContext.Provider>
  );
}
