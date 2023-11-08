import { CloseBtn } from '../styles/icons/close-btn';
import { useFetcher } from '@remix-run/react';
import { RegularButton } from '../styles/regular-button';
import { useMemo } from 'react';

type Props = {
  mail: string;
  itemName: string;
  itemId: string;
  onClose: () => void;
};

type Fetcher = {
  ok: boolean;
  success?: string;
  error?: string;
};

export const UnsubscribeModal = ({
  mail,
  itemId,
  itemName,
  onClose,
}: Props) => {
  const {
    data: fetcherData,
    Form: FetcherForm,
    state: fetcherState,
  } = useFetcher<Fetcher>();
  const successMsg = useMemo(() => fetcherData?.success, [fetcherData]);
  const hasError = useMemo(() => fetcherData?.error, [fetcherData]);
  console.log('successMsg', successMsg);
  console.log('hasError', hasError);

  return (
    <div>
      <FetcherForm id='subscribe-form' method='post'>
        <div className='flex gap-8 items-center justify-between'>
          <h3 className='line-clamp-1 text-slate-900 text-lg font-semibold'>
            ¿Seguro que quieres darte de baja?
          </h3>
          <CloseBtn
            className='cursor-pointer text-slate-600 hover:text-indigo-400'
            width={20}
            height={20}
            onClick={onClose}
          />
        </div>
        <div className='my-8'>
          <p className='text-sm'>
            Si pinchas en darse de baja no volverás a recibir correos con el
            seguimiento de precios de{' '}
            <span className='text-indigo-800 font-semibold'>{itemName}</span>
          </p>
          <input hidden name='item-id' value={itemId} readOnly />
          <input hidden name='unsubscribe-email' value={mail} readOnly />
        </div>
        <div className='flex justify-between mb-1'>
          <RegularButton content='Cerrar' onClick={onClose} color='secondary' />
          <RegularButton
            content='Darse de baja'
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
