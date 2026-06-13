/**
 * Format numeric value to Vietnamese Dong (VND) currency string
 */
export const formatPriceVND = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(price);
};

/**
 * Format numeric value to USD (fallback/alternative)
 */
export const formatPriceUSD = (price: number): string => {
  // Let's assume an exchange rate of 1 USD = 25,000 VND for nice display conversion
  const usdPrice = price / 25000;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(usdPrice);
};

/**
 * Format date string to local readable format
 */
export const formatDate = (dateString: string, locale: 'vi' | 'en' = 'vi'): string => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  if (locale === 'vi') {
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Simple SKU generator helper
 */
export const generateSKU = (categorySlug: string, name: string): string => {
  const cleanCat = categorySlug.substring(0, 2).toUpperCase();
  const cleanName = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-zA-Z0-9]/g, '') // Remove special chars
    .substring(0, 3)
    .toUpperCase();
  const rand = Math.floor(10 + Math.random() * 90);
  return `${cleanCat}-${cleanName}-${rand}`;
};
