import type { ActionFunctionArgs } from '@remix-run/node';
import { defer } from '@remix-run/node';
import { Await, useLoaderData } from '@remix-run/react';
import { Suspense } from 'react';
import type { ListItemsCoolmod } from '~/interfaces/ItemCoolmod';
import { getCoolmodListItems } from '~/services/scrap/coolmod.service';
import { errorMsgs } from '~/utils/const';

type LoaderResponse = {
  ok: boolean;
  error?: string;
  data?: Promise<ListItemsCoolmod[]>;
};

export const loader = async ({ params }: ActionFunctionArgs) => {
  if (!params.words) {
    return defer({
      ok: false,
      error: errorMsgs.internalError,
    });
  }
  try {
    const scrapResponsePromise = getCoolmodListItems({
      querySearch: params.words,
    });

    return defer({
      ok: true,
      data: scrapResponsePromise,
    });
  } catch (err) {
    console.log('ERROR LIST ITEMS', err);
    return defer({
      ok: false,
      error: errorMsgs.internalError,
    });
  }
};

export default function SearchItem() {
  const { data, ok, error } = useLoaderData<LoaderResponse>();

  if (!ok && error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <div>Search item - Displaying the list of items searched by keyword</div>
      <div>
        <Suspense fallback={<div>Loading...</div>}>
          <Await resolve={data as Promise<ListItemsCoolmod[]>}>
            {(resolvedData) =>
              resolvedData.map((item) => (
                <div key={item.url} className='flex gap-x-2'>
                  <p>Name: {item.name}</p>
                  <p>ImgPath: {item.imgPath}</p>
                  <p>Price: {item.price}</p>
                  <p>Url: {item.url}</p>
                </div>
              ))
            }
          </Await>
        </Suspense>
      </div>
    </div>
  );
}
