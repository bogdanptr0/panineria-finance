
/**
 * Format a number as RON currency
 */
export const formatCurrency = (value: number): string => {
  return `RON ${value.toLocaleString('ro-RO', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

/**
 * Return a default value if the input is empty
 */
export const getDefaultIfEmpty = (value: string, defaultValue: string = "Unnamed"): string => {
  return value.trim() === "" ? defaultValue : value;
};

/**
 * Format number as percentage
 */
export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(2)}%`;
};

/**
 * Calculate percentage change between two values
 */
export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 1 : 0;
  return (current - previous) / Math.abs(previous);
};

/**
 * Format date to locale string
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('ro-RO', {
    year: 'numeric',
    month: 'long'
  });
};
