import React, { useState, useEffect } from 'react';
import { db } from '../../db/dbClient';
import { Search, AlertTriangle, ArrowUp, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface FlatVariant {
  productId: string;
  productName: string;
  variantId?: string;
  sku: string;
  colorName: string;
  colorHex: string;
  size: string;
  stock: number;
}

export const Warehouse: React.FC = () => {
  const [flatVariants, setFlatVariants] = useState<FlatVariant[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showLowStockOnly, setShowLowStockOnly] = useState<boolean>(false);
  const [replenishSuccess, setReplenishSuccess] = useState<string | null>(null);
  const { language, t } = useLanguage();

  useEffect(() => {
    loadWarehouseData();
  }, [language]);

  const loadWarehouseData = async () => {
    const allProds = await db.getProducts();

    // Flatten variants for high-density listing
    const flat: FlatVariant[] = [];
    allProds.forEach(p => {
      if (p.variants && p.variants.length > 0) {
        p.variants.forEach(v => {
          flat.push({
            productId: p.id,
            productName: language === 'vi' ? p.name_vi : p.name_en,
            variantId: v.id,
            sku: v.sku || p.sku,
            colorName: language === 'vi' ? (v.color_name_vi || v.color_name_en || 'Mặc định') : (v.color_name_en || 'Default'),
            colorHex: v.color_hex || '#ccc',
            size: v.size,
            stock: v.stock_quantity
          });
        });
      } else {
        flat.push({
          productId: p.id,
          productName: language === 'vi' ? p.name_vi : p.name_en,
          sku: p.sku,
          colorName: language === 'vi' ? 'Mặc định' : 'Default',
          colorHex: '#ccc',
          size: 'OS (One Size)',
          stock: p.stock_quantity
        });
      }
    });
    setFlatVariants(flat);
  };

  const handleRestock = async (flatVar: FlatVariant, amount: number) => {
    // Fetch parent product
    const prod = await db.getProductById(flatVar.productId);
    if (!prod) return;

    if (flatVar.variantId) {
      // Find variant index
      const varIdx = prod.variants.findIndex(v => v.id === flatVar.variantId);
      if (varIdx >= 0) {
        prod.variants[varIdx].stock_quantity += amount;
      }
    }
    // Update aggregate product stock
    prod.stock_quantity = prod.variants.length > 0 
      ? prod.variants.reduce((acc, curr) => acc + curr.stock_quantity, 0)
      : prod.stock_quantity + amount;

    await db.saveProduct(prod);
    
    // Trigger notification
    setReplenishSuccess(t(
      `Đã bổ sung thành công ${flatVar.productName} (${flatVar.size} / ${flatVar.colorName}) thêm +${amount} sản phẩm!`,
      `Successfully replenished ${flatVar.productName} (${flatVar.size} / ${flatVar.colorName}) by +${amount} units!`
    ));
    setTimeout(() => setReplenishSuccess(null), 5000);

    // Reload warehouse logs
    await loadWarehouseData();
  };

  // Filter
  const filteredVariants = flatVariants.filter(v => {
    if (showLowStockOnly && v.stock > 10) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!v.productName.toLowerCase().includes(q) && !v.sku.toLowerCase().includes(q) && !v.colorName.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="text-left">
        <h1 className="text-2xl font-bold text-primary tracking-tight">{t('Quản Lý Kho Hàng', 'Warehouse Console')}</h1>
        <p className="text-xs text-secondary font-light">{t('Chỉ số tồn kho, cập nhật SKU riêng biệt và bổ sung lượng hàng tồn nhanh chóng.', 'Inventory health metrics, individual SKU stock logging, and quick replenish actions.')}</p>
      </div>

      {/* Success Notification banner */}
      {replenishSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded p-4 flex items-center gap-3 text-xs font-medium animate-fadeIn">
          <CheckCircle className="w-5 h-5 text-emerald-500" />
          <span>{replenishSuccess}</span>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-card border border-outline-custom p-4 rounded shadow-sm">
        <div className="relative flex-grow max-w-md">
          <input
            type="text"
            placeholder={t('Tìm kiếm SKU, sản phẩm, màu sắc...', 'Search SKUs, garments, colors...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface text-xs pl-9 pr-4 py-2 border border-primary/10 rounded focus:outline-none focus:border-primary text-primary"
          />
          <Search className="w-4 h-4 text-secondary/60 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-6 text-xs">
          <label className="flex items-center gap-2 font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={showLowStockOnly}
              onChange={(e) => setShowLowStockOnly(e.target.checked)}
              className="accent-primary"
            />
            <span className="text-amber-600 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> {t('Chỉ hiển thị sản phẩm sắp hết hàng (≤ 10)', 'Show Low Stock Only (≤ 10)')}
            </span>
          </label>
        </div>
      </div>

      {/* Warehouse Listing */}
      <div className="bg-card border border-outline-custom rounded shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-custom text-[9px] uppercase tracking-widest font-bold text-secondary bg-surface">
                <th className="p-4 pl-6">{t('Mã SKU', 'SKU Code')}</th>
                <th className="p-4">{t('Sản phẩm', 'Garment Item')}</th>
                <th className="p-4 text-center">{t('Cỡ', 'Size')}</th>
                <th className="p-4">{t('Màu sắc', 'Color Shade')}</th>
                <th className="p-4 text-center">{t('Tồn kho', 'Units Level')}</th>
                <th className="p-4 text-center">{t('Trạng thái', 'Status')}</th>
                <th className="p-4 text-center">{t('Bổ sung tồn kho', 'Fulfillment Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-custom text-xs">
              {filteredVariants.length > 0 ? (
                filteredVariants.map((v, idx) => {
                  const isLow = v.stock <= 10;
                  const isOut = v.stock === 0;

                  return (
                    <tr key={`${v.sku}-${idx}`} className={`hover:bg-surface/40 ${isLow ? 'bg-amber-500/5' : ''}`}>
                      <td className="p-4 pl-6 font-mono font-semibold text-secondary">{v.sku}</td>
                      <td className="p-4 font-semibold text-primary">{v.productName}</td>
                      <td className="p-4 text-center font-mono">{v.size}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-[11px] text-secondary">
                          <span className="w-3 h-3 rounded-full border border-primary/10" style={{ backgroundColor: v.colorHex }} />
                          <span>{v.colorName}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center font-mono font-bold text-primary">{v.stock}</td>
                      <td className="p-4 text-center">
                        {isOut ? (
                          <span className="text-[9px] uppercase tracking-widest bg-red-500/10 text-red-500 font-bold px-2 py-0.5 rounded border border-red-500/20 animate-pulse">{t('Hết hàng', 'Out of Stock')}</span>
                        ) : isLow ? (
                          <span className="text-[9px] uppercase tracking-widest bg-amber-500/10 text-amber-500 font-bold px-2 py-0.5 rounded border border-amber-500/20">{t('Sắp hết hàng', 'Low Stock')}</span>
                        ) : (
                          <span className="text-[9px] uppercase tracking-widest bg-emerald-500/10 text-emerald-500 font-bold px-2 py-0.5 rounded border border-emerald-500/20">{t('An toàn', 'Healthy')}</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleRestock(v, 10)}
                            className="bg-card border border-primary/20 hover:border-primary text-primary text-[9px] font-bold tracking-widest uppercase py-1 px-2.5 rounded transition flex items-center gap-0.5 cursor-pointer"
                          >
                            <ArrowUp className="w-3 h-3" /> +10
                          </button>
                          <button
                            onClick={() => handleRestock(v, 50)}
                            className="bg-primary hover:bg-primary-light text-white text-[9px] font-bold tracking-widest uppercase py-1 px-2.5 rounded shadow transition flex items-center gap-0.5 cursor-pointer"
                          >
                            <ArrowUp className="w-3 h-3" /> +50
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-20 text-center text-secondary text-xs">
                    {t('Không tìm thấy SKU kho hàng nào.', 'No matching warehouse SKUs.')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
