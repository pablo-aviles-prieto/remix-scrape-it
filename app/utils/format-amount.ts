import { formatterUSTwoDecimals } from './const';

export const formatAmount = (price: number) => {
  if (isNaN(price)) return '--';
  return formatterUSTwoDecimals.format(price);
};
