import { useFetcher } from '@remix-run/react';
import { CloseBtn } from '../styles/icons/close-btn';
import { RegularButton } from '../styles/regular-button';
import { Switch, TextInputField } from 'evergreen-ui';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

type Props = {
  itemName: string;
  itemId: string;
  onClose: () => void;
};

type Fetcher = {
  ok: boolean;
  email?: string;
  error?: string;
};

// TODO: Change the message and add a button to subscribe to a desired price
// TODO: Add a radio button to select between the subscribers (daily) or the priceSubscribers
// (desiredPrice), and in the last case, add a input with the price
// TODO: Permitir que si elige un desiredPrice, que el usuario peuda marcar un checkbox con
// la opción de recibir notificaciones diarias sobre el producto también, y así agregarlo en ambas
// TODO: Receive an array with the inputs that has errors
export const SubscribeModal = ({ itemName, itemId, onClose }: Props) => {
  const {
    data: fetcherData,
    Form: FetcherForm,
    state: fetcherState,
  } = useFetcher<Fetcher>();
  const [displayError, setDisplayError] = useState(false);
  const [isSubscribedDaily, setIsSubscribedDaily] = useState(false);
  const email = useMemo(() => fetcherData?.email, [fetcherData]);
  const hasError = useMemo(() => fetcherData?.error, [fetcherData]);

  useEffect(() => {
    if (!email && hasError) {
      toast.error(`Revisa el email facilitado e inténtalo nuevamente`);
      setDisplayError(true);
      return;
    }
    if (email && !hasError) {
      toast.success(
        `Recibirás notificaciones diarias sobre este producto en ${email}`
      );
      onClose();
    }
  }, [email, hasError]);

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
          <div className='mb-8 space-y-2'>
            <p>
              ¡Recibe en tu correo información sobre{' '}
              <span className='text-sm font-semibold'>{itemName}</span>!
            </p>
            <p>
              Recibe un correo diario con los precios actualizados del producto
              o bien selecciona el precio al que deseas que te avisemos
            </p>
          </div>

          {/* TODO: Add a checkbox input */}
          <div className='flex items-center gap-x-2 mb-6'>
            <Switch
              className={`custom-switch ${
                isSubscribedDaily ? 'is-selected' : ''
              }`}
              onChange={(e) => setIsSubscribedDaily(e.target.checked)}
              checked={isSubscribedDaily}
              value={isSubscribedDaily.toString()}
              name='switch-subscription-state'
            />
            <p className='text-sm'>
              {!isSubscribedDaily
                ? 'Subscríbete a los últimos precios del producto'
                : 'Te notificaremos cuando llegue al precio deseado'}
            </p>
          </div>
          <TextInputField
            description={
              !isSubscribedDaily
                ? 'Introduce tu email para que te llegue un correo diario'
                : 'Introduce tu email para que te notifiquemos con el precio deseado'
            }
            name='subscribe-email'
            placeholder='Introduce tu email'
            className={`bg-gray-100 !text-sm !mt-1 !w-full ${
              hasError && displayError ? '!border-red-400 !border-2' : ''
            }`}
            width='25rem'
            onChange={() => setDisplayError(false)}
          />
          {isSubscribedDaily ? (
            <>
              <TextInputField
                description='Introduce un precio para que te avisemos'
                name='desired-price'
                placeholder='Introduce el precio deseado'
                width='25rem'
                type='number'
                min={0}
                step={0.01}
              />
              {/* TODO: Add a checkbox so it also subscribe daily? */}
            </>
          ) : null}
          <input hidden name='item-id' value={itemId} readOnly />
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
