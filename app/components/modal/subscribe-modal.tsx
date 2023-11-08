import { useFetcher } from '@remix-run/react';
import { CloseBtn } from '../styles/icons/close-btn';
import { RegularButton } from '../styles/regular-button';
import { TextInput } from 'evergreen-ui';
import { useEffect, useMemo } from 'react';

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

export const SubscribeModal = ({ itemName, itemId, onClose }: Props) => {
  const {
    data: fetcherData,
    Form: FetcherForm,
    state: fetcherState,
  } = useFetcher<Fetcher>();
  const email = useMemo(() => fetcherData?.email, [fetcherData]);
  const hasError = useMemo(() => fetcherData?.error, [fetcherData]);

  // TODO: USE A FUCKING TOAST THAT DOESNT CRASH THE WHOLE APP. THX

  // useEffect(() => {
  //   if (!email && hasError) {
  //     toaster.danger(`Error al subscribirse`, {
  //       description: `Revisa el email facilitado e inténtalo nuevamente`,
  //     });
  //     return;
  //   }
  //   if (email && !hasError) {
  //     toaster.success(`Te has subscrito correctamente!`, {
  //       description: `Recibirás notificaciones diarias sobre este producto en ${email}`,
  //     });
  //     onClose();
  //   }
  // }, [email, hasError]);

  return (
    <div>
      <FetcherForm id='subscribe-form' method='post'>
        <div className='flex gap-8 items-center justify-between'>
          <h3 className='line-clamp-1 text-slate-900 text-lg font-semibold'>
            Subscríbete a los últimos precios
          </h3>
          <CloseBtn
            className='cursor-pointer text-slate-600 hover:text-indigo-400'
            width={20}
            height={20}
            onClick={onClose}
          />
        </div>
        <div className='my-16'>
          <div>
            <p className='mb-4'>
              ¿Quieres seguir los últimos precios de{' '}
              <span className='text-sm font-semibold'>{itemName}</span>?
            </p>
            <p>¡Introduce un email para que te llegue un correo diario!</p>
          </div>

          <TextInput
            name='subscribe'
            placeholder='Introduce tu email'
            className='bg-gray-100 !text-sm !mt-1 !w-full'
            width='25rem'
          />
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
