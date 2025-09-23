import type {ReactNode} from 'react';
import AnnouncementBar from './AnnouncementBar';
import Header from './Header';
import Footer from './Footer';

interface ProductLayoutProps {
  children: ReactNode;
}

export default function ProductLayout({children}: ProductLayoutProps) {
  return (
    <>
      <AnnouncementBar />
      <div className="page-container">
        <Header cartCount={0} />
        <main>{children}</main>
        <Footer />
      </div>
    </>
  );
}
