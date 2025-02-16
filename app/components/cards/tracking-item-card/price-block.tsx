import { format } from 'date-fns';
import type { IPrices } from '~/interfaces';
import { dateFormat } from '~/utils/const';

interface PriceBlockProps {
  lastPrice?: IPrices;
  currency?: string;
}

export const PriceBlock = ({ lastPrice, currency }: PriceBlockProps) => {
  return (
    <h1 className='text-gray-700 font-bold text-xl mt-2'>
      {lastPrice && currency ? (
        <>
          {lastPrice.price + currency}{' '}
          <span className='text-[10px] uppercase'>
            Último precio ({format(new Date(lastPrice.date), dateFormat.euWithTime)})
          </span>
        </>
      ) : (
        <span className='text-[10px] uppercase'>No hay precios registrados</span>
      )}
    </h1>
  );
};
