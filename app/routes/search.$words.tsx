import type { ActionFunctionArgs } from '@remix-run/node';
import { defer, json } from '@remix-run/node';
import { Await, useLoaderData } from '@remix-run/react';
import { motion } from 'framer-motion';
import { Heading } from 'evergreen-ui';
import { Suspense } from 'react';
import { LoaderWrapper } from '~/components/loader/loader-wrapper';
import { FallbackLoader } from '~/components/styles/fallback-loader';
import { Info } from '~/components/styles/icons/info';
import { ListItemsCard } from '~/components/cards/list-items-card';
import type { ListItems } from '~/interfaces';
import { getCoolmodListItems } from '~/services/scrap/coolmod.service';
import { errorMsgs, stores } from '~/utils/const';
import { getAliexpressListItems } from '~/services/scrap/aliexpress.service';
import { ErrorRetrieveData } from '~/components/error/error-retrieve-data';

type LoaderResponse = {
  ok: boolean;
  error?: string;
  data?: Promise<ListItems[] | null>;
  store: stores;
};

const ERROR_MESSAGE =
  'No se pudo obtener información de los productos, revise los datos introducidos e inténtelo más tarde.';

export const loader = async ({ request, params }: ActionFunctionArgs) => {
  const url = new URL(request.url);
  const queryStore = url.searchParams.get('store');

  if (!params.words) {
    return json({
      ok: false,
      error: errorMsgs.internalError,
      store: queryStore,
    });
  }

  try {
    let scrapResponsePromise: Promise<ListItems[] | null> =
      Promise.resolve(null);

    if (queryStore === stores.COOLMOD) {
      scrapResponsePromise = getCoolmodListItems({
        querySearch: params.words,
      });
    } else {
      scrapResponsePromise = getAliexpressListItems({
        querySearch: params.words,
      });
    }

    return defer({
      ok: true,
      data: scrapResponsePromise,
      store: queryStore,
    });
  } catch (err) {
    console.log('ERROR LIST ITEMS', err);
    return json({
      ok: false,
      error: errorMsgs.internalError,
      store: queryStore,
    });
  }
};

export default function SearchItem() {
  const { data, ok, error, store } = useLoaderData<LoaderResponse>();

  if (!ok && error) {
    return <ErrorRetrieveData>{ERROR_MESSAGE}</ErrorRetrieveData>;
  }

  return (
    <div className='pb-6'>
      <div>
        <LoaderWrapper>
          <Suspense fallback={<FallbackLoader />}>
            <Await resolve={data as Promise<ListItems[] | null>}>
              {(resolvedData) => {
                if (!resolvedData) {
                  return <ErrorRetrieveData>{ERROR_MESSAGE}</ErrorRetrieveData>;
                }
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 200 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -200 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className='flex gap-1 my-4 items-center justify-center'>
                      <Info
                        width={20}
                        height={20}
                        strokeWidth={2}
                        className='text-slate-200'
                      />
                      <Heading color='muted' size={500}>
                        Haz click sobre la imagen de un producto para ver su
                        seguimiento
                      </Heading>
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-12'>
                      {resolvedData.map((item) => (
                        <ListItemsCard
                          key={item.url}
                          item={item}
                          store={store}
                        />
                      ))}
                    </div>
                  </motion.div>
                );
              }}
            </Await>
          </Suspense>
        </LoaderWrapper>
      </div>
    </div>
  );
}
