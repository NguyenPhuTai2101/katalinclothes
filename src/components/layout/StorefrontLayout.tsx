import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { TopNavBar } from './TopNavBar';
import { Footer } from './Footer';
import { LoginModal } from '../common/LoginModal';

export const StorefrontLayout: React.FC = () => {
  const { pathname } = useLocation();
  const [loginOpen, setLoginOpen] = useState(false);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <TopNavBar onOpenLogin={() => setLoginOpen(true)} />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />

      {/* Global Auth Modal */}
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
};

