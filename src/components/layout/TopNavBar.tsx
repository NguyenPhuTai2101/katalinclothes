import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { ShoppingBag, Heart, User, Search, Menu, X, Eye, Sun, Moon } from 'lucide-react';

interface TopNavBarProps {
  onOpenLogin: () => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({ onOpenLogin }) => {
  const { cartCount } = useCart();
  const { wishlistItems } = useWishlist();
  const { user, role, setRole, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const navLinks = [
    { name: t('Trang chủ', 'Home'), path: '/' },
    { name: t('Bộ sưu tập', 'Collections'), path: '/collections' },
    { name: t('Yêu thích', 'Wishlist'), path: '/wishlist' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // Check if current user is the default simulated guest customer
  const isDefaultGuest = !user || user.id === 'cust-1';

  return (
    <>
      <header className="sticky top-0 left-0 w-full z-40 bg-card border-b border-outline-custom text-primary transition-colors duration-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 items-center h-16 sm:h-20">
            
            {/* COLUMN 1: LEFT SIDE (Hamburger Menu on mobile, Navigation links on desktop) */}
            <div className="flex items-center justify-start">
              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 -ml-2 hover:opacity-75 focus:outline-none md:hidden text-primary cursor-pointer"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Desktop Navigation Links */}
              <nav className="hidden md:flex space-x-6 lg:space-x-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`text-[11px] tracking-widest uppercase transition-opacity hover:opacity-100 font-semibold ${
                      isActive(link.path)
                        ? 'opacity-100 active-nav-link text-primary font-bold'
                        : 'opacity-65 text-primary/80'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>

            {/* COLUMN 2: CENTER (Brand Logo) */}
            <div className="flex justify-center items-center">
              <Link
                to="/"
                className="font-serif text-xl sm:text-2xl lg:text-3xl font-semibold tracking-widest text-center text-primary whitespace-nowrap"
                style={{ fontVariant: 'small-caps' }}
              >
                Katalin-Clothes
              </Link>
            </div>

            {/* COLUMN 3: RIGHT SIDE (Actions) */}
            <div className="flex items-center justify-end space-x-1 sm:space-x-2.5">
              {/* Search Toggle */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 hover:opacity-75 focus:outline-none hidden sm:block text-primary cursor-pointer"
                aria-label="Search"
              >
                <Search className="w-4.5 h-4.5" />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 hover:opacity-75 focus:outline-none text-primary cursor-pointer"
                title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              >
                {theme === 'light' ? <Moon className="w-4.5 h-4.5" /> : <Sun className="w-4.5 h-4.5" />}
              </button>

              {/* Language Switcher */}
              <button
                onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
                className="text-[9px] tracking-widest font-mono font-semibold hover:opacity-75 focus:outline-none px-1.5 py-0.5 border border-primary/20 rounded cursor-pointer text-primary"
                title={language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
              >
                {language === 'vi' ? 'EN' : 'VI'}
              </button>

              {/* Wishlist Icon */}
              <Link
                to="/wishlist"
                className="p-2 hover:opacity-75 focus:outline-none relative text-primary"
                aria-label="Wishlist"
              >
                <Heart className="w-4.5 h-4.5" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-0 -right-0 flex items-center justify-center w-4 h-4 text-[9px] font-bold text-white bg-accent rounded-full">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              {/* Cart Icon */}
              <Link
                to="/checkout"
                className="p-2 hover:opacity-75 focus:outline-none relative text-primary"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-4.5 h-4.5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0 -right-0 flex items-center justify-center w-4 h-4 text-[9px] font-bold text-white bg-primary rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Profile Dropdown Trigger */}
              <div className="relative">
                {isDefaultGuest ? (
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="p-2 hover:opacity-75 focus:outline-none text-primary cursor-pointer"
                    title={t('Tài khoản', 'Account')}
                  >
                    <User className="w-4.5 h-4.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm cursor-pointer hover:opacity-85 transition ml-1"
                    title={user?.full_name || 'User'}
                  >
                    {user?.full_name.charAt(0) || 'U'}
                  </button>
                )}

                {/* Profile/Auth Dropdown */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2.5 w-60 bg-card border border-outline-custom rounded-lg shadow-xl py-2 z-50 animate-fadeIn text-left">
                    {isDefaultGuest ? (
                      <div className="px-4 py-3 space-y-2">
                        <p className="text-[10px] tracking-wider text-secondary uppercase font-semibold">
                          {t('Chào mừng quý khách', 'Welcome Guest')}
                        </p>
                        <div className="flex flex-col gap-1.5 pt-1">
                          <button
                            onClick={() => {
                              setProfileDropdownOpen(false);
                              onOpenLogin();
                            }}
                            className="w-full text-center text-xs tracking-widest uppercase bg-primary text-white hover:bg-primary-light transition py-2 rounded font-semibold cursor-pointer"
                          >
                            {t('Đăng Nhập / Đăng Ký', 'Sign In / Sign Up')}
                          </button>
                          <button
                            onClick={() => {
                              setProfileDropdownOpen(false);
                              setRole('admin');
                            }}
                            className="w-full text-center text-[9px] tracking-widest uppercase border border-primary/25 text-primary hover:bg-surface transition py-1.5 rounded font-semibold cursor-pointer"
                          >
                            {t('Giả lập quyền Admin', 'Simulate Admin')}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="px-4 py-2 border-b border-outline-custom">
                          <p className="text-xs font-semibold text-primary truncate">{user?.full_name}</p>
                          <p className="text-[9px] text-secondary truncate">{user?.email}</p>
                          <span className={`inline-block text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded font-bold mt-1.5 ${
                            role === 'admin' ? 'bg-accent/10 text-accent' : 'bg-primary/5 text-secondary'
                          }`}>
                            {role === 'admin' ? t('Quản trị viên', 'Admin') : t('Khách hàng', 'Customer')}
                          </span>
                        </div>
                        <div className="py-1">
                          {role === 'admin' && (
                            <Link
                              to="/admin"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="w-full text-left block px-4 py-2 text-xs text-primary hover:bg-surface transition"
                            >
                              {t('Bảng quản trị', 'Admin Dashboard')}
                            </Link>
                          )}
                          <button
                            onClick={() => {
                              setProfileDropdownOpen(false);
                              logout();
                            }}
                            className="w-full text-left block px-4 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition border-t border-outline-custom font-semibold cursor-pointer"
                          >
                            {t('Đăng xuất', 'Sign Out')}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Inline Search Bar */}
        {searchOpen && (
          <div className="bg-card border-t border-outline-custom px-4 py-3 sm:px-6 lg:px-8 animate-fadeIn">
            <div className="max-w-3xl mx-auto flex items-center">
              <Search className="w-5 h-5 text-secondary mr-3" />
              <input
                type="text"
                placeholder={t('Tìm kiếm sản phẩm...', 'Search collections, shirts, dresses...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm py-2 bg-transparent focus:outline-none border-b border-outline-custom focus:border-primary text-primary"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    window.location.href = `/collections?search=${searchQuery}`;
                  }
                }}
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="ml-3 p-1 text-secondary hover:text-primary focus:outline-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-fadeIn">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-primary/45 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative flex flex-col w-full max-w-xs bg-card h-full shadow-2xl p-6 z-10 transition-transform duration-300">
            <div className="flex items-center justify-between border-b border-outline-custom pb-4 mb-6">
              <span className="font-serif text-xl font-bold tracking-widest">Katalin-Clothes</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:opacity-75 focus:outline-none cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Mobile Search */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('Tìm kiếm...', 'Search...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-sm pl-9 pr-4 py-2 bg-surface rounded focus:outline-none focus:ring-1 focus:ring-primary/20 border border-outline-custom text-primary"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setMobileMenuOpen(false);
                      window.location.href = `/collections?search=${searchQuery}`;
                    }
                  }}
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-secondary" />
              </div>
            </div>

            <nav className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm tracking-widest uppercase py-2 border-b border-outline-custom ${
                    isActive(link.path) ? 'font-semibold text-primary' : 'text-secondary'
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              {role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm tracking-widest uppercase py-2 text-accent font-semibold flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" /> {t('Bảng quản trị', 'Admin Dashboard')}
                </Link>
              )}
            </nav>

            <div className="mt-auto border-t border-outline-custom pt-6 space-y-4">
              {/* Mobile Lang and Theme controls */}
              <div className="flex items-center justify-between px-2">
                <span className="text-[10px] tracking-wider uppercase opacity-60">{t('Giao diện & Ngôn ngữ', 'Theme & Language')}</span>
                <div className="flex items-center space-x-3">
                  <button onClick={toggleTheme} className="p-1 hover:opacity-75 cursor-pointer">
                    {theme === 'light' ? <Moon className="w-4.5 h-4.5" /> : <Sun className="w-4.5 h-4.5" />}
                  </button>
                  <button
                    onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
                    className="text-[10px] tracking-widest font-mono font-bold border border-primary/25 rounded px-1.5 py-0.5 cursor-pointer"
                  >
                    {language === 'vi' ? 'EN' : 'VI'}
                  </button>
                </div>
              </div>

              {isDefaultGuest ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenLogin();
                  }}
                  className="w-full text-center text-xs tracking-widest uppercase bg-primary text-white hover:bg-primary-light transition py-2.5 px-4 rounded font-semibold cursor-pointer"
                >
                  {t('Đăng Nhập / Đăng Ký', 'Sign In / Sign Up')}
                </button>
              ) : (
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center text-xs tracking-widest uppercase border border-red-500/25 text-red-500 hover:bg-red-50 transition py-2.5 px-4 rounded font-semibold cursor-pointer"
                >
                  {t('Đăng xuất', 'Sign Out')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
