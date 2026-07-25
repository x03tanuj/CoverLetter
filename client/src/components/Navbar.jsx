import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, LogOut, LayoutDashboard, PlusCircle, History } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      backgroundColor: '#FFFFFF',
      borderBottom: '2.5px solid var(--border-dark)',
      padding: '0.8rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      {/* Brand Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
        <div className="neo-badge neo-badge-coral" style={{ padding: '0.35rem 0.65rem' }}>
          <Sparkles size={18} />
        </div>
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.3rem', color: 'var(--text-main)' }}>
          CoverCraft AI
        </span>
      </Link>

      {/* Center Nav Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Link
          to="/"
          className={`neo-btn ${isActive('/') ? 'neo-btn-yellow' : ''}`}
          style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
        >
          <LayoutDashboard size={16} /> Dashboard
        </Link>
        <Link
          to="/generate"
          className={`neo-btn ${isActive('/generate') ? 'neo-btn-primary' : ''}`}
          style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
        >
          <PlusCircle size={16} /> New Letter
        </Link>
        <Link
          to="/history"
          className={`neo-btn ${isActive('/history') ? 'neo-btn-teal' : ''}`}
          style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
        >
          <History size={16} /> History
        </Link>
      </div>

      {/* User Info & Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div className="neo-badge neo-badge-gray" style={{ textTransform: 'none', fontWeight: 600 }}>
          {user?.name || 'User'}
        </div>

        <button onClick={handleLogout} className="neo-btn" style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}>
          <LogOut size={15} /> Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
