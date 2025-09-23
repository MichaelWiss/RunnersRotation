import {Link} from 'react-router';

export default function HeaderProduct() {
  return (
    <header className="header">
      <nav className="nav-container">
        <Link to="/" className="logo">VELOCITY</Link>
        <ul className="nav-links">
          <li><a href="#">Trail Running</a></li>
          <li><a href="#">Road Running</a></li>
          <li><a href="#">Ultralight</a></li>
          <li><a href="#">Racing</a></li>
          <li><a href="#">Account</a></li>
          <li><a href="#">Cart (0)</a></li>
        </ul>
      </nav>
    </header>
  );
}
