import { useNavigate } from '@remix-run/react';
import { format } from 'date-fns';
import type { TrackingResponse } from '~/interfaces/tracking-schema';
import { dateFormat } from '~/utils/const';
import { RegularButton } from '../styles/regular-button';

type Props = {
  item: TrackingResponse;
};

export const CarouselItemCard = ({ item }: Props) => {
  const navigate = useNavigate();

  const navigateToItem = () => navigate(`/item/${item.id}`);

  return (
    <div className='shadow-lg m-2 my-4 pb-4 h-[36rem] rounded-lg bg-white'>
      <div className='h-[50%] overflow-hidden rounded-lg'>
        <img
          className='object-cover w-full h-full hover:scale-105 transition-transform'
          src={item.image}
          alt={item.name}
        />
      </div>
      <div className='px-4 h-[50%] flex flex-col justify-between'>
        <div>
          <p className='text-indigo-600 font-semibold'>{item.name}</p>
          <div className='text-sm my-2'>
            Últimos precios:
            <ul>
              {item.prices.slice(0, 5).map((priceObj) => (
                <li className='flex gap-2 text-sm'>
                  <p>
                    <span className='text-xs text-slate-400'>Fecha: </span>
                    {format(new Date(priceObj.date), dateFormat.euWithTime)}
                  </p>
                  <p>
                    <span className='text-xs text-slate-400'>Precio: </span>
                    {priceObj.price + item.currency}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className='flex justify-between'>
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
          <RegularButton content='Seguimiento' onClick={navigateToItem} />
        </div>
      </div>
    </div>
  );
};
