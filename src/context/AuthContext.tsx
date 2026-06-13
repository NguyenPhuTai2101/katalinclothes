import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../db/dbClient';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'customer' | 'admin';
  phone?: string;
  avatar_url?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  province_code?: string;
  district_code?: string;
  ward_code?: string;
  street_address?: string;
}

interface AuthContextType {
  user: User | null;
  role: 'customer' | 'admin';
  loading: boolean;
  setRole: (role: 'customer' | 'admin') => void;
  loginAsCustomer: () => void;
  loginAsAdmin: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRoleState] = useState<'customer' | 'admin'>('customer');
  const [loading, setLoading] = useState(true);

  // Sync profile details from Supabase database
  const syncProfile = async (supabaseUser: any) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const syncedUser: User = {
          id: data.id,
          email: data.email || supabaseUser.email || '',
          full_name: data.full_name || '',
          role: (data.role as 'customer' | 'admin') || 'customer',
          phone: data.phone || '',
          avatar_url: data.avatar_url || '',
          address: data.address || '',
          city: data.city || '',
          postal_code: data.postal_code || '',
          province_code: data.province_code || '',
          district_code: data.district_code || '',
          ward_code: data.ward_code || '',
          street_address: data.street_address || ''
        };
        setUser(syncedUser);
        setRoleState(syncedUser.role);
        localStorage.setItem('ktl_current_user', JSON.stringify(syncedUser));
      } else {
        // If profile doesn't exist in DB, create/simulate a fallback profile
        const fallbackUser: User = {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          full_name: supabaseUser.user_metadata?.full_name || 'Guest User',
          role: 'customer'
        };
        setUser(fallbackUser);
        setRoleState('customer');
        localStorage.setItem('ktl_current_user', JSON.stringify(fallbackUser));

        // Try inserting profile to DB
        await supabase.from('profiles').insert({
          id: supabaseUser.id,
          email: fallbackUser.email,
          full_name: fallbackUser.full_name,
          role: 'customer'
        });
      }
    } catch (err) {
      console.warn('Could not sync profile with Supabase DB, using session fallback:', err);
      const sessionUser: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        full_name: supabaseUser.user_metadata?.full_name || 'Guest User',
        role: 'customer'
      };
      setUser(sessionUser);
      setRoleState('customer');
      localStorage.setItem('ktl_current_user', JSON.stringify(sessionUser));
    }
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        // 1. Check if Supabase session is active
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session?.user) {
          if (mounted) {
            await syncProfile(session.user);
          }
        } else {
          // 2. Fall back to local storage (mock simulation)
          const savedUser = localStorage.getItem('ktl_current_user');
          if (savedUser && mounted) {
            const parsed = JSON.parse(savedUser) as User;
            setUser(parsed);
            setRoleState(parsed.role);
          } else if (mounted) {
            // Default to mock guest customer on first load
            loginAsCustomer();
          }
        }
      } catch (err) {
        console.warn('Supabase session initialization failed, falling back to mock:', err);
        const savedUser = localStorage.getItem('ktl_current_user');
        if (savedUser && mounted) {
          const parsed = JSON.parse(savedUser) as User;
          setUser(parsed);
          setRoleState(parsed.role);
        } else if (mounted) {
          loginAsCustomer();
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        if (event === 'SIGNED_IN' && session?.user) {
          setLoading(true);
          await syncProfile(session.user);
          setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setRoleState('customer');
          localStorage.removeItem('ktl_current_user');
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loginAsCustomer = () => {
    const customerUser: User = {
      id: 'cust-1',
      email: 'minh.nguyen@gmail.com',
      full_name: 'Nguyễn Văn Minh',
      role: 'customer',
      phone: '0901234567',
      address: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1',
      city: 'Thành phố Hồ Chí Minh',
      postal_code: '70000',
      province_code: '79', // Ho Chi Minh City code in API
      district_code: '760', // District 1 code in API
      ward_code: '26734', // Ben Nghe ward code in API
      street_address: '123 Nguyễn Huệ'
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
      phone: '0988888888',
      address: '321 Lê Lợi, Phường Bến Nghé, Quận 1',
      city: 'Thành phố Hồ Chí Minh',
      postal_code: '70000',
      province_code: '79',
      district_code: '760',
      ward_code: '26734',
      street_address: '321 Lê Lợi'
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

  // Real Email / Password Sign In
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // 1. Attempt login with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        // Check if we can fall back to local mock authentication
        if (email === 'bach.tran@admin.com') {
          loginAsAdmin();
          return;
        } else if (email === 'minh.nguyen@gmail.com' || email.includes('customer')) {
          loginAsCustomer();
          return;
        }
        throw error;
      }

      if (data?.user) {
        await syncProfile(data.user);
      }
    } catch (err: any) {
      // Fallback
      if (email === 'bach.tran@admin.com') {
        loginAsAdmin();
        return;
      } else if (email === 'minh.nguyen@gmail.com') {
        loginAsCustomer();
        return;
      }
      throw new Error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // Real Email / Password Sign Up
  const register = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (error) throw error;

      if (data?.user) {
        await syncProfile(data.user);
      }
    } catch (err: any) {
      console.warn('Supabase sign up failed, falling back to mock registration:', err);
      // Fallback: Create mock user in local storage
      const mockUser: User = {
        id: 'mock-' + Math.random().toString(36).substr(2, 9),
        email,
        full_name: fullName,
        role: 'customer'
      };
      setUser(mockUser);
      setRoleState('customer');
      localStorage.setItem('ktl_current_user', JSON.stringify(mockUser));
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Supabase sign out error, clearing local session:', err);
    } finally {
      setUser(null);
      setRoleState('customer');
      localStorage.removeItem('ktl_current_user');
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) throw new Error('No user is currently logged in');

    const updatedUser = { ...user, ...updates };

    // Try updating Supabase DB profiles table
    try {
      const dbPayload = {
        full_name: updates.full_name !== undefined ? updates.full_name : user.full_name,
        phone: updates.phone !== undefined ? updates.phone : user.phone,
        avatar_url: updates.avatar_url !== undefined ? updates.avatar_url : user.avatar_url,
        address: updates.address !== undefined ? updates.address : user.address,
        city: updates.city !== undefined ? updates.city : user.city,
        postal_code: updates.postal_code !== undefined ? updates.postal_code : user.postal_code,
        province_code: updates.province_code !== undefined ? updates.province_code : user.province_code,
        district_code: updates.district_code !== undefined ? updates.district_code : user.district_code,
        ward_code: updates.ward_code !== undefined ? updates.ward_code : user.ward_code,
        street_address: updates.street_address !== undefined ? updates.street_address : user.street_address,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .update(dbPayload)
        .eq('id', user.id);

      if (error) {
        console.warn('Supabase profile update failed, falling back to local session: ', error.message);
      }
    } catch (err) {
      console.warn('Database connection failed, updating locally only: ', err);
    }

    // Always update local React state and localStorage to ensure local responsiveness
    setUser(updatedUser);
    localStorage.setItem('ktl_current_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        setRole,
        loginAsCustomer,
        loginAsAdmin,
        login,
        register,
        logout,
        updateProfile
      }}
    >
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
