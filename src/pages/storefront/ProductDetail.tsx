import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../../db/dbClient';
import type { Product, ProductImage } from '../../db/mockDb';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useLanguage } from '../../context/LanguageContext';
import { formatPriceVND } from '../../utils/formatters';
import { Heart, ShoppingBag, ArrowLeft, ChevronDown, ChevronUp, ShieldCheck, AlertCircle } from 'lucide-react';

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { language, t } = useLanguage();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<ProductImage | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColorHex, setSelectedColorHex] = useState<string>('');
  const [selectedColorName, setSelectedColorName] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  // Accordion drawer states
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [careOpen, setCareOpen] = useState(false);
  const [shippingOpen, setShippingOpen] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!slug) return;
      setLoading(true);
      const prod = await db.getProductBySlug(slug);
      if (prod) {
        setProduct(prod);
        setSelectedImage(prod.images.find(img => img.is_primary) || prod.images[0]);
        
        // Auto select first variant if available
        if (prod.variants && prod.variants.length > 0) {
          setSelectedSize(prod.variants[0].size);
          setSelectedColorHex(prod.variants[0].color_hex);
          setSelectedColorName(language === 'vi' ? prod.variants[0].color_name_vi : prod.variants[0].color_name_en);
        }

        // Fetch related products
        const allProds = await db.getProducts();
        const related = allProds
          .filter(p => p.category_id === prod.category_id && p.id !== prod.id && p.is_active)
          .slice(0, 3);
        setRelatedProducts(related);
      } else {
        setProduct(null);
      }
      setLoading(false);
    };

    fetchProductDetails();
  }, [slug, language]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="animate-spin w-8 h-8 border-t-2 border-primary border-solid rounded-full mx-auto mb-4"></div>
        <p className="text-secondary text-xs font-mono">{t('Đang tải thông tin sản phẩm...', 'Loading product particulars...')}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto text-center py-24 space-y-6">
        <h1 className="font-serif text-3xl font-bold">{t('Không tìm thấy sản phẩm', 'Piece Not Found')}</h1>
        <p className="text-secondary text-xs leading-relaxed">
          {t(
            'Trang phục bạn yêu cầu có thể đã bị ẩn hoặc xóa khỏi danh mục. Hãy khám phá các thiết kế khác của chúng tôi.',
            'The requested garment might have been archived or deleted. Explore our active catalog for other items.'
          )}
        </p>
        <Link
          to="/collections"
          className="inline-block px-8 py-3 bg-primary text-white text-xs tracking-widest uppercase font-semibold hover:bg-primary-light transition rounded"
        >
          {t('Quay lại danh mục', 'Return to Catalog')}
        </Link>
      </div>
    );
  }

  // Find variant matching current selections
  const currentVariant = product.variants.find(
    v => v.size === selectedSize && v.color_hex === selectedColorHex
  );

  // Total stock of selected color/size variant or total product stock
  const currentStock = currentVariant ? currentVariant.stock_quantity : product.stock_quantity;
  const isOutOfStock = currentStock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, currentVariant || undefined, quantity);
  };

  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  
  // Sizing and Color availability pools
  const availableSizes = Array.from(new Set(product.variants.map(v => v.size)));
  const uniqueColors = product.variants.reduce((acc, current) => {
    const x = acc.find(item => item.color_hex === current.color_hex);
    if (!x) {
      return acc.concat([{
        color_hex: current.color_hex,
        color_name: language === 'vi' ? current.color_name_vi : current.color_name_en
      }]);
    } else {
      return acc;
    }
  }, [] as { color_hex: string; color_name: string }[]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-20">
      {/* Back button */}
      <div>
        <Link to="/collections" className="inline-flex items-center gap-2 text-xs text-secondary hover:text-primary transition uppercase tracking-widest font-semibold">
          <ArrowLeft className="w-4 h-4" /> {t('Quay lại danh mục', 'Back to Collection')}
        </Link>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Left Column: Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-[3/4] w-full bg-surface rounded overflow-hidden border border-primary/5">
            <img
              src={selectedImage?.url || '/src/assets/products/linen_shirt_1.png'}
              alt={language === 'vi' ? selectedImage?.alt_vi || product.name_vi : selectedImage?.alt_en || product.name_en}
              className="w-full h-full object-cover object-center transition-all duration-300"
            />
          </div>

          {/* Thumbnail list */}
          {product.images.length > 1 && (
            <div className="flex gap-4">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 aspect-[3/4] bg-surface rounded overflow-hidden border transition shrink-0 ${
                    selectedImage?.id === img.id ? 'border-primary' : 'border-primary/5 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt={language === 'vi' ? img.alt_vi : img.alt_en} className="w-full h-full object-cover object-center" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Information details */}
        <div className="space-y-8">
          {/* Header info */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-[10px] tracking-widest font-mono text-secondary uppercase">
              <span>SKU: {currentVariant?.sku || product.sku}</span>
              <span>EST. 2026</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-primary leading-tight">
              {language === 'vi' ? product.name_vi : product.name_en}
            </h1>
            {language === 'vi' ? (
              <p className="text-xs text-secondary italic tracking-wider">{product.name_en}</p>
            ) : (
              <p className="text-xs text-secondary italic tracking-wider">{product.name_vi}</p>
            )}
            
            {/* Price display */}
            <div className="flex items-baseline space-x-3 pt-2">
              <span className="text-2xl font-serif font-semibold text-primary">
                {formatPriceVND(product.price)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-sm text-secondary line-through opacity-75">
                    {formatPriceVND(product.compare_at_price!)}
                  </span>
                  <span className="bg-accent/10 text-accent text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                    Discount Sale
                  </span>
                </>
              )}
            </div>
          </div>

          <hr className="border-primary/5" />

          {/* Product configuration selector */}
          <div className="space-y-6">
            {/* Colors selection */}
            {uniqueColors.length > 0 && (
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-primary">
                  <span>{t('Chọn Màu sắc', 'Select Color')}</span>
                  <span className="text-secondary font-medium lowercase font-sans">{selectedColorName}</span>
                </div>
                <div className="flex space-x-3">
                  {uniqueColors.map((col) => (
                    <button
                      key={col.color_hex}
                      onClick={() => {
                        setSelectedColorHex(col.color_hex);
                        setSelectedColorName(col.color_name);
                      }}
                      className={`w-8 h-8 rounded-full border flex items-center justify-center transition cursor-pointer ${
                        selectedColorHex === col.color_hex ? 'border-primary ring-1 ring-primary/20 scale-105' : 'border-primary/10'
                      }`}
                      style={{ backgroundColor: col.color_hex }}
                      title={col.color_name}
                    >
                      {selectedColorHex === col.color_hex && (
                        <div className={`w-1.5 h-1.5 rounded-full ${col.color_hex.toLowerCase() === '#ffffff' ? 'bg-primary' : 'bg-white'}`} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes selection */}
            {availableSizes.length > 0 && (
              <div className="space-y-3">
                <span className="text-[10px] uppercase tracking-widest font-bold text-primary block">{t('Chọn Kích thước', 'Select Size')}</span>
                <div className="flex flex-wrap gap-3">
                  {availableSizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`w-11 h-11 border text-xs flex items-center justify-center rounded transition cursor-pointer ${
                        selectedSize === sz
                          ? 'border-primary bg-primary text-white font-semibold'
                          : 'border-outline-custom bg-card text-secondary hover:border-primary/30'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity selection */}
            {!isOutOfStock && (
              <div className="space-y-3 w-32">
                <span className="text-[10px] uppercase tracking-widest font-bold text-primary block">{t('Số lượng', 'Quantity')}</span>
                <div className="flex items-center border border-primary/15 rounded bg-card">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 hover:bg-surface text-secondary transition cursor-pointer"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center text-xs font-semibold text-primary">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                    className="px-3 py-1.5 hover:bg-surface text-secondary transition cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Stock Notification indicators */}
          <div className="space-y-2.5">
            {isOutOfStock ? (
              <div className="flex items-center space-x-2 text-xs text-red-500 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{t('Đã hết hàng! Vui lòng quay lại sau...', 'Sold out! Checking incoming replenishment...')}</span>
              </div>
            ) : currentStock <= 5 ? (
              <div className="flex items-center space-x-2 text-xs text-amber-500 font-medium animate-pulse">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{t(`Sắp hết hàng: Chỉ còn ${currentStock} sản phẩm cho tùy chọn này!`, `Low Stock: Only ${currentStock} pieces left in this configuration!`)}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-xs text-emerald-600 font-medium">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>{t(`Sản phẩm đang sẵn có (${currentStock} sản phẩm)`, `Garment in stock (${currentStock} available units)`)}</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex-1 py-4 text-xs tracking-widest uppercase font-semibold text-center rounded transition shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                isOutOfStock
                  ? 'bg-primary/10 text-secondary cursor-not-allowed shadow-none'
                  : 'bg-primary text-white hover:bg-primary-light'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              {isOutOfStock ? t('Hết Hàng', 'Sold Out') : t('Thêm vào Giỏ Hàng', 'Add to Shopping Cart')}
            </button>
            
            <button
              onClick={() => toggleWishlist(product)}
              className="px-4 border border-outline-custom hover:border-primary rounded text-primary hover:text-accent transition flex items-center justify-center bg-card cursor-pointer"
              aria-label="Wishlist toggle"
            >
              <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-accent text-accent' : ''}`} />
            </button>
          </div>

          <hr className="border-primary/5" />

          {/* Technical detail accordions */}
          <div className="border border-primary/5 rounded bg-card overflow-hidden shadow-sm">
            {/* Description detail */}
            <div className="border-b border-primary/5 last:border-b-0">
              <button
                onClick={() => setDetailsOpen(!detailsOpen)}
                className="w-full px-6 py-4 flex items-center justify-between text-xs tracking-widest uppercase font-bold text-primary hover:bg-surface transition cursor-pointer"
              >
                <span>{t('Chi tiết Thành phần', 'Composition Details')}</span>
                {detailsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {detailsOpen && (
                <div className="px-6 pb-5 pt-1 text-xs text-secondary leading-relaxed space-y-3 font-light">
                  <p>{language === 'vi' ? product.description_vi : product.description_en}</p>
                  {language === 'vi' ? (
                    <p className="italic text-secondary/80">{product.description_en}</p>
                  ) : (
                    <p className="italic text-secondary/80">{product.description_vi}</p>
                  )}
                  <p className="pt-2">
                    <strong className="font-semibold text-primary">{t('Thành phần vải:', 'Composition:')}</strong> {language === 'vi' ? product.materials_vi || 'N/A' : product.materials_en || 'N/A'}
                  </p>
                </div>
              )}
            </div>

            {/* Care Instructions */}
            <div className="border-b border-primary/5 last:border-b-0">
              <button
                onClick={() => setCareOpen(!careOpen)}
                className="w-full px-6 py-4 flex items-center justify-between text-xs tracking-widest uppercase font-bold text-primary hover:bg-surface transition cursor-pointer"
              >
                <span>{t('Hướng dẫn Bảo quản', 'Garment Care Instructions')}</span>
                {careOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {careOpen && (
                <div className="px-6 pb-5 pt-1 text-xs text-secondary leading-relaxed space-y-2 font-light">
                  <p>{language === 'vi' ? product.care_instructions_vi : product.care_instructions_en}</p>
                  {language === 'vi' ? (
                    <p className="italic text-secondary/80">{product.care_instructions_en}</p>
                  ) : (
                    <p className="italic text-secondary/80">{product.care_instructions_vi}</p>
                  )}
                </div>
              )}
            </div>

            {/* Logistics & Delivery */}
            <div className="border-b border-primary/5 last:border-b-0">
              <button
                onClick={() => setShippingOpen(!shippingOpen)}
                className="w-full px-6 py-4 flex items-center justify-between text-xs tracking-widest uppercase font-bold text-primary hover:bg-surface transition cursor-pointer"
              >
                <span>{t('Vận chuyển & Đổi trả', 'Shipping & Returns')}</span>
                {shippingOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {shippingOpen && (
                <div className="px-6 pb-5 pt-1 text-xs text-secondary leading-relaxed space-y-2 font-light">
                  <p>{t('Giao hàng tiêu chuẩn toàn quốc: 2 - 3 ngày làm việc. Miễn phí vận chuyển cho tất cả đơn hàng trên 1.000.000₫.', 'Standard delivery across Vietnam: 2-3 business days. Free shipping on all orders over 1.000.000₫.')}</p>
                  <p>{t('Chính sách đổi trả: Hỗ trợ đổi trả tận nơi trong vòng 15 ngày kể từ ngày nhận hàng với điều kiện sản phẩm còn nguyên tem mác và bao bì.', 'Returns: We offer hassle-free return shipping within 15 days of order delivery in original tags and packaging.')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Recommendations */}
      {relatedProducts.length > 0 && (
        <section className="space-y-8 border-t border-primary/5 pt-16">
          <div className="text-center">
            <span className="text-[10px] uppercase tracking-[0.25em] text-accent font-semibold">{t('Hoàn thiện phong cách', 'Complete the Silhouette')}</span>
            <h2 className="text-2xl font-serif text-primary mt-1 font-bold">{t('Sản phẩm liên quan', 'Related Pieces')}</h2>
            <div className="w-10 h-px bg-primary/20 mx-auto mt-3"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {relatedProducts.map((p) => (
              <div key={p.id} className="group flex flex-col space-y-4">
                <div className="relative aspect-[3/4] bg-surface overflow-hidden rounded border border-primary/5">
                  <Link to={`/products/${p.slug}`} className="block h-full w-full">
                    <img
                      src={p.images[0]?.url || '/src/assets/products/linen_shirt_1.png'}
                      alt={language === 'vi' ? p.name_vi : p.name_en}
                      className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    />
                  </Link>
                </div>
                <div className="flex justify-between items-start text-xs tracking-wider">
                  <div>
                    <Link to={`/products/${p.slug}`} className="font-serif text-sm font-semibold hover:underline text-primary">
                      {language === 'vi' ? p.name_vi : p.name_en}
                    </Link>
                    {language === 'vi' ? (
                      <p className="text-[10px] text-secondary/70 italic mt-0.5">{p.name_en}</p>
                    ) : (
                      <p className="text-[10px] text-secondary/70 italic mt-0.5">{p.name_vi}</p>
                    )}
                  </div>
                  <span className="text-primary font-semibold">{formatPriceVND(p.price)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
