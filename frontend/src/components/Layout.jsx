import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import './Layout.css';

function Layout({ children }) {
  const location = useLocation();

  // Dynamically compute navbar title from current route path
  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/':
        return 'Home Feed';
      case '/explore':
        return 'Explore Trends';
      case '/profile':
        return 'My Profile';
      default:
        return 'SocialHub';
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="layout-body">
        <Navbar title={getPageTitle(location.pathname)} />
        <main className="layout-main animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
