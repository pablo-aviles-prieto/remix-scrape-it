import type { ActionFunctionArgs } from '@remix-run/node';
import { defer } from '@remix-run/node';
import { Await, useLoaderData } from '@remix-run/react';
import { Spinner } from 'evergreen-ui';
import { Suspense } from 'react';
import { LoaderWrapper } from '~/components/loader/loader-wrapper';
import { TrackingItemCard } from '~/components/styles/tracking-item-card';
import type { TrackingResponse } from '~/interfaces/tracking-schema';
import { getTrackedItem } from '~/services/get-tracked-item.service';
import { errorMsgs } from '~/utils/const';
import { isValidObjectId } from 'mongoose';

type LoaderResponse = {
  ok: boolean;
  error?: string;
  trackedItem?: Promise<TrackingResponse>;
};

export const loader = async ({ params }: ActionFunctionArgs) => {
  if (!params.id || !isValidObjectId(params.id)) {
    return defer({
      ok: false,
      error: errorMsgs.invalidId,
    });
  }

  try {
    const trackedItemPromise = getTrackedItem(params.id);

    return defer({
      ok: true,
      trackedItem: trackedItemPromise,
    });
  } catch (err) {
    console.log('ERROR ITEM TRACKING BY ID', err);
    return defer({
      ok: false,
      error: errorMsgs.internalError,
    });
  }
};

export default function SearchItem() {
  const { trackedItem, ok, error } = useLoaderData<LoaderResponse>();

  if (!ok && error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <LoaderWrapper>
        <Suspense
          fallback={
            <div className='absolute top-0 left-0 bottom-0 right-0 bg-transparent z-10'>
              <Spinner size={128} marginX='auto' marginY={425} />
            </div>
          }
        >
          <Await resolve={trackedItem as Promise<TrackingResponse>}>
            {(resolvedData) =>
              resolvedData ? (
                <div>
                  <p>ID: {resolvedData.id}</p>
                  <p>Name: {resolvedData.name}</p>
                  <p>Image: {resolvedData.image}</p>
                  <p>URL: {resolvedData.url}</p>
                  <p>Currency: {resolvedData.currency}</p>
                  <p>Created: {resolvedData.createdAt as unknown as string}</p>
                  <p>Updated: {resolvedData.updatedAt as unknown as string}</p>
                  {resolvedData.prices.map((priceObj) => (
                    <div key={priceObj.date as unknown as string}>
                      <p>Fecha: {priceObj.date as unknown as string}</p>
                      <p>Precio: {priceObj.price + resolvedData.currency}</p>
                    </div>
                  ))}
                  <TrackingItemCard item={resolvedData} />
                </div>
              ) : (
                <div>
                  Please check the url provided. (navigate back to home page?)
                </div>
              )
            }
          </Await>
        </Suspense>
      </LoaderWrapper>
    </div>
  );
}
