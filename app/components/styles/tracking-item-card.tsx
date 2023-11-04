import type { TrackingResponse } from '~/interfaces/tracking-schema';
import { RegularButton } from './regular-button';

type Props = {
  item: TrackingResponse;
};

export const TrackingItemCard = ({ item }: Props) => {
  // const lastPrice =
  //   item.prices.length > 0
  //     ? item.prices[item.prices.length - 1].price
  //     : undefined;

  const { [item.prices.length - 1]: lastPrices } = item.prices;

  return (
    <div className='py-6'>
      <div className='flex mx-auto max-w-3xl bg-white shadow-lg rounded-lg overflow-hidden'>
        <img className='w-2/5 bg-cover' src={item.image} />
        <div className='w-3/5 p-4 flex flex-col justify-between'>
          <div>
            <h1 className='text-gray-900 font-bold text-2xl'>{item.name}</h1>
            <p className='mt-2 text-gray-600 text-sm'>
              Subscríbete para que te llege diariamente al correo el seguimiento
              de este producto!
            </p>
            <h1 className='text-gray-700 font-bold text-xl my-2'>
              {lastPrices.price + item.currency}{' '}
              <span className='text-[10px] uppercase'>
                Último precio ({lastPrices.date as unknown as string})
              </span>
            </h1>
          </div>
          <div className='flex item-center justify-between mt-3'>
            <a
              className='select-none rounded-lg bg-transparent py-3 px-6 text-center align-middle font-sans text-xs font-bold 
              uppercase text-indigo-600 shadow-md shadow-indigo-300/20 transition-all hover:shadow-lg border border-indigo-600
             hover:shadow-indigo-300/30 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] 
              active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none'
              href={item.url}
              target='_blank'
              rel='noopener noreferrer'
            >
              Visitar página
            </a>
            <RegularButton
              content='Subscribirse'
              onClick={() =>
                console.log(
                  'Open modal to provide a mail. Modal explains how to unsubscribe'
                )
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};
