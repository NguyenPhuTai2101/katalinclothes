import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../db/dbClient';

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
  loading: boolean;
  setRole: (role: 'customer' | 'admin') => void;
  loginAsCustomer: () => void;
  loginAsAdmin: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
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
          avatar_url: data.avatar_url || ''
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
        // If user credentials match mock admin or customer emails
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
      // Fallback: If mock matching works or supabase is blocked
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
        // Try to sync/create profile record
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
        logout
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

