import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  ShoppingCart, 
  Users, 
  Warehouse, 
  BarChart3, 
  ArrowLeft,
  X,
  Sliders
} from 'lucide-react';

interface SideNavBarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const SideNavBar: React.FC<SideNavBarProps> = ({ isOpen = false, onClose }) => {
  const { t } = useLanguage();
  
  const menuItems = [
    { name: t('Tổng quan', 'Overview'), path: '/admin', icon: LayoutDashboard },
    { name: t('Sản phẩm', 'Products'), path: '/admin/products', icon: ShoppingBag },
    { name: t('Đơn hàng', 'Orders'), path: '/admin/orders', icon: ShoppingCart },
    { name: t('Khách hàng', 'Customers'), path: '/admin/customers', icon: Users },
    { name: t('Kho hàng', 'Warehouse'), path: '/admin/warehouse', icon: Warehouse },
    { name: t('Báo cáo', 'Reports'), path: '/admin/reports', icon: BarChart3 },
    { name: t('Cấu hình', 'Settings'), path: '/admin/settings', icon: Sliders },
  ];

  return (
    <>
      {/* Backdrop for mobile devices */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-xs transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside className={`w-64 bg-[#1a1a1a] dark:bg-[#121212] text-white flex flex-col h-screen fixed left-0 top-0 z-40 border-r border-white/5 shadow-xl transition-transform duration-300 lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Brand / Logo */}
        <div className="h-20 flex items-center px-6 border-b border-white/5 justify-between">
          <Link to="/admin" className="font-serif text-xl font-bold tracking-widest uppercase" onClick={onClose}>
            KATALIN
            <span className="block text-[8px] font-sans tracking-[0.25em] text-accent font-semibold mt-0.5">{t('BẢNG QUẢN TRỊ', 'ADMIN PANEL')}</span>
          </Link>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-white/60 hover:text-white lg:hidden focus:outline-none cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-grow py-6 px-4 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              onClick={onClose}
              className={({ isActive }) => 
                `flex items-center px-4 py-3 text-xs tracking-wider uppercase font-semibold rounded transition-colors gap-3 ${
                  isActive 
                    ? 'bg-white text-[#1a1a1a] dark:bg-white/10 dark:text-white' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Footer Settings & Return to Shop */}
        <div className="p-4 border-t border-white/5 space-y-2">
          <Link
            to="/"
            onClick={onClose}
            className="flex items-center justify-center px-4 py-2 text-[10px] tracking-widest uppercase font-semibold border border-white/20 hover:bg-white hover:text-[#1a1a1a] transition rounded w-full gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {t('Cửa hàng', 'Storefront')}
          </Link>
          <div className="text-center text-[9px] text-white/30 pt-2 font-mono">
            v1.0.0 • Katalin-Clothes
          </div>
        </div>
      </aside>
    </>
  );
};
