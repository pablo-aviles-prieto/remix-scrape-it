export const parsedDisplayedPriceString = (price: string, currency: string) => {
  if (isNaN(parseFloat(price))) return `-- ${currency}`;
  return `${price}${currency}`;
};
