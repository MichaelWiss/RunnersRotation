import { Link } from 'react-router';

export default function NavigationCircle() {
  return (
    <Link to="/" className="nav-circle" id="navCircle">
      <div className="circular-text">VELOCITY</div>
    </Link>
  );
}