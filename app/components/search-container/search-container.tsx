import type { ActionFunctionArgs } from '@remix-run/node';
import { Form } from '@remix-run/react';

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  console.log('formData', formData);
};

export const SearchContainer = () => {
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
    </div>
  );
};
