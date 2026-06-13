import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product, ProductVariant, Order } from '../db/mockDb';
import { db } from '../db/dbClient';

export interface CartItem {
  id: string; // unique cart item identifier (product_id + variant_id combo or random)
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  price: number;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  addToCart: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  checkoutCart: (shippingDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    paymentMethod: string;
  }, notes?: string) => Promise<Order>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart on init
  useEffect(() => {
    const savedCart = localStorage.getItem('ktl_cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // Sync cart to local storage
  const saveCart = (items: CartItem[]) => {
    setCartItems(items);
    localStorage.setItem('ktl_cart', JSON.stringify(items));
  };

  const addToCart = (product: Product, variant?: ProductVariant, quantity: number = 1) => {
    const cartItemId = variant ? `${product.id}-${variant.id}` : `${product.id}`;
    const existingIndex = cartItems.findIndex(item => item.id === cartItemId);
    const unitPrice = product.price + (variant?.price_adjustment || 0);

    let newItems = [...cartItems];
    if (existingIndex >= 0) {
      newItems[existingIndex].quantity += quantity;
    } else {
      newItems.push({
        id: cartItemId,
        product,
        variant,
        quantity,
        price: unitPrice
      });
    }
    saveCart(newItems);
  };

  const removeFromCart = (id: string) => {
    const newItems = cartItems.filter(item => item.id !== id);
    saveCart(newItems);
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    const newItems = cartItems.map(item => 
      item.id === id ? { ...item, quantity } : item
    );
    saveCart(newItems);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const checkoutCart = async (
    shipping: Parameters<CartContextType['checkoutCart']>[0],
    notes?: string
  ): Promise<Order> => {
    const subtotal = cartSubtotal;
    const shipping_fee = subtotal > 1000000 ? 0 : 40000; // Free shipping above 1.000.000₫
    const discount = 0;
    const tax = 0;
    const total = subtotal + shipping_fee + tax - discount;

    const orderItems = cartItems.map(item => ({
      product_id: item.product.id,
      variant_id: item.variant?.id,
      product_name: item.product.name_en, // Or name_vi
      variant_info: item.variant ? `${item.variant.color_name_en} / ${item.variant.size}` : undefined,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
      image_url: item.product.images[0]?.url
    }));

    const orderInput = {
      status: 'pending' as const,
      shipping_first_name: shipping.firstName,
      shipping_last_name: shipping.lastName,
      shipping_email: shipping.email,
      shipping_phone: shipping.phone,
      shipping_address: shipping.address,
      shipping_city: shipping.city,
      shipping_postal_code: shipping.postalCode,
      shipping_country: shipping.country,
      subtotal,
      shipping_fee,
      tax,
      discount,
      total,
      payment_method: shipping.paymentMethod,
      payment_status: 'pending' as const,
      items: orderItems,
      notes
    };

    const newOrder = await db.createOrder(orderInput);
    clearCart();
    return newOrder;
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      cartSubtotal,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      checkoutCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
