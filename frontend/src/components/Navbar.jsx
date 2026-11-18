import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, Upload, LogOut, User, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onToggleSidebar, onOpenUpload }) {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/');
    }
  };

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    navigate('/auth');
  };

  return (
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={onToggleSidebar} className="btn-icon" aria-label="Toggle Sidebar">
          <Menu size={20} />
        </button>
        <Link to="/" className="navbar-brand">
          <span style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'var(--accent-gradient)',
            color: '#fff',
            fontWeight: '900',
            fontFamily: 'monospace',
            marginRight: '2px'
          }}>
            P
          </span>
          Play<span className="text-gradient">Tube</span>
        </Link>
      </div>

      <form onSubmit={handleSearchSubmit} className="navbar-search">
        <input
          type="text"
          placeholder="Search videos..."
          className="form-control search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" className="btn-icon search-btn" aria-label="Search">
          <Search size={18} />
        </button>
      </form>

      <div className="navbar-actions">
        {user ? (
          <>
            <button
              onClick={onOpenUpload}
              className="btn btn-secondary"
              style={{ padding: '8px 14px', borderRadius: '20px' }}
            >
              <Upload size={16} />
              <span style={{ fontSize: '0.85rem' }}>Upload</span>
            </button>

            <div style={{ position: 'relative' }}>
              <img
                src={user.avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
                alt={user.fullname}
                className="video-card-avatar"
                style={{ cursor: 'pointer', border: '2px solid var(--border-color-focus)' }}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              />

              {dropdownOpen && (
                <div
                  className="glass-card"
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '48px',
                    width: '220px',
                    padding: '8px',
                    zIndex: 1001,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    boxShadow: 'var(--shadow-lg)'
                  }}
                >
                  <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.fullname}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      @{user.username}
                    </div>
                  </div>

                  <Link
                    to={`/c/${user.username}`}
                    className="sidebar-item"
                    style={{ padding: '10px 12px', fontSize: '0.85rem', gap: '10px' }}
                    onClick={() => setDropdownOpen(false)}
                  >
                    <User size={16} />
                    My Channel
                  </Link>

                  <Link
                    to="/dashboard"
                    className="sidebar-item"
                    style={{ padding: '10px 12px', fontSize: '0.85rem', gap: '10px' }}
                    onClick={() => setDropdownOpen(false)}
                  >
                    <LayoutDashboard size={16} />
                    Creator Dashboard
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="sidebar-item"
                    style={{
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      padding: '10px 12px',
                      fontSize: '0.85rem',
                      color: 'var(--accent-red)',
                      cursor: 'pointer',
                      gap: '10px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link to="/auth" className="btn btn-primary" style={{ padding: '8px 18px', borderRadius: '20px', fontSize: '0.85rem' }}>
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
