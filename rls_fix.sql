-- ============================================================
-- KATALIN CLOTHES — Supabase RLS Fix & Development Policies
-- Chạy script này trong Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- ============================================================

-- ------------------------------------------------------------
-- PHẦN 1: Sửa lỗi đệ quy vô hạn RLS trên bảng profiles
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql;

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT
  USING (public.is_admin());

-- ------------------------------------------------------------
-- PHẦN 2: Chính sách cho môi trường Phát triển / Demo (DEVELOPMENT POLICIES)
-- Vì ứng dụng hiện tại là Frontend-only (chưa tích hợp màn hình Đăng nhập/Đăng ký của Supabase Auth),
-- toàn bộ thao tác gieo dữ liệu (seeding), thêm/sửa sản phẩm của Admin giả lập,
-- và đặt hàng của khách vãng lai đều chạy dưới quyền Anonymous (chưa đăng nhập).
-- Để các tính năng hoạt động bình thường, ta cần cấp quyền cho khách vãng lai (anon) như sau:
-- ------------------------------------------------------------

-- 1. Cho phép MỌI NGƯỜI quản lý sản phẩm, hình ảnh và biến thể (phục vụ Seeding & Admin CRUD giả lập)
DROP POLICY IF EXISTS "Anyone can manage products dev" ON public.products;
CREATE POLICY "Anyone can manage products dev" ON public.products 
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can manage product images dev" ON public.product_images;
CREATE POLICY "Anyone can manage product images dev" ON public.product_images 
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can manage variants dev" ON public.product_variants;
CREATE POLICY "Anyone can manage variants dev" ON public.product_variants 
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can manage categories dev" ON public.categories;
CREATE POLICY "Anyone can manage categories dev" ON public.categories 
  FOR ALL USING (true) WITH CHECK (true);

-- 2. Cho phép MỌI NGƯỜI tạo và xem đơn hàng (phục vụ Guest Checkout & hiển thị hóa đơn thành công)
DROP POLICY IF EXISTS "Anyone can manage orders dev" ON public.orders;
CREATE POLICY "Anyone can manage orders dev" ON public.orders 
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can manage order items dev" ON public.order_items;
CREATE POLICY "Anyone can manage order items dev" ON public.order_items 
  FOR ALL USING (true) WITH CHECK (true);

-- 3. Cho phép MỌI NGƯỜI thêm email nhận bản tin
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers 
  FOR INSERT WITH CHECK (true);

-- ------------------------------------------------------------
-- PHẦN 3: Bổ sung các cột Lưu Địa Chỉ Mặc Định cho bảng Profiles
-- ------------------------------------------------------------
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS postal_code TEXT,
  ADD COLUMN IF NOT EXISTS province_code TEXT,
  ADD COLUMN IF NOT EXISTS district_code TEXT,
  ADD COLUMN IF NOT EXISTS ward_code TEXT,
  ADD COLUMN IF NOT EXISTS street_address TEXT;

-- ------------------------------------------------------------
-- PHẦN 4: Bổ sung Bảng Cấu Hình Trang Chủ (Settings Table)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hero_title_vi TEXT NOT NULL,
  hero_title_en TEXT NOT NULL,
  hero_subtitle_vi TEXT NOT NULL,
  hero_subtitle_en TEXT NOT NULL,
  hero_image_url TEXT NOT NULL,
  campaign_quote_vi TEXT NOT NULL,
  campaign_quote_en TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can manage settings dev" ON public.settings;
CREATE POLICY "Anyone can manage settings dev" ON public.settings 
  FOR ALL USING (true) WITH CHECK (true);


