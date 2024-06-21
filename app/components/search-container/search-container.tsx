import { Form, useNavigate } from '@remix-run/react';
import {
  Button,
  Heading,
  Position,
  Select,
  TextInput,
  Tooltip,
} from 'evergreen-ui';
import { SearchIcon } from '../styles/icons/search-icon';
import useWindowWidth from '~/hooks/use-window-width';
import { stores } from '~/utils/const';

const tooltipContent =
  'Busca entre los artículos de las diferentes tiendas para ver o crear un seguimiento de los precios de dicho artículo. Además puedes subscribirte a dicho seguimiento para que te llegue un email diario con los últimos precios o una notificación cuando llegue al precio indicado!';

export const SearchContainer = () => {
  const innerWidth = useWindowWidth();
  const navigate = useNavigate();

  return (
    <div className='text-center'>
      <button className='mx-auto' type='button' onClick={() => navigate(`/`)}>
        <img src='/images/logo.webp' className='w-[85px] h-auto' />
      </button>
      <div className='flex gap-2 justify-center items-end'>
        <Heading
          color='muted'
          size={innerWidth && innerWidth > 640 ? 900 : 800}
        >
          Rastrea los mejores precios
        </Heading>
        <Tooltip id='info' content={tooltipContent} position={Position.TOP}>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            stroke='currentColor'
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            width={innerWidth && innerWidth > 640 ? 25 : 20}
            height={innerWidth && innerWidth > 640 ? 25 : 20}
            className='icon icon-tabler icon-tabler-info-circle text-slate-300 mb-[3px]'
            viewBox='0 0 24 24'
          >
            <path stroke='none' d='M0 0h24v24H0z' />
            <path d='M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0M12 9h.01' />
            <path d='M11 12h1v4h1' />
          </svg>
        </Tooltip>
      </div>
      <div
        className={`relative ${
          innerWidth && innerWidth > 640 ? 'w-[35rem]' : 'w-[22rem]'
        } mx-auto mt-2`}
      >
        <Form id='search-form' method='post'>
          <div className='absolute left-[1px] top-[2px] h-[28px]'>
            <Select
              className='!h-[28px]'
              name='selected-store'
              defaultValue={stores.ALIEXPRESS}
            >
              <option value={stores.ALIEXPRESS}>{stores.ALIEXPRESS}</option>
              <option value={stores.COOLMOD}>{stores.COOLMOD}</option>
            </Select>
          </div>
          <TextInput
            name='search'
            placeholder='Busca o inserta el enlace de un producto'
            className='bg-gray-100 !pr-20 !pl-[122px] !text-sm'
            width={innerWidth && innerWidth > 640 ? '35rem' : '22rem'}
          />
          <SearchIcon
            className='absolute left-[100px] top-[6px] text-indigo-600'
            width={20}
            height={20}
            strokeWidth={2.5}
          />
          <Button
            color='whitesmoke'
            className='!absolute right-0 !bg-indigo-600 !z-[2] hover:!bg-indigo-500'
            type='submit'
            fontSize='small'
          >
            Buscar
          </Button>
        </Form>
      </div>
    </div>
  );
};
