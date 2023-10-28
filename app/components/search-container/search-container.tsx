import { Form, useNavigate } from '@remix-run/react';

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
      <h2 className='text-4xl'>Rastrea los mejores precios</h2>
      <div>
        <Form id='search-form' method='post'>
          <input
            aria-label='Search bar'
            name='search'
            type='text'
            placeholder='Busca...'
            className='text-gray-900 bg-gray-200'
          />
          <button type='submit' className='border-2 border-gray-500 px-2 py-1'>
            Busca
          </button>
        </Form>
      </div>
      <ul>
        <li onClick={() => navigate('/')}>Go to homepage</li>
        <li onClick={() => navigate('/search')}>Search page</li>
        <li onClick={() => navigate('/search/palabra%20clave%20busqueda')}>
          Search page list items
        </li>
        <li onClick={() => navigate('/search/details/www.param-manolo.com')}>
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
