import type { ActionFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

export const loader = async ({ params }: ActionFunctionArgs) => {
  return json({ words: params.words });
};

export default function SearchItem() {
  const { words } = useLoaderData<typeof loader>();

  return (
    <div>
      <div>Search item - Displaying the list of items searched by keyword</div>
      <div>
        Keywords to search:{' '}
        <span className='font-bold text-blue-300'>{words} </span>
        (still missing the queryParam for the store to search)
      </div>
    </div>
  );
}
