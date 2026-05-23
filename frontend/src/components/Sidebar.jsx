import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { userService } from '../services/api';

const navItems = [
  { to: '/feed', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { to: '/explore', label: 'Explore', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
  { to: '/publisher', label: 'Studio', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { to: '/profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
];

const navLinkClass = ({ isActive }) =>
  [
    'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
    'max-md:flex-1 max-md:flex-col max-md:gap-1 max-md:px-2 max-md:py-2 max-md:text-[10px]',
    isActive
      ? 'nav-pill-active'
      : 'text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary',
  ].join(' ');

function Sidebar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    userService.getCurrentUser().then(data => setUser(data));
  }, []);

  return (
    <aside className="fixed bottom-0 left-0 right-0 z-[100] border-t border-border bg-bg-elevated/95 px-3 py-2 backdrop-blur-xl max-md:rounded-t-2xl md:bottom-auto md:left-0 md:top-0 md:flex md:h-screen md:w-[88px] md:flex-col md:border-r md:border-t-0 md:px-3 md:py-5 lg:w-[260px] lg:px-4">
      <div className="mb-0 flex items-center justify-center gap-2 md:mb-8 md:justify-start lg:mb-10">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-lg shadow-lg shadow-violet-600/30">
          ⚡
        </div>
        <span className="font-heading hidden text-xl font-bold tracking-tight text-gradient lg:inline">
          SocialHub
        </span>
      </div>

      <nav className="flex flex-1 flex-row justify-around gap-1 md:flex-col md:justify-start md:gap-1">
        {navItems.map(({ to, label, icon }) => (
          <NavLink key={to} to={to} className={navLinkClass} title={label}>
            <svg className="h-5 w-5 shrink-0 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
            </svg>
            <span className="hidden lg:inline">{label}</span>
            <span className="md:hidden lg:hidden">{label}</span>
          </NavLink>
        ))}
      </nav>

      {user && (
        <div className="mt-2 hidden items-center gap-3 rounded-xl border border-border bg-bg-surface/60 p-3 md:mt-auto md:flex">
          <img
            src={user.avatar}
            alt={user.fullName}
            className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-violet-500/40"
          />
          <div className="hidden min-w-0 lg:block">
            <p className="truncate text-sm font-semibold text-text-primary">{user.fullName}</p>
            <p className="truncate text-xs text-text-muted">@{user.username}</p>
          </div>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
