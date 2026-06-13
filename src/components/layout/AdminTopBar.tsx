import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../db/dbClient';
import type { Product } from '../../db/mockDb';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { Bell, Search, LogOut, ChevronDown, Check, Sun, Moon, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdminTopBarProps {
  onMenuClick: () => void;
}

export const AdminTopBar: React.FC<AdminTopBarProps> = ({ onMenuClick }) => {
  const { user, loginAsCustomer, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchStock = async () => {
      const allProds = await db.getProducts();
      // Filter products with low stock (<= 10 units)
      const low = allProds.filter(p => p.stock_quantity <= 10);
      setLowStockProducts(low);
    };

    fetchStock();
    // Poll inventory status every 10 seconds for real-time responsiveness
    const interval = setInterval(fetchStock, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-20 bg-card border-b border-primary/5 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Mobile Menu Toggle */}
      <button
        onClick={onMenuClick}
        className="p-2 -ml-2 text-secondary hover:text-primary lg:hidden focus:outline-none cursor-pointer"
        aria-label="Open sidebar"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Search Bar */}
      <div className="flex-grow max-w-xs sm:w-96 relative ml-2 lg:ml-0">
        <input
          type="text"
          placeholder={t('Tìm kiếm nhanh sản phẩm, đơn hàng...', 'Quick search products, orders, customers...')}
          className="w-full bg-surface text-xs pl-9 pr-4 py-2 border border-primary/5 rounded focus:outline-none focus:border-primary/20 text-primary placeholder-secondary/60"
        />
        <Search className="w-4 h-4 text-secondary/60 absolute left-3 top-2.5" />
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-4 relative">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-secondary hover:text-primary transition focus:outline-none"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? <Moon className="w-4.5 h-4.5" /> : <Sun className="w-4.5 h-4.5" />}
        </button>

        {/* Language Switcher */}
        <button
          onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
          className="text-[9px] tracking-widest font-mono font-semibold hover:opacity-75 focus:outline-none px-2 py-1 border border-primary/20 rounded cursor-pointer text-primary"
          title={language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
        >
          {language === 'vi' ? 'EN' : 'VI'}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setNotifDropdownOpen(!notifDropdownOpen);
              setProfileDropdownOpen(false);
            }}
            className="p-2 text-secondary hover:text-primary transition focus:outline-none relative"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {lowStockProducts.length > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[9px] font-bold text-white bg-accent rounded-full animate-pulse">
                {lowStockProducts.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {notifDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-card border border-primary/5 rounded shadow-xl py-2 z-50 animate-fadeIn">
              <div className="px-4 py-2 border-b border-primary/5 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider">{t('Cảnh báo & Alerts', 'Alerts & Warnings')}</span>
                <span className="text-[9px] bg-accent/10 text-accent font-semibold px-1.5 py-0.5 rounded">
                  {lowStockProducts.length} {t('cảnh báo', 'warnings')}
                </span>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {lowStockProducts.length > 0 ? (
                  lowStockProducts.map(p => (
                    <Link
                      key={p.id}
                      to="/admin/warehouse"
                      onClick={() => setNotifDropdownOpen(false)}
                      className="px-4 py-3 hover:bg-surface border-b border-primary/5 last:border-b-0 block transition"
                    >
                      <p className="text-xs font-semibold text-primary truncate">{language === 'vi' ? p.name_vi : p.name_en}</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-[10px] text-red-500 font-medium uppercase">{t('Cảnh Báo Hết Hàng', 'Low Stock Warning')}</span>
                        <span className="text-[10px] font-mono bg-red-50 text-red-700 px-1 py-0.2 rounded font-semibold">
                          {p.stock_quantity} {t('còn lại', 'left')}
                        </span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="py-6 text-center text-secondary text-xs">
                    {t('Mức kho hàng đều ổn định.', 'All inventory levels are healthy.')}
                  </div>
                )}
              </div>
              <div className="px-4 py-1.5 text-center bg-surface border-t border-primary/5">
                <Link
                  to="/admin/warehouse"
                  onClick={() => setNotifDropdownOpen(false)}
                  className="text-[10px] uppercase font-semibold text-accent hover:text-primary transition block"
                >
                  {t('Quản lý Kho Hàng', 'Manage Warehouse')}
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileDropdownOpen(!profileDropdownOpen);
              setNotifDropdownOpen(false);
            }}
            className="flex items-center space-x-2 focus:outline-none hover:opacity-85 transition"
          >
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
              {user?.full_name.charAt(0) || 'A'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-primary">{user?.full_name || 'Admin User'}</p>
              <p className="text-[9px] text-accent tracking-wider uppercase font-semibold">{t('Quản trị viên', 'Administrator')}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-secondary" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-card border border-primary/5 rounded shadow-xl py-1.5 z-50 animate-fadeIn">
              <div className="px-4 py-2 border-b border-primary/5 text-left">
                <p className="text-xs font-semibold text-primary">{user?.full_name}</p>
                <p className="text-[10px] text-secondary truncate">{user?.email}</p>
              </div>
              
              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  loginAsCustomer();
                  window.location.href = '/';
                }}
                className="w-full text-left px-4 py-2 text-xs text-primary hover:bg-surface transition flex items-center justify-between"
              >
                <span>{t('Xem Cửa Hàng', 'Switch to Storefront')}</span>
                <Check className="w-3.5 h-3.5 text-accent" />
              </button>

              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  logout();
                  window.location.href = '/';
                }}
                className="w-full text-left px-4 py-2.5 text-xs text-red-500 hover:bg-red-50 transition border-t border-primary/5 flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t('Đăng xuất Phiên', 'Logout Session')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
