import { RON_CONVERSION_RATE_TO_EURO } from './const';
import { formatAmount } from './format-amount';
import { parseAmount } from './parse-amount';

export const parseAliexpressPrice = (price: string) => {
  if (price.includes('€')) {
    const removedEuroSymbol = price.replaceAll('€', '');
    return formatAmount(parseAmount(removedEuroSymbol));
  } else if (price.includes('RON')) {
    const removedRonSymbol = price.replaceAll('RON', '');
    return formatAmount(
      parseAmount(removedRonSymbol) * RON_CONVERSION_RATE_TO_EURO
    );
  }
  return price;
};
