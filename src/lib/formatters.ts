
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
