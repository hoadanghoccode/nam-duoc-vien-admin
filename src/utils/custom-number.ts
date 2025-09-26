export const ConvertNumber = (index: number) => {
  if (index == 0) {
    return '0';
  }

  if (!index) {
    return '0';
  }

  if (index >= 1_000_000_000) {
    const value = Math.floor((index / 1_000_000_000) * 10) / 10;
    return value.toString().includes('.') ? `${value}B` : `${value}B`;
  } else if (index >= 1_000_000) {
    const value = Math.floor((index / 1_000_000) * 10) / 10;
    return value.toString().includes('.') ? `${value}M` : `${value}M`;
  } else if (index >= 1_000) {
    const value = Math.floor((index / 1_000) * 10) / 10;
    return value.toString().includes('.') ? `${value}K` : `${value}K`;
  } else {
    return `${index?.toLocaleString('vi-VN')}`;
  }
};

export const formatBinary = (num: number | string): string => {
  const parsedNum = typeof num === 'string' ? parseFloat(num) : num;

  if (isNaN(parsedNum)) {
    throw new Error('Invalid number input');
  }

  const integerPart = Math.floor(parsedNum).toString(2);
  const decimalPart = Math.round((parsedNum % 1) * 100);
  return `${integerPart}.${decimalPart}`;
};
export const FormattedNumber = (index: number | string) => {
  const value = typeof index === 'string' ? parseFloat(index) : index;

  if (isNaN(value)) {
    return '';
  }

  const formattedValue = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);

  return formattedValue;
};

export const FormatPoint = (index: number | string) => {
  const value = typeof index === 'string' ? parseFloat(index) : index;

  if (isNaN(value)) {
    return '';
  }

  const formattedValue = new Intl.NumberFormat('vi-VN').format(value);

  return formattedValue;
};
export const FormattedNumberNotExtension = (index: number) => {
  const formattedValue = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(index);
  return formattedValue.replace('₫', '').trim();
};

export const convertNumber = (index: number) => {
  if (index == 0) {
    return '0';
  }

  if (!index) {
    return '';
  }

  if (index >= 1_000_000_000) {
    const value = Math.floor((index / 1_000_000_000) * 10) / 10;
    return value.toString().includes('.') ? `${value}B` : `${value}B`;
  } else if (index >= 1_000_000) {
    const value = Math.floor((index / 1_000_000) * 10) / 10;
    return value.toString().includes('.') ? `${value}M` : `${value}M`;
  } else if (index >= 1_000) {
    const value = Math.floor((index / 1_000) * 10) / 10;
    return value.toString().includes('.') ? `${value}K` : `${value}K`;
  } else {
    return `${index?.toLocaleString('vi-VN')}`;
  }
};
