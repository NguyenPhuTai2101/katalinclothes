export interface Category {
  id: string;
  name_vi: string;
  name_en: string;
  slug: string;
  description_vi?: string;
  description_en?: string;
  image_url?: string;
  display_order: number;
  is_active: boolean;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_vi?: string;
  alt_en?: string;
  display_order: number;
  is_primary: boolean;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string; // S, M, L, XL, etc.
  color_name_vi: string;
  color_name_en: string;
  color_hex: string;
  stock_quantity: number;
  price_adjustment: number;
  sku: string;
}

export interface Product {
  id: string;
  name_vi: string;
  name_en: string;
  slug: string;
  description_vi?: string;
  description_en?: string;
  price: number;
  compare_at_price?: number;
  category_id: string;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_active: boolean;
  stock_quantity: number;
  sku: string;
  tags?: string[];
  materials_vi?: string;
  materials_en?: string;
  care_instructions_vi?: string;
  care_instructions_en?: string;
  images: ProductImage[];
  variants: ProductVariant[];
  created_at: string;
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id: string;
  variant_id?: string;
  product_name: string;
  variant_info?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  image_url?: string;
}

export interface Order {
  id: string;
  user_id?: string;
  order_number: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  shipping_first_name: string;
  shipping_last_name: string;
  shipping_email: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_country: string;
  subtotal: number;
  shipping_fee: number;
  tax: number;
  discount: number;
  total: number;
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  created_at: string;
  items: OrderItem[];
  notes?: string;
}

export interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  role: 'customer' | 'admin';
  total_spent: number;
  order_count: number;
  created_at: string;
}

// Initial default categories
export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name_vi: 'Áo', name_en: 'Tops', slug: 'tops', display_order: 1, is_active: true },
  { id: 'cat-2', name_vi: 'Quần', name_en: 'Bottoms', slug: 'bottoms', display_order: 2, is_active: true },
  { id: 'cat-3', name_vi: 'Váy & Đầm', name_en: 'Dresses', slug: 'dresses', display_order: 3, is_active: true },
  { id: 'cat-4', name_vi: 'Áo khoác', name_en: 'Outerwear', slug: 'outerwear', display_order: 4, is_active: true },
  { id: 'cat-5', name_vi: 'Phụ kiện', name_en: 'Accessories', slug: 'accessories', display_order: 5, is_active: true },
  { id: 'cat-6', name_vi: 'Giày dép', name_en: 'Footwear', slug: 'footwear', display_order: 6, is_active: true },
];

// Initial default products
export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name_vi: 'Áo sơ mi linen cổ trụ',
    name_en: 'Band Collar Linen Shirt',
    slug: 'band-collar-linen-shirt',
    description_vi: 'Áo sơ mi dáng rộng được may bằng chất liệu 100% linen tự nhiên, thoáng mát và sang trọng. Phù hợp cho những ngày hè thanh lịch.',
    description_en: 'Loose-fit shirt crafted from 100% natural linen, breathable and premium. Perfect for elegant summer days.',
    price: 650000,
    compare_at_price: 850000,
    category_id: 'cat-1',
    is_featured: true,
    is_new_arrival: true,
    is_active: true,
    stock_quantity: 45,
    sku: 'TS-LN-01',
    tags: ['linen', 'shirt', 'summer', 'minimalist'],
    materials_vi: '100% Linen tự nhiên',
    materials_en: '100% Natural Linen',
    care_instructions_vi: 'Giặt tay nhẹ nhàng bằng nước lạnh. Không vắt mạnh. Ủi hơi nước ở nhiệt độ vừa.',
    care_instructions_en: 'Gently hand wash in cold water. Do not wring. Steam iron at medium temperature.',
    images: [
      { id: 'img-1-1', product_id: 'prod-1', url: '/src/assets/products/linen_shirt_1.png', alt_vi: 'Áo sơ mi linen trắng', alt_en: 'White linen shirt', display_order: 1, is_primary: true },
      { id: 'img-1-2', product_id: 'prod-1', url: '/src/assets/products/linen_shirt_2.png', alt_vi: 'Chi tiết áo sơ mi linen', alt_en: 'Linen shirt detail', display_order: 2, is_primary: false }
    ],
    variants: [
      { id: 'var-1-1', product_id: 'prod-1', size: 'S', color_name_vi: 'Trắng tinh khôi', color_name_en: 'Pure White', color_hex: '#ffffff', stock_quantity: 15, price_adjustment: 0, sku: 'TS-LN-01-W-S' },
      { id: 'var-1-2', product_id: 'prod-1', size: 'M', color_name_vi: 'Trắng tinh khôi', color_name_en: 'Pure White', color_hex: '#ffffff', stock_quantity: 20, price_adjustment: 0, sku: 'TS-LN-01-W-M' },
      { id: 'var-1-3', product_id: 'prod-1', size: 'L', color_name_vi: 'Trắng tinh khôi', color_name_en: 'Pure White', color_hex: '#ffffff', stock_quantity: 10, price_adjustment: 0, sku: 'TS-LN-01-W-L' },
      { id: 'var-1-4', product_id: 'prod-1', size: 'S', color_name_vi: 'Xám đá', color_name_en: 'Slate Gray', color_hex: '#708090', stock_quantity: 0, price_adjustment: 0, sku: 'TS-LN-01-G-S' },
      { id: 'var-1-5', product_id: 'prod-1', size: 'M', color_name_vi: 'Xám đá', color_name_en: 'Slate Gray', color_hex: '#708090', stock_quantity: 12, price_adjustment: 0, sku: 'TS-LN-01-G-M' }
    ],
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'prod-2',
    name_vi: 'Đầm lụa midi dáng suông',
    name_en: 'Silk Midi Slip Dress',
    slug: 'silk-midi-slip-dress',
    description_vi: 'Đầm hai dây lụa cao cấp với đường cắt xéo tôn dáng tinh tế. Chất lụa mềm mại lướt nhẹ trên da tạo cảm giác bay bổng sang trọng.',
    description_en: 'Premium silk slip dress with bias cut that flatters the silhouette. Soft silk glides gently on the skin for a luxurious flowy feel.',
    price: 1250000,
    compare_at_price: 1550000,
    category_id: 'cat-3',
    is_featured: true,
    is_new_arrival: false,
    is_active: true,
    stock_quantity: 18,
    sku: 'DR-SK-02',
    tags: ['silk', 'dress', 'midi', 'luxury'],
    materials_vi: '85% Lụa tơ tằm tự nhiên, 15% Viscose',
    materials_en: '85% Mulberry Silk, 15% Viscose',
    care_instructions_vi: 'Giặt hấp khô hoặc giặt tay bằng sữa tắm nhẹ. Phơi trong bóng râm.',
    care_instructions_en: 'Dry clean or hand wash using mild soap. Hang to dry in shade.',
    images: [
      { id: 'img-2-1', product_id: 'prod-2', url: '/src/assets/products/silk_dress_1.png', alt_vi: 'Đầm lụa vàng cát', alt_en: 'Champagne silk dress', display_order: 1, is_primary: true },
      { id: 'img-2-2', product_id: 'prod-2', url: '/src/assets/products/silk_dress_2.png', alt_vi: 'Đầm lụa đen huyền bí', alt_en: 'Midnight black silk dress', display_order: 2, is_primary: false }
    ],
    variants: [
      { id: 'var-2-1', product_id: 'prod-2', size: 'S', color_name_vi: 'Vàng cát', color_name_en: 'Champagne Gold', color_hex: '#e8d8c8', stock_quantity: 5, price_adjustment: 0, sku: 'DR-SK-02-C-S' },
      { id: 'var-2-2', product_id: 'prod-2', size: 'M', color_name_vi: 'Vàng cát', color_name_en: 'Champagne Gold', color_hex: '#e8d8c8', stock_quantity: 6, price_adjustment: 0, sku: 'DR-SK-02-C-M' },
      { id: 'var-2-3', product_id: 'prod-2', size: 'S', color_name_vi: 'Đen tuyền', color_name_en: 'Midnight Black', color_hex: '#111111', stock_quantity: 4, price_adjustment: 0, sku: 'DR-SK-02-B-S' },
      { id: 'var-2-4', product_id: 'prod-2', size: 'M', color_name_vi: 'Đen tuyền', color_name_en: 'Midnight Black', color_hex: '#111111', stock_quantity: 3, price_adjustment: 0, sku: 'DR-SK-02-B-M' }
    ],
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'prod-3',
    name_vi: 'Áo khoác Trench Coat cổ điển',
    name_en: 'Classic Double-Breasted Trench Coat',
    slug: 'classic-double-breasted-trench-coat',
    description_vi: 'Chiếc áo khoác trench coat vượt thời gian với phom dáng cứng cáp, chống thấm nước nhẹ. Thiết kế thắt đai eo tôn dáng gọn gàng.',
    description_en: 'A timeless trench coat featuring a structured silhouette and water-resistant fabric. Belted waist design for a tailored look.',
    price: 1850000,
    category_id: 'cat-4',
    is_featured: true,
    is_new_arrival: true,
    is_active: true,
    stock_quantity: 12,
    sku: 'OW-TC-03',
    tags: ['trench coat', 'outerwear', 'classic', 'winter'],
    materials_vi: '70% Cotton Gabardine, 30% Polyester',
    materials_en: '70% Cotton Gabardine, 30% Polyester',
    care_instructions_vi: 'Giặt khô chuyên nghiệp. Tránh giặt máy làm mất phom áo.',
    care_instructions_en: 'Professional dry clean only. Avoid machine washing to preserve structure.',
    images: [
      { id: 'img-3-1', product_id: 'prod-3', url: '/src/assets/products/trench_coat_1.png', alt_vi: 'Áo khoác trench coat màu kaki', alt_en: 'Khaki trench coat', display_order: 1, is_primary: true }
    ],
    variants: [
      { id: 'var-3-1', product_id: 'prod-3', size: 'S', color_name_vi: 'Vàng Kaki', color_name_en: 'Classic Khaki', color_hex: '#c3b091', stock_quantity: 3, price_adjustment: 0, sku: 'OW-TC-03-K-S' },
      { id: 'var-3-2', product_id: 'prod-3', size: 'M', color_name_vi: 'Vàng Kaki', color_name_en: 'Classic Khaki', color_hex: '#c3b091', stock_quantity: 5, price_adjustment: 0, sku: 'OW-TC-03-K-M' },
      { id: 'var-3-3', product_id: 'prod-3', size: 'L', color_name_vi: 'Vàng Kaki', color_name_en: 'Classic Khaki', color_hex: '#c3b091', stock_quantity: 4, price_adjustment: 0, sku: 'OW-TC-03-K-L' }
    ],
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'prod-4',
    name_vi: 'Quần tây xếp ly ống rộng',
    name_en: 'Pleated Wide-Leg Trousers',
    slug: 'pleated-wide-leg-trousers',
    description_vi: 'Quần tây với thiết kế xếp ly tinh tế phía trước, cạp cao tôn dáng, ống quần rộng tạo chuyển động thướt tha khi di chuyển.',
    description_en: 'Trousers featuring elegant front pleats, high-rise waist for leg-lengthening silhouette, and a wide-leg cut for fluid movement.',
    price: 790000,
    compare_at_price: 950000,
    category_id: 'cat-2',
    is_featured: false,
    is_new_arrival: true,
    is_active: true,
    stock_quantity: 3, // Low stock warning test
    sku: 'BT-TR-04',
    tags: ['pants', 'trousers', 'wide-leg', 'office'],
    materials_vi: '75% Polyester, 20% Rayon, 5% Spandex',
    materials_en: '75% Polyester, 20% Rayon, 5% Spandex',
    care_instructions_vi: 'Giặt máy ở chế độ nhẹ nhàng. Ủi nhẹ ở nhiệt độ thấp.',
    care_instructions_en: 'Machine wash in gentle cycle. Cool iron if needed.',
    images: [
      { id: 'img-4-1', product_id: 'prod-4', url: '/src/assets/products/wide_pants_1.png', alt_vi: 'Quần tây xếp ly đen', alt_en: 'Black pleated trousers', display_order: 1, is_primary: true }
    ],
    variants: [
      { id: 'var-4-1', product_id: 'prod-4', size: 'S', color_name_vi: 'Đen tuyền', color_name_en: 'Midnight Black', color_hex: '#111111', stock_quantity: 1, price_adjustment: 0, sku: 'BT-TR-04-B-S' },
      { id: 'var-4-2', product_id: 'prod-4', size: 'M', color_name_vi: 'Đen tuyền', color_name_en: 'Midnight Black', color_hex: '#111111', stock_quantity: 2, price_adjustment: 0, sku: 'BT-TR-04-B-M' }
    ],
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'prod-5',
    name_vi: 'Áo thun bông hữu cơ cổ tròn',
    name_en: 'Organic Cotton Crewneck Tee',
    slug: 'organic-cotton-crewneck-tee',
    description_vi: 'Mẫu áo phông cơ bản hoàn hảo, dệt từ 100% bông hữu cơ siêu mềm mịn, mang lại cảm giác thoải mái tối đa suốt cả ngày.',
    description_en: 'The perfect essential tee, knitted from 100% ultra-soft organic cotton. Delivers absolute comfort all day long.',
    price: 350000,
    category_id: 'cat-1',
    is_featured: false,
    is_new_arrival: false,
    is_active: true,
    stock_quantity: 80,
    sku: 'TS-CT-05',
    tags: ['basic', 'tee', 'cotton', 'everyday'],
    materials_vi: '100% Bông hữu cơ đã được chứng nhận',
    materials_en: '100% Certified Organic Cotton',
    care_instructions_vi: 'Giặt máy bình thường với các đồ cùng màu. Sấy ở nhiệt độ thấp.',
    care_instructions_en: 'Machine wash warm with like colors. Tumble dry low.',
    images: [
      { id: 'img-5-1', product_id: 'prod-5', url: '/src/assets/products/cotton_tee_1.png', alt_vi: 'Áo thun cotton sữa', alt_en: 'Milk cotton tee', display_order: 1, is_primary: true }
    ],
    variants: [
      { id: 'var-5-1', product_id: 'prod-5', size: 'S', color_name_vi: 'Kem Sữa', color_name_en: 'Cream', color_hex: '#f5f5dc', stock_quantity: 30, price_adjustment: 0, sku: 'TS-CT-05-CR-S' },
      { id: 'var-5-2', product_id: 'prod-5', size: 'M', color_name_vi: 'Kem Sữa', color_name_en: 'Cream', color_hex: '#f5f5dc', stock_quantity: 30, price_adjustment: 0, sku: 'TS-CT-05-CR-M' },
      { id: 'var-5-3', product_id: 'prod-5', size: 'L', color_name_vi: 'Kem Sữa', color_name_en: 'Cream', color_hex: '#f5f5dc', stock_quantity: 20, price_adjustment: 0, sku: 'TS-CT-05-CR-L' }
    ],
    created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'prod-6',
    name_vi: 'Giày búp bê da mềm',
    name_en: 'Soft Leather Ballet Flats',
    slug: 'soft-leather-ballet-flats',
    description_vi: 'Giày búp bê da cừu thật mềm mại, ôm chân tinh tế. Đế da mỏng có lớp lót cao su chống trượt giúp từng bước chân êm ái nhẹ nhàng.',
    description_en: 'Ballet flats crafted from butter-soft sheepskin leather. Thin leather sole with slip-resistant rubber pod ensures comfortable strides.',
    price: 1450000,
    compare_at_price: 1850000,
    category_id: 'cat-6',
    is_featured: false,
    is_new_arrival: false,
    is_active: true,
    stock_quantity: 20,
    sku: 'FW-BF-06',
    tags: ['flats', 'shoes', 'leather', 'ballet'],
    materials_vi: '100% Da cừu thật nhập khẩu, lót da dê',
    materials_en: '100% Imported Sheepskin Leather, goatskin lining',
    care_instructions_vi: 'Tránh đi mưa. Lau bằng khăn cotton mềm khô. Đánh xi dưỡng da định kỳ.',
    care_instructions_en: 'Avoid wearing in rain. Wipe with a dry soft cotton cloth. Apply leather balm regularly.',
    images: [
      { id: 'img-6-1', product_id: 'prod-6', url: '/src/assets/products/ballet_flats_1.png', alt_vi: 'Giày búp bê da đen', alt_en: 'Black leather ballet flats', display_order: 1, is_primary: true }
    ],
    variants: [
      { id: 'var-6-1', product_id: 'prod-6', size: '36', color_name_vi: 'Đen bóng', color_name_en: 'Nero Black', color_hex: '#151515', stock_quantity: 5, price_adjustment: 0, sku: 'FW-BF-06-B-36' },
      { id: 'var-6-2', product_id: 'prod-6', size: '37', color_name_vi: 'Đen bóng', color_name_en: 'Nero Black', color_hex: '#151515', stock_quantity: 10, price_adjustment: 0, sku: 'FW-BF-06-B-37' },
      { id: 'var-6-3', product_id: 'prod-6', size: '38', color_name_vi: 'Đen bóng', color_name_en: 'Nero Black', color_hex: '#151515', stock_quantity: 5, price_adjustment: 0, sku: 'FW-BF-06-B-38' }
    ],
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Initial mock customers
export const DEFAULT_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    full_name: 'Nguyễn Văn Minh',
    email: 'minh.nguyen@gmail.com',
    phone: '0901234567',
    avatar_url: '',
    role: 'customer',
    total_spent: 3850000,
    order_count: 2,
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'cust-2',
    full_name: 'Lê Thị Khánh Huyền',
    email: 'huyen.le@gmail.com',
    phone: '0918765432',
    avatar_url: '',
    role: 'customer',
    total_spent: 1250000,
    order_count: 1,
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'cust-3',
    full_name: 'Trần Hoàng Bách',
    email: 'bach.tran@admin.com',
    phone: '0988888888',
    avatar_url: '',
    role: 'admin',
    total_spent: 0,
    order_count: 0,
    created_at: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Initial mock orders
export const DEFAULT_ORDERS: Order[] = [
  {
    id: 'ord-1',
    order_number: 'KTL-20260610-84512',
    status: 'delivered',
    shipping_first_name: 'Nguyễn',
    shipping_last_name: 'Văn Minh',
    shipping_email: 'minh.nguyen@gmail.com',
    shipping_phone: '0901234567',
    shipping_address: '123 Nguyễn Huệ, Phường Bến Nghé',
    shipping_city: 'Hồ Chí Minh',
    shipping_postal_code: '70000',
    shipping_country: 'VN',
    subtotal: 2500000,
    shipping_fee: 50000,
    tax: 0,
    discount: 0,
    total: 2550000,
    payment_method: 'credit_card',
    payment_status: 'paid',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        id: 'ord-item-1-1',
        order_id: 'ord-1',
        product_id: 'prod-2',
        variant_id: 'var-2-1',
        product_name: 'Đầm lụa midi dáng suông',
        variant_info: 'Vàng cát / S',
        quantity: 2,
        unit_price: 1250000,
        total_price: 2500000,
        image_url: '/src/assets/products/silk_dress_1.png'
      }
    ],
    notes: 'Giao hàng giờ hành chính giúp em.'
  },
  {
    id: 'ord-2',
    order_number: 'KTL-20260611-37941',
    status: 'processing',
    shipping_first_name: 'Lê',
    shipping_last_name: 'Thị Khánh Huyền',
    shipping_email: 'huyen.le@gmail.com',
    shipping_phone: '0918765432',
    shipping_address: '456 Lê Lợi, Quận 1',
    shipping_city: 'Hồ Chí Minh',
    shipping_postal_code: '70000',
    shipping_country: 'VN',
    subtotal: 1300000,
    shipping_fee: 30000,
    tax: 0,
    discount: 30000,
    total: 1300000,
    payment_method: 'cod',
    payment_status: 'pending',
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        id: 'ord-item-2-1',
        order_id: 'ord-2',
        product_id: 'prod-1',
        variant_id: 'var-1-2',
        product_name: 'Áo sơ mi linen cổ trụ',
        variant_info: 'Trắng tinh khôi / M',
        quantity: 2,
        unit_price: 650000,
        total_price: 1300000,
        image_url: '/src/assets/products/linen_shirt_1.png'
      }
    ]
  }
];

// Helper to interact with LocalStorage
const getStorageItem = <T>(key: string, defaultValue: T): T => {
  const item = localStorage.getItem(key);
  if (!item) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  return JSON.parse(item);
};

const setStorageItem = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const mockDb = {
  initialize: () => {
    getStorageItem('ktl_categories', DEFAULT_CATEGORIES);
    getStorageItem('ktl_products', DEFAULT_PRODUCTS);
    getStorageItem('ktl_customers', DEFAULT_CUSTOMERS);
    getStorageItem('ktl_orders', DEFAULT_ORDERS);
  },

  // Categories CRUD
  getCategories: (): Category[] => {
    return getStorageItem('ktl_categories', DEFAULT_CATEGORIES);
  },

  // Products CRUD
  getProducts: (): Product[] => {
    return getStorageItem('ktl_products', DEFAULT_PRODUCTS);
  },

  getProductById: (id: string): Product | undefined => {
    const products = getStorageItem('ktl_products', DEFAULT_PRODUCTS);
    return products.find(p => p.id === id);
  },

  getProductBySlug: (slug: string): Product | undefined => {
    const products = getStorageItem('ktl_products', DEFAULT_PRODUCTS);
    return products.find(p => p.slug === slug);
  },

  saveProduct: (product: Product): Product => {
    const products = getStorageItem('ktl_products', DEFAULT_PRODUCTS);
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) {
      products[index] = { ...product };
    } else {
      products.push(product);
    }
    setStorageItem('ktl_products', products);
    return product;
  },

  deleteProduct: (id: string): boolean => {
    const products = getStorageItem('ktl_products', DEFAULT_PRODUCTS);
    const filtered = products.filter(p => p.id !== id);
    if (filtered.length !== products.length) {
      setStorageItem('ktl_products', filtered);
      return true;
    }
    return false;
  },

  // Customers CRUD
  getCustomers: (): Customer[] => {
    return getStorageItem('ktl_customers', DEFAULT_CUSTOMERS);
  },

  // Orders CRUD
  getOrders: (): Order[] => {
    return getStorageItem('ktl_orders', DEFAULT_ORDERS);
  },

  updateOrderStatus: (id: string, status: Order['status'], paymentStatus?: Order['payment_status']): Order | undefined => {
    const orders = getStorageItem('ktl_orders', DEFAULT_ORDERS);
    const orderIndex = orders.findIndex(o => o.id === id);
    if (orderIndex >= 0) {
      orders[orderIndex].status = status;
      if (paymentStatus) {
        orders[orderIndex].payment_status = paymentStatus;
      }
      setStorageItem('ktl_orders', orders);
      return orders[orderIndex];
    }
    return undefined;
  },

  createOrder: (orderInput: Omit<Order, 'id' | 'order_number' | 'created_at'>): Order => {
    const orders = getStorageItem('ktl_orders', DEFAULT_ORDERS);
    const randomNumber = Math.floor(10000 + Math.random() * 90000);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    
    const newOrder: Order = {
      ...orderInput,
      id: 'ord-' + Math.random().toString(36).substr(2, 9),
      order_number: `KTL-${dateStr}-${randomNumber}`,
      created_at: new Date().toISOString()
    };

    orders.unshift(newOrder); // Add to beginning of orders
    setStorageItem('ktl_orders', orders);

    // Subtract from Warehouse stock
    const products = getStorageItem('ktl_products', DEFAULT_PRODUCTS);
    newOrder.items.forEach(item => {
      const prodIndex = products.findIndex(p => p.id === item.product_id);
      if (prodIndex >= 0) {
        // Decrement overall stock
        products[prodIndex].stock_quantity = Math.max(0, products[prodIndex].stock_quantity - item.quantity);
        
        // Decrement variant stock
        if (item.variant_id) {
          const varIndex = products[prodIndex].variants.findIndex(v => v.id === item.variant_id);
          if (varIndex >= 0) {
            products[prodIndex].variants[varIndex].stock_quantity = Math.max(0, products[prodIndex].variants[varIndex].stock_quantity - item.quantity);
          }
        }
      }
    });
    setStorageItem('ktl_products', products);

    // Update customer spending metrics
    const customers = getStorageItem('ktl_customers', DEFAULT_CUSTOMERS);
    const custIndex = customers.findIndex(c => c.email.toLowerCase() === orderInput.shipping_email.toLowerCase());
    if (custIndex >= 0) {
      customers[custIndex].total_spent += orderInput.total;
      customers[custIndex].order_count += 1;
    } else {
      // Create a customer profile if first-time checkout
      customers.push({
        id: 'cust-' + Math.random().toString(36).substr(2, 9),
        full_name: `${orderInput.shipping_first_name} ${orderInput.shipping_last_name}`,
        email: orderInput.shipping_email,
        phone: orderInput.shipping_phone,
        role: 'customer',
        total_spent: orderInput.total,
        order_count: 1,
        created_at: new Date().toISOString()
      });
    }
    setStorageItem('ktl_customers', customers);

    return newOrder;
  }
};

