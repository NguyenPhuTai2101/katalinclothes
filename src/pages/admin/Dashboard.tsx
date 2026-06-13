import React, { useState, useEffect } from 'react';
import { db } from '../../db/dbClient';
import type { Order, Customer } from '../../db/mockDb';
import { formatPriceVND, formatDate } from '../../utils/formatters';
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  AlertTriangle, 
  ArrowUpRight, 
  TrendingUp,
  Package,
  Eye,
  FileSpreadsheet
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../../context/LanguageContext';

export const Dashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [lowStockCount, setLowStockCount] = useState<number>(0);
  const { t } = useLanguage();

  useEffect(() => {
    const loadDashboardData = async () => {
      const o = await db.getOrders();
      setOrders(o);
      const p = await db.getProducts();
      setLowStockCount(p.filter(prod => prod.stock_quantity <= 10).length);
      const c = await db.getCustomers();
      setCustomers(c);
    };
    loadDashboardData();
  }, []);

  // Compute metrics
  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled' && o.status !== 'refunded')
    .reduce((acc, current) => acc + current.total, 0);

  const totalOrders = orders.length;
  const totalCustomers = customers.filter(c => c.role === 'customer').length;

  // Chart data
  const revenueChartData = [
    { name: t('T1', 'Jan'), revenue: 12000000 },
    { name: t('T2', 'Feb'), revenue: 18500000 },
    { name: t('T3', 'Mar'), revenue: 15000000 },
    { name: t('T4', 'Apr'), revenue: 26400000 },
    { name: t('T5', 'May'), revenue: 31200000 },
    { name: t('T6', 'Jun'), revenue: totalRevenue }, // Current live data
  ];

  const translateShipStatus = (s: string) => {
    switch (s) {
      case 'pending': return t('Chờ duyệt', 'Pending');
      case 'confirmed': return t('Xác nhận', 'Confirmed');
      case 'processing': return t('Đang xử lý', 'Processing');
      case 'shipped': return t('Đang giao', 'Shipped');
      case 'delivered': return t('Đã giao', 'Delivered');
      case 'cancelled': return t('Đã hủy', 'Cancelled');
      case 'refunded': return t('Đã hoàn tiền', 'Refunded');
      default: return s.toUpperCase();
    }
  };

  const translatePayStatus = (p: string) => {
    switch (p) {
      case 'pending': return t('Chờ thanh toán', 'Pending');
      case 'paid': return t('Đã thanh toán', 'Paid');
      case 'failed': return t('Thất bại', 'Failed');
      case 'refunded': return t('Đã hoàn tiền', 'Refunded');
      default: return p.toUpperCase();
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Title & Actions */}
      <div className="flex justify-between items-center">
        <div className="text-left">
          <h1 className="text-2xl font-bold text-primary tracking-tight">{t('Bảng Tổng Quan', 'Overview Dashboard')}</h1>
          <p className="text-xs text-secondary font-light">{t('Số liệu phân tích cửa hàng Katalin-Clothes và chỉ số hiệu suất thời gian thực.', 'Real-time Katalin-Clothes shop analytics and key performance indices.')}</p>
        </div>

        <button className="bg-primary hover:bg-primary-light text-white text-[10px] tracking-widest uppercase font-semibold py-2.5 px-4 rounded shadow transition flex items-center gap-1.5 cursor-pointer">
          <FileSpreadsheet className="w-3.5 h-3.5" /> {t('Xuất Báo Cáo', 'Export Reports')}
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="bg-card border border-outline-custom rounded p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-2 text-left">
            <span className="text-[10px] uppercase tracking-widest font-bold text-secondary">{t('Tổng doanh thu', 'Total Revenue')}</span>
            <p className="text-xl font-semibold font-mono text-primary">{formatPriceVND(totalRevenue)}</p>
            <div className="flex items-center text-[10px] text-emerald-500 font-semibold gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +14.2% <span className="text-secondary/60 font-normal ml-1">{t('so với tháng trước', 'vs last month')}</span>
            </div>
          </div>
          <div className="w-12 h-12 bg-surface border border-outline-custom text-accent rounded flex items-center justify-center shadow-inner">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-card border border-outline-custom rounded p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-2 text-left">
            <span className="text-[10px] uppercase tracking-widest font-bold text-secondary">{t('Tổng đơn hàng', 'Total Orders')}</span>
            <p className="text-xl font-semibold font-mono text-primary">{totalOrders}</p>
            <div className="flex items-center text-[10px] text-emerald-500 font-semibold gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +8.6% <span className="text-secondary/60 font-normal ml-1">{t('so với tháng trước', 'vs last month')}</span>
            </div>
          </div>
          <div className="w-12 h-12 bg-surface border border-outline-custom text-accent rounded flex items-center justify-center shadow-inner">
            <ShoppingCart className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-card border border-outline-custom rounded p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-2 text-left">
            <span className="text-[10px] uppercase tracking-widest font-bold text-secondary">{t('Khách hàng hoạt động', 'Active Customers')}</span>
            <p className="text-xl font-semibold font-mono text-primary">{totalCustomers}</p>
            <div className="flex items-center text-[10px] text-emerald-500 font-semibold gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +22.4% <span className="text-secondary/60 font-normal ml-1">{t('so với tháng trước', 'vs last month')}</span>
            </div>
          </div>
          <div className="w-12 h-12 bg-surface border border-outline-custom text-accent rounded flex items-center justify-center shadow-inner">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-card border border-outline-custom rounded p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-2 text-left">
            <span className="text-[10px] uppercase tracking-widest font-bold text-secondary">{t('Cảnh báo sắp hết hàng', 'Low Stock Warnings')}</span>
            <p className="text-xl font-semibold font-mono text-primary">{lowStockCount}</p>
            <div className={`flex items-center text-[10px] font-semibold gap-0.5 ${lowStockCount > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
              <AlertTriangle className="w-3.5 h-3.5" />
              {lowStockCount > 0 ? t('Cần nhập thêm hàng', 'Replenishment needed') : t('Tất cả an toàn', 'All healthy')}
            </div>
          </div>
          <div className="w-12 h-12 bg-surface border border-outline-custom text-accent rounded flex items-center justify-center shadow-inner">
            <Package className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Warning banner */}
      {lowStockCount > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded p-4 flex items-center justify-between text-amber-600">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <div className="text-left">
              <p className="text-xs font-semibold text-amber-600">{t('Cảnh báo tồn kho', 'Inventory Alert')}</p>
              <p className="text-[10px] text-amber-600/90">{t(`Có ${lowStockCount} sản phẩm sắp hết hàng trong kho. Vui lòng kiểm tra để nhập thêm hàng.`, `There are ${lowStockCount} products running low in warehouse quantities. Review items to restock.`)}</p>
            </div>
          </div>
          <Link
            to="/admin/warehouse"
            className="text-[10px] uppercase font-bold border border-amber-500/30 rounded px-3 py-1 bg-card hover:bg-surface text-amber-600 transition"
          >
            {t('Kiểm Tra Kho Hàng', 'Review Warehouse')}
          </Link>
        </div>
      )}

      {/* Charts Section */}
      <div className="bg-card border border-outline-custom rounded p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="text-left">
            <span className="text-[9px] uppercase tracking-widest font-bold text-secondary">{t('Xu hướng tài chính', 'Financial Trend')}</span>
            <h3 className="text-sm font-semibold text-primary">{t('Doanh Thu Bán Hàng Theo Tháng', 'Monthly Sales Revenue')}</h3>
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--outline-custom)" />
              <XAxis dataKey="name" stroke="#888" fontSize={11} tickLine={false} />
              <YAxis stroke="#888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000000).toFixed(1)}M`} />
              <Tooltip formatter={(value: any) => formatPriceVND(value)} labelClassName="text-xs font-semibold text-primary" contentStyle={{ fontSize: 11, backgroundColor: 'var(--card)', borderColor: 'var(--outline-custom)' }} />
              <Line type="monotone" dataKey="revenue" stroke="var(--accent)" strokeWidth={2} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-card border border-outline-custom rounded shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-custom flex justify-between items-center bg-surface">
          <div className="text-left">
            <span className="text-[9px] uppercase tracking-widest font-bold text-secondary">{t('Nhật ký giao dịch', 'Transaction Logs')}</span>
            <h3 className="text-sm font-semibold text-primary">{t('Các Đơn Hàng Gần Đây', 'Recent Customer Orders')}</h3>
          </div>
          <Link to="/admin/orders" className="text-[10px] uppercase tracking-widest font-semibold hover:opacity-75 flex items-center gap-1 transition text-primary">
            {t('Xem tất cả', 'View All')} <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-custom text-[9px] uppercase tracking-widest font-bold text-secondary bg-surface/50">
                <th className="p-4 pl-6">{t('Mã đơn hàng', 'Order Number')}</th>
                <th className="p-4">{t('Khách hàng', 'Customer')}</th>
                <th className="p-4">{t('Ngày đặt', 'Date Placed')}</th>
                <th className="p-4">{t('Tổng số tiền', 'Total Price')}</th>
                <th className="p-4">{t('Trạng thái', 'Ship Status')}</th>
                <th className="p-4">{t('Thanh toán', 'Payment')}</th>
                <th className="p-4 text-center">{t('Chi tiết', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-custom text-xs">
              {orders.slice(0, 5).map(o => {
                // Status styles
                const shipStyles: Record<string, string> = {
                  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
                  confirmed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
                  processing: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
                  shipped: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
                  delivered: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
                  cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
                  refunded: 'bg-gray-500/10 text-gray-500 border-gray-500/20'
                };

                const payStyles: Record<string, string> = {
                  pending: 'text-amber-500',
                  paid: 'text-emerald-500',
                  failed: 'text-red-500',
                  refunded: 'text-gray-400'
                };

                return (
                  <tr key={o.id} className="hover:bg-surface/40">
                    <td className="p-4 pl-6 font-mono font-semibold text-primary">{o.order_number}</td>
                    <td className="p-4">
                      <p className="font-semibold text-primary">{o.shipping_first_name} {o.shipping_last_name}</p>
                      <p className="text-[10px] text-secondary">{o.shipping_email}</p>
                    </td>
                    <td className="p-4 text-secondary">{formatDate(o.created_at)}</td>
                    <td className="p-4 font-mono font-semibold text-primary">{formatPriceVND(o.total)}</td>
                    <td className="p-4">
                      <span className={`text-[9px] uppercase tracking-widest px-2 py-0.5 rounded border font-semibold ${shipStyles[o.status] || ''}`}>
                        {translateShipStatus(o.status)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] font-semibold flex items-center gap-1 ${payStyles[o.payment_status] || ''}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {translatePayStatus(o.payment_status)}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <Link
                        to="/admin/orders"
                        className="p-1 text-secondary hover:text-primary transition flex items-center justify-center cursor-pointer"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Chevron right icon definition
const ChevronRight: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);
