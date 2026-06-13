import React, { useState, useEffect } from 'react';
import { db } from '../../db/dbClient';
import type { Customer } from '../../db/mockDb';
import { formatPriceVND, formatDate } from '../../utils/formatters';
import { Search, Mail, Phone, Calendar, UserCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { t } = useLanguage();

  useEffect(() => {
    const loadCustomers = async () => {
      const c = await db.getCustomers();
      setCustomers(c);
    };
    loadCustomers();
  }, []);

  const filteredCustomers = customers.filter(c => {
    const query = searchQuery.toLowerCase();
    return (
      c.full_name.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      (c.phone && c.phone.includes(query))
    );
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="text-left">
        <h1 className="text-2xl font-bold text-primary tracking-tight">{t('Danh Sách Khách Hàng', 'Customer Registry')}</h1>
        <p className="text-xs text-secondary font-light">{t('Giám sát khách hàng, tổng hợp mức chi tiêu và quản lý thông tin tài khoản.', 'Monitor customer engagement, aggregate spending thresholds, and manage profiles.')}</p>
      </div>

      {/* Controls */}
      <div className="flex gap-4 bg-card border border-outline-custom p-4 rounded shadow-sm">
        <div className="relative flex-grow max-w-md">
          <input
            type="text"
            placeholder={t('Tìm kiếm theo tên khách hàng, email, số điện thoại...', 'Search by customer name, email, phone...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface text-xs pl-9 pr-4 py-2 border border-primary/10 rounded focus:outline-none focus:border-primary text-primary"
          />
          <Search className="w-4 h-4 text-secondary/60 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-card border border-outline-custom rounded shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-custom text-[9px] uppercase tracking-widest font-bold text-secondary bg-surface">
                <th className="p-4 pl-6">{t('Khách hàng', 'Client Name')}</th>
                <th className="p-4">{t('Liên hệ', 'Contact Info')}</th>
                <th className="p-4">{t('Ngày tham gia', 'Joined Date')}</th>
                <th className="p-4 text-center">{t('Số đơn hàng', 'Orders Count')}</th>
                <th className="p-4 text-right">{t('Tổng chi tiêu', 'Cumulative Spending')}</th>
                <th className="p-4 text-center">{t('Trạng thái', 'Status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-custom text-xs">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map(c => (
                  <tr key={c.id} className="hover:bg-surface/40">
                    <td className="p-4 pl-6 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/5 text-primary border border-primary/5 flex items-center justify-center font-bold font-mono">
                        {c.full_name.charAt(0)}
                      </div>
                      <div className="text-left font-semibold text-primary">
                        {c.full_name}
                        {c.role === 'admin' && (
                          <span className="ml-2 bg-accent/10 text-accent text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded">
                            {t('Quản trị', 'Staff')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-secondary space-y-0.5 text-left">
                      <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 opacity-60" /> {c.email}</p>
                      {c.phone && <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 opacity-60" /> {c.phone}</p>}
                    </td>
                    <td className="p-4 text-secondary flex items-center gap-1.5 mt-2.5">
                      <Calendar className="w-3.5 h-3.5 opacity-60" />
                      {formatDate(c.created_at)}
                    </td>
                    <td className="p-4 text-center font-mono font-semibold text-primary">{c.order_count}</td>
                    <td className="p-4 text-right font-mono font-bold text-accent">{formatPriceVND(c.total_spent)}</td>
                    <td className="p-4 text-center">
                      <span className="text-emerald-500 font-semibold flex items-center justify-center gap-1 text-[10px]">
                        <UserCheck className="w-3.5 h-3.5" /> {t('Đã xác thực', 'Verified')}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-secondary text-xs">
                    {t('Không tìm thấy khách hàng nào phù hợp.', 'No customers found matching registry query.')}
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
