import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { User, Phone, Mail, MapPin, Save, CheckCircle, AlertCircle } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { t } = useLanguage();

  // Profile Form States
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Address Picker API States
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
  const [postalCode, setPostalCode] = useState<string>('70000');

  // Alert States
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);

  // Sync initial user details
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setPhone(user.phone || '');
      setEmail(user.email || '');
      setPostalCode(user.postal_code || '70000');
      setStreetAddress(user.street_address || '');
      setProvinceName(user.city || '');
      
      if (user.province_code) {
        setSelectedProvinceCode(user.province_code);
      }
      if (user.district_code) {
        setSelectedDistrictCode(user.district_code);
      }
      if (user.ward_code) {
        setSelectedWardCode(user.ward_code);
      }
    }
  }, [user]);

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

  // Fetch districts when selectedProvinceCode changes
  useEffect(() => {
    if (!selectedProvinceCode) {
      setDistricts([]);
      setWards([]);
      return;
    }
    const fetchDistricts = async () => {
      try {
        const res = await fetch(`https://provinces.open-api.vn/api/p/${selectedProvinceCode}?depth=2`);
        if (res.ok) {
          const data = await res.json();
          const list = data.districts || [];
          setDistricts(list);
          // Only clear if the code changes to a different one (not during initial mount sync)
          if (user?.province_code !== selectedProvinceCode) {
            setWards([]);
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
      return;
    }
    const fetchWards = async () => {
      try {
        const res = await fetch(`https://provinces.open-api.vn/api/d/${selectedDistrictCode}?depth=2`);
        if (res.ok) {
          const data = await res.json();
          const list = data.wards || [];
          setWards(list);
          // Only clear if the code changes to a different one
          if (user?.district_code !== selectedDistrictCode) {
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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // Build unified address
      let fullAddress = streetAddress;
      if (wardName) fullAddress += `, ${wardName}`;
      if (districtName) fullAddress += `, ${districtName}`;

      await updateProfile({
        full_name: fullName,
        phone: phone,
        address: fullAddress,
        city: provinceName,
        postal_code: postalCode,
        province_code: selectedProvinceCode,
        district_code: selectedDistrictCode,
        ward_code: selectedWardCode,
        street_address: streetAddress
      });

      setSuccessMsg(t('Cập nhật thông tin tài khoản thành công!', 'Profile updated successfully!'));
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || t('Có lỗi xảy ra khi cập nhật.', 'An error occurred during update.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="text-center space-y-2 mb-4">
        <span className="text-[10px] uppercase tracking-[0.25em] text-accent font-semibold">
          {t('THÔNG TIN TÀI KHOẢN', 'ACCOUNT PROFILE')}
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-light text-primary">
          {t('Hồ Sơ & Địa Chỉ Mặc Định', 'Profile & Settings')}
        </h1>
        <div className="w-12 h-px bg-primary/20 mx-auto mt-2"></div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg text-xs max-w-2xl mx-auto">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-xs max-w-2xl mx-auto">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Main Settings Card */}
      <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        
        {/* Left Side: General Profile Info */}
        <div className="md:col-span-1 bg-card border border-outline-custom p-6 rounded-lg shadow-sm space-y-6 text-left h-fit">
          <div className="flex flex-col items-center pb-4 border-b border-outline-custom">
            <div className="w-16 h-16 bg-primary text-white text-xl font-bold rounded-full flex items-center justify-center uppercase shadow-md mb-3">
              {fullName.charAt(0) || 'U'}
            </div>
            <p className="text-sm font-semibold text-primary">{fullName || 'Katalin User'}</p>
            <p className="text-[10px] text-secondary tracking-wider uppercase font-semibold mt-1">
              {user?.role === 'admin' ? t('Quản trị viên', 'Administrator') : t('Thành viên', 'Store Member')}
            </p>
          </div>

          <div className="space-y-4">
            {/* Email (Readonly) */}
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-widest font-semibold text-secondary">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full text-xs pl-9 pr-3 py-2 bg-surface/60 border border-primary/5 rounded text-secondary font-medium cursor-not-allowed"
                />
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-secondary/50" />
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-widest font-semibold text-secondary">{t('Họ và Tên', 'Full Name')}</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 bg-surface border border-primary/10 rounded focus:outline-none focus:border-primary text-primary"
                />
                <User className="absolute left-3 top-2.5 w-4 h-4 text-secondary/50" />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-widest font-semibold text-secondary">{t('Số điện thoại', 'Phone Number')}</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 bg-surface border border-primary/10 rounded focus:outline-none focus:border-primary text-primary"
                />
                <Phone className="absolute left-3 top-2.5 w-4 h-4 text-secondary/50" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Shipping Address Details */}
        <div className="md:col-span-2 bg-card border border-outline-custom p-6 rounded-lg shadow-sm space-y-6 text-left">
          <div className="border-b border-outline-custom pb-3 mb-2 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-accent" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">
              {t('Địa chỉ giao hàng mặc định', 'Default Shipping Address')}
            </h3>
          </div>

          {/* Cascading Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Province Select */}
            <div className="space-y-1.5">
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
                className="w-full text-xs px-3 py-2 bg-surface border border-primary/10 rounded focus:outline-none focus:border-primary text-primary"
              >
                <option value="">{t('-- Chọn Tỉnh/Thành --', '-- Select Province --')}</option>
                {provinces.map(p => (
                  <option key={p.code} value={p.code}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* District Select */}
            <div className="space-y-1.5">
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
                className="w-full text-xs px-3 py-2 bg-surface border border-primary/10 rounded focus:outline-none focus:border-primary text-primary disabled:opacity-55"
              >
                <option value="">{t('-- Chọn Quận/Huyện --', '-- Select District --')}</option>
                {districts.map(d => (
                  <option key={d.code} value={d.code}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Ward Select */}
            <div className="space-y-1.5">
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
                className="w-full text-xs px-3 py-2 bg-surface border border-primary/10 rounded focus:outline-none focus:border-primary text-primary disabled:opacity-55"
              >
                <option value="">{t('-- Chọn Phường/Xã --', '-- Select Ward --')}</option>
                {wards.map(w => (
                  <option key={w.code} value={w.code}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Detailed Street Address */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest font-semibold text-secondary">{t('Số nhà, tên đường...', 'Street Address (House no, street name)')}</label>
            <input
              type="text"
              required
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              placeholder={t('Ví dụ: 123 Nguyễn Huệ', 'e.g. 123 Nguyen Hue')}
              className="w-full text-xs px-3 py-2 bg-surface border border-primary/10 rounded focus:outline-none focus:border-primary text-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Country */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-semibold text-secondary">{t('Quốc gia', 'Country')}</label>
              <input
                type="text"
                disabled
                value="Vietnam"
                className="w-full text-xs px-3 py-2 bg-surface/65 border border-primary/5 rounded text-secondary font-semibold cursor-not-allowed"
              />
            </div>

            {/* Postal Code */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-semibold text-secondary">{t('Mã bưu chính', 'Zip Code')}</label>
              <input
                type="text"
                required
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-surface border border-primary/10 rounded focus:outline-none focus:border-primary text-primary"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end pt-4 border-t border-outline-custom">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 bg-primary hover:bg-primary-light text-white text-xs tracking-widest uppercase font-semibold py-3 px-6 rounded shadow-md transition cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? t('Đang lưu...', 'Saving...') : t('Lưu Thay Đổi', 'Save Profile Settings')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
