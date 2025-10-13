// src/utils/helpers.js
// General utility functions

export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
};

export const getTimestamp = () => {
  return Date.now();
};

