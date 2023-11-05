import { useFetcher } from '@remix-run/react';
import { CloseBtn } from '../styles/icons/close-btn';
import { RegularButton } from '../styles/regular-button';
import { TextInput } from 'evergreen-ui';

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
  const fetcher = useFetcher<Fetcher>();

  // TODO: Show a toast if succesfully created or if it has an error
  const email = fetcher?.data?.email;
  const hasError = fetcher?.data?.error;
  console.log('fetcher.data', fetcher.data);
  console.log('email', email);
  console.log('hasError', hasError);

  return (
    <div>
      <fetcher.Form id='subscribe-form' method='post'>
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
              fetcher.state === 'submitting' || fetcher.state === 'loading'
            }
            isDisabled={
              fetcher.state === 'submitting' || fetcher.state === 'loading'
            }
          />
        </div>
      </fetcher.Form>
    </div>
  );
};
