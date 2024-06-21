import { useEffect, useState } from 'react';
import type { SingleItem } from '~/interfaces';
import { Dialog } from 'evergreen-ui';
import { ItemModal } from '../modal/item-modal';
import { RegularButton } from '../styles/regular-button';
import type { stores } from '~/utils/const';
import { useModifyDocumentTitle } from '~/hooks/use-modify-metadata-title';
import { customEllipsis } from '~/utils/custom-ellipsis';
import type { StoreImageInfo } from '../styles/store-badge';
import { STORE_IMAGE_MAPPER, StoreBadge } from '../styles/store-badge';

type Props = {
  item: SingleItem;
  urlItem: string;
  store: stores;
};

export const ItemCard = ({ item, urlItem, store }: Props) => {
  const [isShown, setIsShown] = useState(false);
  const { modifyDocTitle } = useModifyDocumentTitle();

  // Have to modify this on client comp to avoid rehydratation error things (updateDehydratedSuspenseComponent)
  useEffect(() => {
    const newTitle = `Detalles del producto ${customEllipsis(
      item.itemName ?? '',
      15
    )} de ${store}`;
    modifyDocTitle(newTitle);
  }, [modifyDocTitle, item, store]);

  const storeImageInfo = STORE_IMAGE_MAPPER[store] as StoreImageInfo;

  return (
    <>
      <div className='flex w-[22rem] sm:w-[26rem] flex-col rounded-xl bg-gray-200 bg-clip-border text-gray-700 shadow-md mx-auto'>
        <div className='h-[20rem] overflow-hidden relative'>
          <StoreBadge
            store={store}
            storeImageInfo={storeImageInfo}
            size='medium'
          />
          <img
            className='object-cover w-full h-full hover:scale-105 transition-transform'
            src={item.imgPath}
            alt={item.itemName}
          />
        </div>
        <div className='p-6'>
          <h5 className='mb-2 font-sans text-xl font-semibold line-clamp-2 leading-snug tracking-normal text-slate-600 antialiased'>
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
          <a
            className='select-none rounded-lg bg-transparent py-3 px-6 text-center align-middle font-sans text-xs font-bold 
            uppercase text-indigo-600 shadow-md shadow-indigo-300/20 transition-all hover:shadow-lg border border-indigo-600
           hover:shadow-indigo-300/30 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] 
            active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none'
            href={urlItem}
            target='_blank'
            rel='noopener noreferrer'
          >
            Visitar página
          </a>
          <RegularButton
            content='Seguimiento'
            onClick={() => setIsShown(true)}
          />
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
          actualPrice={item.actualPrice ?? ''}
          imgPath={item.imgPath ?? ''}
          oldPrice={item.oldPrice}
          discount={item.discount}
          currency={item.currency ?? '€'}
          urlItem={urlItem}
          store={store}
          onClose={() => setIsShown(false)}
        />
      </Dialog>
    </>
  );
};
