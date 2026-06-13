import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../db/dbClient';
import type { Product, Category } from '../../db/mockDb';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useLanguage } from '../../context/LanguageContext';
import { formatPriceVND } from '../../utils/formatters';
import { Heart, ShoppingBag, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

export const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { language, t } = useLanguage();

  useEffect(() => {
    const loadHomeData = async () => {
      const prods = await db.getProducts();
      setFeaturedProducts(prods.filter(p => p.is_featured && p.is_active));
      const cats = await db.getCategories();
      setCategories(cats.filter(c => c.is_active).slice(0, 4));
    };
    loadHomeData();
  }, []);

  return (
    <div className="space-y-20 pb-20">
      {/* Editorial Hero Banner */}
      <section className="relative h-screen w-full bg-[#1a1a1a] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 opacity-65 bg-cover bg-center transition-transform duration-10000 hover:scale-105" style={{ backgroundImage: "url('/src/assets/hero/hero_fashion_1.png')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a]/60 via-transparent to-[#1a1a1a]/45"></div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white w-full text-center md:text-left z-10 pt-16">
          <div className="max-w-2xl space-y-6 md:space-y-8 animate-fadeIn">
            <span className="text-xs uppercase tracking-[0.3em] font-semibold text-accent">{t('Chiến dịch Katalin-Clothes', 'Katalin-Clothes Campaign')}</span>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-light leading-none tracking-tight">
              {t('Ý niệm', 'Aesthetic')} <br />
              <span className="font-normal italic">{t('Thẩm mỹ', 'Narrative')}</span>
            </h1>
            <p className="text-white/80 text-xs sm:text-sm max-w-md leading-relaxed tracking-wider font-light mx-auto md:mx-0">
              {t(
                'Những phom dáng vượt thời gian được thiết kế từ chất liệu tự nhiên cao cấp và đường nét kiến trúc tinh tế cho tủ đồ hiện đại.',
                'Timeless silhouettes designed with exceptional organic materials and architectural lines for the modern wardrobe.'
              )}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-4">
              <Link
                to="/collections"
                className="w-full sm:w-auto px-8 py-3.5 bg-white text-[#1a1a1a] text-xs tracking-widest uppercase font-semibold hover:bg-accent hover:text-white transition-all duration-300 rounded shadow-md text-center"
              >
                {t('Mua bộ sưu tập', 'Shop Collection')}
              </Link>
              <Link
                to="/collections?filter=new"
                className="w-full sm:w-auto px-8 py-3.5 border border-white/40 text-white text-xs tracking-widest uppercase font-semibold hover:border-white hover:bg-white/5 transition-all duration-300 rounded text-center"
              >
                {t('Hàng mới về', 'New Arrivals')}
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Banner Info */}
        <div className="absolute bottom-10 left-0 w-full hidden lg:block z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center text-[10px] uppercase tracking-[0.2em] text-white/50">
            <span>{t('Miễn phí giao hàng cho đơn từ 1.000.000₫', 'Free Shipping Above 1.000.000₫')}</span>
            <span>{t('May đo thủ công tại Việt Nam', 'Ethically Made in Vietnam')}</span>
            <span>Est. 2026</span>
          </div>
        </div>
      </section>

      {/* Brand Ethos / Story */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6 pt-8">
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-accent">{t('TRIẾT LÝ THƯƠNG HIỆU', 'THE ETHOS')}</span>
        <h2 className="text-2xl sm:text-4xl font-serif text-primary font-normal leading-snug">
          {t('"Sự tối giản chính là chiếc chìa khóa khởi sinh vẻ thanh lịch đích thực."', '"Simplicity is the keynote of all true elegance."')}
        </h2>
        <div className="w-12 h-px bg-primary/20 mx-auto"></div>
        <p className="text-secondary text-xs sm:text-sm leading-relaxed max-w-xl mx-auto tracking-wide font-light">
          {t(
            'Chúng tôi tin vào những trang phục mang câu chuyện riêng. Không chạy theo xu hướng nhất thời, chúng tôi tôn vinh cấu trúc của phom dáng. Katalin-Clothes chọn lọc các sợi tự nhiên như linen, lụa tơ tằm và cotton hữu cơ nhằm tạo ra những sản phẩm mướt nhẹ trên da và bền đẹp cùng năm tháng.',
            'We believe in clothes that tell a story. Not of trends, but of form. We source natural fibers like premium linen, silk, and organic cotton to craft pieces that sit lightly on your skin and endure in your collection.'
          )}
        </p>
      </section>

      {/* Category Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-end justify-between border-b border-primary/5 pb-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-accent font-semibold">{t('Mua sắm theo thể loại', 'Shop by Category')}</span>
            <h3 className="text-xl sm:text-3xl font-serif text-primary mt-1 font-semibold">{t('Danh mục tuyển chọn', 'Structured Categories')}</h3>
          </div>
          <Link to="/collections" className="text-xs uppercase tracking-widest text-primary font-semibold hover:opacity-75 flex items-center gap-1.5 transition">
            {t('Xem tất cả', 'View All')} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => {
            let imgUrl = '/src/assets/products/linen_shirt_1.png';
            if (cat.slug === 'bottoms') imgUrl = '/src/assets/products/wide_pants_1.png';
            if (cat.slug === 'dresses') imgUrl = '/src/assets/products/silk_dress_1.png';
            if (cat.slug === 'outerwear') imgUrl = '/src/assets/products/trench_coat_1.png';

            return (
              <Link
                key={cat.id}
                to={`/collections?category=${cat.slug}`}
                className="group relative h-72 sm:h-96 w-full bg-surface overflow-hidden rounded shadow-sm border border-primary/5 block"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url('${imgUrl}')` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-primary/10 to-transparent transition-opacity group-hover:from-primary/75"></div>
                
                <div className="absolute bottom-6 left-6 text-white space-y-1">
                  <span className="text-[9px] uppercase tracking-[0.25em] text-accent font-semibold">
                    {language === 'vi' ? cat.name_en : cat.name_vi}
                  </span>
                  <h4 className="font-serif text-lg sm:text-xl font-medium tracking-wider">
                    {language === 'vi' ? cat.name_vi : cat.name_en}
                  </h4>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Collection Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[10px] uppercase tracking-[0.25em] text-accent font-semibold">{t('Tuyển chọn đặc biệt', 'Featured Selection')}</span>
          <h3 className="text-2xl sm:text-4xl font-serif text-primary font-bold">{t('Danh mục biên tập', 'The Editorial Catalog')}</h3>
          <div className="w-12 h-px bg-primary/25 mx-auto mt-3"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
          {featuredProducts.map((prod) => {
            const hasDiscount = prod.compare_at_price && prod.compare_at_price > prod.price;

            return (
              <div key={prod.id} className="group flex flex-col space-y-4">
                {/* Image Container */}
                <div className="relative aspect-[3/4] bg-surface overflow-hidden rounded border border-primary/5">
                  <Link to={`/products/${prod.slug}`} className="block h-full w-full">
                    <img
                      src={prod.images[0]?.url || '/src/assets/products/linen_shirt_1.png'}
                      alt={language === 'vi' ? prod.images[0]?.alt_vi || prod.name_vi : prod.images[0]?.alt_en || prod.name_en}
                      className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    />
                  </Link>

                  {/* Absolute badgifying */}
                  {prod.is_new_arrival && (
                    <span className="absolute top-4 left-4 bg-primary text-white text-[9px] tracking-widest uppercase px-2 py-0.5 rounded font-semibold">
                      {t('Mới', 'New')}
                    </span>
                  )}
                  {hasDiscount && (
                    <span className="absolute top-4 right-4 bg-accent text-white text-[9px] tracking-widest uppercase px-2 py-0.5 rounded font-semibold">
                      Sale
                    </span>
                  )}

                  {/* Actions Drawer Hover */}
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/50 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-between gap-2">
                    <button
                      onClick={() => addToCart(prod, prod.variants[0] || undefined)}
                      className="flex-1 bg-card hover:bg-primary hover:text-card text-primary text-[10px] font-semibold tracking-widest uppercase py-2.5 px-3 rounded shadow transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      {t('Thêm vào giỏ', 'Add to Cart')}
                    </button>
                    <button
                      onClick={() => toggleWishlist(prod)}
                      className="bg-card border border-outline-custom hover:bg-surface p-2.5 rounded shadow text-primary hover:text-accent transition cursor-pointer"
                      aria-label="Wishlist"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isInWishlist(prod.id) ? 'fill-accent text-accent' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="flex justify-between items-start text-xs tracking-wider">
                  <div className="space-y-1">
                    <span className="text-[10px] text-secondary font-mono tracking-widest uppercase block">
                      {prod.sku}
                    </span>
                    <Link to={`/products/${prod.slug}`} className="font-serif text-sm font-semibold hover:underline text-primary">
                      {language === 'vi' ? prod.name_vi : prod.name_en}
                    </Link>
                    {language === 'vi' ? (
                      <p className="text-[10px] text-secondary/70 italic">{prod.name_en}</p>
                    ) : (
                      <p className="text-[10px] text-secondary/70 italic">{prod.name_vi}</p>
                    )}
                  </div>
                  
                  <div className="text-right font-medium">
                    <span className="text-primary font-semibold">{formatPriceVND(prod.price)}</span>
                    {hasDiscount && (
                      <span className="block text-[10px] text-secondary line-through opacity-75 mt-0.5">
                        {formatPriceVND(prod.compare_at_price!)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Editorial Quote */}
      <section className="bg-[#1a1a1a] dark:bg-[#121212] text-white py-24 flex items-center justify-center text-center">
        <div className="max-w-3xl px-4 sm:px-6 space-y-6">
          <span className="text-xs uppercase tracking-[0.3em] text-accent font-semibold">{t('CHIẾN DỊCH HÈ', 'SUMMER CAMPAIGN')}</span>
          <h3 className="text-3xl sm:text-5xl font-serif font-light leading-snug">
            {t('Thiết kế cho Sự nhẹ nhàng,', 'Designed for Ease,')} <br />
            {t('May đo cho sự Bền bỉ', 'Crafted for')} <span className="italic">{t('Trường tồn', 'Longevity')}</span>
          </h3>
          <p className="text-white/60 text-xs sm:text-sm max-w-md mx-auto leading-relaxed font-light">
            {t(
              'Từng sản phẩm đều trải qua các quy trình kiểm thử độ rũ của phom dáng và tinh chỉnh đường viền nhằm đảm bảo sự thoải mái và định hình phong cách ổn định suốt nhiều năm.',
              'Every garment goes through strict shape testing and finishing details to guarantee comfort and style stability for years to come.'
            )}
          </p>
          <div className="pt-4">
            <Link
              to="/collections"
              className="inline-flex items-center gap-2 border-b border-white pb-1.5 text-xs uppercase tracking-widest text-white hover:text-accent hover:border-accent transition font-semibold"
            >
              {t('Khám phá Bộ sưu tập', 'Explore the Collection')} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Icons Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 py-4 border-t border-primary/5">
        <div className="flex flex-col items-center text-center p-4 space-y-3">
          <div className="w-12 h-12 rounded-full border border-primary/10 flex items-center justify-center text-accent">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="font-serif text-sm font-semibold text-primary uppercase tracking-wider">{t('Chất liệu Thượng hạng', 'Premium Materials')}</h4>
          <p className="text-[11px] text-secondary max-w-xs leading-relaxed">
            {t(
              '100% linen tự nhiên, lụa tơ tằm nguyên bản và bông hữu cơ đã qua kiểm định thân thiện với môi trường, cho độ bền bỉ vượt trội.',
              '100% natural linen, silk, and organic cotton certified for ethical harvesting and supreme fiber strength.'
            )}
          </p>
        </div>
        <div className="flex flex-col items-center text-center p-4 space-y-3">
          <div className="w-12 h-12 rounded-full border border-primary/10 flex items-center justify-center text-accent">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <h4 className="font-serif text-sm font-semibold text-primary uppercase tracking-wider">{t('Vận chuyển & Đổi trả', 'Circular Logistics')}</h4>
          <p className="text-[11px] text-secondary max-w-xs leading-relaxed">
            {t(
              'Miễn phí vận chuyển cho đơn hàng trị giá trên 1.000.000₫. Hỗ trợ đổi trả trong vòng 15 ngày để trải nghiệm hoàn hảo nhất.',
              'Free shipping on order amounts exceeding 1.000.000₫. 15-day return policy for peace of mind.'
            )}
          </p>
        </div>
        <div className="flex flex-col items-center text-center p-4 space-y-3">
          <div className="w-12 h-12 rounded-full border border-primary/10 flex items-center justify-center text-accent">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h4 className="font-serif text-sm font-semibold text-primary uppercase tracking-wider">{t('Tư vấn Số đo', 'Personal Fitting')}</h4>
          <p className="text-[11px] text-secondary max-w-xs leading-relaxed">
            {t(
              'Đội ngũ chuyên gia luôn sẵn sàng 24/7. Bạn có thể xem bảng chi tiết số đo áo/quần ngay trên trang sản phẩm để chọn size chính xác nhất.',
              'Our sizing experts are available 24/7. Access detailed measurement profiles directly inside product sheets.'
            )}
          </p>
        </div>
      </section>
    </div>
  );
};
