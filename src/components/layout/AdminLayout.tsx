import React, { useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SideNavBar } from './SideNavBar';
import { AdminTopBar } from './AdminTopBar';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const AdminLayout: React.FC = () => {
  const { role, loginAsAdmin } = useAuth();
  const { t } = useLanguage();

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (role !== 'admin') {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
        <div className="max-w-md bg-card border border-outline-custom p-8 rounded-lg shadow-xl space-y-6">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="font-serif text-2xl font-bold text-primary">{t('Từ Chối Truy Cập', 'Access Denied')}</h1>
            <p className="text-secondary text-xs leading-relaxed">
              {t('Trang quản trị này chỉ dành cho nhân viên hệ thống. Tài khoản của bạn hiện tại không có quyền truy cập vào đây.', 'This panel is restricted to administrative staff. Your current profile does not have permission to view this resource.')}
            </p>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => {
                loginAsAdmin();
              }}
              className="w-full text-center text-xs tracking-widest uppercase bg-primary text-white hover:bg-primary-light transition py-3 px-4 rounded font-semibold cursor-pointer"
            >
              {t('Nâng Quyền lên Admin', 'Elevate Role to Admin')}
            </button>
            <Link
              to="/"
              className="w-full text-center text-xs tracking-widest uppercase border border-primary/25 text-primary hover:bg-surface transition py-3 px-4 rounded font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> {t('Quay lại Cửa Hàng', 'Return to Storefront')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar Navigation */}
      <SideNavBar />

      {/* Main Content Area */}
      <div className="flex-1 pl-64 flex flex-col min-h-screen">
        {/* Top Header Bar */}
        <AdminTopBar />

        {/* Dynamic Route Content */}
        <main className="flex-grow p-8 bg-surface">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
