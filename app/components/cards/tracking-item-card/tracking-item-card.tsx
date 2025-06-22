import type { TrackingResponse } from '~/interfaces/tracking-schema';
import { RegularButton } from '../../styles/regular-button';
import { SubscribeModal } from '../../modal/subscribe-modal';
import { useEffect, useState } from 'react';
import { Dialog } from 'evergreen-ui';
import { customEllipsis } from '~/utils/custom-ellipsis';
import { useModifyDocumentTitle } from '~/hooks/use-modify-metadata-title';
import type { StoreImageInfo } from '../../styles/store-badge';
import { STORE_IMAGE_MAPPER, StoreBadge } from '../../styles/store-badge';
import { PriceBlock } from '~/components/cards/tracking-item-card/price-block';

type Props = {
  item: TrackingResponse;
};

export const TrackingItemCard = ({ item }: Props) => {
  const [isShown, setIsShown] = useState(false);
  const { modifyDocTitle } = useModifyDocumentTitle();
  const lastValidPrice = [...item.prices]
    .reverse()
    .find(p => !isNaN(parseFloat(p.price)) && isFinite(Number(p.price)));

  const lastPrice = lastValidPrice;

  // Have to modify this on client comp to avoid rehydratation error things (updateDehydratedSuspenseComponent)
  useEffect(() => {
    const newTitle = `Detalles del producto ${customEllipsis(item.name, 15)} de ${item.store}`;
    modifyDocTitle(newTitle);
  }, [modifyDocTitle, item]);

  const storeImageInfo = STORE_IMAGE_MAPPER[item.store] as StoreImageInfo;

  return (
    <>
      <div className='flex flex-col sm:flex-row mx-auto max-w-3xl bg-white shadow-lg rounded-lg overflow-hidden relative'>
        <StoreBadge store={item.store} storeImageInfo={storeImageInfo} />
        <img
          className='sm:w-2/5 object-contain max-h-[280px] hover:scale-105 transition-transform'
          src={item.image}
          alt={item.name}
        />
        <div className='sm:w-3/5 p-4 flex flex-col justify-between'>
          <div>
            <h1 className='text-gray-900 font-bold text-xl line-clamp-3'>{item.name}</h1>
            <p className='mt-2 text-gray-600 text-sm'>
              Subscríbete para que te notifiquemos cuando llegue al precio indicado o para recibir
              diariamente en el correo el seguimiento de este producto!
            </p>
            <PriceBlock lastPrice={lastPrice} currency={item.currency} />
          </div>
          <div className='flex gap-2 flex-col sm:flex-row item-center justify-between mt-3'>
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

            <RegularButton content='Subscribirse' onClick={() => setIsShown(true)} />
          </div>
        </div>
      </div>
      <Dialog
        isShown={isShown}
        onCloseComplete={() => setIsShown(false)}
        hasHeader={false}
        hasFooter={false}
      >
        <SubscribeModal
          itemName={item.name}
          itemId={item.id}
          itemLastPrice={item.prices[item.prices.length - 1].price}
          onClose={() => setIsShown(false)}
        />
      </Dialog>
    </>
  );
};
