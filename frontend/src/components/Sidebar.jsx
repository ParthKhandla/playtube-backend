import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, Heart, History, LayoutDashboard, Film, Folder } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ collapsed }) {
  const { user } = useAuth();

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <NavLink
        to="/"
        className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
      >
        <Home size={20} />
        <span>Home</span>
      </NavLink>

      {user && (
        <>
          <NavLink
            to="/subscriptions"
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          >
            <Compass size={20} />
            <span>Subscriptions</span>
          </NavLink>

          <NavLink
            to="/liked-videos"
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          >
            <Heart size={20} />
            <span>Liked Videos</span>
          </NavLink>

          <NavLink
            to="/history"
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          >
            <History size={20} />
            <span>Watch History</span>
          </NavLink>

          <NavLink
            to="/dashboard"
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
        </>
      )}

      <div style={{ margin: '12px 16px', height: '1px', backgroundColor: 'var(--border-color)', display: collapsed ? 'none' : 'block' }} />

      {!collapsed && (
        <div style={{ padding: '0 16px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Explore PlayTube
        </div>
      )}

      {user ? (
        <NavLink
          to={`/c/${user.username}`}
          className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
        >
          <Film size={20} />
          <span>My Videos</span>
        </NavLink>
      ) : (
        <NavLink
          to="/auth"
          className="sidebar-item"
        >
          <LayoutDashboard size={20} />
          <span>Sign In to Upload</span>
        </NavLink>
      )}
    </aside>
  );
}
