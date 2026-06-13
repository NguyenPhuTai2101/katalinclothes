import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { ShoppingBag, Heart, User, Search, Menu, X, Eye, Sun, Moon } from 'lucide-react';

interface TopNavBarProps {
  transparent?: boolean;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({ transparent = false }) => {
  const { cartCount } = useCart();
  const { wishlistItems } = useWishlist();
  const { role, setRole } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${
          transparent && location.pathname === '/'
            ? 'bg-transparent border-b border-transparent text-white'
            : 'glass-nav text-primary'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Mobile Menu Toggle */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 -ml-2 hover:opacity-75 focus:outline-none"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

            {/* Brand Logo */}
            <div className="flex-1 md:flex-none flex justify-center md:justify-start">
              <Link
                to="/"
                className="font-serif text-2xl sm:text-3xl font-semibold tracking-widest text-center"
                style={{ fontVariant: 'small-caps' }}
              >
                Katalin-Clothes
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex space-x-8 lg:space-x-12">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm tracking-widest uppercase transition-opacity hover:opacity-100 ${
                    isActive(link.path)
                      ? 'font-medium opacity-100 active-nav-link'
                      : 'opacity-60'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Actions (Search, Theme, Language, Wishlist, Cart, Profile, Admin Switcher) */}
            <div className="flex items-center space-x-1.5 sm:space-x-3.5">
              {/* Search Toggle */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 hover:opacity-75 focus:outline-none hidden sm:block"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 hover:opacity-75 focus:outline-none"
                title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              >
                {theme === 'light' ? <Moon className="w-4.5 h-4.5" /> : <Sun className="w-4.5 h-4.5" />}
              </button>

              {/* Language Switcher */}
              <button
                onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
                className="text-[9px] tracking-widest font-mono font-semibold hover:opacity-75 focus:outline-none px-1.5 py-0.5 border border-primary/20 rounded cursor-pointer"
                title={language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
              >
                {language === 'vi' ? 'EN' : 'VI'}
              </button>

              {/* Wishlist Icon */}
              <Link
                to="/wishlist"
                className="p-2 hover:opacity-75 focus:outline-none relative"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-0 -right-0 flex items-center justify-center w-4 h-4 text-[9px] font-bold text-white bg-accent rounded-full">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              {/* Cart Icon */}
              <Link
                to="/checkout"
                className="p-2 hover:opacity-75 focus:outline-none relative"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0 -right-0 flex items-center justify-center w-4 h-4 text-[9px] font-bold text-white bg-primary rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Admin Dashboard shortcut if admin role */}
              {role === 'admin' ? (
                <Link
                  to="/admin"
                  className="p-2 hover:opacity-75 focus:outline-none flex items-center gap-1 text-xs border border-primary/20 px-2 py-1 rounded"
                  title="Switch to Admin Dashboard"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline uppercase tracking-wider font-semibold text-[10px]">Admin</span>
                </Link>
              ) : (
                <button
                  onClick={() => setRole('admin')}
                  className="p-2 hover:opacity-75 focus:outline-none flex items-center gap-1 text-xs opacity-40 hover:opacity-100"
                  title="Simulate Admin Login"
                >
                  <User className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Inline Search Bar */}
        {searchOpen && (
          <div className="bg-card border-t border-primary/5 px-4 py-3 sm:px-6 lg:px-8 animate-fadeIn">
            <div className="max-w-3xl mx-auto flex items-center">
              <Search className="w-5 h-5 text-secondary mr-3" />
              <input
                type="text"
                placeholder={t('Tìm kiếm sản phẩm...', 'Search collections, shirts, dresses...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm py-2 bg-transparent focus:outline-none border-b border-primary/10 focus:border-primary text-primary"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    window.location.href = `/collections?search=${searchQuery}`;
                  }
                }}
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="ml-3 p-1 text-secondary hover:text-primary focus:outline-none"
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
            <div className="flex items-center justify-between border-b border-primary/5 pb-4 mb-6">
              <span className="font-serif text-xl font-bold tracking-widest">Katalin-Clothes</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:opacity-75 focus:outline-none"
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
                  className="w-full text-sm pl-9 pr-4 py-2 bg-surface rounded focus:outline-none focus:ring-1 focus:ring-primary/20 border border-primary/5 text-primary"
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
                  className={`text-sm tracking-widest uppercase py-2 border-b border-primary/5 ${
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

            <div className="mt-auto border-t border-primary/5 pt-6 space-y-4">
              {/* Mobile Lang and Theme controls */}
              <div className="flex items-center justify-between px-2">
                <span className="text-[10px] tracking-wider uppercase opacity-60">{t('Giao diện & Ngôn ngữ', 'Theme & Language')}</span>
                <div className="flex items-center space-x-3">
                  <button onClick={toggleTheme} className="p-1 hover:opacity-75">
                    {theme === 'light' ? <Moon className="w-4.5 h-4.5" /> : <Sun className="w-4.5 h-4.5" />}
                  </button>
                  <button
                    onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
                    className="text-[10px] tracking-widest font-mono font-bold border border-primary/25 rounded px-1.5 py-0.5"
                  >
                    {language === 'vi' ? 'EN' : 'VI'}
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  setRole(role === 'admin' ? 'customer' : 'admin');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-center text-xs tracking-widest uppercase border border-primary/25 hover:bg-primary hover:text-white transition py-2 px-4 rounded"
              >
                {role === 'admin' 
                  ? t('Simulate Customer Role', 'Simulate Customer Role') 
                  : t('Simulate Admin Role', 'Simulate Admin Role')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
