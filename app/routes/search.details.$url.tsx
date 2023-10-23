import type { ActionFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

export const loader = async ({ params }: ActionFunctionArgs) => {
  return json({ url: params.url });
};

export default function SearchIndex() {
  const { url } = useLoaderData<typeof loader>();

  return (
    <div>
      <div>
        Search details page - Should display the details of an item given a url
        on params
      </div>
      <div>
        URL to search: <span className='font-bold text-blue-300'>{url}</span>
      </div>
    </div>
  );
}
