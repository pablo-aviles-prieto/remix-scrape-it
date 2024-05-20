import type { ActionFunctionArgs } from '@remix-run/node';
import { defer, json } from '@remix-run/node';
import { Await, Outlet, useLoaderData, useNavigate } from '@remix-run/react';
import { Suspense } from 'react';
import { LoaderWrapper } from '~/components/loader/loader-wrapper';
import { TrackingItemCard } from '~/components/cards/tracking-item-card';
import type { TrackingResponse } from '~/interfaces/tracking-schema';
import { getTrackedItem } from '~/services/tracking/get-tracked-item.service';
import { SIMPLE_REGEX_EMAIL, errorMsgs } from '~/utils/const';
import { isValidObjectId } from 'mongoose';
import { updateTrackedItemSubscribers } from '~/services/tracking/update-tracked-items.service';
import { FallbackLoader } from '~/components/styles/fallback-loader';
import { LineChart } from '~/components/chart/line-chart';
import { Heading } from 'evergreen-ui';
import { TablePricingHistory } from '~/components/styles/table-pricing-history';
import { RegularButton } from '~/components/styles/regular-button';

type LoaderResponse = {
  ok: boolean;
  error?: string;
  trackedItem?: Promise<TrackingResponse>;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  // TODO: accept a new formData of radio button to know if its subscribed to daily updates
  // or to a price, and get that price
  // TODO: Return in the response an array with the fields that have error since now i can have
  // an input with the email and a price, one or both with error
  const email = formData.get('subscribe-email')?.toString()?.trim();
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
    return json({
      ok: false,
      error: errorMsgs.invalidURL,
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
    return json({
      ok: false,
      error: errorMsgs.internalError,
    });
  }
};

export default function SearchItem() {
  const { trackedItem, ok, error } = useLoaderData<LoaderResponse>();
  const navigate = useNavigate();

  if (!ok && error) {
    return (
      <div className='flex flex-col items-center gap-2'>
        <p className='text-lg'>
          Hubo un error:{' '}
          <span className='text-indigo-300'>
            {error === 'Check the URL provided'
              ? 'Revise la URL introducida e inténtelo nuevamente'
              : error}
          </span>
        </p>
        <RegularButton
          removeShadow
          content='Volver atrás'
          onClick={() => navigate(`/`)}
        />
      </div>
    );
  }

  return (
    <div>
      <LoaderWrapper>
        <Suspense fallback={<FallbackLoader />}>
          <Await resolve={trackedItem as Promise<TrackingResponse>}>
            {(resolvedData) => (
              <div>
                <div className='my-4'>
                  <TrackingItemCard item={resolvedData} />
                </div>
                <div className='xl:flex gap-2 justify-center'>
                  {resolvedData.prices.length >= 5 && (
                    <div className='xl:w-[65%] w-full mx-auto'>
                      <Heading
                        color='muted'
                        className='text-center !mb-1'
                        size={600}
                      >
                        Gráfica de precios
                      </Heading>
                      <LineChart
                        prices={resolvedData.prices}
                        itemName={resolvedData.name}
                        currency={resolvedData.currency}
                      />
                    </div>
                  )}
                  <div className='xl:w-[35%] sm:w-[28rem] mx-auto'>
                    <Heading
                      color='muted'
                      className='text-center !mb-5'
                      size={600}
                    >
                      Tabla con todos los precios registrados
                    </Heading>
                    <div className='pr-[2rem] mx-auto border h-[18rem] overflow-y-auto border-slate-500 rounded-lg'>
                      <TablePricingHistory item={resolvedData} />
                    </div>
                  </div>
                </div>
                <Outlet context={resolvedData} />
              </div>
            )}
          </Await>
        </Suspense>
      </LoaderWrapper>
    </div>
  );
}
