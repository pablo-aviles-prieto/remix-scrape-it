import type { ActionFunctionArgs } from '@remix-run/node';
import { defer, json } from '@remix-run/node';
import { Await, Outlet, useLoaderData } from '@remix-run/react';
import { Heading, Spinner } from 'evergreen-ui';
import { Suspense } from 'react';
import { LoaderWrapper } from '~/components/loader/loader-wrapper';
import { TrackingItemCard } from '~/components/styles/tracking-item-card';
import type { TrackingResponse } from '~/interfaces/tracking-schema';
import { getTrackedItem } from '~/services/tracking/get-tracked-item.service';
import { SIMPLE_REGEX_EMAIL, errorMsgs } from '~/utils/const';
import { isValidObjectId } from 'mongoose';
import { TablePricingHistory } from '~/components/styles/table-pricing-history';
import { updateTrackedItemSubscribers } from '~/services/tracking/update-tracked-items.service';

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
                  <div className='text-center'>
                    Gráfica con datos (si hay 5 o más??)
                  </div>
                  <div className='my-6'>
                    <TrackingItemCard item={resolvedData} />
                  </div>
                  <Heading
                    color='muted'
                    className='text-center !mb-1'
                    size={600}
                  >
                    Histórico de precios
                  </Heading>
                  <div className='pr-[46px] max-w-3xl mx-auto border h-[calc(100vh-600px)] overflow-y-auto border-slate-800 rounded-lg'>
                    <TablePricingHistory item={resolvedData} />
                  </div>
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
      <Outlet />
    </div>
  );
}
