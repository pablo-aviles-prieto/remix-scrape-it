import { formatterUSTwoDecimals } from './const';

export const formatAmount = (price: number) => {
  return formatterUSTwoDecimals.format(price);
};
