import React, { useState, useEffect } from 'react';
import { db } from '../../db/dbClient';
import type { Order } from '../../db/mockDb';
import { formatPriceVND } from '../../utils/formatters';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { Award, Activity, Percent } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const Reports: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    const loadOrders = async () => {
      const o = await db.getOrders();
      setOrders(o);
    };
    loadOrders();
  }, []);

  // Compute metrics
  const totalSales = orders
    .filter(o => o.status !== 'cancelled' && o.status !== 'refunded')
    .reduce((acc, curr) => acc + curr.total, 0);

  const averageOrderValue = orders.length > 0 ? totalSales / orders.length : 0;

  // Chart 1: Sales breakdown by Category
  const categoryData = [
    { name: t('Áo / Tops', 'Tops'), value: 3850000 },
    { name: t('Váy Đầm / Dresses', 'Dresses'), value: 2500000 },
    { name: t('Áo Khoác / Outerwear', 'Outerwear'), value: 1850000 },
    { name: t('Quần / Bottoms', 'Bottoms'), value: 790000 },
  ];
  
  const COLORS = ['var(--accent)', 'var(--secondary)', 'var(--primary-light)', 'var(--outline-custom)'];

  // Chart 2: Weekly revenue growth
  const weeklyData = [
    { name: t('Tuần 1', 'Week 1'), sales: 8500000 },
    { name: t('Tuần 2', 'Week 2'), sales: 12400000 },
    { name: t('Tuần 3', 'Week 3'), sales: 9800000 },
    { name: t('Tuần 4', 'Week 4'), sales: 14500000 },
    { name: t('Tuần 5', 'Week 5'), sales: 11200000 },
    { name: t('Tuần 6', 'Week 6'), sales: totalSales > 0 ? totalSales : 7800000 },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="text-left">
        <h1 className="text-2xl font-bold text-primary tracking-tight">{t('Báo Cáo & Phân Tích', 'Reports & Analytics')}</h1>
        <p className="text-xs text-secondary font-light">{t('Phân phối doanh số bán quần áo, xu hướng doanh thu hàng tuần và các số liệu kinh doanh.', 'Garment sales distributions, weekly turnover patterns, and business performance metrics.')}</p>
      </div>

      {/* Highlights metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        <div className="bg-card border border-outline-custom rounded p-6 shadow-sm space-y-2">
          <span className="text-[10px] uppercase tracking-widest font-bold text-secondary flex items-center gap-1">
            <Award className="w-4 h-4 text-accent" /> {t('Chỉ số hiệu quả bán lẻ', 'Retail Efficiency Index')}
          </span>
          <h3 className="text-xl font-bold text-primary">{t('Hiệu suất cao', 'High Performing')}</h3>
          <p className="text-[11px] text-secondary">{t('Tỷ lệ xoay vòng sản phẩm đạt mức 84%, cho thấy tốc độ bán lẻ vô cùng mạnh mẽ.', 'Product turnover index is resting at 84%, indicating robust retail velocity.')}</p>
        </div>

        <div className="bg-card border border-outline-custom rounded p-6 shadow-sm space-y-2">
          <span className="text-[10px] uppercase tracking-widest font-bold text-secondary flex items-center gap-1">
            <Activity className="w-4 h-4 text-accent" /> {t('Đơn hàng trung bình (AOV)', 'Average Order Value (AOV)')}
          </span>
          <h3 className="text-xl font-bold font-mono text-primary">{formatPriceVND(averageOrderValue)}</h3>
          <p className="text-[11px] text-secondary">{t('Giá trị giỏ hàng trung bình dao động ở mức 850.000₫ cho mỗi giao dịch.', 'Customer cart values are hovering around 850.000₫ per transaction.')}</p>
        </div>

        <div className="bg-card border border-outline-custom rounded p-6 shadow-sm space-y-2">
          <span className="text-[10px] uppercase tracking-widest font-bold text-secondary flex items-center gap-1">
            <Percent className="w-4 h-4 text-accent" /> {t('Biên lợi nhuận gộp', 'Gross Margin')}
          </span>
          <h3 className="text-xl font-bold font-mono text-primary">68.4%</h3>
          <p className="text-[11px] text-secondary">{t('Biên lợi nhuận gộp duy trì ổn định qua các kênh phân phối kỹ thuật số trực tiếp.', 'Gross margins remain stable through direct-to-consumer digital channels.')}</p>
        </div>
      </div>

      {/* Grid of charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Bar chart */}
        <div className="bg-card border border-outline-custom rounded p-6 shadow-sm space-y-4">
          <div className="text-left">
            <span className="text-[9px] uppercase tracking-widest font-bold text-secondary">{t('Tăng trưởng doanh số', 'Sales growth')}</span>
            <h3 className="text-xs font-semibold text-primary">{t('Doanh Thu Bán Hàng Ròng Hàng Tuần', 'Weekly Net Sales Turnover')}</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--outline-custom)" />
                <XAxis dataKey="name" fontSize={11} stroke="#888" tickLine={false} />
                <YAxis fontSize={11} stroke="#888" tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000000).toFixed(0)}M`} />
                <Tooltip formatter={(value: any) => formatPriceVND(value)} labelClassName="text-xs font-semibold text-primary" contentStyle={{ fontSize: 11, backgroundColor: 'var(--card)', borderColor: 'var(--outline-custom)' }} itemStyle={{ color: 'var(--primary)' }} />
                <Bar dataKey="sales" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Pie chart */}
        <div className="bg-card border border-outline-custom rounded p-6 shadow-sm space-y-4">
          <div className="text-left">
            <span className="text-[9px] uppercase tracking-widest font-bold text-secondary">{t('Phân phối sản phẩm', 'Garment Distribution')}</span>
            <h3 className="text-xs font-semibold text-primary">{t('Doanh Số Theo Từng Danh Mục', 'Sales by Category Distribution')}</h3>
          </div>
          <div className="h-72 flex flex-col justify-center">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatPriceVND(value)} labelClassName="text-xs font-semibold text-primary" contentStyle={{ fontSize: 11, backgroundColor: 'var(--card)', borderColor: 'var(--outline-custom)' }} itemStyle={{ color: 'var(--primary)' }} />
                  <Legend verticalAlign="bottom" height={36} iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 11, color: 'var(--primary)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
