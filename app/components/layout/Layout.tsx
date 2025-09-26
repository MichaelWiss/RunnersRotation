import {useEffect} from 'react';
import AnnouncementBar from './AnnouncementBar';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  // Dynamically set header/announcement heights so content never overlaps
  useEffect(() => {
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
    <>
      <AnnouncementBar />
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}