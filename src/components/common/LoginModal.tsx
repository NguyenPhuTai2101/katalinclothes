import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { X, Mail, Lock, User as UserIcon, AlertCircle, Sparkles } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login, register, loading } = useAuth();
  const { t } = useLanguage();
  
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !password) {
      setErrorMsg(t('Vui lòng điền đầy đủ email và mật khẩu.', 'Please enter both email and password.'));
      return;
    }

    if (activeTab === 'signup' && !fullName) {
      setErrorMsg(t('Vui lòng nhập họ và tên của bạn.', 'Please enter your full name.'));
      return;
    }

    try {
      if (activeTab === 'signin') {
        await login(email, password);
        setSuccessMsg(t('Đăng nhập thành công!', 'Successfully signed in!'));
        setTimeout(() => {
          onClose();
          // Reset forms
          setEmail('');
          setPassword('');
        }, 1000);
      } else {
        await register(email, password, fullName);
        setSuccessMsg(t('Đăng ký tài khoản thành công!', 'Account registered successfully!'));
        setTimeout(() => {
          setActiveTab('signin');
          setErrorMsg('');
          setSuccessMsg('');
        }, 1500);
      }
    } catch (err: any) {
      setErrorMsg(err.message || t('Đã xảy ra lỗi, vui lòng thử lại.', 'An error occurred, please try again.'));
    }
  };

  // Quick Dev login helpers
  const handleQuickLogin = async (role: 'customer' | 'admin') => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      if (role === 'admin') {
        await login('bach.tran@admin.com', 'admin123');
      } else {
        await login('minh.nguyen@gmail.com', 'customer123');
      }
      setSuccessMsg(t('Đăng nhập thành công với vai trò giả lập!', 'Quick Login simulation success!'));
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-primary/45 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-card border border-outline-custom rounded-xl shadow-2xl overflow-hidden z-10 animate-slideUp">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-full text-secondary hover:text-primary hover:bg-surface transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Branding */}
        <div className="px-6 pt-8 pb-4 text-center border-b border-outline-custom bg-surface/50">
          <h2 className="font-serif text-2xl font-semibold tracking-widest uppercase">
            Katalin-Clothes
          </h2>
          <p className="text-[10px] tracking-wider text-secondary uppercase mt-1">
            {t('Thời trang thiết kế tối giản', 'MINIMALIST DESIGNER WEAR')}
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-outline-custom">
          <button
            onClick={() => {
              setActiveTab('signin');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-3 text-xs tracking-widest uppercase font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'signin'
                ? 'border-primary text-primary'
                : 'border-transparent text-secondary hover:text-primary'
            }`}
          >
            {t('Đăng Nhập', 'Sign In')}
          </button>
          <button
            onClick={() => {
              setActiveTab('signup');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-3 text-xs tracking-widest uppercase font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'signup'
                ? 'border-primary text-primary'
                : 'border-transparent text-secondary hover:text-primary'
            }`}
          >
            {t('Đăng Ký', 'Sign Up')}
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded text-xs">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Name Field (Sign Up Only) */}
          {activeTab === 'signup' && (
            <div className="space-y-1">
              <label className="block text-[10px] uppercase tracking-wider text-secondary font-semibold">
                {t('Họ và Tên', 'Full Name')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Nguyễn Văn A"
                  className="w-full text-xs pl-9 pr-3 py-2.5 bg-surface border border-outline-custom rounded focus:outline-none focus:border-primary text-primary"
                  required
                />
                <UserIcon className="absolute left-3 top-3 w-4 h-4 text-secondary/60" />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-1">
            <label className="block text-[10px] uppercase tracking-wider text-secondary font-semibold">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full text-xs pl-9 pr-3 py-2.5 bg-surface border border-outline-custom rounded focus:outline-none focus:border-primary text-primary"
                required
              />
              <Mail className="absolute left-3 top-3 w-4 h-4 text-secondary/60" />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <label className="block text-[10px] uppercase tracking-wider text-secondary font-semibold">
              {t('Mật Khẩu', 'Password')}
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs pl-9 pr-3 py-2.5 bg-surface border border-outline-custom rounded focus:outline-none focus:border-primary text-primary"
                required
              />
              <Lock className="absolute left-3 top-3 w-4 h-4 text-secondary/60" />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full text-center text-xs tracking-widest uppercase bg-primary text-white hover:bg-primary-light transition py-3 rounded font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading 
              ? t('Đang xử lý...', 'Processing...') 
              : activeTab === 'signin' 
                ? t('Đăng Nhập', 'Sign In') 
                : t('Tạo Tài Khoản', 'Create Account')}
          </button>
        </form>

        {/* Developer Sandbox Section */}
        <div className="border-t border-outline-custom bg-surface/50 p-4">
          <p className="text-[10px] tracking-wider text-center text-secondary uppercase font-semibold mb-2.5">
            {t('Dành Cho Lập Trình Viên', 'Developer Simulation')}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickLogin('customer')}
              className="text-[9px] tracking-wider uppercase font-semibold border border-primary/20 hover:bg-primary hover:text-white transition py-2 px-1 rounded text-primary text-center cursor-pointer"
            >
              {t('Giao diện Khách', 'Quick Cust')}
            </button>
            <button
              onClick={() => handleQuickLogin('admin')}
              className="text-[9px] tracking-wider uppercase font-semibold border border-accent/30 text-accent hover:bg-accent hover:text-white transition py-2 px-1 rounded text-center cursor-pointer"
            >
              {t('Giao diện Admin', 'Quick Admin')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
