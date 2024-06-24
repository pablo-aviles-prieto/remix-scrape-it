import type { ActionFunctionArgs, MetaFunction } from '@remix-run/node';
import { defer } from '@remix-run/node';
import { Await, useLoaderData } from '@remix-run/react';
import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { LoaderWrapper } from '~/components/loader/loader-wrapper';
import { FallbackLoader } from '~/components/styles/fallback-loader';
import { ItemCard } from '~/components/cards/item-card';
import type { SingleItem } from '~/interfaces';
import { getCoolmodSingleItem } from '~/services/scrap/coolmod.service';
import { errorMsgs, stores } from '~/utils/const';
import { getAliexpressSingleItem } from '~/services/scrap/aliexpress.service';
import { ErrorRetrieveData } from '~/components/error/error-retrieve-data';
import { createBaseMetadataInfo } from '~/utils/create-base-metadata-info';
import { getThomannSingleItem } from '~/services/scrap/thomann.service';

type LoaderResponse = {
  ok: boolean;
  error?: string;
  data?: Promise<SingleItem | null>;
  url: URL;
  store: stores;
};

const ERROR_MESSAGE =
  'No se pudo obtener los datos del producto, revise el enlace proporcionado e inténtelo más tarde.';

export const meta: MetaFunction = (ServerRuntimeMetaArgs) => {
  const metadata = createBaseMetadataInfo(ServerRuntimeMetaArgs);
  // removing the base metadata title
  const filteredMetadata = metadata.filter(
    (metaItem) => !metaItem.hasOwnProperty('title')
  );
  return [
    {
      title: `Obteniendo información...`,
    },
    ...filteredMetadata,
  ];
};

export const loader = async ({ request }: ActionFunctionArgs) => {
  const url = new URL(request.url);
  const queryUrl = url.searchParams.get('url');
  const queryStore = url.searchParams.get('store');

  if (!queryUrl || !queryUrl.startsWith('https://') || !queryStore) {
    return defer({
      ok: false,
      error: 'Revise la URL introducida',
      url: queryUrl,
      store: queryStore,
    });
  }

  const STORE_SCRAPPER = {
    [stores.ALIEXPRESS]: getAliexpressSingleItem,
    [stores.COOLMOD]: getCoolmodSingleItem,
    [stores.THOMANN]: getThomannSingleItem,
  };

  try {
    const getSingleItemServiceByStore = STORE_SCRAPPER[queryStore as stores];

    const scrapResponsePromise = getSingleItemServiceByStore({
      productPage: queryUrl,
    });

    return defer({
      ok: true,
      data: scrapResponsePromise,
      url: queryUrl,
      store: queryStore,
    });
  } catch (err) {
    console.log('ERROR SINGLE ITEM', err);
    return defer({
      ok: false,
      error: errorMsgs.internalError,
      url: queryUrl,
      store: queryStore,
    });
  }
};

export default function SearchIndex() {
  const { data, ok, error, url, store } = useLoaderData<LoaderResponse>();

  if (!ok && error) {
    return <ErrorRetrieveData>{ERROR_MESSAGE}</ErrorRetrieveData>;
  }

  return (
    <div>
      <LoaderWrapper>
        <Suspense fallback={<FallbackLoader />}>
          <Await resolve={data as Promise<SingleItem | null>}>
            {(resolvedData) => {
              if (!resolvedData) {
                return <ErrorRetrieveData>{ERROR_MESSAGE}</ErrorRetrieveData>;
              }
              return (
                <motion.div
                  initial={{ opacity: 0, x: 300 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -300 }}
                  transition={{ duration: 0.5 }}
                >
                  <ItemCard item={resolvedData} urlItem={url} store={store} />
                </motion.div>
              );
            }}
          </Await>
        </Suspense>
      </LoaderWrapper>
    </div>
  );
}
