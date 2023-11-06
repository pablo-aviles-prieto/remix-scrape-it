export const transformDecimalOperator = (price: string) => {
  return price.replace(/\./g, '').replace(',', '.');
};
