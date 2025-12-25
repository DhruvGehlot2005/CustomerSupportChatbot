/**
 * Header Component
 * 
 * Purpose: Main navigation header for the e-commerce site.
 * 
 * Features:
 * - Logo and site name
 * - Navigation links
 * - Search bar
 * - User account menu
 * - Shopping cart icon
 * 
 * Integration:
 * - Uses AuthContext for user state
 * - Links to all main pages
 */

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

/**
 * Header Component
 */
export default function Header(): JSX.Element {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo and Brand */}
        <Link to="/" className="header-logo">
          <span className="logo-icon">🛍️</span>
          <span className="logo-text">ShopEase</span>
        </Link>

        {/* Navigation Links */}
        <nav className="header-nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/products" className="nav-link">Products</Link>
          {isAuthenticated && (
            <Link to="/orders" className="nav-link">My Orders</Link>
          )}
          <Link to="/support" className="nav-link support-link">
            💬 Support
          </Link>
        </nav>

        {/* User Actions */}
        <div className="header-actions">
          {isAuthenticated ? (
            <div className="user-menu">
              <span className="user-greeting">Hi, {user?.name}!</span>
              <button onClick={logout} className="btn-logout">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="btn-login">Login</Link>
              <Link to="/signup" className="btn-signup">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
