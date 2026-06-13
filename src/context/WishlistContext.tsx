import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product } from '../db/mockDb';

interface WishlistContextType {
  wishlistItems: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (id: string) => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (id: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);

  // Load wishlist on init
  useEffect(() => {
    const savedWishlist = localStorage.getItem('ktl_wishlist');
    if (savedWishlist) {
      setWishlistItems(JSON.parse(savedWishlist));
    }
  }, []);

  // Sync wishlist to local storage
  const saveWishlist = (items: Product[]) => {
    setWishlistItems(items);
    localStorage.setItem('ktl_wishlist', JSON.stringify(items));
  };

  const addToWishlist = (product: Product) => {
    if (wishlistItems.some(item => item.id === product.id)) return;
    saveWishlist([...wishlistItems, product]);
  };

  const removeFromWishlist = (id: string) => {
    saveWishlist(wishlistItems.filter(item => item.id !== id));
  };

  const toggleWishlist = (product: Product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const isInWishlist = (id: string) => {
    return wishlistItems.some(item => item.id === id);
  };

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      isInWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
