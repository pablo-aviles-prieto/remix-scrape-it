import type { ActionFunctionArgs, MetaFunction } from '@remix-run/node';
import { defer, json } from '@remix-run/node';
import { Await, Outlet, useLoaderData, useNavigate } from '@remix-run/react';
import { Suspense } from 'react';
import { LoaderWrapper } from '~/components/loader/loader-wrapper';
import { TrackingItemCard } from '~/components/cards/tracking-item-card';
import type { TrackingResponse } from '~/interfaces/tracking-schema';
import { getTrackedItem } from '~/services/tracking/get-tracked-item.service';
import { SIMPLE_REGEX_EMAIL, errorMsgs } from '~/utils/const';
import { isValidObjectId } from 'mongoose';
import {
  updateTrackedItemDesiredPriceSubscribers,
  updateTrackedItemSubscribers,
} from '~/services/tracking/update-tracked-items.service';
import { FallbackLoader } from '~/components/styles/fallback-loader';
import { LineChart } from '~/components/chart/line-chart';
import { Heading } from 'evergreen-ui';
import { TablePricingHistory } from '~/components/styles/table-pricing-history';
import { RegularButton } from '~/components/styles/regular-button';
import { parseAmount } from '~/utils/parse-amount';
import { formatAmount } from '~/utils/format-amount';
import { createBaseMetadataInfo } from '~/utils/create-base-metadata-info';

type LoaderResponse = {
  ok: boolean;
  error?: string;
  trackedItem?: Promise<TrackingResponse>;
};

const validateDesiredPrice = (desiredPrice: string | undefined, itemPrice: string | undefined) => {
  if (!desiredPrice) {
    return {
      parsedPrice: null,
      error: { field: 'desired-price', message: errorMsgs.invalidPrice },
    };
  }
  const parsedDesiredPrice = parseFloat(desiredPrice);
  if (isNaN(parsedDesiredPrice) || parsedDesiredPrice <= 0) {
    return {
      parsedPrice: null,
      error: { field: 'desired-price', message: errorMsgs.invalidPrice },
    };
  }

  const parsedItemPrice = parseAmount(itemPrice ?? '0');
  if (parsedItemPrice <= parsedDesiredPrice) {
    return {
      parsedPrice: null,
      error: { field: 'desired-price', message: errorMsgs.invalidDesiredPrice },
    };
  }

  return { parsedPrice: parsedDesiredPrice, error: null };
};

export const meta: MetaFunction = ServerRuntimeMetaArgs => {
  const metadata = createBaseMetadataInfo(ServerRuntimeMetaArgs);
  // removing the base metadata title
  const filteredMetadata = metadata.filter(metaItem => !metaItem.hasOwnProperty('title'));
  return [
    {
      title: 'Detalles del producto...',
    },
    ...filteredMetadata,
  ];
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const email = formData.get('subscribe-email')?.toString()?.trim();
  const switchState = formData.get('switch-subscription-state');
  const desiredPrice = formData.get('desired-price')?.toString();
  const itemId = formData.get('item-id')?.toString();
  const itemLastPrice = formData.get('item-last-price')?.toString();
  const isSubscribedToAPrice = switchState === 'on';
  const errors: { field: string; message: string }[] = [];

  let parsedPrice: number | undefined;
  // Validate desired price if the switch is on
  if (isSubscribedToAPrice) {
    const { parsedPrice: price, error: priceError } = validateDesiredPrice(
      desiredPrice,
      itemLastPrice
    );
    if (priceError) {
      errors.push(priceError);
    } else {
      parsedPrice = price;
    }
  }

  if (!email || !email.match(SIMPLE_REGEX_EMAIL)) {
    errors.push({ field: 'subscribe-email', message: errorMsgs.invalidEmail });
  }

  if (errors.length > 0) {
    return json({ ok: false, errors }, { status: 400 });
  }

  if (isSubscribedToAPrice) {
    await updateTrackedItemDesiredPriceSubscribers({
      id: itemId ?? '',
      email: email ?? '',
      desiredPrice: formatAmount(parsedPrice ?? 0),
    });
  } else {
    await updateTrackedItemSubscribers({
      email: email ?? '',
      id: itemId ?? '',
    });
  }

  return json({ ok: true, email, desiredPrice: parsedPrice });
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
        <RegularButton removeShadow content='Volver atrás' onClick={() => navigate(`/`)} />
      </div>
    );
  }

  return (
    <div>
      <LoaderWrapper>
        <Suspense fallback={<FallbackLoader />}>
          <Await resolve={trackedItem as Promise<TrackingResponse>}>
            {resolvedData => (
              <div>
                <div className='my-4'>
                  <TrackingItemCard item={resolvedData} />
                </div>
                <div className='xl:flex gap-2 justify-center'>
                  {/* Checking if is a valid price (not --) and a finite number to display the Chart */}
                  {resolvedData.prices.filter(
                    priceObj =>
                      !isNaN(parseFloat(priceObj.price)) && isFinite(Number(priceObj.price))
                  ).length >= 1 && (
                    <div className='xl:w-[65%] w-full mx-auto'>
                      <Heading color='muted' className='text-center !mb-1' size={600}>
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
                    <Heading color='muted' className='text-center !mb-5' size={600}>
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
