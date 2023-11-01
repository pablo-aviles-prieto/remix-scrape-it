import type { ActionFunctionArgs } from '@remix-run/node';
import { defer } from '@remix-run/node';
import { Await, useLoaderData } from '@remix-run/react';
import { Spinner } from 'evergreen-ui';
import { Suspense } from 'react';
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
      <div>
        Search details page - Should display the details of an item given a url
        on params
      </div>
      <Suspense
        fallback={
          <div className='absolute top-0 left-0 bottom-0 right-0 bg-transparent z-10'>
            <Spinner size={128} marginX='auto' marginY={425} />
          </div>
        }
      >
        <Await resolve={data as Promise<SingleItemCoolmod>}>
          {(resolvedData) => (
            <div className='flex gap-x-2'>
              <p>Name: {resolvedData.itemName}</p>
              <p>ActualPrice: {resolvedData.actualPrice}</p>
              <p>OldPrice: {resolvedData.oldPrice ?? 'none'}</p>
              <p>Url: {url}</p>
              <p>ImgPath: {resolvedData.imgPath}</p>
              <p>Discount?: {resolvedData.discount ?? 'none'}</p>
            </div>
          )}
        </Await>
      </Suspense>
    </div>
  );
}
