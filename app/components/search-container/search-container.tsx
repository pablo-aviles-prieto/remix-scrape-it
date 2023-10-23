import type { ActionFunctionArgs } from '@remix-run/node';
import { Form, useNavigate } from '@remix-run/react';

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  console.log('formData', formData);
};

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
        <li onClick={() => navigate('/search')}>Search page</li>
        <li onClick={() => navigate('/search/item')}>Search page items</li>
        <li onClick={() => navigate('/test2')}>Go to test2</li>
        <li onClick={() => navigate('/')}>Go to homepage</li>
      </ul>
    </div>
  );
};
