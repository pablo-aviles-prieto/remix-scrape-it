import { useNavigate } from '@remix-run/react';
import { CloseBtn } from '../styles/icons/close-btn';
import { RegularButton } from '../styles/regular-button';
import { useEffect, useState } from 'react';
import type { TrackingResponse } from '~/interfaces/tracking-schema';
import { LineChart } from '../chart/line-chart';
import toast from 'react-hot-toast';

type Props = {
  itemName: string;
  actualPrice: string;
  imgPath: string;
  oldPrice?: string;
  discount?: string;
  urlItem: string;
  currency: string;
  onClose: () => void;
};

type TrackingResponseGET = {
  ok: boolean;
  error?: string;
  item?: TrackingResponse;
};

type TrackingResponsePOST = {
  ok: boolean;
  error?: string;
  insertedId?: string;
};

type PayloadTrackingPOST = {
  name: string;
  url: string;
  image: string;
  currency: string;
  actualPrice: string;
};

export const ItemModal = ({
  itemName,
  actualPrice,
  imgPath,
  oldPrice,
  discount,
  urlItem,
  currency,
  onClose,
}: Props) => {
  const [trackingId, setTrackingId] = useState<string | undefined>(undefined);
  const [trackingData, setTrackingData] = useState<
    TrackingResponse | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorGettingItem, setErrorGettingItem] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getTrackingItemId = async () => {
      setIsLoading(true);
      const response = await fetch(
        `/api/trackings?name=${itemName}&url=${urlItem}`
      );
      const trackedItemResponse =
        (await response.json()) as TrackingResponseGET;

      if (!trackedItemResponse.ok && trackedItemResponse.error) {
        toast.error(
          `Error Interno. No se puede crear ni visualizar seguimientos`
        );
        setErrorGettingItem(true);
        setIsLoading(false);
        return;
      }

      if (trackedItemResponse.ok && trackedItemResponse.item?.id) {
        setTrackingId(trackedItemResponse.item.id);
        setTrackingData(trackedItemResponse.item);
      } else {
        setTrackingId(undefined);
        setTrackingData(undefined);
      }
      setIsLoading(false);
    };
    getTrackingItemId();
  }, [itemName, urlItem]);

  const createTrackingHelper = async () => {
    const payload: PayloadTrackingPOST = {
      name: itemName,
      image: imgPath,
      actualPrice,
      currency: currency,
      url: urlItem,
    };

    const response = await fetch('/api/trackings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const createTracking = (await response.json()) as TrackingResponsePOST;

    if (createTracking.ok && createTracking.insertedId) {
      navigate(`/item/${createTracking.insertedId}`);
    } else {
      toast.error(`Error al crear el seguimiento. Inténtelo más tarde`);
    }
  };

  return (
    <div>
      <div className='flex gap-8 items-center justify-between'>
        <h3 className='line-clamp-1 text-slate-900 text-lg font-semibold'>
          {itemName}
        </h3>
        <CloseBtn
          className='cursor-pointer text-slate-600 hover:text-indigo-400'
          width={40}
          height={40}
          onClick={onClose}
        />
      </div>
      <div className='my-6'>
        <div className='mr-8'>
          {trackingData && trackingData.prices.length >= 5 && (
            <LineChart
              theme='light'
              prices={trackingData.prices}
              itemName={trackingData.name}
              currency={trackingData.currency}
              isModal
            />
          )}
        </div>
        <div className='my-4 flex items-center max-h-[12rem] overflow-hidden'>
          <div className='w-[50%]'>
            <img
              src={imgPath}
              alt={itemName}
              className='object-cover w-full h-full'
            />
          </div>
          <div className='w-[50%] ml-2 text-xs font-bold flex flex-col sm:gap-3'>
            <p className={`text-sm sm:text-base max-h-[100px] overflow-hidden`}>
              {itemName}
            </p>
            <p>
              Precio:{' '}
              <span
                className={`text-lg ${
                  oldPrice ? 'text-green-700' : 'text-slate-800'
                }`}
              >
                {actualPrice}
                {currency}
              </span>
              {oldPrice && discount && (
                <span className='block sm:inline'>
                  {' '}
                  sin dto:{' '}
                  <span className='text-base relative font-semibold'>
                    <span className='line-through text-red-800 font-bold italic'>
                      {oldPrice}
                    </span>
                    <span className='text-xs ml-1 sm:ml-0 text-slate-900 sm:absolute sm:-top-[12px] sm:right-0'>
                      {discount}
                    </span>
                  </span>
                </span>
              )}
            </p>
          </div>
        </div>
        <div>
          <p className='text-center text-indigo-700 font-semibold text-sm'>
            {!trackingData && !trackingId
              ? 'No hay seguimiento para este producto. Puede crearlo y subscribirse para ser notificado cuando llegue al precio indicado o para recibir diariamente en el correo el seguimiento de este producto'
              : 'Acceda al seguimiento de este producto para subscribirse y ser notificado cuando llegue al precio indicado o para recibir diariamente en el correo el seguimiento de este producto'}
          </p>
        </div>
      </div>
      <div className='flex justify-between mb-1'>
        <RegularButton content='Cerrar' onClick={onClose} color='secondary' />
        {!errorGettingItem &&
          (trackingId ? (
            <RegularButton
              content={isLoading ? '' : 'Ver seguimiento'}
              onClick={() => navigate(`/item/${trackingId}`)}
              isLoading={isLoading}
            />
          ) : (
            <RegularButton
              content={isLoading ? '' : 'Crear seguimiento'}
              onClick={createTrackingHelper}
              isLoading={isLoading}
            />
          ))}
      </div>
    </div>
  );
};
