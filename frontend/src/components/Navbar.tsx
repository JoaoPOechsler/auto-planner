import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-inner">
          <Link to="/" className="navbar-brand">
            <span className="navbar-brand-icon">🚗</span>
            <span className="navbar-brand-name">Auto Planner</span>
          </Link>
          {user && (
            <div className="navbar-right">
              <span className="navbar-user">Olá, {user.name.split(' ')[0]}!</span>
              <button className="btn btn-ghost btn-sm" onClick={signOut}>Sair</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
