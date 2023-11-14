import type { ActionFunctionArgs } from '@remix-run/node';
import { defer } from '@remix-run/node';
import { Await, useLoaderData } from '@remix-run/react';
import { Heading } from 'evergreen-ui';
import { Suspense } from 'react';
import { LoaderWrapper } from '~/components/loader/loader-wrapper';
import { FallbackLoader } from '~/components/styles/fallback-loader';
import { Info } from '~/components/styles/icons/info';
import { ListItemsCard } from '~/components/cards/list-items-card';
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
    // TODO: Show toast
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <div className='flex gap-1 mb-2 items-center justify-center'>
        <Info
          width={20}
          height={20}
          strokeWidth={2}
          className='text-slate-200'
        />
        <Heading color='muted' size={500}>
          Haz click sobre la imagen de un producto para ver su seguimiento
        </Heading>
      </div>
      <div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-12'>
          <LoaderWrapper>
            <Suspense fallback={<FallbackLoader />}>
              <Await resolve={data as Promise<ListItemsCoolmod[]>}>
                {(resolvedData) =>
                  resolvedData.map((item) => (
                    <ListItemsCard key={item.url} item={item} />
                  ))
                }
              </Await>
            </Suspense>
          </LoaderWrapper>
        </div>
      </div>
    </div>
  );
}
