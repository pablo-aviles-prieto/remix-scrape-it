import { Form } from '@remix-run/react';
import { Button, Heading, TextInput } from 'evergreen-ui';
import { SearchIcon } from '../styles/icons/search-icon';

export const SearchContainer = () => {
  return (
    <div className='text-center'>
      <Heading color='muted' size={900}>
        Rastrea los mejores precios
      </Heading>
      <div className='relative w-[30rem] mx-auto mt-4'>
        <Form id='search-form' method='post'>
          <TextInput
            name='search'
            placeholder='Busca o inserta el enlace de un producto'
            className='bg-gray-100 !pr-20 !pl-7 !text-sm'
            width='30rem'
          />
          <SearchIcon
            className='absolute left-1 top-[7px] text-indigo-600'
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
