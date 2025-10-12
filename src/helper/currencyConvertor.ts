export const currencyConvertor = (amount: number, currency: string='INR') => {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  });

  return formatter.format(amount);
}