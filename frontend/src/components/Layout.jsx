import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

function Layout({ children }) {
  const location = useLocation();

  const isLandingPage = location.pathname === '/';
  const isOnboardingPage = location.pathname === '/onboarding';
  const isPublisherPage = location.pathname === '/publisher';

  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/feed':
        return 'Home Feed';
      case '/explore':
        return 'Explore Trends';
      case '/profile':
        return 'My Profile';
      case '/publisher':
        return 'Content Studio';
      default:
        return 'SocialHub';
    }
  };

  const getPageSubtitle = (pathname) => {
    switch (pathname) {
      case '/feed':
        return 'See what your network is sharing';
      case '/explore':
        return 'Discover trends and creators';
      case '/profile':
        return 'Your public identity';
      case '/publisher':
        return 'Schedule posts across all channels';
      default:
        return '';
    }
  };

  if (isLandingPage || isOnboardingPage) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="app-mesh-bg flex min-h-screen w-full">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col transition-all md:ml-[88px] lg:ml-[260px] max-md:mb-[72px] max-md:ml-0 max-md:mt-[64px]">
        <Navbar title={getPageTitle(location.pathname)} subtitle={getPageSubtitle(location.pathname)} />
        <main
          className={`mx-auto w-full flex-1 animate-fade-in px-6 py-6 max-md:px-4 max-md:py-4 ${
            isPublisherPage ? 'max-w-[1400px]' : 'max-w-[1200px]'
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
