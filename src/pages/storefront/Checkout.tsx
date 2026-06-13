import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';
import { formatPriceVND } from '../../utils/formatters';
import { ShoppingBag, ArrowLeft, Trash2, CreditCard, ChevronRight, Check, MapPin } from 'lucide-react';
import type { Order } from '../../db/mockDb';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export const Checkout: React.FC = () => {
  const { language, t } = useLanguage();
  const { cartItems, cartSubtotal, cartCount, updateQuantity, removeFromCart, checkoutCart } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState<number>(1); // 1: Review, 2: Info, 3: Success
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Address picker API states
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string>('');
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<string>('');
  const [selectedWardCode, setSelectedWardCode] = useState<string>('');

  const [streetAddress, setStreetAddress] = useState<string>('');
  const [provinceName, setProvinceName] = useState<string>('');
  const [districtName, setDistrictName] = useState<string>('');
  const [wardName, setWardName] = useState<string>('');

  // Form Fields
  const [formData, setFormData] = useState({
    firstName: 'Nguyễn',
    lastName: 'Văn Minh',
    email: 'minh.nguyen@gmail.com',
    phone: '0901234567',
    address: '',
    city: '',
    postalCode: '70000',
    country: 'VN',
    paymentMethod: 'stripe', // 'stripe' | 'cod'
  });
  const [notes, setNotes] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNextStep = () => {
    if (step === 1 && cartItems.length > 0) {
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    if (!selectedProvinceCode || !selectedDistrictCode || !selectedWardCode || !streetAddress) {
      alert(t('Vui lòng chọn đầy đủ thông tin địa chỉ giao hàng.', 'Please complete all shipping address selections.'));
      return;
    }
    
    setSubmitting(true);
    try {
      const order = await checkoutCart(formData, notes);
      setCreatedOrder(order);
      setStep(3);
    } catch (err) {
      console.error("Checkout failed: ", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Fetch provinces on mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await fetch('https://provinces.open-api.vn/api/?depth=1');
        if (res.ok) {
          const data = await res.json();
          setProvinces(data);
        }
      } catch (err) {
        console.error('Failed to fetch provinces:', err);
      }
    };
    fetchProvinces();
  }, []);

  // Auto-fill user profile info if logged in (once when user details load)
  useEffect(() => {
    if (user) {
      const nameParts = user.full_name.trim().split(' ');
      const last = nameParts.pop() || '';
      const first = nameParts.join(' ') || '';

      setFormData(prev => ({
        ...prev,
        firstName: first || prev.firstName,
        lastName: last || prev.lastName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        postalCode: user.postal_code || prev.postalCode,
      }));

      // Start the cascading auto-fill
      if (user.province_code) {
        setSelectedProvinceCode(user.province_code);
        setProvinceName(user.city || '');
      }
      if (user.street_address) {
        setStreetAddress(user.street_address);
      }
    }
  }, [user]);

  // Fetch districts when selectedProvinceCode changes
  useEffect(() => {
    if (!selectedProvinceCode) {
      setDistricts([]);
      setWards([]);
      setSelectedDistrictCode('');
      setSelectedWardCode('');
      setDistrictName('');
      setWardName('');
      return;
    }
    const fetchDistricts = async () => {
      try {
        const res = await fetch(`https://provinces.open-api.vn/api/p/${selectedProvinceCode}?depth=2`);
        if (res.ok) {
          const data = await res.json();
          const list = data.districts || [];
          setDistricts(list);
          setWards([]);

          // Prefill district code if it matches the user profile's province
          if (user && user.province_code === selectedProvinceCode && user.district_code) {
            setSelectedDistrictCode(user.district_code);
            const matched = list.find((d: any) => String(d.code) === String(user.district_code));
            if (matched) setDistrictName(matched.name);
          } else {
            setSelectedDistrictCode('');
            setSelectedWardCode('');
            setDistrictName('');
            setWardName('');
          }
        }
      } catch (err) {
        console.error('Failed to fetch districts:', err);
      }
    };
    fetchDistricts();
  }, [selectedProvinceCode]);

  // Fetch wards when selectedDistrictCode changes
  useEffect(() => {
    if (!selectedDistrictCode) {
      setWards([]);
      setSelectedWardCode('');
      setWardName('');
      return;
    }
    const fetchWards = async () => {
      try {
        const res = await fetch(`https://provinces.open-api.vn/api/d/${selectedDistrictCode}?depth=2`);
        if (res.ok) {
          const data = await res.json();
          const list = data.wards || [];
          setWards(list);

          // Prefill ward code if it matches the user profile's district
          if (user && user.district_code === selectedDistrictCode && user.ward_code) {
            setSelectedWardCode(user.ward_code);
            const matched = list.find((w: any) => String(w.code) === String(user.ward_code));
            if (matched) setWardName(matched.name);
          } else {
            setSelectedWardCode('');
            setWardName('');
          }
        }
      } catch (err) {
        console.error('Failed to fetch wards:', err);
      }
    };
    fetchWards();
  }, [selectedDistrictCode]);

  // Update combined address inside formData
  useEffect(() => {
    const provinceText = provinceName;
    const districtText = districtName;
    const wardText = wardName;

    let fullAddress = streetAddress;
    if (wardText) fullAddress += `, ${wardText}`;
    if (districtText) fullAddress += `, ${districtText}`;

    setFormData(prev => ({
      ...prev,
      city: provinceText || prev.city,
      address: fullAddress || prev.address
    }));
  }, [streetAddress, provinceName, districtName, wardName]);

  const shippingFee = cartSubtotal > 1000000 ? 0 : 40000;
  const grandTotal = cartSubtotal + shippingFee;

  // STEP 1: Review Shopping Bag
  if (step === 1) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <div className="text-center space-y-3 mb-6">
          <span className="text-[10px] uppercase tracking-[0.25em] text-accent font-semibold">{t('GIỎ HÀNG CỦA BẠN', 'SHOPPING BAG')}</span>
          <h1 className="text-2xl sm:text-4xl font-serif font-light text-primary">{t('Kiểm Tra Đơn Hàng', 'Your Order Review')}</h1>
          <div className="w-12 h-px bg-primary/20 mx-auto mt-2"></div>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-20 space-y-6 max-w-sm mx-auto">
            <div className="w-16 h-16 bg-surface border border-primary/10 text-secondary rounded-full flex items-center justify-center mx-auto shadow-inner">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <p className="text-secondary text-xs leading-relaxed">
              {t('Giỏ hàng của bạn đang trống. Hãy khám phá các bộ sưu tập của chúng tôi để chọn sản phẩm.', 'Your shopping bag is currently empty. Explore our seasonal collections to select items.')}
            </p>
            <Link
              to="/collections"
              className="inline-block px-8 py-3 bg-primary text-white text-xs tracking-widest uppercase font-semibold hover:bg-primary-light transition rounded w-full shadow"
            >
              {t('Bắt đầu mua sắm', 'Start Shopping')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Bag list (left) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="border border-outline-custom rounded bg-card shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline-custom text-[9px] uppercase tracking-widest font-bold text-secondary bg-surface">
                      <th className="p-4 sm:p-6">{t('Sản phẩm', 'Product Item')}</th>
                      <th className="p-4 text-center">{t('Số lượng', 'Quantity')}</th>
                      <th className="p-4 text-right">{t('Giá', 'Price')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-custom">
                    {cartItems.map((item) => (
                      <tr key={item.id} className="text-xs">
                        <td className="p-4 sm:p-6 flex gap-4">
                          <div className="w-14 sm:w-20 aspect-[3/4] bg-surface rounded overflow-hidden border border-outline-custom shrink-0">
                            <img src={item.product.images[0]?.url} alt={language === 'vi' ? item.product.name_vi : item.product.name_en} className="w-full h-full object-cover object-center" />
                          </div>
                          <div className="space-y-1">
                            <Link to={`/products/${item.product.slug}`} className="font-serif text-sm font-semibold hover:underline text-primary">
                              {language === 'vi' ? item.product.name_vi : item.product.name_en}
                            </Link>
                            {item.variant && (
                              <p className="text-[10px] text-secondary font-medium uppercase tracking-wider bg-surface w-fit px-1.5 py-0.5 rounded border border-outline-custom">
                                {t('Phân loại', 'Variant')}: {language === 'vi' ? (item.variant.color_name_vi || item.variant.color_name_en) : item.variant.color_name_en} / {item.variant.size}
                              </p>
                            )}
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-[10px] text-red-500 hover:text-red-700 flex items-center gap-1 mt-1 font-semibold cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" /> {t('Xóa', 'Remove')}
                            </button>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center border border-primary/15 rounded bg-card w-24 mx-auto">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-2 py-1 text-secondary hover:bg-surface cursor-pointer"
                            >
                              -
                            </button>
                            <span className="flex-1 text-center font-mono font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-2 py-1 text-secondary hover:bg-surface cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="p-4 text-right font-medium text-primary">
                          {formatPriceVND(item.price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order summary (right) */}
            <div className="space-y-6">
              <div className="border border-outline-custom rounded bg-card p-6 shadow-sm space-y-6">
                <span className="text-[10px] uppercase tracking-widest font-bold text-primary block border-b border-outline-custom pb-3">
                  {t('Tóm tắt đơn hàng', 'Bag Summary')}
                </span>
                
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-secondary">
                    <span>{t(`Tạm tính (${cartCount} sản phẩm)`, `Cart Subtotal (${cartCount} items)`)}</span>
                    <span className="font-mono">{formatPriceVND(cartSubtotal)}</span>
                  </div>
                  <div className="flex justify-between text-secondary">
                    <span>{t('Phí vận chuyển', 'Shipping Fee')}</span>
                    <span className="font-mono">{shippingFee === 0 ? t('MIỄN PHÍ', 'FREE') : formatPriceVND(shippingFee)}</span>
                  </div>
                  {shippingFee > 0 && (
                    <p className="text-[9px] text-accent leading-relaxed">
                      {t(`💡 Gợi ý: Thêm ${formatPriceVND(1000000 - cartSubtotal)} để được MIỄN PHÍ vận chuyển!`, `💡 Tip: Add ${formatPriceVND(1000000 - cartSubtotal)} more to your order to unlock free shipping!`)}
                    </p>
                  )}
                  <hr className="border-outline-custom pt-1" />
                  <div className="flex justify-between text-sm font-semibold text-primary">
                    <span>{t('Tổng cộng', 'Grand Total')}</span>
                    <span className="font-mono font-bold text-base text-accent">{formatPriceVND(grandTotal)}</span>
                  </div>
                </div>

                <button
                  onClick={handleNextStep}
                  className="w-full bg-primary hover:bg-primary-light text-white text-xs tracking-widest uppercase font-semibold py-3.5 rounded shadow-md flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  {t('Tiến hành đặt hàng', 'Proceed to Checkout')} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // STEP 2: Shipping & Information details
  if (step === 2) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div className="flex items-center gap-3">
          <button onClick={handlePrevStep} className="p-2 border border-primary/10 rounded hover:bg-surface text-primary transition cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="text-left">
            <span className="text-[9px] uppercase tracking-widest text-secondary font-semibold">{t('Bước 2 / 2', 'Step 2 of 2')}</span>
            <h1 className="text-xl font-serif font-bold text-primary">{t('Thông Tin Giao Hàng & Thanh Toán', 'Shipping & Payment Particulars')}</h1>
          </div>
        </div>

        <form onSubmit={handleCheckout} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Inputs Form (left) */}
          <div className="md:col-span-2 space-y-6 bg-card border border-outline-custom p-6 rounded shadow-sm">
            <span className="text-[10px] uppercase tracking-widest font-bold text-primary block border-b border-outline-custom pb-3 mb-4 text-left">
              {t('Địa chỉ giao hàng', 'Recipient Address')}
            </span>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-secondary">{t('Tên', 'First Name')}</label>
                <input
                  type="text"
                  required
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full text-xs px-3 py-2 bg-surface border border-primary/10 rounded focus:outline-none focus:border-primary text-primary"
                />
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-secondary">{t('Họ', 'Last Name')}</label>
                <input
                  type="text"
                  required
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full text-xs px-3 py-2 bg-surface border border-primary/10 rounded focus:outline-none focus:border-primary text-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-secondary">{t('Địa chỉ Email', 'Email Address')}</label>
                <input
                  type="email"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full text-xs px-3 py-2 bg-surface border border-primary/10 rounded focus:outline-none focus:border-primary text-primary"
                />
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-secondary">{t('Số điện thoại', 'Phone Number')}</label>
                <input
                  type="tel"
                  required
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full text-xs px-3 py-2 bg-surface border border-primary/10 rounded focus:outline-none focus:border-primary text-primary"
                />
              </div>
            </div>

            {/* Vietnamese Division Selectors */}
            <div className="border border-outline-custom rounded-lg p-4 bg-surface/40 space-y-4">
              <div className="flex items-center gap-2 text-secondary text-[10px] font-bold uppercase tracking-wider pb-2 border-b border-outline-custom">
                <MapPin className="w-4 h-4 text-accent" />
                <span>{t('Bộ chọn địa chỉ chính xác', 'Accurate Address Selector')}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Province Select */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] uppercase tracking-widest font-semibold text-secondary">{t('Tỉnh / Thành', 'Province')}</label>
                  <select
                    required
                    value={selectedProvinceCode}
                    onChange={(e) => {
                      const code = e.target.value;
                      setSelectedProvinceCode(code);
                      const name = provinces.find(p => String(p.code) === String(code))?.name || '';
                      setProvinceName(name);
                    }}
                    className="w-full text-xs px-3 py-2 bg-card border border-primary/10 rounded focus:outline-none focus:border-primary text-primary"
                  >
                    <option value="">{t('-- Chọn Tỉnh/Thành --', '-- Select Province --')}</option>
                    {provinces.map(p => (
                      <option key={p.code} value={p.code}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* District Select */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] uppercase tracking-widest font-semibold text-secondary">{t('Quận / Huyện', 'District')}</label>
                  <select
                    required
                    disabled={!selectedProvinceCode}
                    value={selectedDistrictCode}
                    onChange={(e) => {
                      const code = e.target.value;
                      setSelectedDistrictCode(code);
                      const name = districts.find(d => String(d.code) === String(code))?.name || '';
                      setDistrictName(name);
                    }}
                    className="w-full text-xs px-3 py-2 bg-card border border-primary/10 rounded focus:outline-none focus:border-primary text-primary disabled:opacity-55"
                  >
                    <option value="">{t('-- Chọn Quận/Huyện --', '-- Select District --')}</option>
                    {districts.map(d => (
                      <option key={d.code} value={d.code}>{d.name}</option>
                    ))}
                  </select>
                </div>

                {/* Ward Select */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] uppercase tracking-widest font-semibold text-secondary">{t('Phường / Xã', 'Ward')}</label>
                  <select
                    required
                    disabled={!selectedDistrictCode}
                    value={selectedWardCode}
                    onChange={(e) => {
                      const code = e.target.value;
                      setSelectedWardCode(code);
                      const name = wards.find(w => String(w.code) === String(code))?.name || '';
                      setWardName(name);
                    }}
                    className="w-full text-xs px-3 py-2 bg-card border border-primary/10 rounded focus:outline-none focus:border-primary text-primary disabled:opacity-55"
                  >
                    <option value="">{t('-- Chọn Phường/Xã --', '-- Select Ward --')}</option>
                    {wards.map(w => (
                      <option key={w.code} value={w.code}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Detailed Street Address */}
              <div className="space-y-1.5 text-left pt-2">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-secondary">{t('Số nhà, tên đường...', 'Street Address (House no, street name)')}</label>
                <input
                  type="text"
                  required
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder={t('Ví dụ: 123 Nguyễn Huệ', 'e.g. 123 Nguyen Hue')}
                  className="w-full text-xs px-3 py-2 bg-card border border-primary/10 rounded focus:outline-none focus:border-primary text-primary"
                />
              </div>
            </div>

            {/* Postal code & Country info */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-1.5 text-left">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-secondary">{t('Quốc gia', 'Country')}</label>
                <input
                  type="text"
                  disabled
                  value="Vietnam"
                  className="w-full text-xs px-3 py-2 bg-surface/65 border border-primary/5 rounded text-secondary font-semibold"
                />
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-secondary">{t('Mã bưu chính', 'Zip Code')}</label>
                <input
                  type="text"
                  required
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  className="w-full text-xs px-3 py-2 bg-surface border border-primary/10 rounded focus:outline-none focus:border-primary text-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-[10px] uppercase tracking-widest font-semibold text-secondary">{t('Ghi chú giao hàng (không bắt buộc)', 'Special delivery notes (optional)')}</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-surface border border-primary/10 rounded focus:outline-none focus:border-primary text-primary h-20"
                placeholder={t('Mã vào cổng, thông tin chuông cửa, gọi trước khi giao...', 'Gate code, buzzer info, pre-call...')}
              />
            </div>

            <span className="text-[10px] uppercase tracking-widest font-bold text-primary block border-b border-outline-custom pb-3 pt-4 mb-4 text-left">
              {t('Phương thức thanh toán', 'Settlement Method')}
            </span>

            <div className="grid grid-cols-2 gap-4">
              <label className={`border rounded p-4 flex items-center justify-between cursor-pointer transition ${formData.paymentMethod === 'stripe' ? 'border-primary bg-primary/5' : 'border-primary/10 bg-card hover:bg-surface'}`}>
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-secondary" />
                  <div className="text-left">
                    <p className="text-xs font-semibold text-primary">{t('Cổng thanh toán Stripe', 'Stripe Secure Card')}</p>
                    <p className="text-[9px] text-secondary">{t('Thẻ tín dụng / ghi nợ', 'Credit/Debit Card')}</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="stripe"
                  checked={formData.paymentMethod === 'stripe'}
                  onChange={handleInputChange}
                  className="accent-primary"
                />
              </label>

              <label className={`border rounded p-4 flex items-center justify-between cursor-pointer transition ${formData.paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-primary/10 bg-card hover:bg-surface'}`}>
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-5 h-5 text-secondary" />
                  <div className="text-left">
                    <p className="text-xs font-semibold text-primary">{t('Thanh toán khi nhận hàng', 'Cash On Delivery')}</p>
                    <p className="text-[9px] text-secondary">{t('Trả tiền mặt khi nhận hàng', 'Pay upon arrival')}</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={formData.paymentMethod === 'cod'}
                  onChange={handleInputChange}
                  className="accent-primary"
                />
              </label>
            </div>
          </div>

          {/* Sticky checkout summary (right) */}
          <div className="space-y-6">
            <div className="border border-outline-custom rounded bg-card p-6 shadow-sm space-y-6">
              <span className="text-[10px] uppercase tracking-widest font-bold text-primary block border-b border-outline-custom pb-3">
                {t('Chi tiết đơn hàng', 'Review Summary')}
              </span>

              <div className="max-h-48 overflow-y-auto space-y-3 pr-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3 text-xs">
                    <div className="w-10 aspect-[3/4] bg-surface rounded overflow-hidden border border-outline-custom shrink-0">
                      <img src={item.product.images[0]?.url} alt={language === 'vi' ? item.product.name_vi : item.product.name_en} className="w-full h-full object-cover object-center" />
                    </div>
                    <div className="flex-grow space-y-0.5 truncate text-left">
                      <p className="font-semibold text-primary truncate">{language === 'vi' ? item.product.name_vi : item.product.name_en}</p>
                      <p className="text-[9px] text-secondary">{t('SL', 'Qty')}: {item.quantity}</p>
                    </div>
                    <span className="font-mono text-secondary font-medium">
                      {formatPriceVND(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <hr className="border-outline-custom" />

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-secondary">
                  <span>{t('Tạm tính', 'Cart Subtotal')}</span>
                  <span className="font-mono">{formatPriceVND(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between text-secondary">
                  <span>{t('Phí giao hàng', 'Shipping Fee')}</span>
                  <span className="font-mono">{shippingFee === 0 ? t('MIỄN PHÍ', 'FREE') : formatPriceVND(shippingFee)}</span>
                </div>
                <hr className="border-outline-custom pt-1" />
                <div className="flex justify-between text-sm font-semibold text-primary">
                  <span>{t('Tổng số tiền', 'Total Amount')}</span>
                  <span className="font-mono font-bold text-base text-accent">{formatPriceVND(grandTotal)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={`w-full bg-primary hover:bg-primary-light text-white text-xs tracking-widest uppercase font-semibold py-3.5 rounded shadow-md flex items-center justify-center gap-1.5 transition cursor-pointer ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {submitting ? t('Đang xử lý...', 'Placing Order...') : t('Đặt hàng an toàn', 'Place Secure Order')}
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  // STEP 3: Order Placement Success Landing page
  if (step === 3 && createdOrder) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-8 animate-fadeIn">
        <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner border border-emerald-500/20">
          <Check className="w-10 h-10" />
        </div>

        <div className="space-y-3">
          <h1 className="font-serif text-3xl font-bold text-primary">{t('Đặt hàng thành công!', 'Order Confirmed!')}</h1>
          <p className="text-secondary text-xs leading-relaxed">
            {t('Cảm ơn bạn đã mua sắm tại Katalin-Clothes. Chúng tôi đã ghi nhận đơn đặt hàng của bạn. Bạn có thể theo dõi trạng thái đơn hàng trong trang quản trị!', 'Thank you for shopping at Katalin-Clothes. We have recorded your purchase. You can review the order status in the admin dashboard!')}
          </p>
        </div>

        {/* Invoice Summary */}
        <div className="border border-outline-custom rounded bg-card p-6 shadow-sm text-left text-xs space-y-4">
          <div className="flex justify-between border-b border-outline-custom pb-2 text-[10px] uppercase font-bold text-secondary">
            <span>{t('Mã đơn hàng', 'Order Number')}</span>
            <span className="font-mono font-bold text-primary">{createdOrder.order_number}</span>
          </div>

          <div className="space-y-2">
            <span className="text-[9px] uppercase tracking-widest font-bold text-secondary block">{t('Địa chỉ nhận hàng', 'Shipment Address')}</span>
            <p className="text-primary font-medium">{createdOrder.shipping_first_name} {createdOrder.shipping_last_name}</p>
            <p className="text-secondary leading-normal">{createdOrder.shipping_address}, {createdOrder.shipping_city}</p>
            <p className="text-secondary">{t('Điện thoại:', 'Phone:')} {createdOrder.shipping_phone}</p>
          </div>

          <hr className="border-outline-custom" />

          <div className="space-y-2.5">
            <span className="text-[9px] uppercase tracking-widest font-bold text-secondary block">{t('Chi tiết hóa đơn', 'Invoice Particulars')}</span>
            {createdOrder.items.map((it) => (
              <div key={it.id} className="flex justify-between text-secondary">
                <span>{it.product_name} (x{it.quantity})</span>
                <span className="font-mono">{formatPriceVND(it.total_price)}</span>
              </div>
            ))}
            <div className="flex justify-between pt-1 border-t border-outline-custom font-semibold text-primary">
              <span>{t('Tổng tiền thanh toán', 'Grand Total')}</span>
              <span className="font-mono text-accent font-bold">{formatPriceVND(createdOrder.total)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <Link
            to="/collections"
            className="w-full text-center text-xs tracking-widest uppercase bg-primary text-white hover:bg-primary-light transition py-3.5 rounded font-semibold shadow cursor-pointer"
          >
            {t('Tiếp tục xem sản phẩm', 'Continue Browsing')}
          </Link>
          <Link
            to="/admin/orders"
            className="w-full text-center text-xs tracking-widest uppercase border border-primary/25 text-primary hover:bg-surface transition py-3.5 rounded font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {t('Xem trong bảng quản trị', 'View in Admin Dashboard')}
          </Link>
        </div>
      </div>
    );
  }

  return null;
};
