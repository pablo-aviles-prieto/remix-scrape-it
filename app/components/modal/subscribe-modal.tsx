import { useFetcher } from '@remix-run/react';
import { CloseBtn } from '../styles/icons/close-btn';
import { RegularButton } from '../styles/regular-button';
import { Switch, TextInputField } from 'evergreen-ui';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { formatAmount } from '~/utils/format-amount';

type Props = {
  itemName: string;
  itemId: string;
  itemLastPrice: string;
  onClose: () => void;
};

type Fetcher = {
  ok: boolean;
  email?: string;
  desiredPrice?: number;
  errors?: { field: string; message: string }[];
};

const getFieldError = (errors: Fetcher['errors'], field: string) => {
  return errors?.find((error) => error.field === field)?.message;
};

export const SubscribeModal = ({
  itemName,
  itemId,
  itemLastPrice,
  onClose,
}: Props) => {
  const {
    data: fetcherData,
    Form: FetcherForm,
    state: fetcherState,
  } = useFetcher<Fetcher>();
  const [hasErrors, setHasErrors] = useState(fetcherData?.errors);
  const [isSubscribedToPrice, setIsSubscribedToPrice] = useState(false);
  const emailError = useMemo(
    () => getFieldError(fetcherData?.errors, 'subscribe-email'),
    [fetcherData]
  );
  const priceError = useMemo(
    () => getFieldError(fetcherData?.errors, 'desired-price'),
    [fetcherData]
  );

  useEffect(() => {
    if (fetcherData?.errors) {
      setHasErrors(fetcherData.errors);
    }
  }, [fetcherData]);

  useEffect(() => {
    if (hasErrors) {
      hasErrors.forEach((error) => {
        toast.error(error.message, { id: error.field });
      });
    }
    if (fetcherData?.ok) {
      toast.success(
        `${
          !isSubscribedToPrice
            ? 'Recibirás notificaciones diarias sobre este producto'
            : `Te notificaremos cuando llegue a ${formatAmount(
                fetcherData?.desiredPrice ?? 0
              )}€`
        } en ${fetcherData.email}`,
        { id: 'toast-success' }
      );
      onClose();
    }
  }, [fetcherData, onClose, isSubscribedToPrice]);

  return (
    <div>
      <FetcherForm id='subscribe-form' method='post'>
        <div className='flex gap-8 items-center justify-between'>
          <h3 className='line-clamp-1 text-slate-900 text-lg font-semibold'>
            Subscríbete al producto
          </h3>
          <CloseBtn
            className='cursor-pointer text-slate-600 hover:text-indigo-400'
            width={20}
            height={20}
            onClick={onClose}
          />
        </div>
        <div className='my-16'>
          <div className='mb-6 space-y-2'>
            <p>
              ¡Reciba en su correo información sobre{' '}
              <span className='text-sm font-bold'>{itemName.trim()}</span>!
            </p>
            <p className='text-sm'>
              Puede <span className='font-medium'>elegir</span> entre recibir un{' '}
              <span className='font-medium'>
                correo diario con los precios actualizados
              </span>{' '}
              del producto o recibir un{' '}
              <span className='font-medium'>
                correo cuando el producto llegue al precio
              </span>{' '}
              deseado
            </p>
          </div>

          <div className='flex items-center gap-x-2 mb-2'>
            <Switch
              className={`custom-switch ${
                isSubscribedToPrice ? 'is-selected' : ''
              }`}
              onChange={(e) => setIsSubscribedToPrice(e.target.checked)}
              checked={isSubscribedToPrice}
              value={isSubscribedToPrice.toString()}
              name='switch-subscription-state'
            />
            <p className='text-sm'>
              {!isSubscribedToPrice
                ? 'Reciba a diario un correo con los precios de este artículo'
                : 'Indique el precio deseado al que quiere que le notifiquemos'}
            </p>
          </div>
          <TextInputField
            description={
              !isSubscribedToPrice
                ? 'Introduce tu email para que te llegue un correo diario'
                : 'Introduce tu email para que te notifiquemos con el precio deseado'
            }
            name='subscribe-email'
            placeholder='Introduce tu email'
            className={`bg-gray-100 !text-sm !mt-1 !w-full ${
              emailError && hasErrors ? '!border-red-400 !border-2' : ''
            }`}
            width='25rem'
            onChange={() => setHasErrors(undefined)}
          />
          {isSubscribedToPrice ? (
            <TextInputField
              description='Introduce un precio para que te avisemos'
              name='desired-price'
              placeholder='Introduce el precio deseado'
              width='25rem'
              type='number'
              min={0}
              step={0.01}
              onChange={() => setHasErrors(undefined)}
              className={`bg-gray-100 !text-sm !mt-1 !w-full ${
                priceError && hasErrors ? '!border-red-400 !border-2' : ''
              }`}
            />
          ) : null}
          <input hidden name='item-id' value={itemId} readOnly />
          <input hidden name='item-last-price' value={itemLastPrice} readOnly />
        </div>
        <div className='flex justify-between mb-1'>
          <RegularButton content='Cerrar' onClick={onClose} color='secondary' />
          <RegularButton
            content='Subscribirse'
            type='submit'
            isLoading={
              fetcherState === 'submitting' || fetcherState === 'loading'
            }
            isDisabled={
              fetcherState === 'submitting' || fetcherState === 'loading'
            }
          />
        </div>
      </FetcherForm>
    </div>
  );
};
