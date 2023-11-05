export const transformDecimalOperator = (price: string) =>
  price.includes(',') ? price.replace(',', '.') : price;
