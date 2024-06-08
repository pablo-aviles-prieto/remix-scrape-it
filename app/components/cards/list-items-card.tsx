import { Dialog, Position, Tooltip } from 'evergreen-ui';
import { useState } from 'react';
import type { ListItems } from '~/interfaces';
import { ItemModal } from '../modal/item-modal';

type Props = {
  item: ListItems;
};

export const ListItemsCard = ({ item }: Props) => {
  const [isShown, setIsShown] = useState(false);

  return (
    <>
      <div className='w-full relative shadow-md rounded-lg overflow-hidden'>
        <img
          src={
            item.imgPath ??
            'https://static.vecteezy.com/system/resources/previews/007/126/739/non_2x/question-mark-icon-free-vector.jpg'
          }
          alt={item.name}
          className='w-full h-auto object-cover rounded-lg cursor-pointer hover:scale-105 transition-transform'
          onClick={() => setIsShown(true)}
        />
        <div
          className='absolute bottom-0 left-0 right-0 h-30 bg-slate-900 bg-opacity-70 
          backdrop-blur-[3px] text-white p-2 rounded-b-sm'
        >
          <Tooltip content={item.name} position={Position.TOP}>
            <h1 className='text-sm font-semibold overflow-hidden line-clamp-1'>
              {item.name}
            </h1>
          </Tooltip>
          <div className='pt-1 flex items-center justify-between'>
            <p className='text-lg relative'>
              <span
                className={
                  item.discountedPrice ? 'text-green-300' : 'text-white'
                }
              >
                {item.discountedPrice ?? item.price}
                {item.currency}
              </span>
              {item.discountedPrice && (
                <>
                  <span className='ml-1 text-xs line-through text-red-300 font-semibold italic'>
                    {item.price}
                  </span>
                  <span className='text-[10px] absolute -top-[4px] right-0 leading-4'>
                    {item.discountPercent}
                  </span>
                </>
              )}
            </p>
            <a
              href={item.url ?? ''}
              target='_blank'
              rel='noopener noreferrer'
              className='underline hover:text-indigo-300'
            >
              Visitar página
            </a>
          </div>
        </div>
      </div>
      <Dialog
        isShown={isShown}
        onCloseComplete={() => setIsShown(false)}
        hasHeader={false}
        hasFooter={false}
      >
        <ItemModal
          itemName={item.name ?? ''}
          actualPrice={
            item.discountedPrice
              ? String(item.discountedPrice)
              : item.price ?? ''
          }
          oldPrice={item.discountedPrice ? item.price : undefined}
          discount={item.discountedPrice ? item.discountPercent : undefined}
          imgPath={item.imgPath ?? ''}
          currency={item.currency}
          urlItem={item.url ?? ''}
          onClose={() => setIsShown(false)}
        />
      </Dialog>
    </>
  );
};
