// import { Delete, EventSeat, Restaurant, Schedule } from '@mui/icons-material';

export interface Voucher {
  id: string;
  code: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usageCount?: number;
  usageLimitPerUser?: number;
  expiryDate: string;
  canUse: boolean;
  isActive: boolean;
}

export interface VoucherListResponse {
  vouchers: Voucher[];
  totalPages: number;
  totalCount: number;
  currentPage: number;
}

export const getExpirationLabel = (voucher: Voucher) => {
  const now = new Date();
  const expiry = new Date(voucher.expiryDate);
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { label: 'Đã hết hạn', color: 'error' as const };
  } else if (diffDays <= 3) {
    return { label: `Còn ${diffDays} ngày`, color: 'warning' as const };
  } else if (diffDays <= 7) {
    return { label: `Còn ${diffDays} ngày`, color: 'info' as const };
  } else {
    return { label: `Còn ${diffDays} ngày`, color: 'success' as const };
  }
};

export const getDiscountDisplay = (
  discountType: string,
  discountValue: number,
  maxDiscountAmount?: number,
) => {
  if (discountType === 'percentage') {
    return `Giảm ${discountValue}%${
      maxDiscountAmount ? ` (tối đa ${maxDiscountAmount.toLocaleString('vi-VN')}₫)` : ''
    }`;
  } else {
    return `Giảm ${discountValue.toLocaleString('vi-VN')}₫`;
  }
};

export const filterVouchers = (vouchers: Voucher[], searchTerm: string): Voucher[] => {
  if (!searchTerm.trim()) return vouchers;

  const term = searchTerm.toLowerCase();
  return vouchers.filter(
    (voucher) =>
      voucher.name.toLowerCase().includes(term) ||
      voucher.code.toLowerCase().includes(term) ||
      voucher.description.toLowerCase().includes(term),
  );
};

export const formatPrice = (price: string | number): string => {
  const numPrice = typeof price === 'string' ? Number.parseFloat(price) : price;
  return new Intl.NumberFormat('vi-VN').format(numPrice) + ' ₫';
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// Format currency function
export const formatCurrency = (amount: string | number): string => {
  const numAmount = typeof amount === 'string' ? Number.parseFloat(amount) : amount;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(numAmount);
};

// Format date function
export const formatDateVietNam = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('vi-VN');
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'warning';
    case 'CONFIRMED':
      return 'success';
    case 'CANCELLED':
      return 'error';
    case 'COMPLETED':
      return 'info';
    default:
      return 'default';
  }
};

export const getStatusText = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'Chờ xác nhận';
    case 'CONFIRMED':
      return 'Đã xác nhận';
    case 'CANCELLED':
      return 'Đã hủy';
    case 'COMPLETED':
      return 'Hoàn thành';
    default:
      return status;
  }
};

export const formatCurrencyV2 = (amount: string | number) => {
  const num = typeof amount === 'string' ? Number.parseFloat(amount) : amount;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(num);
};

export const formatDateV2 = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatTime = (timeString: string) => {
  return timeString.substring(0, 5);
};
