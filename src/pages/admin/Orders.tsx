import React, { useState, useEffect } from 'react';
import { db } from '../../db/dbClient';
import type { Order } from '../../db/mockDb';
import { formatPriceVND, formatDate } from '../../utils/formatters';
import { 
  Search, 
  Eye, 
  X, 
  MapPin, 
  Phone, 
  Mail
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const { t } = useLanguage();

  // Details Modal state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatedStatus, setUpdatedStatus] = useState<Order['status']>('pending');
  const [updatedPayment, setUpdatedPayment] = useState<Order['payment_status']>('pending');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const o = await db.getOrders();
    setOrders(o);
  };

  const handleOpenDetails = (order: Order) => {
    setSelectedOrder(order);
    setUpdatedStatus(order.status);
    setUpdatedPayment(order.payment_status);
  };

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    await db.updateOrderStatus(selectedOrder.id, updatedStatus, updatedPayment);
    await loadOrders();
    setSelectedOrder(null);
  };

  // Filter orders
  const filteredOrders = orders.filter(o => {
    if (statusFilter && o.status !== statusFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const name = `${o.shipping_first_name} ${o.shipping_last_name}`.toLowerCase();
      if (!o.order_number.toLowerCase().includes(query) && !name.includes(query) && !o.shipping_email.toLowerCase().includes(query)) {
        return false;
      }
    }
    return true;
  });

  const shipStatuses: Order['status'][] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
  const payStatuses: Order['payment_status'][] = ['pending', 'paid', 'failed', 'refunded'];

  const shipStyles: Record<string, string> = {
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-255',
    confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
    processing: 'bg-purple-50 text-purple-700 border-purple-200',
    shipped: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
    refunded: 'bg-gray-100 text-gray-700 border-gray-300'
  };

  const payStyles: Record<string, string> = {
    pending: 'text-amber-500',
    paid: 'text-emerald-600',
    failed: 'text-red-500',
    refunded: 'text-gray-400'
  };

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
      {/* Header */}
      <div className="text-left">
        <h1 className="text-2xl font-bold text-primary tracking-tight">{t('Quản Lý Đơn Hàng', 'Order Management')}</h1>
        <p className="text-xs text-secondary font-light">{t('Thực hiện đơn đặt hàng, giám sát thanh toán và cập nhật hành trình giao hàng.', 'Fulfill customer packages, monitor payments, and update delivery tracking status.')}</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-card border border-outline-custom p-4 rounded shadow-sm">
        <div className="relative flex-grow max-w-md">
          <input
            type="text"
            placeholder={t('Tìm kiếm mã đơn hàng, tên khách hàng, email...', 'Search by order number, customer name, email...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface text-xs pl-9 pr-4 py-2 border border-primary/10 rounded focus:outline-none focus:border-primary text-primary"
          />
          <Search className="w-4 h-4 text-secondary/60 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-secondary tracking-widest uppercase text-[9px] font-bold">{t('Giao hàng', 'Ship Status')}</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-card border border-primary/15 rounded py-1.5 px-3 text-xs text-primary focus:outline-none"
          >
            <option value="">{t('Tất cả trạng thái', 'All Statuses')}</option>
            {shipStatuses.map((s) => (
              <option key={s} value={s}>{translateShipStatus(s)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-card border border-outline-custom rounded shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-custom text-[9px] uppercase tracking-widest font-bold text-secondary bg-surface">
                <th className="p-4 pl-6">{t('Mã đơn hàng', 'Order Number')}</th>
                <th className="p-4">{t('Khách hàng', 'Customer')}</th>
                <th className="p-4">{t('Ngày đặt hàng', 'Date Placed')}</th>
                <th className="p-4 text-right">{t('Tạm tính', 'Subtotal')}</th>
                <th className="p-4 text-right">{t('Tổng tiền', 'Grand Total')}</th>
                <th className="p-4 text-center">{t('Giao hàng', 'Ship Status')}</th>
                <th className="p-4 text-center">{t('Thanh toán', 'Payment')}</th>
                <th className="p-4 text-center">{t('Hành động', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-custom text-xs">
              {filteredOrders.length > 0 ? (
                filteredOrders.map(o => (
                  <tr key={o.id} className="hover:bg-surface/40 animate-fadeIn">
                    <td className="p-4 pl-6 font-mono font-semibold text-primary">{o.order_number}</td>
                    <td className="p-4">
                      <p className="font-semibold text-primary">{o.shipping_first_name} {o.shipping_last_name}</p>
                      <p className="text-[10px] text-secondary">{o.shipping_email}</p>
                    </td>
                    <td className="p-4 text-secondary">{formatDate(o.created_at)}</td>
                    <td className="p-4 text-right font-mono text-secondary">{formatPriceVND(o.subtotal)}</td>
                    <td className="p-4 text-right font-mono font-bold text-primary">{formatPriceVND(o.total)}</td>
                    <td className="p-4 text-center">
                      <span className={`text-[9px] uppercase tracking-widest px-2 py-0.5 rounded border font-semibold ${shipStyles[o.status] || ''}`}>
                        {translateShipStatus(o.status)}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`text-[10px] font-semibold flex items-center justify-center gap-1 ${payStyles[o.payment_status] || ''}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {translatePayStatus(o.payment_status)}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleOpenDetails(o)}
                        className="p-1.5 hover:bg-surface hover:text-primary rounded text-secondary transition mx-auto flex items-center justify-center cursor-pointer"
                        title={t('Xem chi tiết', 'View details')}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-20 text-center text-secondary text-xs">
                    {t('Không có đơn hàng nào phù hợp.', 'No matching orders in database.')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details & Status Edit Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn">
          {/* Overlay */}
          <div className="fixed inset-0 bg-primary/45 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />

          {/* Modal Content */}
          <div className="relative bg-card w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl p-8 z-10 border border-outline-custom text-left flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-outline-custom pb-4 mb-6">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-accent font-semibold font-mono">{t('Hóa đơn', 'Invoice')} #{selectedOrder.order_number}</span>
                <h3 className="text-lg font-serif font-bold text-primary">{t('Chi Tiết Đơn Hàng', 'Order Particulars')}</h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1.5 hover:bg-surface rounded text-secondary hover:text-primary transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleSaveStatus} className="space-y-6 flex-grow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Column 1: Delivery Details & Items */}
                <div className="space-y-4">
                  {/* Recipient Card */}
                  <div className="space-y-2 bg-surface p-4 rounded border border-outline-custom text-xs text-secondary leading-relaxed">
                    <span className="text-[9px] uppercase tracking-widest font-bold text-primary block border-b border-outline-custom pb-1 mb-2">{t('Địa chỉ giao hàng', 'Delivery Address')}</span>
                    <p className="font-semibold text-primary text-sm flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-accent" /> {selectedOrder.shipping_first_name} {selectedOrder.shipping_last_name}
                    </p>
                    <p className="pl-5">{selectedOrder.shipping_address}, {selectedOrder.shipping_city}</p>
                    <p className="pl-5 flex items-center gap-1.5 mt-1">
                      <Phone className="w-3 h-3" /> {selectedOrder.shipping_phone}
                    </p>
                    <p className="pl-5 flex items-center gap-1.5">
                      <Mail className="w-3 h-3" /> {selectedOrder.shipping_email}
                    </p>
                    {selectedOrder.notes && (
                      <p className="pl-5 italic text-secondary/80 mt-2 bg-card/40 p-1.5 rounded border border-outline-custom">
                        {t('Ghi chú:', 'Note:')} "{selectedOrder.notes}"
                      </p>
                    )}
                  </div>

                  {/* Items purchased */}
                  <div className="space-y-2">
                    <span className="text-[9px] uppercase tracking-widest font-bold text-secondary block border-b border-outline-custom pb-1">{t('Sản phẩm đã mua', 'Garments Purchased')}</span>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {selectedOrder.items.map(it => (
                        <div key={it.id} className="flex gap-4 p-2 border border-outline-custom rounded bg-surface/50 items-center text-xs">
                          <div className="w-10 aspect-[3/4] bg-surface rounded overflow-hidden border border-outline-custom shrink-0">
                            <img src={it.image_url} alt={it.product_name} className="w-full h-full object-cover object-center" />
                          </div>
                          <div className="flex-grow text-left">
                            <p className="font-semibold text-primary">{it.product_name}</p>
                            {it.variant_info && <p className="text-[10px] text-secondary font-mono">{it.variant_info}</p>}
                          </div>
                          <div className="text-right text-[11px]">
                            <p className="font-semibold text-primary">{formatPriceVND(it.unit_price)} x{it.quantity}</p>
                            <p className="text-accent font-bold mt-0.5">{formatPriceVND(it.total_price)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Column 2: Status Config & Financials */}
                <div className="space-y-6">
                  {/* Financials details */}
                  <div className="bg-surface p-4 rounded border border-outline-custom space-y-2.5 text-xs text-left">
                    <span className="text-[9px] uppercase tracking-widest font-bold text-primary block border-b border-outline-custom pb-1 mb-2">{t('Tổng giá trị hóa đơn', 'Invoice Totals')}</span>
                    <div className="flex justify-between text-secondary">
                      <span>{t('Tạm tính', 'Subtotal')}</span>
                      <span className="font-mono">{formatPriceVND(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-secondary">
                      <span>{t('Phí giao hàng', 'Shipping Fee')}</span>
                      <span className="font-mono">{formatPriceVND(selectedOrder.shipping_fee)}</span>
                    </div>
                    <hr className="border-outline-custom pt-1" />
                    <div className="flex justify-between text-sm font-bold text-primary">
                      <span>{t('Tổng tiền thanh toán', 'Total Invoiced')}</span>
                      <span className="font-mono text-accent text-base">{formatPriceVND(selectedOrder.total)}</span>
                    </div>
                  </div>

                  {/* Status update config */}
                  <div className="space-y-4 text-left">
                    <span className="text-[9px] uppercase tracking-widest font-bold text-secondary block border-b border-outline-custom pb-1">{t('Cập nhật trạng thái', 'Modify Order State')}</span>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest font-semibold text-secondary">{t('Trạng thái giao hàng', 'Shipment Delivery Status')}</label>
                      <select
                        value={updatedStatus}
                        onChange={(e) => setUpdatedStatus(e.target.value as Order['status'])}
                        className="w-full text-xs px-3 py-2 bg-surface border border-primary/10 rounded focus:outline-none focus:border-primary text-primary"
                      >
                        {shipStatuses.map(s => (
                          <option key={s} value={s}>{translateShipStatus(s)}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest font-semibold text-secondary">{t('Trạng thái thanh toán', 'Payment Settlement Status')}</label>
                      <select
                        value={updatedPayment}
                        onChange={(e) => setUpdatedPayment(e.target.value as Order['payment_status'])}
                        className="w-full text-xs px-3 py-2 bg-surface border border-primary/10 rounded focus:outline-none focus:border-primary text-primary"
                      >
                        {payStatuses.map(p => (
                          <option key={p} value={p}>{translatePayStatus(p)}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex justify-end gap-3 border-t border-outline-custom pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-6 py-2.5 border border-primary/15 hover:bg-surface text-secondary text-[10px] font-semibold tracking-widest uppercase transition rounded cursor-pointer"
                >
                  {t('Hủy bỏ', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary hover:bg-primary-light text-white text-[10px] font-semibold tracking-widest uppercase transition rounded shadow cursor-pointer"
                >
                  {t('Lưu trạng thái', 'Save Status Updates')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
