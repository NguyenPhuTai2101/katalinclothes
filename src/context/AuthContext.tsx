import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'customer' | 'admin';
  phone?: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  role: 'customer' | 'admin';
  setRole: (role: 'customer' | 'admin') => void;
  loginAsCustomer: () => void;
  loginAsAdmin: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRoleState] = useState<'customer' | 'admin'>('customer');

  // Load initial user from localStorage or use default
  useEffect(() => {
    const savedUser = localStorage.getItem('ktl_current_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser) as User;
      setUser(parsed);
      setRoleState(parsed.role);
    } else {
      // Default to guest or first customer
      loginAsCustomer();
    }
  }, []);

  const loginAsCustomer = () => {
    const customerUser: User = {
      id: 'cust-1',
      email: 'minh.nguyen@gmail.com',
      full_name: 'Nguyễn Văn Minh',
      role: 'customer',
      phone: '0901234567'
    };
    setUser(customerUser);
    setRoleState('customer');
    localStorage.setItem('ktl_current_user', JSON.stringify(customerUser));
  };

  const loginAsAdmin = () => {
    const adminUser: User = {
      id: 'cust-3',
      email: 'bach.tran@admin.com',
      full_name: 'Trần Hoàng Bách',
      role: 'admin',
      phone: '0988888888'
    };
    setUser(adminUser);
    setRoleState('admin');
    localStorage.setItem('ktl_current_user', JSON.stringify(adminUser));
  };

  const setRole = (newRole: 'customer' | 'admin') => {
    if (newRole === 'admin') {
      loginAsAdmin();
    } else {
      loginAsCustomer();
    }
  };

  const logout = () => {
    setUser(null);
    setRoleState('customer');
    localStorage.removeItem('ktl_current_user');
  };

  return (
    <AuthContext.Provider value={{ user, role, setRole, loginAsCustomer, loginAsAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
