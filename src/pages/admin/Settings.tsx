import React, { useState, useEffect } from 'react';
import { db } from '../../db/dbClient';
import { DEFAULT_SETTINGS } from '../../db/mockDb';
import type { Category, HomepageSettings } from '../../db/mockDb';
import { useLanguage } from '../../context/LanguageContext';
import { Sliders, Image, FileText, Save, CheckCircle, AlertCircle } from 'lucide-react';

export const Settings: React.FC = () => {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<HomepageSettings>(DEFAULT_SETTINGS);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [categoryForm, setCategoryForm] = useState<Category | null>(null);
  
  // Notification states
  const [settingsSuccess, setSettingsSuccess] = useState<boolean>(false);
  const [categorySuccess, setCategorySuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      const currentSettings = await db.getSettings();
      if (currentSettings) {
        setSettings(currentSettings);
      }
      const cats = await db.getCategories();
      setCategories(cats);
      if (cats.length > 0) {
        setSelectedCategoryId(cats[0].id);
        setCategoryForm({ ...cats[0] });
      }
    };
    loadData();
  }, []);

  // Update selected category form fields when selection changes
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const catId = e.target.value;
    setSelectedCategoryId(catId);
    const selected = categories.find(c => c.id === catId);
    if (selected) {
      setCategoryForm({ ...selected });
    }
  };

  // Handle homepage settings save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setErrorMsg('');
      setSettingsSuccess(false);
      await db.updateSettings(settings);
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save settings');
    }
  };

  // Handle category settings save
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm) return;
    try {
      setErrorMsg('');
      setCategorySuccess(false);
      const updated = await db.updateCategory(categoryForm);
      
      // Update categories array in state
      setCategories(prev => prev.map(c => c.id === updated.id ? updated : c));
      setCategorySuccess(true);
      setTimeout(() => setCategorySuccess(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save category');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="text-left flex items-center justify-between border-b border-outline-custom pb-4">
        <div>
          <h1 className="text-2xl font-bold text-primary tracking-tight flex items-center gap-2">
            <Sliders className="w-6 h-6 text-accent" />
            {t('Cấu Hình Trang Web', 'Site Customization')}
          </h1>
          <p className="text-xs text-secondary font-light">
            {t('Quản lý hình ảnh, nội dung biểu ngữ trang chủ và các ảnh đại diện của danh mục sản phẩm.', 'Manage hero slides, homepage slogans, and cover images for categories.')}
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
        
        {/* HOMEPAGE SETTINGS */}
        <div className="bg-card border border-outline-custom rounded-lg shadow-sm overflow-hidden flex flex-col">
          <div className="border-b border-outline-custom p-5 bg-surface/30 flex items-center justify-between">
            <h3 className="font-serif text-sm font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-accent" />
              {t('Cấu hình Trang Chủ', 'Homepage Configuration')}
            </h3>
            {settingsSuccess && (
              <span className="text-[10px] text-green-500 font-medium flex items-center gap-1 animate-fadeIn">
                <CheckCircle className="w-3.5 h-3.5" />
                {t('Đã lưu thành công', 'Saved successfully')}
              </span>
            )}
          </div>
          
          <form onSubmit={handleSaveSettings} className="p-6 space-y-6 flex-grow flex flex-col justify-between">
            <div className="space-y-5">
              {/* Hero Image URL & Preview */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider font-bold text-secondary">{t('Hình ảnh nền Slide chính', 'Hero Slide Cover Image')}</label>
                <input
                  type="text"
                  value={settings.hero_image_url}
                  onChange={e => setSettings(prev => ({ ...prev, hero_image_url: e.target.value }))}
                  className="w-full bg-surface border border-outline-custom rounded px-3 py-2 text-xs text-primary focus:outline-none focus:border-accent"
                  placeholder="/assets/hero/hero_fashion_1.png"
                  required
                />
                <div className="mt-2 relative h-36 rounded overflow-hidden bg-surface border border-outline-custom flex items-center justify-center">
                  {settings.hero_image_url ? (
                    <img 
                      src={settings.hero_image_url} 
                      alt="Hero Preview" 
                      className="absolute inset-0 w-full h-full object-cover opacity-80"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : null}
                  <span className="text-[10px] text-secondary/60 uppercase tracking-widest pointer-events-none flex items-center gap-1 z-10">
                    <Image className="w-4 h-4" />
                    {t('Xem trước ảnh bìa', 'Cover Preview')}
                  </span>
                </div>
              </div>

              {/* Title VI / EN */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-secondary">{t('Tiêu đề chính (VI)', 'Hero Title (VI)')}</label>
                  <textarea
                    rows={2}
                    value={settings.hero_title_vi}
                    onChange={e => setSettings(prev => ({ ...prev, hero_title_vi: e.target.value }))}
                    className="w-full bg-surface border border-outline-custom rounded px-3 py-2 text-xs text-primary focus:outline-none focus:border-accent font-serif"
                    placeholder="Ý niệm \n Thẩm mỹ"
                    required
                  />
                  <p className="text-[9px] text-secondary/70 italic">{t('Dùng \\n để ngắt dòng làm nghiêng chữ', 'Use \\n to break line and italicize second part')}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-secondary">{t('Tiêu đề chính (EN)', 'Hero Title (EN)')}</label>
                  <textarea
                    rows={2}
                    value={settings.hero_title_en}
                    onChange={e => setSettings(prev => ({ ...prev, hero_title_en: e.target.value }))}
                    className="w-full bg-surface border border-outline-custom rounded px-3 py-2 text-xs text-primary focus:outline-none focus:border-accent font-serif"
                    placeholder="Aesthetic \n Narrative"
                    required
                  />
                  <p className="text-[9px] text-secondary/70 italic">{t('Dùng \\n để ngắt dòng làm nghiêng chữ', 'Use \\n to break line and italicize second part')}</p>
                </div>
              </div>

              {/* Subtitle VI / EN */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-secondary">{t('Phụ đề (VI)', 'Hero Subtitle (VI)')}</label>
                  <textarea
                    rows={2}
                    value={settings.hero_subtitle_vi}
                    onChange={e => setSettings(prev => ({ ...prev, hero_subtitle_vi: e.target.value }))}
                    className="w-full bg-surface border border-outline-custom rounded px-3 py-2 text-xs text-primary focus:outline-none focus:border-accent leading-relaxed"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-secondary">{t('Phụ đề (EN)', 'Hero Subtitle (EN)')}</label>
                  <textarea
                    rows={2}
                    value={settings.hero_subtitle_en}
                    onChange={e => setSettings(prev => ({ ...prev, hero_subtitle_en: e.target.value }))}
                    className="w-full bg-surface border border-outline-custom rounded px-3 py-2 text-xs text-primary focus:outline-none focus:border-accent leading-relaxed"
                    required
                  />
                </div>
              </div>

              {/* Campaign Slogan Quote VI / EN */}
              <div className="space-y-4 border-t border-outline-custom/40 pt-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-secondary">{t('Châm ngôn Chiến dịch (VI)', 'Campaign Quote (VI)')}</label>
                  <textarea
                    rows={3}
                    value={settings.campaign_quote_vi}
                    onChange={e => setSettings(prev => ({ ...prev, campaign_quote_vi: e.target.value }))}
                    className="w-full bg-surface border border-outline-custom rounded px-3 py-2 text-xs text-primary focus:outline-none focus:border-accent"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-secondary">{t('Châm ngôn Chiến dịch (EN)', 'Campaign Quote (EN)')}</label>
                  <textarea
                    rows={3}
                    value={settings.campaign_quote_en}
                    onChange={e => setSettings(prev => ({ ...prev, campaign_quote_en: e.target.value }))}
                    className="w-full bg-surface border border-outline-custom rounded px-3 py-2 text-xs text-primary focus:outline-none focus:border-accent"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                className="w-full py-3 bg-primary hover:bg-accent text-card text-xs font-semibold uppercase tracking-widest rounded transition-all duration-300 flex items-center justify-center gap-2 shadow cursor-pointer transform hover:scale-[1.02]"
              >
                <Save className="w-4 h-4" />
                {t('Lưu Cấu Hình Trang Chủ', 'Save Homepage Settings')}
              </button>
            </div>
          </form>
        </div>

        {/* CATEGORY SETTINGS */}
        <div className="bg-card border border-outline-custom rounded-lg shadow-sm overflow-hidden flex flex-col">
          <div className="border-b border-outline-custom p-5 bg-surface/30 flex items-center justify-between">
            <h3 className="font-serif text-sm font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
              <Image className="w-4 h-4 text-accent" />
              {t('Hình Ảnh Danh Mục', 'Category Configuration')}
            </h3>
            {categorySuccess && (
              <span className="text-[10px] text-green-500 font-medium flex items-center gap-1 animate-fadeIn">
                <CheckCircle className="w-3.5 h-3.5" />
                {t('Đã cập nhật danh mục', 'Category updated')}
              </span>
            )}
          </div>

          <div className="p-6 space-y-6 flex-grow flex flex-col justify-between">
            <div className="space-y-5">
              {/* Select Category */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider font-bold text-secondary">{t('Chọn Danh Mục để chỉnh sửa', 'Select Category to Edit')}</label>
                <select
                  value={selectedCategoryId}
                  onChange={handleCategoryChange}
                  className="w-full bg-surface border border-outline-custom rounded px-3 py-2.5 text-xs text-primary focus:outline-none focus:border-accent font-medium"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name_vi} / {c.name_en} ({c.slug})
                    </option>
                  ))}
                </select>
              </div>

              {categoryForm && (
                <form onSubmit={handleSaveCategory} className="space-y-5">
                  {/* Category Image URL */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-secondary">{t('URL Hình ảnh đại diện', 'Category Cover Image URL')}</label>
                    <input
                      type="text"
                      value={categoryForm.image_url || ''}
                      onChange={e => setCategoryForm(prev => prev ? ({ ...prev, image_url: e.target.value }) : null)}
                      className="w-full bg-surface border border-outline-custom rounded px-3 py-2 text-xs text-primary focus:outline-none focus:border-accent"
                      placeholder="/assets/products/linen_shirt_1.png"
                    />
                    <div className="mt-2 relative h-40 rounded overflow-hidden bg-surface border border-outline-custom flex items-center justify-center">
                      {categoryForm.image_url ? (
                        <img 
                          src={categoryForm.image_url} 
                          alt="Category Preview" 
                          className="absolute inset-0 w-full h-full object-cover opacity-80"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : null}
                      <span className="text-[10px] text-secondary/60 uppercase tracking-widest pointer-events-none flex items-center gap-1 z-10">
                        <Image className="w-4 h-4" />
                        {t('Xem trước ảnh danh mục', 'Category Cover Preview')}
                      </span>
                    </div>
                  </div>

                  {/* Names VI / EN */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-secondary">{t('Tên Danh Mục (VI)', 'Category Name (VI)')}</label>
                      <input
                        type="text"
                        value={categoryForm.name_vi}
                        onChange={e => setCategoryForm(prev => prev ? ({ ...prev, name_vi: e.target.value }) : null)}
                        className="w-full bg-surface border border-outline-custom rounded px-3 py-2 text-xs text-primary focus:outline-none focus:border-accent"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-secondary">{t('Tên Danh Mục (EN)', 'Category Name (EN)')}</label>
                      <input
                        type="text"
                        value={categoryForm.name_en}
                        onChange={e => setCategoryForm(prev => prev ? ({ ...prev, name_en: e.target.value }) : null)}
                        className="w-full bg-surface border border-outline-custom rounded px-3 py-2 text-xs text-primary focus:outline-none focus:border-accent"
                        required
                      />
                    </div>
                  </div>

                  {/* Slug & Display Order */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-secondary">Slug</label>
                      <input
                        type="text"
                        value={categoryForm.slug}
                        onChange={e => setCategoryForm(prev => prev ? ({ ...prev, slug: e.target.value }) : null)}
                        className="w-full bg-surface border border-outline-custom rounded px-3 py-2 text-xs text-primary focus:outline-none focus:border-accent"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-secondary">{t('Thứ tự hiển thị', 'Display Order')}</label>
                      <input
                        type="number"
                        value={categoryForm.display_order}
                        onChange={e => setCategoryForm(prev => prev ? ({ ...prev, display_order: Number(e.target.value) }) : null)}
                        className="w-full bg-surface border border-outline-custom rounded px-3 py-2 text-xs text-primary focus:outline-none focus:border-accent"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      type="submit"
                      className="w-full py-3 bg-primary hover:bg-accent text-card text-xs font-semibold uppercase tracking-widest rounded transition-all duration-300 flex items-center justify-center gap-2 shadow cursor-pointer transform hover:scale-[1.02]"
                    >
                      <Save className="w-4 h-4" />
                      {t('Cập Nhật Danh Mục này', 'Update This Category')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
