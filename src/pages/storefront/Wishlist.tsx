import React from 'react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';
import { formatPriceVND } from '../../utils/formatters';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const Wishlist: React.FC = () => {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { t } = useLanguage();

  const handleMoveToCart = (prod: any) => {
    addToCart(prod, prod.variants[0] || undefined);
    removeFromWishlist(prod.id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3 mb-6">
        <span className="text-[10px] uppercase tracking-[0.25em] text-accent font-semibold">{t('SẢN PHẨM ĐÃ LƯU', 'SAVED PIECES')}</span>
        <h1 className="text-2xl sm:text-4xl font-serif font-light text-primary">{t('Danh Sách Yêu Thích', 'Your Editorial Wishlist')}</h1>
        <div className="w-12 h-px bg-primary/20 mx-auto mt-2"></div>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-20 space-y-6 max-w-sm mx-auto animate-fadeIn">
          <div className="w-16 h-16 bg-surface border border-primary/10 text-secondary rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Heart className="w-6 h-6" />
          </div>
          <p className="text-secondary text-xs leading-relaxed">
            {t('Danh sách yêu thích của bạn hiện đang trống. Hãy khám phá cửa hàng và nhấn biểu tượng trái tim trên các sản phẩm bạn yêu thích.', 'Your wishlist is currently empty. Explore the shop and click the heart icon on your favorite garments.')}
          </p>
          <Link
            to="/collections"
            className="inline-block px-8 py-3 bg-primary text-white text-xs tracking-widest uppercase font-semibold hover:bg-primary-light transition rounded w-full shadow cursor-pointer"
          >
            {t('Khám phá Bộ sưu tập', 'Explore Collections')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-fadeIn">
          {wishlistItems.map((prod) => {
            return (
              <div key={prod.id} className="group flex flex-col space-y-4 border border-outline-custom rounded bg-card p-4 shadow-sm relative">
                
                {/* Remove button absolute */}
                <button
                  onClick={() => removeFromWishlist(prod.id)}
                  className="absolute top-6 right-6 z-10 bg-card/90 hover:bg-card text-secondary hover:text-red-500 p-2 rounded-full shadow border border-outline-custom transition cursor-pointer"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Image */}
                <div className="relative aspect-[3/4] bg-surface overflow-hidden rounded border border-outline-custom">
                  <Link to={`/products/${prod.slug}`} className="block h-full w-full">
                    <img
                      src={prod.images[0]?.url || '/src/assets/products/linen_shirt_1.png'}
                      alt={prod.name_en}
                      className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    />
                  </Link>
                </div>

                {/* Details */}
                <div className="space-y-1 text-xs">
                  <span className="text-[10px] text-secondary font-mono tracking-widest uppercase">
                    SKU: {prod.sku}
                  </span>
                  <div className="flex justify-between items-start">
                    <Link to={`/products/${prod.slug}`} className="font-serif text-sm font-semibold hover:underline text-primary">
                      {t(prod.name_vi, prod.name_en)}
                    </Link>
                    <span className="font-semibold text-primary">{formatPriceVND(prod.price)}</span>
                  </div>
                </div>

                {/* Actions */}
                <button
                  onClick={() => handleMoveToCart(prod)}
                  className="w-full bg-primary hover:bg-primary-light text-white text-[10px] tracking-widest uppercase font-semibold py-2.5 rounded shadow flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  {t('Thêm vào giỏ hàng', 'Move to Shopping Cart')}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
