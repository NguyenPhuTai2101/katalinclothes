import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { db } from '../../db/dbClient';
import type { Product, Category } from '../../db/mockDb';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useLanguage } from '../../context/LanguageContext';
import { formatPriceVND } from '../../utils/formatters';
import { Heart, ShoppingBag, Filter, SlidersHorizontal, Check, X } from 'lucide-react';

export const Collections: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [priceRange, setPriceRange] = useState<number>(2500000); // max price
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedFlag, setSelectedFlag] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('recommended');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Mobile drawer filter toggle
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { language, t } = useLanguage();

  // Load categories and sync URL query params
  useEffect(() => {
    const loadData = async () => {
      const allCats = await db.getCategories();
      setCategories(allCats.filter(c => c.is_active));
      
      const allProds = await db.getProducts();
      setProducts(allProds.filter(p => p.is_active));
    };
    loadData();
  }, []);

  // Update filters based on URL search parameters
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) setSelectedCategory(categoryParam);

    const searchParam = searchParams.get('search');
    if (searchParam) setSearchQuery(searchParam);

    const filterParam = searchParams.get('filter');
    if (filterParam) {
      if (filterParam === 'new') setSelectedFlag('new');
      if (filterParam === 'featured') setSelectedFlag('featured');
    }
  }, [searchParams]);

  // Clean filters
  const resetFilters = () => {
    setSelectedCategory('');
    setPriceRange(2500000);
    setSelectedSize('');
    setSelectedFlag('');
    setSearchQuery('');
    setSearchParams({});
  };

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      // Category filter
      if (selectedCategory) {
        const catObj = categories.find(c => c.slug === selectedCategory);
        if (catObj && product.category_id !== catObj.id) return false;
      }
      // Price filter
      if (product.price > priceRange) return false;
      // Size filter
      if (selectedSize && !product.variants.some(v => v.size === selectedSize)) return false;
      // Flags
      if (selectedFlag === 'new' && !product.is_new_arrival) return false;
      if (selectedFlag === 'featured' && !product.is_featured) return false;
      if (selectedFlag === 'sale' && (!product.compare_at_price || product.compare_at_price <= product.price)) return false;
      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = product.name_en.toLowerCase().includes(query) || product.name_vi.toLowerCase().includes(query);
        const matchesSku = product.sku.toLowerCase().includes(query);
        const matchesTags = product.tags?.some(t => t.toLowerCase().includes(query));
        if (!matchesName && !matchesSku && !matchesTags) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortOption === 'price-asc') return a.price - b.price;
      if (sortOption === 'price-desc') return b.price - a.price;
      if (sortOption === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      // Default: recommended (featured first, then price)
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      return 0;
    });

  const sizes = ['S', 'M', 'L', 'XL', '36', '37', '38'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Editorial Header */}
      <div className="text-center space-y-3 mb-12 animate-fadeIn">
        <span className="text-[10px] uppercase tracking-[0.25em] text-accent font-semibold">{t('MUA SẮM THỜI TRANG CƠ BẢN', 'SHOP THE ESSENTIALS')}</span>
        <h1 className="text-3xl sm:text-5xl font-serif font-light text-primary">{t('Tất cả Bộ sưu tập', 'All Collections')}</h1>
        <p className="text-xs text-secondary max-w-md mx-auto leading-relaxed">
          {t(
            'Các thiết kế tối giản, tập trung vào cấu trúc đường nét kiến trúc và gam màu trung tính sang trọng.',
            'Curated minimalist garments structured around architectural forms and neutral shades.'
          )}
        </p>
      </div>

      <div className="flex gap-12">
        {/* Desktop Sidebar Filter (left side) */}
        <aside className="hidden lg:block w-64 shrink-0 space-y-8">
          <div className="flex items-center justify-between border-b border-primary/5 pb-4">
            <span className="text-xs uppercase tracking-widest font-semibold flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" /> {t('Bộ lọc', 'Filters')}
            </span>
            <button
              onClick={resetFilters}
              className="text-[10px] uppercase tracking-widest text-secondary hover:text-primary transition underline underline-offset-4 cursor-pointer"
            >
              {t('Đặt lại', 'Reset All')}
            </button>
          </div>

          {/* Search Field */}
          <div className="space-y-2.5">
            <label className="text-[10px] uppercase tracking-widest font-bold text-primary block">{t('Từ khóa tìm kiếm', 'Search Query')}</label>
            <input
              type="text"
              placeholder={t('Tìm kiếm trong danh mục...', 'Search catalog...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-card border border-primary/10 rounded focus:outline-none focus:border-primary text-primary"
            />
          </div>

          {/* Category Filter */}
          <div className="space-y-2.5">
            <span className="text-[10px] uppercase tracking-widest font-bold text-primary block">{t('Danh mục', 'Categories')}</span>
            <div className="flex flex-col space-y-1.5">
              <button
                onClick={() => { setSelectedCategory(''); setSearchParams({ ...Object.fromEntries(searchParams), category: '' }); }}
                className={`text-xs text-left py-1 hover:text-primary transition cursor-pointer ${selectedCategory === '' ? 'font-bold text-primary active-nav-link w-fit' : 'text-secondary'}`}
              >
                {t('Tất cả Danh mục', 'All Categories')}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.slug); setSearchParams({ ...Object.fromEntries(searchParams), category: cat.slug }); }}
                  className={`text-xs text-left py-1 hover:text-primary transition cursor-pointer ${selectedCategory === cat.slug ? 'font-bold text-primary active-nav-link w-fit' : 'text-secondary'}`}
                >
                  {language === 'vi' ? cat.name_vi : cat.name_en}
                </button>
              ))}
            </div>
          </div>

          {/* Sizing Filter */}
          <div className="space-y-2.5">
            <span className="text-[10px] uppercase tracking-widest font-bold text-primary block">{t('Chọn Kích thước', 'Select Size')}</span>
            <div className="flex flex-wrap gap-2">
              {sizes.map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(selectedSize === sz ? '' : sz)}
                  className={`w-9 h-9 border text-xs flex items-center justify-center rounded transition cursor-pointer ${
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

          {/* Price Range */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold">
              <span>{t('Giá tối đa', 'Max Price')}</span>
              <span className="font-mono">{formatPriceVND(priceRange)}</span>
            </div>
            <input
              type="range"
              min={100000}
              max={2500000}
              step={50000}
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-primary bg-primary/10 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Flag Options */}
          <div className="space-y-2.5">
            <span className="text-[10px] uppercase tracking-widest font-bold text-primary block">{t('Bộ sưu tập đặc biệt', 'Collection Badges')}</span>
            <div className="flex flex-col space-y-1.5 text-xs">
              {[
                { key: 'new', label: t('Hàng mới về', 'New Arrivals') },
                { key: 'featured', label: t('Sản phẩm Nổi bật', 'Featured Pieces') },
                { key: 'sale', label: t('Khuyến mãi / Sale', 'Discount Sales') }
              ].map(flag => (
                <button
                  key={flag.key}
                  onClick={() => setSelectedFlag(selectedFlag === flag.key ? '' : flag.key)}
                  className="flex items-center gap-2 text-secondary hover:text-primary transition text-left cursor-pointer"
                >
                  <div className={`w-3.5 h-3.5 border rounded flex items-center justify-center ${selectedFlag === flag.key ? 'border-primary bg-primary text-white' : 'border-primary/25 bg-card'}`}>
                    {selectedFlag === flag.key && <Check className="w-2.5 h-2.5" />}
                  </div>
                  <span>{flag.label}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Catalog Grid (right side) */}
        <div className="flex-1 space-y-6">
          {/* Controls Bar */}
          <div className="flex items-center justify-between border-b border-primary/5 pb-4 text-xs">
            <span className="text-secondary tracking-wide font-light">
              {t('Hiển thị', 'Showing')} <span className="font-semibold text-primary">{filteredProducts.length}</span> {t('sản phẩm thời trang', 'apparel pieces')}
            </span>

            <div className="flex items-center space-x-4">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setFilterDrawerOpen(true)}
                className="lg:hidden flex items-center gap-1.5 border border-primary/15 px-3 py-1.5 rounded bg-card hover:bg-surface transition cursor-pointer"
              >
                <Filter className="w-3.5 h-3.5" /> {t('Bộ lọc', 'Filters')}
              </button>

              {/* Sort selector */}
              <div className="flex items-center space-x-2">
                <span className="text-secondary tracking-widest uppercase text-[10px] font-bold">{t('Sắp xếp', 'Sort By')}</span>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="bg-card border border-primary/15 rounded py-1 px-2.5 text-xs text-primary focus:outline-none"
                >
                  <option value="recommended">{t('Gợi ý cho bạn', 'Recommended')}</option>
                  <option value="price-asc">{t('Giá: Thấp đến Cao', 'Price: Low to High')}</option>
                  <option value="price-desc">{t('Giá: Cao đến Thấp', 'Price: High to Low')}</option>
                  <option value="newest">{t('Hàng mới nhất', 'Newest Arrivals')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {filteredProducts.map((prod) => {
                const hasDiscount = prod.compare_at_price && prod.compare_at_price > prod.price;

                return (
                  <div key={prod.id} className="group flex flex-col space-y-4 animate-fadeIn">
                    <div className="relative aspect-[3/4] bg-surface overflow-hidden rounded border border-primary/5">
                      <Link to={`/products/${prod.slug}`} className="block h-full w-full">
                        <img
                          src={prod.images[0]?.url || '/src/assets/products/linen_shirt_1.png'}
                          alt={language === 'vi' ? prod.images[0]?.alt_vi || prod.name_vi : prod.images[0]?.alt_en || prod.name_en}
                          className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                        />
                      </Link>

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

                      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/50 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-between gap-2">
                        <button
                          onClick={() => addToCart(prod, prod.variants[0] || undefined)}
                          className="flex-1 bg-card hover:bg-primary hover:text-white text-primary text-[10px] font-semibold tracking-widest uppercase py-2.5 px-3 rounded shadow transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          {t('Thêm vào giỏ', 'Add to Cart')}
                        </button>
                        <button
                          onClick={() => toggleWishlist(prod)}
                          className="bg-card/95 hover:bg-card p-2.5 rounded shadow text-primary hover:text-accent transition cursor-pointer"
                          aria-label="Wishlist"
                        >
                          <Heart className={`w-3.5 h-3.5 ${isInWishlist(prod.id) ? 'fill-accent text-accent' : ''}`} />
                        </button>
                      </div>
                    </div>

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
          ) : (
            <div className="py-24 text-center space-y-4">
              <p className="text-secondary text-sm">{t('Không tìm thấy sản phẩm nào phù hợp.', 'No items found matching the selected filters.')}</p>
              <button
                onClick={resetFilters}
                className="px-6 py-2 border border-primary/20 hover:bg-primary hover:text-white text-xs tracking-widest uppercase transition rounded font-semibold cursor-pointer"
              >
                {t('Xóa tất cả bộ lọc', 'Clear all filters')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer Slide-out Filter */}
      {filterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden animate-fadeIn">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-primary/45 backdrop-blur-sm"
            onClick={() => setFilterDrawerOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative flex flex-col w-full max-w-xs bg-card h-full shadow-2xl p-6 z-10 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-primary/5 pb-4 mb-6">
              <span className="text-xs uppercase tracking-widest font-semibold flex items-center gap-2">
                <Filter className="w-4 h-4" /> {t('Bộ lọc', 'Filters')}
              </span>
              <button
                onClick={() => setFilterDrawerOpen(false)}
                className="p-1 hover:opacity-75 focus:outline-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Category Filter */}
              <div className="space-y-2.5">
                <span className="text-[10px] uppercase tracking-widest font-bold text-primary block">{t('Danh mục', 'Categories')}</span>
                <div className="flex flex-col space-y-1.5 text-xs text-left">
                  <button
                    onClick={() => { setSelectedCategory(''); setFilterDrawerOpen(false); setSearchParams({ ...Object.fromEntries(searchParams), category: '' }); }}
                    className={`text-left py-1 cursor-pointer ${selectedCategory === '' ? 'font-bold text-primary' : 'text-secondary'}`}
                  >
                    {t('Tất cả Danh mục', 'All Categories')}
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => { setSelectedCategory(cat.slug); setFilterDrawerOpen(false); setSearchParams({ ...Object.fromEntries(searchParams), category: cat.slug }); }}
                      className={`text-left py-1 cursor-pointer ${selectedCategory === cat.slug ? 'font-bold text-primary' : 'text-secondary'}`}
                    >
                      {language === 'vi' ? cat.name_vi : cat.name_en}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sizing Filter */}
              <div className="space-y-2.5">
                <span className="text-[10px] uppercase tracking-widest font-bold text-primary block">{t('Chọn Kích thước', 'Select Size')}</span>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => { setSelectedSize(selectedSize === sz ? '' : sz); setFilterDrawerOpen(false); }}
                      className={`w-9 h-9 border text-xs flex items-center justify-center rounded transition cursor-pointer ${
                        selectedSize === sz
                          ? 'border-primary bg-primary text-white font-semibold'
                          : 'border-outline-custom bg-card text-secondary'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold">
                  <span>{t('Giá tối đa', 'Max Price')}</span>
                  <span className="font-mono">{formatPriceVND(priceRange)}</span>
                </div>
                <input
                  type="range"
                  min={100000}
                  max={2500000}
                  step={50000}
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-primary bg-primary/10 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Reset */}
              <button
                onClick={() => { resetFilters(); setFilterDrawerOpen(false); }}
                className="w-full py-2.5 text-center text-xs border border-primary/20 hover:bg-primary hover:text-white rounded transition uppercase tracking-widest font-semibold cursor-pointer"
              >
                {t('Xóa bộ lọc', 'Clear all filters')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
