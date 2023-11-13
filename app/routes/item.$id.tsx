import type { ActionFunctionArgs } from '@remix-run/node';
import { defer, json } from '@remix-run/node';
import { Await, Outlet, useLoaderData } from '@remix-run/react';
import { Suspense } from 'react';
import { LoaderWrapper } from '~/components/loader/loader-wrapper';
import { TrackingItemCard } from '~/components/styles/tracking-item-card';
import type { TrackingResponse } from '~/interfaces/tracking-schema';
import { getTrackedItem } from '~/services/tracking/get-tracked-item.service';
import { SIMPLE_REGEX_EMAIL, errorMsgs } from '~/utils/const';
import { isValidObjectId } from 'mongoose';
import { updateTrackedItemSubscribers } from '~/services/tracking/update-tracked-items.service';
import { FallbackLoader } from '~/components/styles/fallback-loader';
import { LineChart } from '~/components/chart/line-chart';
import { PriceHistory } from '~/components/price-history/price-history';

type LoaderResponse = {
  ok: boolean;
  error?: string;
  trackedItem?: Promise<TrackingResponse>;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const email = formData.get('subscribe')?.toString()?.trim();
  const itemId = formData.get('item-id')?.toString();

  if (!email || !email.match(SIMPLE_REGEX_EMAIL)) {
    return json({ ok: false, error: errorMsgs.invalidEmail });
  }

  const updatedSubscribers = await updateTrackedItemSubscribers({
    email,
    id: itemId ?? '',
  });

  return json({ ok: true, email, updatedSubscribers });
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
    return (
      // TODO: Center the message, beautify it, and show link to navigate back to home
      <div>
        Error: {error} (INVALID URL ERROR in case that invalid ID provided)
      </div>
    );
  }

  return (
    <div>
      <LoaderWrapper>
        <Suspense fallback={<FallbackLoader />}>
          <Await resolve={trackedItem as Promise<TrackingResponse>}>
            {(resolvedData) =>
              resolvedData ? (
                <div>
                  <div className='my-6'>
                    <TrackingItemCard item={resolvedData} />
                  </div>
                  <div className='flex gap-2'>
                    <div className='w-[60%]'>
                      <LineChart prices={resolvedData.prices} />
                    </div>
                    <div className='w-[40%]'>
                      <PriceHistory item={resolvedData} />
                    </div>
                  </div>
                  <Outlet context={resolvedData} />
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
