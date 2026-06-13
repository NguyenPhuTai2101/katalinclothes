import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { t } = useLanguage();

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the PWA install prompt in Footer');
      }
      setDeferredPrompt(null);
      setShowInstallBtn(false);
    });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-[#1a1a1a] dark:bg-[#121212] text-white/90 pt-16 pb-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-16 border-b border-white/10">
          {/* Brand Col */}
          <div className="space-y-4">
            <span
              className="font-serif text-2xl tracking-widest font-semibold"
              style={{ fontVariant: 'small-caps' }}
            >
              Katalin-Clothes
            </span>
            <p className="text-white/60 text-xs leading-relaxed max-w-xs">
              {t(
                'Thương hiệu thời trang tối giản lấy cảm hứng từ các hình khối thẩm mỹ vượt thời gian, những đường nét gọn gàng và chất liệu cao cấp. Được sản xuất tại Việt Nam bởi Katalin-Clothes.',
                'Minimalist clothing brand inspired by timeless aesthetic shapes, clean lines, and premium materials. Made in Vietnam by Katalin-Clothes.'
              )}
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="opacity-60 hover:opacity-100 transition-opacity" aria-label="Instagram">
                <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="#" className="opacity-60 hover:opacity-100 transition-opacity" aria-label="Facebook">
                <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="#" className="opacity-60 hover:opacity-100 transition-opacity" aria-label="Twitter">
                <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
              </a>
            </div>
          </div>

          {/* Shop Col */}
          <div>
            <h4 className="font-serif text-sm tracking-widest uppercase font-semibold mb-4">{t('Danh mục', 'Shop')}</h4>
            <ul className="space-y-2 text-xs text-white/60">
              <li><a href="/collections" className="hover:text-white transition-colors">{t('Tất cả sản phẩm', 'All Collections')}</a></li>
              <li><a href="/collections?category=tops" className="hover:text-white transition-colors">{t('Áo', 'Tops')}</a></li>
              <li><a href="/collections?category=bottoms" className="hover:text-white transition-colors">{t('Quần', 'Bottoms')}</a></li>
              <li><a href="/collections?category=dresses" className="hover:text-white transition-colors">{t('Váy & Đầm', 'Dresses')}</a></li>
            </ul>
          </div>

          {/* Customer Care Col */}
          <div>
            <h4 className="font-serif text-sm tracking-widest uppercase font-semibold mb-4">{t('Trợ giúp', 'Assistance')}</h4>
            <ul className="space-y-2 text-xs text-white/60">
              <li><a href="#" className="hover:text-white transition-colors">{t('Vận chuyển & Đổi trả', 'Shipping & Returns')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('Hướng dẫn chọn size', 'Size Guide')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('Liên hệ', 'Contact Us')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Newsletter Col */}
          <div className="space-y-4">
            <h4 className="font-serif text-sm tracking-widest uppercase font-semibold mb-2">{t('Bản tin', 'Newsletter')}</h4>
            <p className="text-white/60 text-xs leading-relaxed">
              {t(
                'Đăng ký nhận thông tin về bộ sưu tập mới và các thông báo khác từ chúng tôi.',
                'Subscribe to receive updates on new collections and editorial announcements.'
              )}
            </p>
            <form onSubmit={handleSubscribe} className="relative mt-2">
              <input
                type="email"
                required
                placeholder={t('Địa chỉ email của bạn', 'Your email address')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded px-4 py-2.5 text-xs focus:outline-none focus:border-white/30 text-white placeholder-white/40"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 hover:opacity-75 text-white focus:outline-none"
                aria-label="Subscribe"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            {subscribed && (
              <p className="text-accent text-xs animate-fadeIn">
                {t('Cảm ơn bạn đã đăng ký nhận bản tin!', 'Thank you for subscribing to our newsletter!')}
              </p>
            )}
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 text-[10px] tracking-wider uppercase text-white/40">
          <p>© {new Date().getFullYear()} Katalin-Clothes. {t('Bảo lưu mọi quyền.', 'All Rights Reserved.')}</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <a href="#" className="hover:text-white transition-colors">{t('Chính sách bảo mật', 'Privacy Policy')}</a>
            <a href="#" className="hover:text-white transition-colors">{t('Điều khoản dịch vụ', 'Terms of Service')}</a>
            {showInstallBtn && (
              <button
                onClick={handleInstallClick}
                className="hover:text-white transition-colors text-[10px] tracking-wider uppercase text-white/40 cursor-pointer focus:outline-none hidden md:block"
              >
                {t('Tải ứng dụng', 'Download App')}
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
