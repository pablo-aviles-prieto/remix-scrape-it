import { Form, useNavigate } from '@remix-run/react';
import { Button, Heading, SearchInput } from 'evergreen-ui';

export const SearchContainer = () => {
  const navigate = useNavigate();

  return (
    <div className='text-center'>
      <Heading color='muted' size={800}>
        Rastrea los mejores precios
      </Heading>
      <div className='relative w-[30rem] mx-auto'>
        <Form id='search-form' method='post'>
          <SearchInput
            name='search'
            placeholder='Busca o inserta el enlace de un producto'
            className='bg-gray-100 !pr-20'
            width='30rem'
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
      <ul>
        <li onClick={() => navigate('/')}>Go to homepage</li>
        <li onClick={() => navigate('/search')}>Search page</li>
        <li
          onClick={() =>
            navigate(
              '/search/details?url=https://www.coolmod.com/palit-geforce-rtx-4070-dual-12gb-gddr6x-dlss3/'
            )
          }
        >
          Search details single item
        </li>
        <li onClick={() => navigate('/search/rtx 4070')}>
          Search list items rtx 4070
        </li>
      </ul>
    </div>
  );
};
