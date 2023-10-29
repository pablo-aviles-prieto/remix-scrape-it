import { Form, useNavigate } from '@remix-run/react';
import { Button, Heading, SearchInput } from 'evergreen-ui';

export const SearchContainer = () => {
  const navigate = useNavigate();

  const getSingleItem = async (urlPage: string) => {
    const response = await fetch(`/api/coolmod?url=${urlPage}`);
    const parsedRes = await response.json();
    console.log('parsedRes', parsedRes);
  };

  const getListItems = async (queryWord: string) => {
    const response = await fetch(`/api/coolmod?query=${queryWord}`);
    const parsedRes = await response.json();
    console.log('parsedRes', parsedRes);
  };

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
        <li onClick={() => navigate('/search/palabra%20clave%20busqueda')}>
          Search page list items
        </li>
        <li
          onClick={() => navigate('/search/details?url=www.param-manolo.com')}
        >
          Search details single item
        </li>
        <li onClick={() => navigate('/test2')}>Go to test2</li>
        <li
          onClick={() =>
            getSingleItem(
              'https://www.coolmod.com/palit-geforce-rtx-4070-dual-12gb-gddr6x-dlss3/'
            )
          }
        >
          GET /api/coolmod?url (with discount)
        </li>
        <li
          onClick={() =>
            getSingleItem(
              'https://www.coolmod.com/asus-dual-geforce-rtx-4060-oc-gaming-8gb-gddr6-dlss3/'
            )
          }
        >
          GET /api/coolmod?url (without discount)
        </li>
        <li onClick={() => getListItems('rtx 4070')}>GET /api/coolmod?query</li>
      </ul>
    </div>
  );
};
