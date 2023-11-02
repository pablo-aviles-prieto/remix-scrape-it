import type { ActionFunctionArgs } from '@remix-run/node';
import { defer } from '@remix-run/node';
import { Await, useLoaderData } from '@remix-run/react';
import { Spinner } from 'evergreen-ui';
import { Suspense } from 'react';
import { LoaderWrapper } from '~/components/loader/loader-wrapper';
import { ItemCard } from '~/components/styles/item-card';
import type { SingleItemCoolmod } from '~/interfaces/item-coolmod';
import { getCoolmodSingleItem } from '~/services/scrap/coolmod.service';
import { errorMsgs } from '~/utils/const';

type LoaderResponse = {
  ok: boolean;
  error?: string;
  data?: Promise<SingleItemCoolmod>;
  url: URL;
};

export const loader = async ({ request }: ActionFunctionArgs) => {
  const url = new URL(request.url);
  const queryUrl = url.searchParams.get('url');
  if (!queryUrl) {
    return defer({
      ok: false,
      error: errorMsgs.internalError,
      url: queryUrl,
    });
  }

  try {
    const scrapResponsePromise = getCoolmodSingleItem({
      productPage: queryUrl,
    });

    return defer({
      ok: true,
      data: scrapResponsePromise,
      url: queryUrl,
    });
  } catch (err) {
    console.log('ERROR SINGLE ITEM', err);
    return defer({
      ok: false,
      error: errorMsgs.internalError,
      url: queryUrl,
    });
  }
};

export default function SearchIndex() {
  const { data, ok, error, url } = useLoaderData<LoaderResponse>();

  if (!ok && error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <div className='mb-8'>
        Search details page - Should display the details of an item given a url
        on params
      </div>
      <LoaderWrapper>
        <Suspense
          fallback={
            <div className='absolute top-0 left-0 bottom-0 right-0 bg-transparent z-10'>
              <Spinner size={128} marginX='auto' marginY={425} />
            </div>
          }
        >
          <Await resolve={data as Promise<SingleItemCoolmod>}>
            {(resolvedData) => <ItemCard item={resolvedData} urlItem={url} />}
          </Await>
        </Suspense>
      </LoaderWrapper>
    </div>
  );
}
