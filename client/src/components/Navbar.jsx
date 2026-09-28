import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  const initial = user?.name ? user.name[0].toUpperCase() : '';

  return (
    <header className="navbar-wrapper">
      <nav className="navbar">
        <Link to="/" className="brand">
          <span className="brand-logo">✍️</span>
          <span className="brand-name">Blog Platform</span>
        </Link>
        <div className="nav-links">
          {user ? (
            <>
              <Link to="/my-posts" className="nav-link">
                My Posts
              </Link>
              <Link to="/new" className="btn btn-sm btn-primary">
                + New Post
              </Link>
              <div className="nav-user-pill">
                <span className="user-avatar-sm">{initial}</span>
                <span className="nav-username">{user.name}</span>
              </div>
              <button onClick={handleLogout} className="btn btn-sm btn-outline">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Log in
              </Link>
              <Link to="/register" className="btn btn-sm btn-primary">
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
