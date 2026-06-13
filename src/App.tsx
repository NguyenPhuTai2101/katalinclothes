import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';

// Layouts
import { StorefrontLayout } from './components/layout/StorefrontLayout';
import { AdminLayout } from './components/layout/AdminLayout';

// Storefront Pages
import { Home } from './pages/storefront/Home';
import { Collections } from './pages/storefront/Collections';
import { ProductDetail } from './pages/storefront/ProductDetail';
import { Checkout } from './pages/storefront/Checkout';
import { Wishlist } from './pages/storefront/Wishlist';
import { Profile } from './pages/storefront/Profile';


// Admin Pages
import { Dashboard } from './pages/admin/Dashboard';
import { Products } from './pages/admin/Products';
import { Orders } from './pages/admin/Orders';
import { Customers } from './pages/admin/Customers';
import { Warehouse } from './pages/admin/Warehouse';
import { Reports } from './pages/admin/Reports';

// Floating Role Switcher Widget for easy testing
const FloatingRoleSwitcher: React.FC = () => {
  const { role, setRole } = useAuth();
  const location = useLocation();

  // Hide on checkout success page to preserve pristine design
  if (location.pathname === '/checkout' && window.location.search.includes('step=3')) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-card/70 text-primary text-[10px] tracking-widest font-semibold uppercase px-4 py-2.5 rounded-full shadow-2xl border border-outline-custom flex items-center gap-3 backdrop-blur-md transition-all duration-300">
      <span className="opacity-60 font-mono">Role: {role}</span>
      <div className="w-px h-3 bg-outline-custom" />
      {role === 'customer' ? (
        <button
          onClick={() => {
            setRole('admin');
            // Refresh/redirect is handled by layout guards
          }}
          className="text-accent hover:text-primary transition flex items-center gap-1 cursor-pointer"
        >
          Activate Admin View →
        </button>
      ) : (
        <Link
          to="/"
          onClick={() => {
            setRole('customer');
          }}
          className="text-accent hover:text-primary transition flex items-center gap-1"
        >
          Activate Shop View →
        </Link>
      )}
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <BrowserRouter>
                <Routes>
                  {/* Customer Storefront Routes */}
                  <Route path="/" element={<StorefrontLayout />}>
                    <Route index element={<Home />} />
                    <Route path="collections" element={<Collections />} />
                    <Route path="products/:slug" element={<ProductDetail />} />
                    <Route path="checkout" element={<Checkout />} />
                    <Route path="wishlist" element={<Wishlist />} />
                    <Route path="profile" element={<Profile />} />

                  </Route>

                  {/* Admin Dashboard Routes */}
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="products" element={<Products />} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="customers" element={<Customers />} />
                    <Route path="warehouse" element={<Warehouse />} />
                    <Route path="reports" element={<Reports />} />
                  </Route>

                  {/* Fallback 404 redirect */}
                  <Route path="*" element={<StorefrontLayout />}>
                    <Route index element={<Home />} />
                  </Route>
                </Routes>
                
                {/* Simulation Widget */}
                <FloatingRoleSwitcher />
              </BrowserRouter>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
