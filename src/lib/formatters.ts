
/**
 * Format a number as RON currency
 */
export const formatCurrency = (value: number): string => {
  return `RON ${value.toLocaleString('ro-RO', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};
