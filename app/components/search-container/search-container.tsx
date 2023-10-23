import { Form, useNavigate } from '@remix-run/react';

export const SearchContainer = () => {
  const navigate = useNavigate();

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
      </ul>
    </div>
  );
};
