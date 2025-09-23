import type {ReactNode} from 'react';
import HeaderProduct from './HeaderProduct';

interface ProductLayoutProps {
  children: ReactNode;
}

export default function ProductLayout({children}: ProductLayoutProps) {
  return (
    <div>
      <HeaderProduct />
      <div>{children}</div>
    </div>
  );
}
