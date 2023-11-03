import { useState } from 'react';
import type { SingleItemCoolmod } from '~/interfaces/item-coolmod';
import { Dialog } from 'evergreen-ui';
import { ItemModal } from '../modal/item-modal';
import { RegularButton } from './regular-button';

type Props = {
  item: SingleItemCoolmod;
  urlItem: string;
};

export const ItemCard = ({ item, urlItem }: Props) => {
  const [isShown, setIsShown] = useState(false);

  return (
    <>
      <div className='flex w-[26rem] flex-col rounded-xl bg-gray-200 bg-clip-border text-gray-700 shadow-md overflow-hidden mx-auto'>
        <div className='h-[20rem] overflow-hidden'>
          <img
            className='object-cover w-full h-full hover:scale-105 transition-transform'
            src={item.imgPath}
            alt={item.itemName}
          />
        </div>
        <div className='p-6'>
          <h5 className='mb-2 h-[55px] block font-sans text-xl font-semibold line-clamp-2 leading-snug tracking-normal text-slate-600 antialiased'>
            {item.itemName}
          </h5>
          <div className='flex gap-3'>
            <h2 className='text-slate-600 font-bold'>
              <span className={`text-sm`}>Precio:</span>{' '}
              <span
                className={`text-lg ${
                  item.oldPrice ? 'text-green-700' : 'text-slate-800'
                }`}
              >
                {item.actualPrice}
                {item.currency}
              </span>
            </h2>
            {item.oldPrice && (
              <h2 className='relative'>
                <span className='text-lg line-through text-red-800 font-semibold italic'>
                  {item.oldPrice}
                </span>{' '}
                <span className='text-slate-900 text-xs text-start absolute top-1 -right-[26px]'>
                  {item.discount}
                </span>
              </h2>
            )}
          </div>
        </div>
        <div className='p-6 pt-0 flex justify-between'>
          <RegularButton
            content='Seguimiento'
            onClick={() => setIsShown(true)}
          />
          <a
            className='select-none rounded-lg bg-indigo-600 py-3 px-6 text-center align-middle font-sans text-xs font-bold 
          uppercase text-slate-200 shadow-md shadow-indigo-500/20 transition-all hover:shadow-lg 
          hover:shadow-indigo-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] 
          active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none'
            href={urlItem}
            target='_blank'
            rel='noopener noreferrer'
          >
            Visitar página
          </a>
        </div>
      </div>
      <Dialog
        isShown={isShown}
        onCloseComplete={() => setIsShown(false)}
        hasHeader={false}
        hasFooter={false}
      >
        <ItemModal
          itemName={item.itemName ?? ''}
          actualPrice={`${item.actualPrice}${item.currency}`}
          imgPath={item.imgPath ?? ''}
          oldPrice={item.oldPrice}
          discount={item.discount}
          urlItem={urlItem}
          onClose={() => setIsShown(false)}
        />
      </Dialog>
    </>
  );
};
