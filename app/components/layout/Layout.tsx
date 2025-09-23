import AnnouncementBar from './AnnouncementBar';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  cartCount?: number;
}

export default function Layout({ children, cartCount }: LayoutProps) {
  return (
    <>
      <AnnouncementBar />
      <div className="page-container">
        <Header cartCount={cartCount} />
        <main>{children}</main>
        <Footer />
      </div>
    </>
  );
}