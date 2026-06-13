import { createClient } from '@supabase/supabase-js';
import { mockDb, DEFAULT_PRODUCTS, DEFAULT_ORDERS } from './mockDb';
import type { Product, Category, Customer, Order, HomepageSettings } from './mockDb';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabaseClient: any = null;
try {
  if (supabaseUrl && supabaseAnonKey) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
} catch (e) {
  console.error('Failed to initialize Supabase client:', e);
}

export const supabase = supabaseClient;

if (typeof window !== 'undefined') {
  mockDb.initialize();
}

let isSeeding = false;
let isSeeded = false;

// Helper to generate UUIDs
function generateUUID() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function ensureSeeded() {
  if (isSeeded || isSeeding) return;
  isSeeding = true;
  try {
    if (!supabase) {
      console.warn('Supabase is not initialized. Using local mockDb storage.');
      isSeeded = true; // Set to true so we don't try again
      isSeeding = false;
      return;
    }
    // 1. Fetch categories
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (catError) {
      console.warn('Supabase categories fetch failed, skipping seed:', catError.message);
      isSeeding = false;
      return;
    }

    // 2. Check if products exist
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.warn('Supabase products count check failed, skipping seed:', countError.message);
      isSeeding = false;
      return;
    }

    if (count === 0) {
      console.log('Supabase products table is empty. Seeding default products...');
      const slugMap: Record<string, string> = {
        'cat-1': 'tops',
        'cat-2': 'bottoms',
        'cat-3': 'dresses',
        'cat-4': 'outerwear',
        'cat-5': 'accessories',
        'cat-6': 'footwear'
      };

      const categorySlugToUuid: Record<string, string> = {};
      categories.forEach((c: any) => {
        categorySlugToUuid[c.slug] = c.id;
      });

      // Using statically imported DEFAULT_PRODUCTS

      for (const prod of DEFAULT_PRODUCTS) {
        const catSlug = slugMap[prod.category_id] || 'tops';
        const actualCatId = categorySlugToUuid[catSlug];
        if (!actualCatId) continue;

        const { data: newProd, error: prodErr } = await supabase
          .from('products')
          .insert({
            name_vi: prod.name_vi,
            name_en: prod.name_en,
            slug: prod.slug,
            description_vi: prod.description_vi,
            description_en: prod.description_en,
            price: prod.price,
            compare_at_price: prod.compare_at_price || null,
            category_id: actualCatId,
            is_featured: prod.is_featured,
            is_new_arrival: prod.is_new_arrival,
            is_active: prod.is_active,
            stock_quantity: prod.stock_quantity,
            sku: prod.sku,
            tags: prod.tags || [],
            materials_vi: prod.materials_vi,
            materials_en: prod.materials_en,
            care_instructions_vi: prod.care_instructions_vi,
            care_instructions_en: prod.care_instructions_en,
            created_at: prod.created_at
          })
          .select()
          .single();

        if (prodErr) {
          console.error(`Failed to seed product ${prod.name_en}:`, prodErr.message);
          continue;
        }

        if (prod.images && prod.images.length > 0) {
          const imgsToInsert = prod.images.map(img => ({
            product_id: newProd.id,
            url: img.url,
            alt_vi: img.alt_vi || '',
            alt_en: img.alt_en || '',
            display_order: img.display_order,
            is_primary: img.is_primary
          }));
          await supabase.from('product_images').insert(imgsToInsert);
        }

        if (prod.variants && prod.variants.length > 0) {
          const varsToInsert = prod.variants.map(v => ({
            product_id: newProd.id,
            size: v.size,
            color_name_vi: v.color_name_vi,
            color_name_en: v.color_name_en,
            color_hex: v.color_hex,
            stock_quantity: v.stock_quantity,
            price_adjustment: v.price_adjustment,
            sku: v.sku
          }));
          await supabase.from('product_variants').insert(varsToInsert);
        }
      }

      // Also seed default orders if orders is empty
      const { count: orderCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      if (orderCount === 0) {
        console.log('Supabase orders table is empty. Seeding default orders...');
        // Using statically imported DEFAULT_ORDERS
        const { data: dbProducts } = await supabase
          .from('products')
          .select(`
            *,
            variants:product_variants(*)
          `);

        if (dbProducts && dbProducts.length > 0) {
          for (const order of DEFAULT_ORDERS) {
            const orderItemsToInsert: any[] = [];
            let subtotal = 0;

            for (const item of order.items) {
              let originalSlug = 'band-collar-linen-shirt';
              if (item.product_id === 'prod-2') originalSlug = 'silk-midi-slip-dress';
              
              const matchedDbProd = dbProducts.find((p: any) => p.slug === originalSlug);
              if (matchedDbProd) {
                const matchedDbVar = matchedDbProd.variants?.[0];
                const unitPrice = Number(matchedDbProd.price);
                const totalPrice = unitPrice * item.quantity;
                subtotal += totalPrice;

                orderItemsToInsert.push({
                  product_id: matchedDbProd.id,
                  variant_id: matchedDbVar?.id || null,
                  product_name: matchedDbProd.name_en,
                  variant_info: matchedDbVar ? `${matchedDbVar.color_name_en} / ${matchedDbVar.size}` : null,
                  quantity: item.quantity,
                  unit_price: unitPrice,
                  total_price: totalPrice,
                  image_url: item.image_url
                });
              }
            }

            if (orderItemsToInsert.length > 0) {
              const { data: newOrder, error: orderErr } = await supabase
                .from('orders')
                .insert({
                  status: order.status,
                  shipping_first_name: order.shipping_first_name,
                  shipping_last_name: order.shipping_last_name,
                  shipping_email: order.shipping_email,
                  shipping_phone: order.shipping_phone,
                  shipping_address: order.shipping_address,
                  shipping_city: order.shipping_city,
                  shipping_postal_code: order.shipping_postal_code,
                  shipping_country: order.shipping_country,
                  subtotal: subtotal,
                  shipping_fee: order.shipping_fee,
                  tax: order.tax,
                  discount: order.discount,
                  total: subtotal + order.shipping_fee - order.discount,
                  payment_method: order.payment_method,
                  payment_status: order.payment_status,
                  notes: order.notes,
                  created_at: order.created_at
                })
                .select()
                .single();

              if (!orderErr && newOrder) {
                const itemsWithOrderId = orderItemsToInsert.map(i => ({
                  ...i,
                  order_id: newOrder.id
                }));
                await supabase.from('order_items').insert(itemsWithOrderId);
              }
            }
          }
        }
      }

      console.log('Supabase database successfully initialized with demo clothing store data.');
    }
    isSeeded = true;
  } catch (err) {
    console.warn('Database seeding failed:', err);
  } finally {
    isSeeding = false;
  }
}

export const db = {
  // Products
  getProducts: async (): Promise<Product[]> => {
    try {
      await ensureSeeded();
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          images:product_images(*),
          variants:product_variants(*)
        `)
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        if (error) console.warn('Supabase getProducts failed, falling back to mockDb:', error.message);
        return mockDb.getProducts();
      }

      return data.map((p: any) => ({
        ...p,
        price: Number(p.price),
        compare_at_price: p.compare_at_price ? Number(p.compare_at_price) : undefined,
        stock_quantity: Number(p.stock_quantity),
        images: (p.images || []).map((img: any) => ({
          ...img,
          display_order: Number(img.display_order),
          is_primary: Boolean(img.is_primary)
        })),
        variants: (p.variants || []).map((v: any) => ({
          ...v,
          stock_quantity: Number(v.stock_quantity),
          price_adjustment: Number(v.price_adjustment)
        }))
      })) as Product[];
    } catch (e) {
      console.warn('Error in getProducts, falling back to mockDb:', e);
      return mockDb.getProducts();
    }
  },

  getProductById: async (id: string): Promise<Product | undefined> => {
    try {
      if (id.startsWith('prod-')) {
        return mockDb.getProductById(id);
      }

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          images:product_images(*),
          variants:product_variants(*)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error || !data) {
        if (error) console.warn('Supabase getProductById failed, falling back to mockDb:', error.message);
        return mockDb.getProductById(id);
      }

      return {
        ...data,
        price: Number(data.price),
        compare_at_price: data.compare_at_price ? Number(data.compare_at_price) : undefined,
        stock_quantity: Number(data.stock_quantity),
        images: (data.images || []).map((img: any) => ({
          ...img,
          display_order: Number(img.display_order),
          is_primary: Boolean(img.is_primary)
        })),
        variants: (data.variants || []).map((v: any) => ({
          ...v,
          stock_quantity: Number(v.stock_quantity),
          price_adjustment: Number(v.price_adjustment)
        }))
      } as Product;
    } catch (e) {
      console.warn('Error in getProductById, falling back to mockDb:', e);
      return mockDb.getProductById(id);
    }
  },

  getProductBySlug: async (slug: string): Promise<Product | undefined> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          images:product_images(*),
          variants:product_variants(*)
        `)
        .eq('slug', slug)
        .maybeSingle();

      if (error || !data) {
        if (error) console.warn('Supabase getProductBySlug failed, falling back to mockDb:', error.message);
        return mockDb.getProductBySlug(slug);
      }

      return {
        ...data,
        price: Number(data.price),
        compare_at_price: data.compare_at_price ? Number(data.compare_at_price) : undefined,
        stock_quantity: Number(data.stock_quantity),
        images: (data.images || []).map((img: any) => ({
          ...img,
          display_order: Number(img.display_order),
          is_primary: Boolean(img.is_primary)
        })),
        variants: (data.variants || []).map((v: any) => ({
          ...v,
          stock_quantity: Number(v.stock_quantity),
          price_adjustment: Number(v.price_adjustment)
        }))
      } as Product;
    } catch (e) {
      console.warn('Error in getProductBySlug, falling back to mockDb:', e);
      return mockDb.getProductBySlug(slug);
    }
  },

  saveProduct: async (product: Product): Promise<Product> => {
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(product.id);
      const targetId = isUuid ? product.id : generateUUID();

      const productData = {
        name_vi: product.name_vi,
        name_en: product.name_en,
        slug: product.slug,
        description_vi: product.description_vi,
        description_en: product.description_en,
        price: product.price,
        compare_at_price: product.compare_at_price || null,
        category_id: product.category_id,
        is_featured: product.is_featured,
        is_new_arrival: product.is_new_arrival,
        is_active: product.is_active,
        stock_quantity: product.stock_quantity,
        sku: product.sku,
        tags: product.tags || [],
        materials_vi: product.materials_vi,
        materials_en: product.materials_en,
        care_instructions_vi: product.care_instructions_vi,
        care_instructions_en: product.care_instructions_en,
      };

      let saveErr = null;
      if (isUuid) {
        const { data: existing } = await supabase
          .from('products')
          .select('id')
          .eq('id', targetId)
          .maybeSingle();

        if (existing) {
          const { error } = await supabase
            .from('products')
            .update(productData)
            .eq('id', targetId);
          saveErr = error;
        } else {
          const { error } = await supabase
            .from('products')
            .insert({ id: targetId, ...productData });
          saveErr = error;
        }
      } else {
        const { error } = await supabase
          .from('products')
          .insert({ id: targetId, ...productData });
        saveErr = error;
      }

      if (saveErr) {
        throw new Error(saveErr.message);
      }

      // Save/Update Images
      await supabase.from('product_images').delete().eq('product_id', targetId);
      if (product.images && product.images.length > 0) {
        const imagesToInsert = product.images.map(img => {
          const imgUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(img.id)
            ? img.id
            : generateUUID();
          return {
            id: imgUuid,
            product_id: targetId,
            url: img.url,
            alt_vi: img.alt_vi || '',
            alt_en: img.alt_en || '',
            display_order: img.display_order || 0,
            is_primary: img.is_primary || false
          };
        });
        await supabase.from('product_images').insert(imagesToInsert);
      }

      // Save/Update Variants
      await supabase.from('product_variants').delete().eq('product_id', targetId);
      if (product.variants && product.variants.length > 0) {
        const variantsToInsert = product.variants.map(v => {
          const varUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v.id)
            ? v.id
            : generateUUID();
          return {
            id: varUuid,
            product_id: targetId,
            size: v.size,
            color_name_vi: v.color_name_vi,
            color_name_en: v.color_name_en,
            color_hex: v.color_hex,
            stock_quantity: v.stock_quantity,
            price_adjustment: v.price_adjustment || 0,
            sku: v.sku
          };
        });
        await supabase.from('product_variants').insert(variantsToInsert);
      }

      const updated = await db.getProductById(targetId);
      if (updated) return updated;
      throw new Error('Could not retrieve saved product');
    } catch (e: any) {
      console.warn('Supabase saveProduct failed, falling back to mockDb:', e.message || e);
      return mockDb.saveProduct(product);
    }
  },

  deleteProduct: async (id: string): Promise<boolean> => {
    try {
      if (id.startsWith('prod-')) {
        return mockDb.deleteProduct(id);
      }
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (e: any) {
      console.warn('Supabase deleteProduct failed, falling back to mockDb:', e.message || e);
      return mockDb.deleteProduct(id);
    }
  },

  // Categories
  getCategories: async (): Promise<Category[]> => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error || !data || data.length === 0) {
        if (error) console.warn('Supabase getCategories failed, falling back to mockDb:', error.message);
        return mockDb.getCategories();
      }

      return data as Category[];
    } catch (e) {
      console.warn('Error in getCategories, falling back to mockDb:', e);
      return mockDb.getCategories();
    }
  },

  updateCategory: async (category: Category): Promise<Category> => {
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category.id) ||
                     /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category.id);
      
      const payload = {
        name_vi: category.name_vi,
        name_en: category.name_en,
        slug: category.slug,
        description_vi: category.description_vi || null,
        description_en: category.description_en || null,
        image_url: category.image_url || null,
        display_order: category.display_order,
        is_active: category.is_active
      };

      if (isUuid) {
        const { error } = await supabase
          .from('categories')
          .update(payload)
          .eq('id', category.id);
        
        if (error) throw error;
      } else {
        return mockDb.updateCategory(category);
      }

      return category;
    } catch (e: any) {
      console.warn('Supabase updateCategory failed, falling back to mockDb:', e.message || e);
      return mockDb.updateCategory(category);
    }
  },

  // Settings
  getSettings: async (): Promise<HomepageSettings> => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        if (error) console.warn('Supabase getSettings failed, falling back to mockDb:', error.message);
        return mockDb.getSettings();
      }

      return data as HomepageSettings;
    } catch (e) {
      console.warn('Error in getSettings, falling back to mockDb:', e);
      return mockDb.getSettings();
    }
  },

  updateSettings: async (settings: HomepageSettings): Promise<HomepageSettings> => {
    try {
      const { data: existing, error: fetchError } = await supabase
        .from('settings')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) throw fetchError;

      const payload = {
        hero_title_vi: settings.hero_title_vi,
        hero_title_en: settings.hero_title_en,
        hero_subtitle_vi: settings.hero_subtitle_vi,
        hero_subtitle_en: settings.hero_subtitle_en,
        hero_image_url: settings.hero_image_url,
        campaign_quote_vi: settings.campaign_quote_vi,
        campaign_quote_en: settings.campaign_quote_en
      };

      if (existing) {
        const { error: updateError } = await supabase
          .from('settings')
          .update(payload)
          .eq('id', existing.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('settings')
          .insert(payload);

        if (insertError) throw insertError;
      }

      // Sync local storage
      mockDb.updateSettings(settings);

      return settings;
    } catch (e: any) {
      console.warn('Supabase updateSettings failed, falling back to mockDb:', e.message || e);
      return mockDb.updateSettings(settings);
    }
  },

  // Customers
  getCustomers: async (): Promise<Customer[]> => {
    try {
      const { data: profiles, error: profErr } = await supabase
        .from('profiles')
        .select('*');

      const { data: orders, error: ordErr } = await supabase
        .from('orders')
        .select('shipping_email, shipping_first_name, shipping_last_name, shipping_phone, total, created_at, user_id');

      if ((profErr || !profiles) && (ordErr || !orders)) {
        console.warn('Supabase getCustomers failed, falling back to mockDb');
        return mockDb.getCustomers();
      }

      const customerMap = new Map<string, Customer>();

      if (profiles) {
        profiles.forEach((p: any) => {
          customerMap.set(p.email.toLowerCase(), {
            id: p.id,
            full_name: p.full_name || p.email,
            email: p.email,
            phone: p.phone || '',
            avatar_url: p.avatar_url || '',
            role: (p.role as 'customer' | 'admin') || 'customer',
            total_spent: 0,
            order_count: 0,
            created_at: p.created_at
          });
        });
      }

      if (orders) {
        orders.forEach((o: any) => {
          const email = o.shipping_email ? o.shipping_email.toLowerCase() : '';
          if (!email) return;

          if (customerMap.has(email)) {
            const cust = customerMap.get(email)!;
            cust.total_spent += Number(o.total);
            cust.order_count += 1;
            if (!cust.phone && o.shipping_phone) {
              cust.phone = o.shipping_phone;
            }
          } else {
            customerMap.set(email, {
              id: 'guest-' + email,
              full_name: `${o.shipping_first_name || ''} ${o.shipping_last_name || ''}`.trim() || email,
              email: o.shipping_email,
              phone: o.shipping_phone || '',
              role: 'customer',
              total_spent: Number(o.total),
              order_count: 1,
              created_at: o.created_at
            });
          }
        });
      }

      return Array.from(customerMap.values());
    } catch (e) {
      console.warn('Error in getCustomers, falling back to mockDb:', e);
      return mockDb.getCustomers();
    }
  },

  // Orders
  getOrders: async (): Promise<Order[]> => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        if (error) console.warn('Supabase getOrders failed, falling back to mockDb:', error.message);
        return mockDb.getOrders();
      }

      return data.map((o: any) => ({
        ...o,
        subtotal: Number(o.subtotal),
        shipping_fee: Number(o.shipping_fee),
        tax: Number(o.tax),
        discount: Number(o.discount),
        total: Number(o.total),
        items: (o.items || []).map((item: any) => ({
          ...item,
          unit_price: Number(item.unit_price),
          total_price: Number(item.total_price),
          quantity: Number(item.quantity)
        }))
      })) as Order[];
    } catch (e) {
      console.warn('Error in getOrders, falling back to mockDb:', e);
      return mockDb.getOrders();
    }
  },

  updateOrderStatus: async (id: string, status: Order['status'], paymentStatus?: Order['payment_status']): Promise<Order | undefined> => {
    try {
      if (id.startsWith('ord-')) {
        return mockDb.updateOrderStatus(id, status, paymentStatus);
      }

      const updatePayload: any = { status };
      if (paymentStatus) {
        updatePayload.payment_status = paymentStatus;
      }

      const { error } = await supabase
        .from('orders')
        .update(updatePayload)
        .eq('id', id);

      if (error) throw error;

      const { data: updatedOrder, error: fetchErr } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .eq('id', id)
        .single();

      if (fetchErr || !updatedOrder) throw fetchErr || new Error('Could not fetch updated order');

      return {
        ...updatedOrder,
        subtotal: Number(updatedOrder.subtotal),
        shipping_fee: Number(updatedOrder.shipping_fee),
        tax: Number(updatedOrder.tax),
        discount: Number(updatedOrder.discount),
        total: Number(updatedOrder.total),
        items: (updatedOrder.items || []).map((item: any) => ({
          ...item,
          unit_price: Number(item.unit_price),
          total_price: Number(item.total_price),
          quantity: Number(item.quantity)
        }))
      } as Order;
    } catch (e: any) {
      console.warn('Supabase updateOrderStatus failed, falling back to mockDb:', e.message || e);
      return mockDb.updateOrderStatus(id, status, paymentStatus);
    }
  },

  createOrder: async (orderInput: Omit<Order, 'id' | 'order_number' | 'created_at'>): Promise<Order> => {
    try {
      const orderData = {
        user_id: orderInput.user_id || null,
        status: orderInput.status || 'pending',
        shipping_first_name: orderInput.shipping_first_name,
        shipping_last_name: orderInput.shipping_last_name,
        shipping_email: orderInput.shipping_email,
        shipping_phone: orderInput.shipping_phone,
        shipping_address: orderInput.shipping_address,
        shipping_city: orderInput.shipping_city,
        shipping_postal_code: orderInput.shipping_postal_code,
        shipping_country: orderInput.shipping_country || 'VN',
        subtotal: orderInput.subtotal,
        shipping_fee: orderInput.shipping_fee,
        tax: orderInput.tax,
        discount: orderInput.discount,
        total: orderInput.total,
        payment_method: orderInput.payment_method,
        payment_status: orderInput.payment_status || 'pending',
        notes: orderInput.notes || null,
      };

      const { data: newOrder, error: orderErr } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderErr) throw orderErr;

      const orderItemsToInsert = orderInput.items.map(item => {
        const isProdUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.product_id);
        const isVarUuid = item.variant_id ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.variant_id) : false;

        return {
          order_id: newOrder.id,
          product_id: isProdUuid ? item.product_id : null,
          variant_id: isVarUuid ? item.variant_id : null,
          product_name: item.product_name,
          variant_info: item.variant_info || null,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          image_url: item.image_url || null
        };
      });

      const { error: itemsErr } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert);

      if (itemsErr) {
        await supabase.from('orders').delete().eq('id', newOrder.id);
        throw itemsErr;
      }

      // Decrement inventory stock
      for (const item of orderInput.items) {
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.product_id)) {
          const { data: prodData } = await supabase
            .from('products')
            .select('stock_quantity')
            .eq('id', item.product_id)
            .maybeSingle();

          if (prodData) {
            const newStock = Math.max(0, Number(prodData.stock_quantity) - item.quantity);
            await supabase
              .from('products')
              .update({ stock_quantity: newStock })
              .eq('id', item.product_id);
          }
        }

        if (item.variant_id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.variant_id)) {
          const { data: varData } = await supabase
            .from('product_variants')
            .select('stock_quantity')
            .eq('id', item.variant_id)
            .maybeSingle();

          if (varData) {
            const newVarStock = Math.max(0, Number(varData.stock_quantity) - item.quantity);
            await supabase
              .from('product_variants')
              .update({ stock_quantity: newVarStock })
              .eq('id', item.variant_id);
          }
        }
      }

      const { data: finalOrder, error: finalErr } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .eq('id', newOrder.id)
        .single();

      if (finalErr || !finalOrder) throw finalErr || new Error('Could not fetch final order');

      return {
        ...finalOrder,
        subtotal: Number(finalOrder.subtotal),
        shipping_fee: Number(finalOrder.shipping_fee),
        tax: Number(finalOrder.tax),
        discount: Number(finalOrder.discount),
        total: Number(finalOrder.total),
        items: (finalOrder.items || []).map((item: any) => ({
          ...item,
          unit_price: Number(item.unit_price),
          total_price: Number(item.total_price),
          quantity: Number(item.quantity)
        }))
      } as Order;
    } catch (e: any) {
      console.warn('Supabase createOrder failed, falling back to mockDb:', e.message || e);
      return mockDb.createOrder(orderInput);
    }
  }
};
