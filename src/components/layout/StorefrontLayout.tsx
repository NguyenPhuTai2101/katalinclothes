import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { TopNavBar } from './TopNavBar';
import { Footer } from './Footer';

export const StorefrontLayout: React.FC = () => {
  const { pathname } = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Determine if navbar should be transparent (only for the Home Page hero)
  const isHomePage = pathname === '/';

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <TopNavBar transparent={isHomePage} />
      <main className={`flex-grow ${isHomePage ? '' : 'pt-16 sm:pt-20'}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
