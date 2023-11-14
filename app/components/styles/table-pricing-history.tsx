import { format } from 'date-fns';
import type { TrackingResponse } from '~/interfaces/tracking-schema';
import { dateFormat } from '~/utils/const';

type Props = {
  item: TrackingResponse;
};

export const TablePricingHistory = ({ item }: Props) => {
  const sortedPrices = [...item.prices].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <>
      {sortedPrices.map((priceObj, i) => (
        <div key={String(priceObj.date)} className='flex w-full justify-center'>
          <p
            className={`min-w-[12rem] py-2 pr-4 border-r-2 border-indigo-700 text-right ${
              i !== item.prices.length - 1 && 'border-b-2'
            }`}
          >
            <span className='text-xs text-slate-400'>Fecha: </span>
            {format(new Date(priceObj.date), dateFormat.euWithTime)}
          </p>
          <p
            className={`pl-4 py-2 min-w-[8rem] text-left ${
              i !== item.prices.length - 1 && 'border-b-2 border-indigo-700'
            }`}
          >
            <span className='text-xs text-slate-400'>Precio: </span>
            {priceObj.price + item.currency}
          </p>
        </div>
      ))}
    </>
  );
};
