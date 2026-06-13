import React, { useState, useEffect } from 'react';
import { db } from '../../db/dbClient';
import type { Product, Category, ProductVariant } from '../../db/mockDb';
import { formatPriceVND } from '../../utils/formatters';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  X, 
  Image as ImageIcon
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const { language, t } = useLanguage();

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [formFields, setFormFields] = useState({
    id: '',
    name_vi: '',
    name_en: '',
    slug: '',
    description_vi: '',
    description_en: '',
    price: 0,
    compare_at_price: 0,
    category_id: '',
    is_featured: false,
    is_new_arrival: false,
    is_active: true,
    stock_quantity: 0,
    sku: '',
    tags: '',
    materials_vi: '',
    materials_en: '',
    care_instructions_vi: '',
    care_instructions_en: '',
  });

  // Variant helper states
  const [variantsList, setVariantsList] = useState<ProductVariant[]>([]);
  const [newVarSize, setNewVarSize] = useState('S');
  const [newVarColorName, setNewVarColorName] = useState('Pure White');
  const [newVarColorHex, setNewVarColorHex] = useState('#ffffff');
  const [newVarStock, setNewVarStock] = useState(10);

  useEffect(() => {
    loadProductsAndCategories();
  }, []);

  const loadProductsAndCategories = async () => {
    const p = await db.getProducts();
    setProducts(p);
    const c = await db.getCategories();
    setCategories(c);
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormFields({
      id: '',
      name_vi: '',
      name_en: '',
      slug: '',
      description_vi: '',
      description_en: '',
      price: 450000,
      compare_at_price: 0,
      category_id: categories[0]?.id || '',
      is_featured: false,
      is_new_arrival: true,
      is_active: true,
      stock_quantity: 25,
      sku: '',
      tags: 'minimalist, summer',
      materials_vi: '100% Cotton hữu cơ',
      materials_en: '100% Organic Cotton',
      care_instructions_vi: 'Giặt máy bình thường',
      care_instructions_en: 'Machine wash warm',
    });
    // Seed some initial variants
    setVariantsList([
      { id: 'v-new-1', product_id: '', size: 'S', color_name_vi: 'Trắng', color_name_en: 'Pure White', color_hex: '#ffffff', stock_quantity: 10, price_adjustment: 0, sku: '' },
      { id: 'v-new-2', product_id: '', size: 'M', color_name_vi: 'Trắng', color_name_en: 'Pure White', color_hex: '#ffffff', stock_quantity: 15, price_adjustment: 0, sku: '' }
    ]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setFormFields({
      id: prod.id,
      name_vi: prod.name_vi,
      name_en: prod.name_en,
      slug: prod.slug,
      description_vi: prod.description_vi || '',
      description_en: prod.description_en || '',
      price: prod.price,
      compare_at_price: prod.compare_at_price || 0,
      category_id: prod.category_id,
      is_featured: prod.is_featured,
      is_new_arrival: prod.is_new_arrival,
      is_active: prod.is_active,
      stock_quantity: prod.stock_quantity,
      sku: prod.sku,
      tags: prod.tags?.join(', ') || '',
      materials_vi: prod.materials_vi || '',
      materials_en: prod.materials_en || '',
      care_instructions_vi: prod.care_instructions_vi || '',
      care_instructions_en: prod.care_instructions_en || '',
    });
    setVariantsList([...prod.variants]);
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormFields(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormFields(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddVariant = () => {
    const newVariant: ProductVariant = {
      id: 'v-add-' + Math.random().toString(36).substr(2, 5),
      product_id: formFields.id,
      size: newVarSize,
      color_name_vi: newVarColorName,
      color_name_en: newVarColorName,
      color_hex: newVarColorHex,
      stock_quantity: newVarStock,
      price_adjustment: 0,
      sku: `${formFields.sku || 'KTL'}-${newVarSize}-${newVarColorName.substring(0,2).toUpperCase()}`
    };
    setVariantsList([...variantsList, newVariant]);
  };

  const handleRemoveVariant = (id: string) => {
    setVariantsList(variantsList.filter(v => v.id !== id));
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm(t("Bạn có chắc chắn muốn xóa sản phẩm này không? Hành động này không thể hoàn tác.", "Are you sure you want to delete this product? This action cannot be undone."))) {
      const ok = await db.deleteProduct(id);
      if (ok) {
        setProducts(products.filter(p => p.id !== id));
      }
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    // Auto calculate total stock from variants if available
    const totalStock = variantsList.reduce((acc, curr) => acc + curr.stock_quantity, 0);

    const generatedSlug = formFields.slug || formFields.name_en.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
    const generatedSku = formFields.sku || `TS-${formFields.name_en.substring(0, 3).toUpperCase()}-${Math.floor(100+Math.random()*900)}`;

    const newProd: Product = {
      id: formFields.id || 'prod-' + Math.random().toString(36).substr(2, 9),
      name_vi: formFields.name_vi,
      name_en: formFields.name_en,
      slug: generatedSlug,
      description_vi: formFields.description_vi,
      description_en: formFields.description_en,
      price: Number(formFields.price),
      compare_at_price: formFields.compare_at_price ? Number(formFields.compare_at_price) : undefined,
      category_id: formFields.category_id,
      is_featured: formFields.is_featured,
      is_new_arrival: formFields.is_new_arrival,
      is_active: formFields.is_active,
      stock_quantity: variantsList.length > 0 ? totalStock : Number(formFields.stock_quantity),
      sku: generatedSku,
      tags: formFields.tags.split(',').map(t => t.trim()).filter(Boolean),
      materials_vi: formFields.materials_vi,
      materials_en: formFields.materials_en,
      care_instructions_vi: formFields.care_instructions_vi,
      care_instructions_en: formFields.care_instructions_en,
      images: editingProduct ? editingProduct.images : [
        { id: 'img-gen-' + Math.random().toString(36).substr(2, 5), product_id: '', url: '/src/assets/products/linen_shirt_1.png', display_order: 1, is_primary: true }
      ],
      variants: variantsList.map(v => ({
        ...v,
        sku: v.sku || `${generatedSku}-${v.size}-${v.color_name_en.substring(0, 2).toUpperCase()}`
      })),
      created_at: editingProduct ? editingProduct.created_at : new Date().toISOString()
    };

    await db.saveProduct(newProd);
    await loadProductsAndCategories();
    setIsModalOpen(false);
  };

  // Filter
  const filteredProducts = products.filter(p => {
    if (selectedCategory && p.category_id !== selectedCategory) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = p.name_en.toLowerCase().includes(query) || p.name_vi.toLowerCase().includes(query);
      const matchesSku = p.sku.toLowerCase().includes(query);
      if (!matchesName && !matchesSku) return false;
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="text-left">
          <h1 className="text-2xl font-bold text-primary tracking-tight">{t('Quản Lý Sản Phẩm', 'Product Management')}</h1>
          <p className="text-xs text-secondary font-light">{t('Thêm, sửa đổi hoặc lưu trữ các sản phẩm quần áo trong Katalin-Clothes.', 'Add, edit, or archive garment stock levels within Katalin-Clothes database.')}</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bg-primary hover:bg-primary-light text-white text-[10px] tracking-widest uppercase font-semibold py-2.5 px-4 rounded shadow transition flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> {t('Thêm Sản Phẩm Mới', 'Add New Product')}
        </button>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-card border border-outline-custom p-4 rounded shadow-sm">
        <div className="relative flex-grow max-w-md">
          <input
            type="text"
            placeholder={t('Tìm kiếm sản phẩm theo tên hoặc SKU...', 'Search by product name or SKU...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface text-xs pl-9 pr-4 py-2 border border-primary/10 rounded focus:outline-none focus:border-primary text-primary"
          />
          <Search className="w-4 h-4 text-secondary/60 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-secondary tracking-widest uppercase text-[9px] font-bold">{t('Danh mục', 'Category')}</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-card border border-primary/15 rounded py-1.5 px-3 text-xs text-primary focus:outline-none"
          >
            <option value="">{t('Tất cả danh mục', 'All Categories')}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{language === 'vi' ? c.name_vi : c.name_en}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-card border border-outline-custom rounded shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-custom text-[9px] uppercase tracking-widest font-bold text-secondary bg-surface">
                <th className="p-4 pl-6">{t('Sản phẩm', 'Garment')}</th>
                <th className="p-4">SKU</th>
                <th className="p-4">{t('Danh mục', 'Category')}</th>
                <th className="p-4 text-right">{t('Giá bán', 'Price')}</th>
                <th className="p-4 text-center">{t('Tồn kho', 'Stock')}</th>
                <th className="p-4 text-center">{t('Nhãn', 'Flags')}</th>
                <th className="p-4 text-center">{t('Trạng thái', 'Status')}</th>
                <th className="p-4 text-center">{t('Hành động', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-custom text-xs">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(p => {
                  const cat = categories.find(c => c.id === p.category_id);
                  const isLowStock = p.stock_quantity <= 10;

                  return (
                    <tr key={p.id} className="hover:bg-surface/40">
                      <td className="p-4 pl-6 flex items-center gap-4">
                        <div className="w-10 aspect-[3/4] bg-surface rounded overflow-hidden border border-outline-custom shrink-0">
                          {p.images[0]?.url ? (
                            <img src={p.images[0].url} alt={language === 'vi' ? p.name_vi : p.name_en} className="w-full h-full object-cover object-center" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-secondary/40 bg-surface">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-primary">{language === 'vi' ? p.name_vi : p.name_en}</p>
                          <p className="text-[10px] text-secondary italic">{language === 'vi' ? p.name_en : p.name_vi}</p>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-secondary">{p.sku}</td>
                      <td className="p-4 text-primary font-medium">{cat ? (language === 'vi' ? cat.name_vi : cat.name_en) : 'Tops'}</td>
                      <td className="p-4 text-right font-mono font-semibold text-primary">{formatPriceVND(p.price)}</td>
                      <td className="p-4 text-center">
                        <span className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] ${isLowStock ? 'bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse' : 'text-primary'}`}>
                          {p.stock_quantity}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-[9px] uppercase tracking-widest font-semibold">
                          {p.is_featured && <span className="bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded border border-amber-500/20">{t('Nổi bật', 'Featured')}</span>}
                          {p.is_new_arrival && <span className="bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded border border-blue-500/20">{t('Mới', 'New')}</span>}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`text-[10px] font-semibold ${p.is_active ? 'text-emerald-600' : 'text-red-500'}`}>
                          {p.is_active ? t('Kích hoạt', 'Active') : t('Lưu trữ', 'Archived')}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1 hover:text-accent transition text-secondary cursor-pointer"
                            title={t('Sửa sản phẩm', 'Edit Product')}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1 hover:text-red-500 transition text-secondary cursor-pointer"
                            title={t('Xóa sản phẩm', 'Delete Product')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-20 text-center text-secondary text-xs">
                    {t('Không tìm thấy sản phẩm nào.', 'No products found in catalog database.')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn">
          {/* Overlay */}
          <div className="fixed inset-0 bg-primary/45 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

          {/* Modal Content */}
          <div className="relative bg-card w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl p-8 z-10 border border-outline-custom flex flex-col text-left">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-outline-custom pb-4 mb-6">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-accent font-semibold">{t('Thông Tin Bản Ghi', 'Database Record')}</span>
                <h3 className="text-lg font-serif font-bold text-primary">
                  {editingProduct ? `${t('Chỉnh sửa', 'Modify')}: ${language === 'vi' ? editingProduct.name_vi : editingProduct.name_en}` : t('Tạo Bản Ghi Sản Phẩm Mới', 'Create New Product Record')}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-surface rounded text-secondary hover:text-primary transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProduct} className="space-y-8 flex-grow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Column 1: Core details */}
                <div className="space-y-4">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-secondary block border-b border-outline-custom pb-1">{t('Thông tin cơ bản', 'Primary details')}</span>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] uppercase tracking-widest font-semibold text-secondary">{t('Mã SKU', 'SKU Code')}</label>
                      <input
                        type="text"
                        name="sku"
                        placeholder="TS-LN-01"
                        value={formFields.sku}
                        onChange={handleInputChange}
                        className="w-full text-xs px-3 py-2 bg-surface border border-primary/10 rounded focus:outline-none focus:border-primary text-primary"
                      />
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] uppercase tracking-widest font-semibold text-secondary">{t('Danh mục', 'Category')}</label>
                      <select
                        name="category_id"
                        value={formFields.category_id}
                        onChange={handleInputChange}
                        className="w-full text-xs px-3 py-2 bg-surface border border-primary/10 rounded focus:outline-none focus:border-primary text-primary"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{language === 'vi' ? c.name_vi : c.name_en}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-[10px] uppercase tracking-widest font-semibold text-secondary">{t('Tên sản phẩm (Tiếng Anh)', 'Product Name (English)')}</label>
                    <input
                      type="text"
                      required
                      name="name_en"
                      value={formFields.name_en}
                      onChange={handleInputChange}
                      className="w-full text-xs px-3 py-2 bg-surface border border-primary/10 rounded focus:outline-none focus:border-primary text-primary"
                    />
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-[10px] uppercase tracking-widest font-semibold text-secondary">{t('Tên sản phẩm (Tiếng Việt)', 'Product Name (Vietnamese)')}</label>
                    <input
                      type="text"
                      required
                      name="name_vi"
                      value={formFields.name_vi}
                      onChange={handleInputChange}
                      className="w-full text-xs px-3 py-2 bg-surface border border-primary/10 rounded focus:outline-none focus:border-primary text-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] uppercase tracking-widest font-semibold text-secondary">{t('Giá bán (VND)', 'Base Price (VND)')}</label>
                      <input
                        type="number"
                        required
                        name="price"
                        value={formFields.price}
                        onChange={handleInputChange}
                        className="w-full text-xs px-3 py-2 bg-surface border border-primary/10 rounded focus:outline-none focus:border-primary text-primary"
                      />
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] uppercase tracking-widest font-semibold text-secondary">{t('Giá so sánh (VND)', 'Compare at Price (VND)')}</label>
                      <input
                        type="number"
                        name="compare_at_price"
                        value={formFields.compare_at_price}
                        onChange={handleInputChange}
                        className="w-full text-xs px-3 py-2 bg-surface border border-primary/10 rounded focus:outline-none focus:border-primary text-primary"
                      />
                    </div>
                  </div>

                  {variantsList.length === 0 && (
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] uppercase tracking-widest font-semibold text-secondary">{t('Tổng tồn kho', 'Overall Stock Quantity')}</label>
                      <input
                        type="number"
                        required
                        name="stock_quantity"
                        value={formFields.stock_quantity}
                        onChange={handleInputChange}
                        className="w-full text-xs px-3 py-2 bg-surface border border-primary/10 rounded focus:outline-none focus:border-primary text-primary"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] uppercase tracking-widest font-semibold text-secondary">{t('Chất liệu (Tiếng Anh)', 'Composition (English)')}</label>
                      <input
                        type="text"
                        name="materials_en"
                        placeholder="100% Linen"
                        value={formFields.materials_en}
                        onChange={handleInputChange}
                        className="w-full text-xs px-3 py-2 bg-surface border border-primary/10 rounded focus:outline-none focus:border-primary text-primary"
                      />
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] uppercase tracking-widest font-semibold text-secondary">{t('Chất liệu (Tiếng Việt)', 'Composition (Vietnamese)')}</label>
                      <input
                        type="text"
                        name="materials_vi"
                        placeholder="100% Vải Lanh"
                        value={formFields.materials_vi}
                        onChange={handleInputChange}
                        className="w-full text-xs px-3 py-2 bg-surface border border-primary/10 rounded focus:outline-none focus:border-primary text-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-[10px] uppercase tracking-widest font-semibold text-secondary">{t('Từ khóa (Cách nhau bằng dấu phẩy)', 'Tags (Comma separated)')}</label>
                    <input
                      type="text"
                      name="tags"
                      value={formFields.tags}
                      onChange={handleInputChange}
                      className="w-full text-xs px-3 py-2 bg-surface border border-primary/10 rounded focus:outline-none focus:border-primary text-primary"
                    />
                  </div>

                  <div className="flex gap-6 pt-2 text-xs">
                    <label className="flex items-center gap-2 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        name="is_new_arrival"
                        checked={formFields.is_new_arrival}
                        onChange={handleInputChange}
                        className="accent-primary"
                      />
                      <span>{t('Hàng mới về', 'New Arrival')}</span>
                    </label>
                    <label className="flex items-center gap-2 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        name="is_featured"
                        checked={formFields.is_featured}
                        onChange={handleInputChange}
                        className="accent-primary"
                      />
                      <span>{t('Nổi bật', 'Featured Campaign')}</span>
                    </label>
                    <label className="flex items-center gap-2 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={formFields.is_active}
                        onChange={handleInputChange}
                        className="accent-primary"
                      />
                      <span>{t('Kích hoạt công khai', 'Active (Public)')}</span>
                    </label>
                  </div>
                </div>

                {/* Column 2: Variants & descriptions */}
                <div className="space-y-6">
                  {/* Descriptions */}
                  <div className="space-y-3">
                    <span className="text-[9px] uppercase tracking-widest font-bold text-secondary block border-b border-outline-custom pb-1">{t('Mô tả sản phẩm', 'Editorial stories')}</span>
                    
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] uppercase tracking-widest font-semibold text-secondary">{t('Mô tả (Tiếng Anh)', 'Story (English)')}</label>
                      <textarea
                        name="description_en"
                        value={formFields.description_en}
                        onChange={handleInputChange}
                        className="w-full text-xs px-3 py-2 bg-surface border border-primary/10 rounded focus:outline-none focus:border-primary text-primary h-20"
                      />
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] uppercase tracking-widest font-semibold text-secondary">{t('Mô tả (Tiếng Việt)', 'Story (Vietnamese)')}</label>
                      <textarea
                        name="description_vi"
                        value={formFields.description_vi}
                        onChange={handleInputChange}
                        className="w-full text-xs px-3 py-2 bg-surface border border-primary/10 rounded focus:outline-none focus:border-primary text-primary h-20"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1 text-left">
                        <label className="text-[10px] uppercase tracking-widest font-semibold text-secondary">{t('Bảo quản (Tiếng Anh)', 'Care Instructions (English)')}</label>
                        <input
                          type="text"
                          name="care_instructions_en"
                          value={formFields.care_instructions_en}
                          onChange={handleInputChange}
                          className="w-full text-xs px-3 py-2 bg-surface border border-primary/10 rounded focus:outline-none focus:border-primary text-primary"
                        />
                      </div>
                      <div className="space-y-1 text-left">
                        <label className="text-[10px] uppercase tracking-widest font-semibold text-secondary">{t('Bảo quản (Tiếng Việt)', 'Care Instructions (Vietnamese)')}</label>
                        <input
                          type="text"
                          name="care_instructions_vi"
                          value={formFields.care_instructions_vi}
                          onChange={handleInputChange}
                          className="w-full text-xs px-3 py-2 bg-surface border border-primary/10 rounded focus:outline-none focus:border-primary text-primary"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sizing & Color variants array */}
                  <div className="space-y-3">
                    <span className="text-[9px] uppercase tracking-widest font-bold text-secondary block border-b border-outline-custom pb-1">{t('Phân loại sản phẩm', 'Garment Variants')}</span>
                    
                    {/* Add Variant Formlet */}
                    <div className="bg-card border border-outline-custom p-3 rounded grid grid-cols-2 sm:grid-cols-4 gap-2 items-end">
                      <div className="space-y-1 text-left">
                        <label className="text-[9px] uppercase tracking-widest font-semibold text-secondary">{t('Kích cỡ', 'Size')}</label>
                        <select
                          value={newVarSize}
                          onChange={(e) => setNewVarSize(e.target.value)}
                          className="w-full bg-surface border border-primary/10 rounded py-1 px-1.5 text-xs text-primary"
                        >
                          {['S', 'M', 'L', 'XL', '36', '37', '38'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="space-y-1 text-left">
                        <label className="text-[9px] uppercase tracking-widest font-semibold text-secondary">{t('Tên màu', 'Color Name')}</label>
                        <input
                          type="text"
                          value={newVarColorName}
                          onChange={(e) => setNewVarColorName(e.target.value)}
                          className="w-full bg-surface border border-primary/10 rounded py-1 px-1.5 text-xs text-primary"
                          placeholder="E.g. Sage"
                        />
                      </div>

                      <div className="space-y-1 text-left">
                        <label className="text-[9px] uppercase tracking-widest font-semibold text-secondary">{t('Màu Hex', 'Color Hex')}</label>
                        <input
                          type="color"
                          value={newVarColorHex}
                          onChange={(e) => setNewVarColorHex(e.target.value)}
                          className="w-full bg-surface border border-primary/10 rounded h-7 p-0.5 cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1 text-left">
                        <label className="text-[9px] uppercase tracking-widest font-semibold text-secondary">{t('Tồn kho', 'Stock')}</label>
                        <input
                          type="number"
                          value={newVarStock}
                          onChange={(e) => setNewVarStock(Number(e.target.value))}
                          className="w-full bg-surface border border-primary/10 rounded py-1 px-1.5 text-xs text-primary"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleAddVariant}
                        className="col-span-2 sm:col-span-4 mt-2 bg-primary text-white text-[9px] tracking-widest uppercase font-semibold py-2 px-3 rounded shadow transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> {t('Thêm Phân Loại', 'Add Variant')}
                      </button>
                    </div>

                    {/* Variant list rendering */}
                    {variantsList.length > 0 ? (
                      <div className="max-h-40 overflow-y-auto space-y-1.5 border border-outline-custom rounded p-2 bg-surface">
                        {variantsList.map((v) => (
                          <div key={v.id} className="flex justify-between items-center text-xs p-1.5 bg-card border border-outline-custom rounded">
                            <div className="flex items-center gap-2">
                              <span className="w-3.5 h-3.5 rounded-full border border-primary/10" style={{ backgroundColor: v.color_hex }} title={v.color_name_en} />
                              <span className="font-semibold">{v.size}</span>
                              <span className="text-secondary font-mono text-[10px]">{language === 'vi' ? (v.color_name_vi || v.color_name_en) : v.color_name_en}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-primary font-bold">{t('Tồn:', 'Qty:')} {v.stock_quantity}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveVariant(v.id)}
                                className="text-red-500 hover:text-red-700 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                        <p className="text-[9px] text-accent text-right italic font-semibold">{t('Tổng tồn kho phân loại:', 'Total variant stock:')} {variantsList.reduce((acc, curr) => acc + curr.stock_quantity, 0)}</p>
                      </div>
                    ) : (
                      <div className="text-center py-4 border border-dashed border-primary/10 rounded text-secondary text-xs leading-relaxed">
                        {t('⚠️ Không có phân loại sản phẩm. Hàng hóa này sẽ được xem là sản phẩm đơn SKU.', '⚠️ No variant configurations. The product will behave as a single SKU item.')}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex justify-end gap-3 border-t border-outline-custom pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 border border-primary/15 hover:bg-surface text-secondary text-[10px] font-semibold tracking-widest uppercase transition rounded cursor-pointer"
                >
                  {t('Hủy bỏ', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary hover:bg-primary-light text-white text-[10px] font-semibold tracking-widest uppercase transition rounded shadow cursor-pointer"
                >
                  {t('Lưu thay đổi', 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
