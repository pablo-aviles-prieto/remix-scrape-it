import type { ActionFunctionArgs } from '@remix-run/node';
import { defer } from '@remix-run/node';
import { Await, useLoaderData } from '@remix-run/react';
import { Spinner } from 'evergreen-ui';
import { Suspense } from 'react';
import { ListItemsCard } from '~/components/styles/list-items-card';
import type { ListItemsCoolmod } from '~/interfaces/item-coolmod';
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
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-12'>
          <Suspense
            fallback={
              <div className='absolute top-0 left-0 bottom-0 right-0 bg-transparent z-10'>
                <Spinner size={128} marginX='auto' marginY={425} />
              </div>
            }
          >
            <Await resolve={data as Promise<ListItemsCoolmod[]>}>
              {(resolvedData) =>
                resolvedData.map((item) => (
                  <ListItemsCard item={item} key={item.url} />
                ))
              }
            </Await>
          </Suspense>
        </div>
      </div>
    </div>
  );
}
