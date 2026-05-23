import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { userService } from '../services/api';
import './Sidebar.css';

function Sidebar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    userService.getCurrentUser().then(data => setUser(data));
  }, []);

  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar-logo">
        <span className="logo-icon">⚡</span>
        <h2 className="logo-text text-gradient">SocialHub</h2>
      </div>

      <nav className="sidebar-nav">
        <NavLink 
          to="/" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="link-text">Home Feed</span>
        </NavLink>

        <NavLink 
          to="/explore" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="link-text">Explore</span>
        </NavLink>

        <NavLink 
          to="/publisher" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="link-text">Publisher</span>
        </NavLink>

        <NavLink 
          to="/profile" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="link-text">Profile</span>
        </NavLink>
      </nav>

      {user && (
        <div className="sidebar-profile">
          <img src={user.avatar} alt={user.fullName} className="user-avatar" />
          <div className="user-info">
            <span className="user-name">{user.fullName}</span>
            <span className="user-username">@{user.username}</span>
          </div>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
